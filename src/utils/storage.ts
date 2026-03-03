import { storage } from '@wxt-dev/storage';
import type { AiProviderConfig } from '@/types';

export interface WordEntry {
  word: string;
  context: string;
  timestamp: number;
}

export interface ChameoSettings {
  enabled: boolean;
  highlightColor: string;
  autoDetect: boolean;
}

export const settingsStorage = storage.defineItem<ChameoSettings>(
  'local:chameo:settings',
  {
    fallback: {
      enabled: true,
      highlightColor: '#fef08a',
      autoDetect: true,
    },
  },
);

export const wordListStorage = storage.defineItem<WordEntry[]>(
  'local:chameo:words',
  { fallback: [] },
);

export const aiProvidersStorage = storage.defineItem<AiProviderConfig[]>(
  'local:chameo:ai-providers',
  { fallback: [] },
);

export const activeProviderIdStorage = storage.defineItem<string | null>(
  'local:chameo:active-provider-id',
);
