export type AiProviderType = 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'openai-compatible' | 'anthropic-compatible';

export interface AiProviderConfig {
  id: string;
  name: string;
  provider: AiProviderType;
  apiKey: string;
  model: string;
  /** custom base URL for OpenAI-compatible / Ollama providers */
  baseUrl?: string;
  /** built-in providers cannot be deleted by users */
  isBuiltin?: boolean;
  createdAt: number;
}

/** resolved config passed to the AI service layer */
export interface AiConfig {
  provider: AiProviderType;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const AI_PROVIDER_LABELS: Record<AiProviderType, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Gemini',
  ollama: 'Ollama',
  'openai-compatible': 'OpenAI 兼容',
  'anthropic-compatible': 'Anthropic 兼容',
};

export const AI_PROVIDER_MODELS: Record<AiProviderType, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini', 'o3-mini'],
  anthropic: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'],
  gemini: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'],
  ollama: ['llama3.1', 'llama3.2', 'qwen2.5', 'deepseek-r1', 'gemma2', 'mistral', 'phi3'],
  'openai-compatible': [],
  'anthropic-compatible': [],
};

export const AI_PROVIDER_DEFAULTS: Partial<Record<AiProviderType, { baseUrl: string; apiKey: string }>> = {
  ollama: { baseUrl: 'http://localhost:11434/v1', apiKey: 'ollama' },
};
