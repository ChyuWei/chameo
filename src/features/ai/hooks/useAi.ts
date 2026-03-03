import { useState, useCallback, useRef } from 'react';
import { chat, chatStream, ask } from '@/services/ai';
import { useAiProviders } from '@/hooks/useAiProviders';
import type { ChatMessage } from '@/types';

export function useAi() {
  const { activeConfig } = useAiProviders();
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const configured = !!activeConfig;

  const sendChat = useCallback(
    async (messages: ChatMessage[]) => {
      if (!activeConfig) {
        setError('请先在设置中配置 AI 服务');
        return null;
      }
      setLoading(true);
      setError(null);
      setResult('');
      try {
        const text = await chat(activeConfig, messages);
        setResult(text);
        return text;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'AI request failed';
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [activeConfig],
  );

  const sendStream = useCallback(
    async (messages: ChatMessage[]) => {
      if (!activeConfig) {
        setError('请先在设置中配置 AI 服务');
        return;
      }
      abortRef.current = new AbortController();
      setLoading(true);
      setError(null);
      setResult('');
      try {
        await chatStream(activeConfig, messages, (chunk) => {
          setResult((prev) => prev + chunk);
        }, { signal: abortRef.current.signal });
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setError(e instanceof Error ? e.message : 'AI stream failed');
        }
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [activeConfig],
  );

  const sendAsk = useCallback(
    async (prompt: string, system?: string) => {
      if (!activeConfig) {
        setError('请先在设置中配置 AI 服务');
        return null;
      }
      setLoading(true);
      setError(null);
      setResult('');
      try {
        const text = await ask(activeConfig, prompt, { system });
        setResult(text);
        return text;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'AI request failed';
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [activeConfig],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clear = useCallback(() => {
    setResult('');
    setError(null);
  }, []);

  return {
    result,
    loading,
    error,
    configured,
    sendChat,
    sendStream,
    sendAsk,
    abort,
    clear,
  } as const;
}
