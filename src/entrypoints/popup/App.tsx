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
        {providers.length > 0 ? (
          <Select value={activeId ?? ''} onValueChange={selectProvider}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('popup.selectProvider')} />
            </SelectTrigger>
            <SelectContent>
              {providers.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <span>{p.name}</span>
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {AI_PROVIDER_LABELS[p.provider]} · {p.model}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="rounded-md border border-dashed px-3 py-2 text-center text-xs text-muted-foreground">
            {t('popup.noProvider')}
          </p>
        )}

        <Button className="w-full" onClick={handleOpenSidePanel}>
          {t('popup.openSidePanel')}
        </Button>
        <Button variant="outline" className="w-full" onClick={handleOpenOptions}>
          {t('popup.settings')}
        </Button>
      </div>
    </div>
  );
}

export default App;
