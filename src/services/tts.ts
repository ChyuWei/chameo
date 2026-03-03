import type { TtsProvider, TtsOptions, TtsVoice } from '@/types';

let currentProvider: TtsProvider | null = null;

export function getTtsProvider(): TtsProvider | null {
  return currentProvider;
}

export function setTtsProvider(provider: TtsProvider) {
  currentProvider = provider;
}

export async function speak(text: string, options?: TtsOptions): Promise<void> {
  const provider = getTtsProvider();
  if (!provider) {
    throw new Error('No TTS provider configured');
  }
  return provider.speak(text, options);
}

export function stopSpeaking() {
  getTtsProvider()?.stop();
}

export async function getVoices(): Promise<TtsVoice[]> {
  const provider = getTtsProvider();
  if (!provider) return [];
  return provider.getVoices();
}
