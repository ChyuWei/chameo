import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AI_PROVIDER_LABELS,
  AI_PROVIDER_MODELS,
  AI_PROVIDER_DEFAULTS,
  type AiProviderType,
  type AiProviderConfig,
} from '@/types';

interface AiProviderFormProps {
  initial?: AiProviderConfig;
  onSubmit: (config: AiProviderConfig) => void;
  onCancel: () => void;
}

const PROVIDER_TYPES = Object.keys(AI_PROVIDER_LABELS) as AiProviderType[];

export function AiProviderForm({ initial, onSubmit, onCancel }: AiProviderFormProps) {
  const { t } = useTranslation();
  const isEdit = !!initial;

  const [name, setName] = useState(initial?.name ?? '');
  const [provider, setProvider] = useState<AiProviderType>(initial?.provider ?? 'openai');
  const [apiKey, setApiKey] = useState(initial?.apiKey ?? '');
  const [model, setModel] = useState(initial?.model ?? '');
  const [baseUrl, setBaseUrl] = useState(initial?.baseUrl ?? '');
  const [showApiKey, setShowApiKey] = useState(false);

  const presetModels = AI_PROVIDER_MODELS[provider];
  const needsBaseUrl = provider === 'openai-compatible' || provider === 'anthropic-compatible' || provider === 'ollama';
  const isApiKeyOptional = provider === 'ollama';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const defaults = AI_PROVIDER_DEFAULTS[provider];
    onSubmit({
      id: initial?.id ?? crypto.randomUUID(),
      name: name.trim() || AI_PROVIDER_LABELS[provider],
      provider,
      apiKey: apiKey.trim() || defaults?.apiKey || '',
      model: model.trim(),
      baseUrl: needsBaseUrl ? (baseUrl.trim() || defaults?.baseUrl) : undefined,
      isBuiltin: initial?.isBuiltin,
      createdAt: initial?.createdAt ?? Date.now(),
    });
  };

  const canSubmit = (isApiKeyOptional || apiKey.trim()) && model.trim() && (!needsBaseUrl || baseUrl.trim() || AI_PROVIDER_DEFAULTS[provider]?.baseUrl);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>{t('aiProvider.name')}</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={AI_PROVIDER_LABELS[provider]}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('aiProvider.type')}</Label>
        <Select value={provider} onValueChange={(v) => {
          const next = v as AiProviderType;
          setProvider(next);
          setModel('');
          const defaults = AI_PROVIDER_DEFAULTS[next];
          setBaseUrl(defaults?.baseUrl ?? '');
          setApiKey(defaults?.apiKey ?? '');
        }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROVIDER_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {AI_PROVIDER_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>API Key{isApiKeyOptional && <span className="ml-1 text-xs text-muted-foreground">({t('aiProvider.optional')})</span>}</Label>
        <div className="relative">
          <Input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={isApiKeyOptional ? t('aiProvider.ollamaKeyHint') : 'sk-...'}
            className="pr-9"
          />
          <button
            type="button"
            onClick={() => setShowApiKey((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('aiProvider.model')}</Label>
        <Input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={presetModels[0] ?? 'model-name'}
        />
      </div>

      {needsBaseUrl && (
        <div className="space-y-2">
          <Label>Base URL</Label>
          <Input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder={AI_PROVIDER_DEFAULTS[provider]?.baseUrl ?? 'https://api.deepseek.com/v1'}
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {isEdit ? t('common.save') : t('aiProvider.add')}
        </Button>
      </div>
    </form>
  );
}
