import { useCallback } from 'react';
import { useExtStorage } from './useExtStorage';
import { aiProvidersStorage, activeProviderIdStorage } from '@/utils/storage';
import type { AiProviderConfig, AiConfig } from '@/types';

export function useAiProviders() {
  const { value: providers, loading, update: setProviders } =
    useExtStorage(aiProvidersStorage);
  const { value: activeId, update: setActiveId } =
    useExtStorage(activeProviderIdStorage);

  const activeProvider = providers?.find((p) => p.id === activeId) ?? null;

  const activeConfig: AiConfig | null = activeProvider
    ? {
        provider: activeProvider.provider,
        apiKey: activeProvider.apiKey,
        model: activeProvider.model,
        baseUrl: activeProvider.baseUrl,
      }
    : null;

  const addProvider = useCallback(
    async (config: AiProviderConfig) => {
      const list = providers ?? [];
      await setProviders([...list, config]);
      if (list.length === 0) {
        await setActiveId(config.id);
      }
    },
    [providers, setProviders, setActiveId],
  );

  const updateProvider = useCallback(
    async (id: string, updates: Partial<AiProviderConfig>) => {
      const list = providers ?? [];
      await setProviders(
        list.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      );
    },
    [providers, setProviders],
  );

  const removeProvider = useCallback(
    async (id: string) => {
      const list = providers ?? [];
      const next = list.filter((p) => p.id !== id);
      await setProviders(next);
      if (activeId === id) {
        await setActiveId(next[0]?.id ?? null);
      }
    },
    [providers, activeId, setProviders, setActiveId],
  );

  const selectProvider = useCallback(
    async (id: string) => {
      await setActiveId(id);
    },
    [setActiveId],
  );

  return {
    providers: providers ?? [],
    activeId,
    activeProvider,
    activeConfig,
    loading,
    addProvider,
    updateProvider,
    removeProvider,
    selectProvider,
  } as const;
}
