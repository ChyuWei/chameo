import { useState, useCallback, useMemo } from 'react';
import { LlmAnalyzer, type AnalysisResult } from '@/core';
import { useAiProviders } from '@/hooks/useAiProviders';
import { ask } from '@/services/ai';

export function useGrammarAnalysis() {
  const { activeConfig } = useAiProviders();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzer = useMemo(() => {
    if (!activeConfig) return null;
    return new LlmAnalyzer((prompt, system) =>
      ask(activeConfig, prompt, { system, temperature: 0 }),
    );
  }, [activeConfig]);

  const analyze = useCallback(
    async (sentence: string) => {
      if (!analyzer) {
        setError('请先在设置中配置 AI 服务');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await analyzer.analyze(sentence);
        setAnalysis(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Analysis failed');
      } finally {
        setLoading(false);
      }
    },
    [analyzer],
  );

  const clear = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  return { analysis, loading, error, analyze, clear } as const;
}
