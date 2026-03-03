import type { GrammarAnalysis, GrammarRole } from '@/types';

const ROLE_COLORS: Record<GrammarRole, string> = {
  subject: 'bg-blue-100 text-blue-800',
  predicate: 'bg-red-100 text-red-800',
  object: 'bg-green-100 text-green-800',
  complement: 'bg-purple-100 text-purple-800',
  adverbial: 'bg-yellow-100 text-yellow-800',
  attributive: 'bg-pink-100 text-pink-800',
  clause: 'bg-orange-100 text-orange-800',
  conjunction: 'bg-gray-100 text-gray-800',
  'preposition-phrase': 'bg-teal-100 text-teal-800',
  other: 'bg-gray-50 text-gray-600',
};

const ROLE_LABELS: Record<GrammarRole, string> = {
  subject: '主语',
  predicate: '谓语',
  object: '宾语',
  complement: '补语',
  adverbial: '状语',
  attributive: '定语',
  clause: '从句',
  conjunction: '连词',
  'preposition-phrase': '介词短语',
  other: '其他',
};

interface GrammarOverlayProps {
  analysis: GrammarAnalysis;
}

export function GrammarOverlay({ analysis }: GrammarOverlayProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {analysis.nodes.map((node, i) => (
          <span
            key={i}
            className={`inline-flex flex-col items-center rounded px-1.5 py-0.5 ${ROLE_COLORS[node.type]}`}
          >
            <span className="text-sm">{node.text}</span>
            <span className="text-[10px] opacity-70">{ROLE_LABELS[node.type]}</span>
          </span>
        ))}
      </div>
      {analysis.explanation && (
        <p className="text-sm text-muted-foreground">{analysis.explanation}</p>
      )}
    </div>
  );
}
