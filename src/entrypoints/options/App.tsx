import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useExtStorage } from '@/hooks/useExtStorage';
import { useAiProviders } from '@/hooks/useAiProviders';
import { settingsStorage } from '@/utils/storage';
import { AiProviderList } from '@/components/common/AiProviderList';

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

export default App;
