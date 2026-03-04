import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { RotateCcw, FileText } from 'lucide-react';
import { useExtStorage } from '@/hooks/useExtStorage';
import { useAiProviders } from '@/hooks/useAiProviders';
import { settingsStorage, segmentColorsStorage } from '@/utils/storage';
import { AiProviderList } from '@/components/common/AiProviderList';
import { DEFAULT_SEGMENT_COLORS, SEGMENT_TYPE_LABELS } from '@/constants/segment-colors';
import type { SegmentType } from '@/core/types';

function App() {
  const { t } = useTranslation();
  const { value: settings, loading, update } = useExtStorage(settingsStorage);
  const {
    providers,
    activeId,
    addProvider,
    updateProvider,
    removeProvider,
    selectProvider,
  } = useAiProviders();
  const { value: segmentColors, update: setSegmentColors } = useExtStorage(segmentColorsStorage);

  const updateSegmentColor = (type: SegmentType, color: string) => {
    if (!segmentColors) return;
    setSegmentColors({ ...segmentColors, [type]: color });
  };

  const resetSegmentColors = () => {
    setSegmentColors(DEFAULT_SEGMENT_COLORS);
  };

  const toggleEnabled = () => {
    if (!settings) return;
    update({ ...settings, enabled: !settings.enabled });
  };

  const toggleAutoDetect = () => {
    if (!settings) return;
    update({ ...settings, autoDetect: !settings.autoDetect });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-8 flex items-center gap-3">
        <img src="/icon/48.png" alt={t('common.appName')} className="size-10" />
        <div>
          <h1 className="text-2xl font-bold">{t('options.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('common.appSlogan')}</p>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <AiProviderList
            providers={providers}
            activeId={activeId}
            onAdd={addProvider}
            onUpdate={updateProvider}
            onRemove={removeProvider}
            onSelect={selectProvider}
          />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">{t('options.basic')}</h2>
          <div className="space-y-4 rounded-lg border p-4">
            <SettingRow
              label={t('options.enabled')}
              description={t('options.enabledDesc')}
              checked={settings?.enabled ?? true}
              onLabel={t('options.on')}
              offLabel={t('options.off')}
              onChange={toggleEnabled}
            />
            <SettingRow
              label={t('options.autoDetect')}
              description={t('options.autoDetectDesc')}
              checked={settings?.autoDetect ?? true}
              onLabel={t('options.on')}
              offLabel={t('options.off')}
              onChange={toggleAutoDetect}
            />
            <CheckboxRow
              label={t('options.addToReview')}
              description={t('options.addToReviewDesc')}
              checked={settings?.addToReviewOnAnalyze ?? false}
              onChange={() => settings && update({ ...settings, addToReviewOnAnalyze: !settings.addToReviewOnAnalyze })}
            />
            <CheckboxRow
              label={t('options.persistAnalysis')}
              description={t('options.persistAnalysisDesc')}
              checked={settings?.persistAnalysis ?? true}
              onChange={() => settings && update({ ...settings, persistAnalysis: !settings.persistAnalysis })}
            />
            <CheckboxRow
              label={t('options.crossSiteHighlight')}
              description={t('options.crossSiteHighlightDesc')}
              checked={settings?.crossSiteHighlight ?? false}
              onChange={() => settings && update({ ...settings, crossSiteHighlight: !settings.crossSiteHighlight })}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">{t('options.highlightColor')}</h2>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <input
              type="color"
              value={settings?.highlightColor ?? '#fef08a'}
              onChange={(e) =>
                settings && update({ ...settings, highlightColor: e.target.value })
              }
              className="size-8 cursor-pointer rounded border-0"
            />
            <span className="text-sm text-muted-foreground">
              {t('options.highlightColorDesc')}
            </span>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('options.segmentColors')}</h2>
            <Button variant="ghost" size="sm" onClick={resetSegmentColors}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              {t('options.resetColors')}
            </Button>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">{t('options.segmentColorsDesc')}</p>
          <div className="grid grid-cols-2 gap-3 rounded-lg border p-4">
            {segmentColors &&
              (Object.keys(SEGMENT_TYPE_LABELS) as SegmentType[]).map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={segmentColors[type] ?? DEFAULT_SEGMENT_COLORS[type]}
                    onChange={(e) => updateSegmentColor(type, e.target.value)}
                    className="size-7 cursor-pointer rounded border-0"
                  />
                  <span className="text-sm">{SEGMENT_TYPE_LABELS[type]}</span>
                </div>
              ))}
          </div>
        </section>

        <section>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => browser.tabs.create({ url: browser.runtime.getURL('/manage.html') })}
          >
            <FileText className="mr-2 h-4 w-4" />
            {t('options.manageRecords')}
          </Button>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">{t('options.about')}</h2>
          <div className="rounded-lg border p-4">
            <p className="text-sm">{t('options.version', { version: '0.1.0' })}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('options.description')}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  checked,
  onLabel,
  offLabel,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onLabel: string;
  offLabel: string;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Button
        variant={checked ? 'default' : 'outline'}
        size="sm"
        onClick={onChange}
      >
        {checked ? onLabel : offLabel}
      </Button>
    </div>
  );
}

function CheckboxRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 cursor-pointer accent-primary"
      />
    </div>
  );
}

export default App;
