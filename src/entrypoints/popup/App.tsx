import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { sendMessage } from '@/utils/messaging';

function App() {
  const { t } = useTranslation();

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
