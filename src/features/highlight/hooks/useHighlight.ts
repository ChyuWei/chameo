import { useState, useCallback } from 'react';
import type { HighlightMark } from '@/types';

export function useHighlight() {
  const [marks, setMarks] = useState<HighlightMark[]>([]);

  const addMark = useCallback((mark: HighlightMark) => {
    setMarks((prev) => [...prev, mark]);
  }, []);

  const removeMark = useCallback((id: string) => {
    setMarks((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const clearMarks = useCallback(() => {
    setMarks([]);
  }, []);

  return { marks, addMark, removeMark, clearMarks } as const;
}
