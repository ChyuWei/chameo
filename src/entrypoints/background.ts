import { onMessage } from '@/utils/messaging';
import {
  settingsStorage,
  aiProvidersStorage,
  activeProviderIdStorage,
} from '@/utils/storage';
import { LlmAnalyzer, splitSentences } from '@/core';
import { ask } from '@/services/ai';
import pLimit from 'p-limit';

const MAX_CONCURRENCY = 3;
import { BUILTIN_PROVIDERS } from '@/constants/builtin-providers';
import type { AiConfig } from '@/types';

const MENU_ID = 'chameo-analyze';

async function getActiveAiConfig(): Promise<AiConfig | null> {
  const [providers, activeId] = await Promise.all([
    aiProvidersStorage.getValue(),
    activeProviderIdStorage.getValue(),
  ]);
  const provider = providers.find((p) => p.id === activeId);
  if (!provider) return null;
  if (!provider.apiKey) return null;
  return {
    provider: provider.provider,
    apiKey: provider.apiKey,
    model: provider.model,
    baseUrl: provider.baseUrl,
  };
}

function i18n(key: string, fallback: string): string {
  return browser.i18n.getMessage(key) || fallback;
}

async function updateContextMenu() {
  const settings = await settingsStorage.getValue();
  const addToReview = settings.addToReviewOnAnalyze;

  const title = addToReview
    ? i18n('contextMenuAnalyzeAndReview', '长难句分析 & 加入复习本')
    : i18n('contextMenuAnalyze', '长难句分析');

  await browser.contextMenus.removeAll();
  browser.contextMenus.create({
    id: MENU_ID,
    title: `Chameo · ${title}`,
    contexts: ['selection'],
  });
}

export default defineBackground(() => {
  console.log('[Chameo] background service worker started');

  updateContextMenu();

  settingsStorage.watch(() => {
    updateContextMenu();
  });

  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== MENU_ID) return;
    const selectedText = info.selectionText?.trim();
    if (!selectedText || !tab?.id) return;

    console.log('[Chameo] Context menu clicked, text:', selectedText);

    await browser.tabs.sendMessage(tab.id, {
      type: 'chameo:notify',
      message: '正在分析，请稍候...',
    });

    const config = await getActiveAiConfig();
    if (!config) {
      console.warn('[Chameo] No active AI provider or API Key not configured');
      await browser.tabs.sendMessage(tab.id, {
        type: 'chameo:notify',
        message: '请先在设置中配置 AI 服务并填写 API Key',
      });
      return;
    }

    console.log('[Chameo] Using provider:', config.provider, config.model);

    const sentences = splitSentences(selectedText);
    console.log(`[Chameo] Split into ${sentences.length} sentence(s)`);

    const batchId = sentences.length > 1 ? `b${Date.now().toString(36)}` : undefined;

    const analyzer = new LlmAnalyzer((prompt, system) =>
      ask(config, prompt, { system, temperature: 0 }),
    );

    const limit = pLimit(MAX_CONCURRENCY);
    const tasks = sentences.map((sentence, i) => limit(async () => {
      try {
        const result = await analyzer.analyze(sentence);
        console.log(`[Chameo] Analysis result (${i + 1}/${sentences.length}):`, JSON.stringify(result, null, 2));

        await browser.tabs.sendMessage(tab.id, {
          type: 'chameo:analysis-result',
          result,
          batchId,
        });
        return true;
      } catch (e: unknown) {
        console.error(`[Chameo] Failed to analyze: "${sentence.slice(0, 50)}..."`, e);

        let errMsg: string;
        if (e instanceof Error) {
          const parts = [e.name, e.message].filter(Boolean);
          const extra = e as Record<string, unknown>;
          if (extra.statusCode) parts.push(`status=${extra.statusCode}`);
          if (extra.responseBody) parts.push(`body=${typeof extra.responseBody === 'string' ? extra.responseBody.slice(0, 300) : JSON.stringify(extra.responseBody).slice(0, 300)}`);
          if (extra.url) parts.push(`url=${extra.url}`);
          if (extra.cause) parts.push(`cause=${extra.cause}`);
          errMsg = parts.join(' | ');
        } else {
          errMsg = JSON.stringify(e) || String(e);
        }

        await browser.tabs.sendMessage(tab.id, {
          type: 'chameo:notify',
          message: `分析失败 (${i + 1}/${sentences.length}): ${errMsg}`,
        });
        return false;
      }
    }));

    const results = await Promise.all(tasks);
    const successCount = results.filter(Boolean).length;

    await browser.tabs.sendMessage(tab.id, { type: 'chameo:batch-complete' });

    if (sentences.length > 1) {
      await browser.tabs.sendMessage(tab.id, {
        type: 'chameo:notify',
        message: `分析完成: ${successCount}/${sentences.length} 句`,
      });
    }
  });

  onMessage('text-selected', ({ data }) => {
    console.log('[Chameo] User selected text:', data.text);
  });

  onMessage('open-side-panel', async ({ sender }) => {
    // @ts-expect-error sidePanel API types may not be available in all browsers
    await browser.sidePanel?.open?.({ windowId: sender.tab?.windowId });
  });

  browser.runtime.onInstalled.addListener(async ({ reason }) => {
    if (reason === 'install') {
      console.log('[Chameo] Extension installed');
      const existing = await aiProvidersStorage.getValue();
      if (existing.length === 0) {
        await aiProvidersStorage.setValue(BUILTIN_PROVIDERS);
      }
    }
    updateContextMenu();
  });
});
