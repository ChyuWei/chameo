import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExtStorage } from '@/hooks/useExtStorage';
import { analysisCacheStorage } from '@/utils/storage';
import { SEGMENT_TYPE_LABELS, DEFAULT_SEGMENT_COLORS } from '@/constants/segment-colors';
import type { SegmentType } from '@/core/types';
import type { SavedAnalysis, AnalysisCacheMap } from '@/utils/storage';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function App() {
  const { t } = useTranslation();
  const { value: cache, update: setCache } = useExtStorage(analysisCacheStorage);

  const entries = Object.entries(cache ?? {}).filter(([, v]) => v.length > 0);
  const totalEntries = entries.reduce((sum, [, v]) => sum + v.length, 0);

  const clearAll = () => {
    if (!confirm(t('manage.clearAllConfirm'))) return;
    setCache({});
  };

  const clearPage = (url: string) => {
    if (!cache) return;
    const next = { ...cache };
    delete next[url];
    setCache(next);
  };

  const deleteEntry = (url: string, sentence: string) => {
    if (!cache) return;
    const next = { ...cache };
    next[url] = (next[url] ?? []).filter((e) => e.sentence !== sentence);
    if (next[url].length === 0) delete next[url];
    setCache(next);
  };

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/icon/48.png" alt={t('common.appName')} className="size-10" />
          <div>
            <h1 className="text-2xl font-bold">{t('manage.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('manage.totalPages', { count: entries.length })}
              {' · '}
              {t('manage.totalEntries', { count: totalEntries })}
            </p>
          </div>
        </div>
        {entries.length > 0 && (
          <Button variant="destructive" size="sm" onClick={clearAll}>
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            {t('manage.clearAll')}
          </Button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          {t('manage.empty')}
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(([url, items]) => (
            <PageGroup
              key={url}
              url={url}
              items={items}
              onClearPage={() => clearPage(url)}
              onDeleteEntry={(sentence) => deleteEntry(url, sentence)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PageGroup({
  url,
  items,
  onClearPage,
  onDeleteEntry,
}: {
  url: string;
  items: SavedAnalysis[];
  onClearPage: () => void;
  onDeleteEntry: (sentence: string) => void;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-lg border">
      <div
        className="flex cursor-pointer items-center gap-2 px-4 py-3 hover:bg-muted/50"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{url}</p>
          <p className="text-xs text-muted-foreground">
            {t('manage.totalEntries', { count: items.length })}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClearPage();
            }}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t">
          {items.map((entry, idx) => (
            <EntryRow
              key={entry.sentence + idx}
              entry={entry}
              onDelete={() => onDeleteEntry(entry.sentence)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EntryRow({
  entry,
  onDelete,
}: {
  entry: SavedAnalysis;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b last:border-b-0">
      <div
        className="flex cursor-pointer items-start gap-2 px-4 py-3 hover:bg-muted/30"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? (
          <ChevronDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-relaxed">{entry.sentence}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('manage.savedAt')} {new Date(entry.timestamp).toLocaleString()}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="shrink-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {expanded && (
        <div className="space-y-3 bg-muted/20 px-10 py-3">
          <div className="flex flex-wrap gap-1">
            {entry.result.segments.map((seg, i) => {
              const color = DEFAULT_SEGMENT_COLORS[seg.type as SegmentType] ?? '#888';
              const label = SEGMENT_TYPE_LABELS[seg.type as SegmentType] ?? seg.type;
              return (
                <span
                  key={i}
                  style={{
                    backgroundColor: hexToRgba(color, 0.2),
                    borderBottom: `2px solid ${color}`,
                  }}
                  className="rounded-sm px-0.5 text-sm"
                  title={label + (seg.modifies ? ` → ${seg.modifies}` : '')}
                >
                  {seg.text}
                </span>
              );
            })}
          </div>

          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium text-muted-foreground">{t('manage.core')}:</span>{' '}
              {entry.result.core.summary}
            </p>
            <p>
              <span className="font-medium text-muted-foreground">{t('manage.translation')}:</span>{' '}
              {entry.result.translation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
