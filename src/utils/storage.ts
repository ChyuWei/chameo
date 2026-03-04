import { storage } from '@wxt-dev/storage';
import type { AiProviderConfig } from '@/types';
import type { AnalysisResult } from '@/core/types';
import { DEFAULT_SEGMENT_COLORS, type SegmentColorMap } from '@/constants/segment-colors';

export interface WordEntry {
  word: string;
  context: string;
  timestamp: number;
}

export interface ChameoSettings {
  enabled: boolean;
  highlightColor: string;
  autoDetect: boolean;
  addToReviewOnAnalyze: boolean;
  persistAnalysis: boolean;
  crossSiteHighlight: boolean;
}

export const settingsStorage = storage.defineItem<ChameoSettings>(
  'local:chameo:settings',
  {
    fallback: {
      enabled: true,
      highlightColor: '#fef08a',
      autoDetect: true,
      addToReviewOnAnalyze: false,
      persistAnalysis: true,
      crossSiteHighlight: false,
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

export const segmentColorsStorage = storage.defineItem<SegmentColorMap>(
  'local:chameo:segment-colors',
  { fallback: DEFAULT_SEGMENT_COLORS },
);

export interface SavedAnalysis {
  sentence: string;
  result: AnalysisResult;
  timestamp: number;
}

/** URL → saved analyses map */
export type AnalysisCacheMap = Record<string, SavedAnalysis[]>;

export const analysisCacheStorage = storage.defineItem<AnalysisCacheMap>(
  'local:chameo:analysis-cache',
  { fallback: {} },
);
