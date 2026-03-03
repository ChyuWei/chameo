import { useState, useCallback } from 'react';
import { speak, stopSpeaking, getVoices } from '@/services/tts';
import type { TtsOptions, TtsVoice } from '@/types';

export function useTts() {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<TtsVoice[]>([]);

  const play = useCallback(async (text: string, options?: TtsOptions) => {
    setSpeaking(true);
    try {
      await speak(text, options);
    } finally {
      setSpeaking(false);
    }
  }, []);

  const stop = useCallback(() => {
    stopSpeaking();
    setSpeaking(false);
  }, []);

  const loadVoices = useCallback(async () => {
    const v = await getVoices();
    setVoices(v);
  }, []);

  return { speaking, voices, play, stop, loadVoices } as const;
}
