/** 成分类型枚举 */
export type SegmentType =
  | 'subject'
  | 'predicate'
  | 'object'
  | 'attributive-clause'
  | 'adverbial-clause'
  | 'appositive-clause'
  | 'parenthetical'
  | 'prepositional-phrase'
  | 'non-finite'
  | 'conjunction';

/** 句子片段 */
export interface Segment {
  text: string;
  type: SegmentType;
  /** 修饰对象，主干成分省略 */
  modifies?: string;
}

/** 主干还原 */
export interface CoreStructure {
  subject: string;
  predicate: string;
  object: string;
  summary: string;
}

/** 长难句分析结果 */
export interface AnalysisResult {
  sentence: string;
  segments: Segment[];
  core: CoreStructure;
  translation: string;
}

/** 分析选项 */
export interface AnalyzeOptions {
  signal?: AbortSignal;
}

/**
 * 文本生成函数。
 * core 不关心底层用的是哪个 LLM SDK / provider，
 * 只要求调用方传入一个 (prompt, systemPrompt) => text 的函数。
 */
export type TextGenerator = (
  prompt: string,
  system: string,
) => Promise<string>;
