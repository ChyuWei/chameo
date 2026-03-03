import { useState, useEffect } from 'react';
import type { WxtStorageItem } from '@wxt-dev/storage';

export function useExtStorage<T>(item: WxtStorageItem<T, Record<string, unknown>>) {
  const [value, setValue] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    item
      .getValue()
      .then((v) => {
        setValue(v);
      })
      .catch((err) => {
        console.warn('[Chameo] storage read failed:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    const unwatch = item.watch((newValue) => {
      setValue(newValue);
    });

    return () => unwatch();
  }, [item]);

  const update = async (newValue: T) => {
    await item.setValue(newValue);
  };

  return { value, loading, update } as const;
}
