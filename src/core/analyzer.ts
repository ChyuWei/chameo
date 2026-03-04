import type { AnalysisResult, AnalyzeOptions } from './types';

/**
 * 长难句分析器抽象接口。
 *
 * 不同实现方式（LLM / 规则引擎 / 词典等）只需实现此接口，
 * 上层代码通过接口调用，不关心具体实现。
 */
export interface SentenceAnalyzer {
  readonly name: string;
  analyze(sentence: string, options?: AnalyzeOptions): Promise<AnalysisResult>;
}
