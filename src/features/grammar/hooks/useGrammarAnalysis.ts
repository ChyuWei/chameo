import { useState, useCallback } from 'react';
import type { GrammarAnalysis } from '@/types';
import { ask } from '@/services/ai';
import { useAiProviders } from '@/hooks/useAiProviders';

const SYSTEM_PROMPT = `You are an English grammar analyzer. 
Analyze sentences and return JSON with this exact shape:
{
  "sentence": "<original sentence>",
  "nodes": [{ "type": "<role>", "text": "<text>", "start": <number>, "end": <number> }],
  "explanation": "<brief explanation in Chinese>"
}
Possible types: subject, predicate, object, complement, adverbial, attributive, clause, conjunction, preposition-phrase, other.
Return ONLY valid JSON, no markdown fences.`;

export function useGrammarAnalysis() {
  const { activeConfig } = useAiProviders();
  const [analysis, setAnalysis] = useState<GrammarAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(
    async (sentence: string) => {
      if (!activeConfig) {
        setError('请先在设置中配置 AI 服务');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await ask(activeConfig, sentence, {
          system: SYSTEM_PROMPT,
          temperature: 0,
        });
        const parsed = JSON.parse(result) as GrammarAnalysis;
        setAnalysis(parsed);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Analysis failed');
      } finally {
        setLoading(false);
      }
    },
    [activeConfig],
  );

  const clear = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  return { analysis, loading, error, analyze, clear } as const;
}
