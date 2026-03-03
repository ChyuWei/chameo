export interface GrammarNode {
  type: GrammarRole;
  text: string;
  /** character offset in the original sentence */
  start: number;
  end: number;
  children?: GrammarNode[];
}

export type GrammarRole =
  | 'subject'
  | 'predicate'
  | 'object'
  | 'complement'
  | 'adverbial'
  | 'attributive'
  | 'clause'
  | 'conjunction'
  | 'preposition-phrase'
  | 'other';

export interface GrammarAnalysis {
  sentence: string;
  nodes: GrammarNode[];
  explanation: string;
}
