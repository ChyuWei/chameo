import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

function App() {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-2 border-b p-3">
        <img src="/icon/32.png" alt={t('common.appName')} className="size-6" />
        <h1 className="text-sm font-bold">{t('common.appName')}</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t('sidepanel.placeholder')}
          </p>
        </div>
      </main>

      <footer className="border-t p-3">
        <Button variant="outline" size="sm" className="w-full">
          {t('sidepanel.wordbook')}
        </Button>
      </footer>
    </div>
  );
}

export default App;
