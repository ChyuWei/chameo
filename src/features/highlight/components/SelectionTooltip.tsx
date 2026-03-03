import { Button } from '@/components/ui/button';

interface SelectionTooltipProps {
  x: number;
  y: number;
  onLookup: () => void;
  onAnalyze: () => void;
  onSpeak: () => void;
  onDismiss: () => void;
}

export function SelectionTooltip({
  x,
  y,
  onLookup,
  onAnalyze,
  onSpeak,
  onDismiss,
}: SelectionTooltipProps) {
  return (
    <div
      className="fixed z-[99999] flex gap-1 rounded-lg border bg-popover p-1 shadow-lg"
      style={{ left: x, top: y }}
    >
      <Button variant="ghost" size="xs" onClick={onLookup}>
        释义
      </Button>
      <Button variant="ghost" size="xs" onClick={onAnalyze}>
        语法
      </Button>
      <Button variant="ghost" size="xs" onClick={onSpeak}>
        发音
      </Button>
      <Button variant="ghost" size="xs" onClick={onDismiss}>
        ✕
      </Button>
    </div>
  );
}
