import { split, SentenceSplitterSyntax as Syntax } from 'sentence-splitter';

/**
 * Split a block of English text into individual sentences.
 * Uses sentence-splitter for robust handling of abbreviations,
 * quoted text, decimal numbers, etc.
 */
export function splitSentences(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const result = split(trimmed);

  return result
    .filter((node) => node.type === Syntax.Sentence)
    .map((node) => node.raw.trim())
    .filter((s) => s.length >= 3);
}
