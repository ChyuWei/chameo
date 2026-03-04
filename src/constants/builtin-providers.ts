import type { AiProviderConfig } from '@/types';

export const BUILTIN_PROVIDERS: AiProviderConfig[] = [
  {
    id: 'builtin-siliconflow',
    name: 'SiliconFlow (免费)',
    provider: 'openai-compatible',
    apiKey: '',
    model: 'Qwen/Qwen2.5-7B-Instruct',
    baseUrl: 'https://api.siliconflow.cn/v1',
    isBuiltin: true,
    createdAt: 0,
  },
];
