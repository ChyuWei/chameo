import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
  'text-selected': (data: { text: string }) => void;
  'open-side-panel': () => void;
  'get-selected-text': () => string | null;
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
