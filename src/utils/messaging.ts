import { defineExtensionMessaging } from '@webext-core/messaging';
import type { TextSelection, GrammarAnalysis } from '@/types';

interface ProtocolMap {
  'text-selected': (data: TextSelection) => void;
  'open-side-panel': () => void;
  'analyze-grammar': (data: { sentence: string }) => GrammarAnalysis;
  'speak-text': (data: { text: string; lang?: string }) => void;
  'highlight-add': (data: { text: string; color: string }) => void;
  'highlight-clear': () => void;
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
