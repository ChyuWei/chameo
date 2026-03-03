export interface TtsOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  voice?: string;
}

export interface TtsProvider {
  readonly name: string;
  speak(text: string, options?: TtsOptions): Promise<void>;
  stop(): void;
  getVoices(): Promise<TtsVoice[]>;
}

export interface TtsVoice {
  id: string;
  name: string;
  lang: string;
}
