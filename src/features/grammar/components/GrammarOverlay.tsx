import type { AnalysisResult, SegmentType } from '@/types';

const SEGMENT_COLORS: Record<SegmentType, string> = {
  'subject': 'bg-blue-100 text-blue-800',
  'predicate': 'bg-red-100 text-red-800',
  'object': 'bg-green-100 text-green-800',
  'attributive-clause': 'bg-pink-100 text-pink-800',
  'adverbial-clause': 'bg-yellow-100 text-yellow-800',
  'appositive-clause': 'bg-orange-100 text-orange-800',
  'parenthetical': 'bg-gray-100 text-gray-800',
  'prepositional-phrase': 'bg-teal-100 text-teal-800',
  'non-finite': 'bg-purple-100 text-purple-800',
  'conjunction': 'bg-gray-100 text-gray-600',
};

const SEGMENT_LABELS: Record<SegmentType, string> = {
  'subject': '主语',
  'predicate': '谓语',
  'object': '宾语',
  'attributive-clause': '定语从句',
  'adverbial-clause': '状语从句',
  'appositive-clause': '同位语从句',
  'parenthetical': '插入语',
  'prepositional-phrase': '介词短语',
  'non-finite': '非谓语',
  'conjunction': '连词',
};

interface GrammarOverlayProps {
  analysis: AnalysisResult;
}

export function GrammarOverlay({ analysis }: GrammarOverlayProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        {analysis.segments.map((seg, i) => (
          <span
            key={i}
            className={`inline-flex flex-col items-center rounded px-1.5 py-0.5 ${SEGMENT_COLORS[seg.type]}`}
            title={seg.modifies ? `修饰: ${seg.modifies}` : undefined}
          >
            <span className="text-sm">{seg.text}</span>
            <span className="text-[10px] opacity-70">{SEGMENT_LABELS[seg.type]}</span>
          </span>
        ))}
      </div>

      <div className="rounded-md border p-3 text-sm">
        <p className="font-medium">主干还原</p>
        <p className="mt-1 text-muted-foreground">{analysis.core.summary}</p>
      </div>

      <p className="text-sm text-muted-foreground">{analysis.translation}</p>
    </div>
  );
}
