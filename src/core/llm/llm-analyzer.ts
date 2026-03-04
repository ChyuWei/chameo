import type { SentenceAnalyzer } from '../analyzer';
import type { AnalysisResult, TextGenerator } from '../types';
import { SENTENCE_ANALYSIS_SYSTEM } from './prompts';

export class LlmAnalyzer implements SentenceAnalyzer {
  readonly name = 'llm';

  constructor(private generate: TextGenerator) {}

  async analyze(sentence: string): Promise<AnalysisResult> {
    const raw = await this.generate(sentence, SENTENCE_ANALYSIS_SYSTEM);
    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
    const result = JSON.parse(cleaned) as AnalysisResult;

    if (!result.sentence || !Array.isArray(result.segments) || !result.core) {
      throw new Error('Invalid analysis result structure');
    }

    return result;
  }
}
