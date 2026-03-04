import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sendMessage } from '@/utils/messaging';
import { useAiProviders } from '@/hooks/useAiProviders';
import { AI_PROVIDER_LABELS } from '@/types';

function App() {
  const { t } = useTranslation();
  const { providers, activeId, activeProvider, selectProvider } = useAiProviders();
  const hasReadyProvider = providers.some((p) => !!p.apiKey);

  const handleOpenSidePanel = () => {
    sendMessage('open-side-panel', undefined);
  };

  const handleOpenOptions = () => {
    browser.runtime.openOptionsPage();
  };

  return (
    <div className="w-80 p-4">
      <div className="mb-4 flex items-center gap-2">
        <img src="/icon/48.png" alt={t('common.appName')} className="size-8" />
        <div>
          <h1 className="text-lg font-bold leading-tight">{t('common.appName')}</h1>
          <p className="text-xs text-muted-foreground">{t('common.appSlogan')}</p>
        </div>
      </div>

      <div className="space-y-2">
        {hasReadyProvider ? (
          <>
            <Select value={activeId ?? ''} onValueChange={selectProvider}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('popup.selectProvider')} />
              </SelectTrigger>
              <SelectContent>
                {providers.map((p) => {
                  const ready = !!p.apiKey;
                  return (
                    <SelectItem key={p.id} value={p.id} disabled={!ready}>
                      <span className={ready ? '' : 'text-muted-foreground'}>{p.name}</span>
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {ready ? `${AI_PROVIDER_LABELS[p.provider]} · ${p.model}` : t('popup.notConfigured')}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {activeProvider && !activeProvider.apiKey && (
              <p className="text-xs text-destructive">{t('popup.activeNotReady')}</p>
            )}
          </>
        ) : (
          <button
            onClick={handleOpenOptions}
            className="w-full rounded-md border border-dashed px-3 py-2 text-center text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
          >
            {t('popup.goToSettings')}
          </button>
        )}

        <Button className="w-full" onClick={handleOpenSidePanel}>
          {t('popup.openSidePanel')}
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => browser.tabs.create({ url: browser.runtime.getURL('/manage.html') })}
          >
            {t('popup.manageRecords')}
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleOpenOptions}>
            {t('popup.settings')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
