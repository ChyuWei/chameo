import { sendMessage } from '@/utils/messaging';

export default defineContentScript({
  matches: ['<all_urls>'],

  main() {
    console.log('Chameo content script loaded');

    document.addEventListener('mouseup', () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (text && text.length > 0) {
        sendMessage('text-selected', { text });
      }
    });
  },
});
