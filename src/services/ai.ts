import { generateText, streamText, type LanguageModel } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { AiConfig, AiProviderType, ChatMessage } from '@/types';

function isOllama(config: AiConfig): boolean {
  return config.provider === 'ollama';
}

async function ollamaChat(
  config: AiConfig,
  messages: ChatMessage[],
  options?: { temperature?: number },
): Promise<string> {
  const baseUrl = (config.baseUrl || 'http://localhost:11434').replace(/\/v1\/?$/, '');
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      messages,
      stream: false,
      think: false,
      options: options?.temperature != null ? { temperature: options.temperature } : undefined,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Ollama error: ${res.status} ${res.statusText} ${body}`);
  }
  const data = await res.json();
  return data.message?.content ?? '';
}

function createModel(config: AiConfig): LanguageModel {
  const { provider, apiKey, model, baseUrl } = config;

  const factories: Record<AiProviderType, () => LanguageModel> = {
    openai: () => createOpenAI({ apiKey })(model),
    anthropic: () => createAnthropic({ apiKey })(model),
    gemini: () => createGoogleGenerativeAI({ apiKey })(model),
    ollama: () =>
      createOpenAICompatible({
        name: 'ollama',
        apiKey: apiKey || 'ollama',
        baseURL: baseUrl || 'http://localhost:11434/v1',
      }).chatModel(model),
    'openai-compatible': () =>
      createOpenAICompatible({
        name: 'openai-compatible',
        apiKey,
        baseURL: baseUrl!,
      }).chatModel(model),
    'anthropic-compatible': () =>
      createAnthropic({ apiKey, baseURL: baseUrl })(model),
  };

  const factory = factories[provider];
  if (!factory) throw new Error(`Unknown AI provider: ${provider}`);
  return factory();
}

export async function chat(
  config: AiConfig,
  messages: ChatMessage[],
  options?: { maxOutputTokens?: number; temperature?: number; signal?: AbortSignal },
): Promise<string> {
  if (isOllama(config)) {
    return ollamaChat(config, messages, { temperature: options?.temperature });
  }
  const model = createModel(config);
  const providerOptions = getProviderOptions(config.provider);
  const { text } = await generateText({
    model,
    messages,
    maxOutputTokens: options?.maxOutputTokens,
    temperature: options?.temperature,
    abortSignal: options?.signal,
    providerOptions,
  });
  return text;
}

function getProviderOptions(provider: AiProviderType) {
  if (provider === 'anthropic' || provider === 'anthropic-compatible') {
    return { anthropic: { thinking: { type: 'disabled' as const } } };
  }
  return undefined;
}

export async function chatStream(
  config: AiConfig,
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  options?: { maxOutputTokens?: number; temperature?: number; signal?: AbortSignal },
): Promise<string> {
  const model = createModel(config);
  const result = streamText({
    model,
    messages,
    maxOutputTokens: options?.maxOutputTokens,
    temperature: options?.temperature,
    abortSignal: options?.signal,
  });

  let fullText = '';
  for await (const chunk of result.textStream) {
    fullText += chunk;
    onChunk(chunk);
  }
  return fullText;
}

export async function ask(
  config: AiConfig,
  prompt: string,
  options?: { system?: string; maxOutputTokens?: number; temperature?: number },
): Promise<string> {
  const messages: ChatMessage[] = [];
  if (options?.system) {
    messages.push({ role: 'system', content: options.system });
  }
  messages.push({ role: 'user', content: prompt });
  return chat(config, messages, options);
}
