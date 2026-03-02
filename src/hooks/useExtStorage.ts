import { useState, useEffect } from 'react';
import type { ExtensionStorageItem } from '@webext-core/storage';

export function useExtStorage<T>(storageItem: ExtensionStorageItem<T>) {
  const [value, setValue] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storageItem.getValue().then((v) => {
      setValue(v);
      setLoading(false);
    });

    const unwatch = storageItem.watch((newValue) => {
      setValue(newValue);
    });

    return unwatch;
  }, [storageItem]);

  const update = async (newValue: T) => {
    await storageItem.setValue(newValue);
  };

  return { value, loading, update } as const;
}
