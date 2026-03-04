import type { SegmentType } from '@/core/types';

export type SegmentColorMap = Record<SegmentType, string>;

export const DEFAULT_SEGMENT_COLORS: SegmentColorMap = {
  'subject':              '#3b82f6', // blue
  'predicate':            '#ef4444', // red
  'object':               '#22c55e', // green
  'attributive-clause':   '#a855f7', // purple
  'adverbial-clause':     '#f97316', // orange
  'appositive-clause':    '#14b8a6', // teal
  'parenthetical':        '#6b7280', // gray
  'prepositional-phrase': '#ec4899', // pink
  'non-finite':           '#eab308', // yellow
  'conjunction':          '#6366f1', // indigo
};

export const SEGMENT_TYPE_LABELS: Record<SegmentType, string> = {
  'subject':              '主语 Subject',
  'predicate':            '谓语 Predicate',
  'object':               '宾语 Object',
  'attributive-clause':   '定语从句 Attr.Cl',
  'adverbial-clause':     '状语从句 Adv.Cl',
  'appositive-clause':    '同位语从句 App.Cl',
  'parenthetical':        '插入语 Par.',
  'prepositional-phrase': '介词短语 PP',
  'non-finite':           '非谓语 NF',
  'conjunction':          '连词 Conj.',
};
