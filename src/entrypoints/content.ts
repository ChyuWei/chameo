import { sendMessage } from '@/utils/messaging';
import { segmentColorsStorage, analysisCacheStorage, settingsStorage } from '@/utils/storage';
import { DEFAULT_SEGMENT_COLORS, SEGMENT_TYPE_LABELS } from '@/constants/segment-colors';
import type { AnalysisResult, Segment, SegmentType } from '@/core/types';

let lastSelectionRange: Range | null = null;
let tooltipStyleInjected = false;

function injectTooltipStyle() {
  if (tooltipStyleInjected) return;
  tooltipStyleInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    [data-chameo-type] {
      position: relative;
      cursor: pointer;
    }
    [data-chameo-type]:hover::after {
      content: attr(data-chameo-label);
      position: absolute;
      bottom: calc(100% + 4px);
      left: 50%;
      transform: translateX(-50%);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      line-height: 1.4;
      white-space: nowrap;
      color: #fff;
      background: rgba(0,0,0,0.8);
      pointer-events: none;
      z-index: 2147483647;
    }
  `;
  document.head.appendChild(style);
}

function saveSelection() {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && sel.toString().trim()) {
    lastSelectionRange = sel.getRangeAt(0).cloneRange();
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function getTextNodesIn(root: Node): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    nodes.push(node);
  }
  return nodes;
}

function getTextNodesInRange(range: Range): Text[] {
  const container = range.commonAncestorContainer;
  if (container.nodeType === Node.TEXT_NODE) {
    return [container as Text];
  }
  return getTextNodesIn(container).filter((n) => range.intersectsNode(n));
}

function simpleSentenceHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return 's' + Math.abs(h).toString(36);
}

function createSentenceBadge(index: number): HTMLElement {
  const badge = document.createElement('span');
  badge.dataset.chameoBadge = 'true';
  badge.textContent = String(index);
  badge.style.cssText = `
    display: inline-flex; align-items: center; justify-content: center;
    width: 16px; height: 16px; border-radius: 50%;
    background: #334155; color: #fff;
    font-size: 10px; line-height: 1; font-weight: 600;
    margin-right: 3px; vertical-align: middle;
    font-family: system-ui, sans-serif;
  `;
  return badge;
}

interface WrapOptions {
  sentenceId?: string;
  batchId?: string;
}

function wrapTextNode(
  textNode: Text,
  color: string,
  type: string,
  modifies?: string,
  opts?: WrapOptions,
) {
  injectTooltipStyle();
  const span = document.createElement('span');
  span.style.backgroundColor = hexToRgba(color, 0.25);
  span.style.borderBottom = `2px solid ${color}`;
  span.style.borderRadius = '2px';
  span.dataset.chameoType = type;
  if (opts?.sentenceId) span.dataset.chameoSentence = opts.sentenceId;
  if (opts?.batchId) span.dataset.chameoBatch = opts.batchId;

  const label = SEGMENT_TYPE_LABELS[type as SegmentType] ?? type;
  span.dataset.chameoLabel = modifies ? `${label} → ${modifies}` : label;

  textNode.parentNode!.insertBefore(span, textNode);
  span.appendChild(textNode);
}

function clearHighlights() {
  document.querySelectorAll<HTMLElement>('[data-chameo-type]').forEach((span) => {
    const parent = span.parentNode;
    if (!parent) return;
    while (span.firstChild) {
      if ((span.firstChild as HTMLElement).dataset?.chameoBadge) {
        span.removeChild(span.firstChild);
      } else {
        parent.insertBefore(span.firstChild, span);
      }
    }
    parent.removeChild(span);
    parent.normalize();
  });
}

function applyHighlightToNodes(
  textNodes: Text[],
  segments: Segment[],
  colors: Record<string, string>,
  opts?: WrapOptions,
) {
  const domText = textNodes.map((n) => n.textContent!).join('');

  let cursor = 0;
  const segRanges: { gStart: number; gEnd: number; seg: Segment; color: string }[] = [];
  for (const seg of segments) {
    const trimmed = seg.text.trim();
    if (!trimmed) continue;
    const idx = domText.indexOf(trimmed, cursor);
    if (idx === -1) continue;
    const color = colors[seg.type as SegmentType] ?? '#888888';
    segRanges.push({ gStart: idx, gEnd: idx + trimmed.length, seg, color });
    cursor = idx + trimmed.length;
  }

  if (!segRanges.length) return;

  let globalOffset = 0;
  const nodeSlices: { node: Text; gStart: number; gEnd: number }[] = [];
  for (const node of textNodes) {
    const len = node.textContent!.length;
    nodeSlices.push({ node, gStart: globalOffset, gEnd: globalOffset + len });
    globalOffset += len;
  }

  for (let i = nodeSlices.length - 1; i >= 0; i--) {
    const ns = nodeSlices[i];
    const overlaps = segRanges.filter((sr) => sr.gStart < ns.gEnd && sr.gEnd > ns.gStart);
    if (!overlaps.length) continue;

    const splitOffsets = new Set<number>();
    for (const sr of overlaps) {
      const localStart = Math.max(0, sr.gStart - ns.gStart);
      const localEnd = Math.min(ns.gEnd - ns.gStart, sr.gEnd - ns.gStart);
      if (localStart > 0) splitOffsets.add(localStart);
      if (localEnd < ns.node.textContent!.length) splitOffsets.add(localEnd);
    }

    const sortedOffsets = [...splitOffsets].sort((a, b) => b - a);
    const parts: Text[] = [];
    let remaining = ns.node;

    for (const offset of sortedOffsets) {
      if (offset > 0 && offset < remaining.textContent!.length) {
        const after = remaining.splitText(offset);
        parts.unshift(after);
      }
    }
    parts.unshift(remaining);

    let partOffset = 0;
    for (const part of parts) {
      const partLen = part.textContent!.length;
      const partGlobalStart = ns.gStart + partOffset;
      const partGlobalEnd = partGlobalStart + partLen;

      const match = overlaps.find(
        (sr) => sr.gStart <= partGlobalStart && sr.gEnd >= partGlobalEnd,
      );
      if (match) {
        wrapTextNode(part, match.color, match.seg.type, match.seg.modifies, opts);
      }

      partOffset += partLen;
    }
  }
}

function findSentenceRange(sentence: string): Range | null {
  const bodyText = document.body.textContent ?? '';
  const idx = bodyText.indexOf(sentence);
  if (idx === -1) return null;

  const textNodes = getTextNodesIn(document.body);
  let offset = 0;
  let startNode: Text | null = null;
  let startOffset = 0;
  let endNode: Text | null = null;
  let endOffset = 0;

  for (const node of textNodes) {
    const len = node.textContent!.length;
    if (!startNode && offset + len > idx) {
      startNode = node;
      startOffset = idx - offset;
    }
    if (offset + len >= idx + sentence.length) {
      endNode = node;
      endOffset = idx + sentence.length - offset;
      break;
    }
    offset += len;
  }

  if (!startNode || !endNode) return null;

  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  return range;
}

function getPageUrl(): string {
  return location.origin + location.pathname;
}

async function saveAnalysisToCache(result: AnalysisResult) {
  const settings = await settingsStorage.getValue();
  if (!settings.persistAnalysis) return;

  const url = getPageUrl();
  const cache = await analysisCacheStorage.getValue().catch(() => ({}));
  const existing = cache[url] ?? [];
  const alreadySaved = existing.some((e) => e.sentence === result.sentence);
  if (alreadySaved) return;

  existing.push({
    sentence: result.sentence,
    result,
    timestamp: Date.now(),
  });
  cache[url] = existing;
  await analysisCacheStorage.setValue(cache);
  await syncCacheToPage();
}

function refreshBadges() {
  document.querySelectorAll('[data-chameo-badge]').forEach((el) => el.remove());

  const spans = document.querySelectorAll<HTMLElement>('[data-chameo-type]');
  if (!spans.length) return;

  // --- Primary: batch-based badges (same selection, multiple sentences) ---
  const batchMap = new Map<string, HTMLElement[]>();
  spans.forEach((span) => {
    const bid = span.dataset.chameoBatch;
    if (bid) {
      if (!batchMap.has(bid)) batchMap.set(bid, []);
      batchMap.get(bid)!.push(span);
    }
  });

  for (const batchSpans of batchMap.values()) {
    const sentenceStarts: HTMLElement[] = [batchSpans[0]];
    for (let i = 1; i < batchSpans.length; i++) {
      if (batchSpans[i].dataset.chameoSentence !== batchSpans[i - 1].dataset.chameoSentence) {
        sentenceStarts.push(batchSpans[i]);
      }
    }
    if (sentenceStarts.length >= 2) {
      let idx = 1;
      sentenceStarts.forEach((s) => s.insertBefore(createSentenceBadge(idx++), s.firstChild));
    }
  }

  // --- Fallback: DOM-adjacent spans without batch, different sentences ---
  const unbatched = [...spans].filter((s) => !s.dataset.chameoBatch);
  if (!unbatched.length) return;

  const groups: HTMLElement[][] = [];
  let cur: HTMLElement[] = [];

  unbatched.forEach((span) => {
    if (!cur.length) { cur.push(span); return; }

    const last = cur[cur.length - 1];
    let node: Node | null = last.nextSibling;
    let adjacent = false;
    while (node) {
      if (node === span) { adjacent = true; break; }
      if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) { node = node.nextSibling; continue; }
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).dataset?.chameoType) { node = node.nextSibling; continue; }
      break;
    }
    if (!adjacent) { groups.push(cur); cur = [span]; }
    else { cur.push(span); }
  });
  if (cur.length) groups.push(cur);

  for (const group of groups) {
    const sentenceStarts: HTMLElement[] = [group[0]];
    for (let i = 1; i < group.length; i++) {
      if (group[i].dataset.chameoSentence !== group[i - 1].dataset.chameoSentence) {
        sentenceStarts.push(group[i]);
      }
    }
    if (sentenceStarts.length >= 2) {
      let idx = 1;
      sentenceStarts.forEach((s) => s.insertBefore(createSentenceBadge(idx++), s.firstChild));
    }
  }
}

async function highlightResult(result: AnalysisResult, batchId?: string) {
  const colors = await segmentColorsStorage.getValue().catch(() => DEFAULT_SEGMENT_COLORS);

  let textNodes: Text[] = [];

  if (lastSelectionRange) {
    const rangeNodes = getTextNodesInRange(lastSelectionRange);
    const rangeText = rangeNodes.map((n) => n.textContent!).join('');
    if (rangeText.includes(result.sentence.slice(0, 30))) {
      textNodes = rangeNodes;
    }
  }

  if (!textNodes.length) {
    const range = findSentenceRange(result.sentence);
    if (range) {
      textNodes = getTextNodesInRange(range);
    }
  }

  if (!textNodes.length) return;

  const sentenceId = simpleSentenceHash(result.sentence);
  applyHighlightToNodes(textNodes, result.segments, colors, { sentenceId, batchId });
  await saveAnalysisToCache(result);
}

async function restoreHighlights() {
  const settings = await settingsStorage.getValue();
  if (!settings.persistAnalysis) return;

  const url = getPageUrl();
  const cache = await analysisCacheStorage.getValue().catch(() => ({}));

  const entriesToApply: { sentence: string; result: AnalysisResult }[] = [];

  const samePageEntries = cache[url] ?? [];
  entriesToApply.push(...samePageEntries);

  if (settings.crossSiteHighlight) {
    const seen = new Set(samePageEntries.map((e) => e.sentence));
    for (const [key, entries] of Object.entries(cache)) {
      if (key === url) continue;
      for (const entry of entries) {
        if (!seen.has(entry.sentence)) {
          seen.add(entry.sentence);
          entriesToApply.push(entry);
        }
      }
    }
  }

  if (!entriesToApply.length) return;

  const colors = await segmentColorsStorage.getValue().catch(() => DEFAULT_SEGMENT_COLORS);

  let restored = 0;
  for (const entry of entriesToApply) {
    const range = findSentenceRange(entry.sentence);
    if (!range) continue;
    const textNodes = getTextNodesInRange(range);
    if (!textNodes.length) continue;
    const sentenceId = simpleSentenceHash(entry.sentence);
    applyHighlightToNodes(textNodes, entry.result.segments, colors, { sentenceId });
    restored++;
  }

  if (restored > 0) {
    refreshBadges();
    console.log(`[Chameo] Restored ${restored} highlight(s) from cache`);
  }
}

async function syncCacheToPage() {
  const cache = await analysisCacheStorage.getValue().catch(() => ({}));
  let el = document.getElementById('__chameo-cache');
  if (!el) {
    el = document.createElement('script');
    el.id = '__chameo-cache';
    el.type = 'application/json';
    el.style.display = 'none';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(cache);
}

export default defineContentScript({
  matches: ['<all_urls>'],

  main() {
    console.log('[Chameo] content script loaded');

    syncCacheToPage();

    restoreHighlights();

    document.addEventListener('mouseup', () => {
      saveSelection();
      const sel = window.getSelection();
      const text = sel?.toString().trim();
      if (text && text.length > 0) {
        sendMessage('text-selected', { text });
      }
    });

    browser.runtime.onMessage.addListener((message) => {
      if (message.type === 'chameo:analysis-result') {
        const result = message.result as AnalysisResult;
        console.log('[Chameo] 分析结果:', result);
        console.table(result.segments);
        console.log('[Chameo] 主干:', result.core.summary);
        console.log('[Chameo] 翻译:', result.translation);
        highlightResult(result, message.batchId);
        window.getSelection()?.removeAllRanges();
        lastSelectionRange = null;
      }

      if (message.type === 'chameo:batch-complete') {
        refreshBadges();
      }

      if (message.type === 'chameo:notify') {
        console.warn('[Chameo]', message.message);
      }

      if (message.type === 'chameo:error') {
        console.error('[Chameo] Error detail:', message);
      }
    });
  },
});
