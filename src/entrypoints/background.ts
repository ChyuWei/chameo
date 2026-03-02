import { onMessage } from '@/utils/messaging';

export default defineBackground(() => {
  console.log('Chameo background service worker started');

  onMessage('text-selected', ({ data }) => {
    console.log('User selected text:', data.text);
  });

  onMessage('open-side-panel', async ({ sender }) => {
    // @ts-expect-error sidePanel API types may not be available in all browsers
    await browser.sidePanel?.open?.({ windowId: sender.tab?.windowId });
  });

  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
      console.log('Chameo installed');
    }
  });
});
