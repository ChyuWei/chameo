import { generateText, streamText, type LanguageModel } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { AiConfig, AiProviderType, ChatMessage } from '@/types';

function createModel(config: AiConfig): LanguageModel {
  const { provider, apiKey, model, baseUrl } = config;

  const factories: Record<AiProviderType, () => LanguageModel> = {
    openai: () => createOpenAI({ apiKey })(model),
    anthropic: () => createAnthropic({ apiKey })(model),
    gemini: () => createGoogleGenerativeAI({ apiKey })(model),
    ollama: () =>
      createOpenAI({ apiKey: apiKey || 'ollama', baseURL: baseUrl || 'http://localhost:11434/v1' })(model),
    'openai-compatible': () =>
      createOpenAI({ apiKey, baseURL: baseUrl })(model),
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
  options?: { maxTokens?: number; temperature?: number; signal?: AbortSignal },
): Promise<string> {
  const model = createModel(config);
  const { text } = await generateText({
    model,
    messages,
    maxTokens: options?.maxTokens,
    temperature: options?.temperature,
    abortSignal: options?.signal,
  });
  return text;
}

export async function chatStream(
  config: AiConfig,
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  options?: { maxTokens?: number; temperature?: number; signal?: AbortSignal },
): Promise<string> {
  const model = createModel(config);
  const result = streamText({
    model,
    messages,
    maxTokens: options?.maxTokens,
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
  options?: { system?: string; maxTokens?: number; temperature?: number },
): Promise<string> {
  const messages: ChatMessage[] = [];
  if (options?.system) {
    messages.push({ role: 'system', content: options.system });
  }
  messages.push({ role: 'user', content: prompt });
  return chat(config, messages, options);
}
