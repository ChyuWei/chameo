import { localExtStorage } from '@webext-core/storage';

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

const DEFAULT_SETTINGS: ChameoSettings = {
  enabled: true,
  highlightColor: '#fef08a',
  autoDetect: true,
};

export const settingsStorage = localExtStorage.getItem<ChameoSettings>(
  'chameo:settings',
  { fallback: DEFAULT_SETTINGS },
);

export const wordListStorage = localExtStorage.getItem<WordEntry[]>(
  'chameo:words',
  { fallback: [] },
);
