import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AI_PROVIDER_LABELS, type AiProviderConfig } from '@/types';
import { AiProviderForm } from './AiProviderForm';

interface AiProviderListProps {
  providers: AiProviderConfig[];
  activeId: string | null;
  onAdd: (config: AiProviderConfig) => void;
  onUpdate: (id: string, updates: Partial<AiProviderConfig>) => void;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
}

export function AiProviderList({
  providers,
  activeId,
  onAdd,
  onUpdate,
  onRemove,
  onSelect,
}: AiProviderListProps) {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingProvider = editingId
    ? providers.find((p) => p.id === editingId)
    : undefined;

  const handleAdd = (config: AiProviderConfig) => {
    onAdd(config);
    setShowForm(false);
  };

  const handleEdit = (config: AiProviderConfig) => {
    onUpdate(config.id, config);
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('aiProvider.title')}</h2>
        <Button size="sm" onClick={() => setShowForm(true)} disabled={showForm}>
          {t('aiProvider.add')}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('aiProvider.addNew')}</CardTitle>
          </CardHeader>
          <CardContent>
            <AiProviderForm
              onSubmit={handleAdd}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {editingId && editingProvider && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('aiProvider.edit')}</CardTitle>
          </CardHeader>
          <CardContent>
            <AiProviderForm
              initial={editingProvider}
              onSubmit={handleEdit}
              onCancel={() => setEditingId(null)}
            />
          </CardContent>
        </Card>
      )}

      {providers.length === 0 && !showForm && (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">{t('aiProvider.empty')}</p>
        </div>
      )}

      <div className="space-y-2">
        {providers.map((p) => {
          const isActive = p.id === activeId;
          return (
            <Card
              key={p.id}
              className={`cursor-pointer transition-colors ${isActive ? 'border-primary' : 'hover:border-primary/50'}`}
              onClick={() => onSelect(p.id)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{p.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {AI_PROVIDER_LABELS[p.provider]}
                    </Badge>
                    {isActive && (
                      <Badge className="text-xs">{t('aiProvider.active')}</Badge>
                    )}
                    {p.isBuiltin && (
                      <Badge variant="outline" className="text-xs">
                        {t('aiProvider.builtin')}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-1">
                    {p.model}
                    {p.baseUrl && ` · ${p.baseUrl}`}
                  </CardDescription>
                  {p.isBuiltin && !p.apiKey && (
                    <p className="mt-1 text-xs text-destructive">
                      {t('aiProvider.needsKey')}
                    </p>
                  )}
                </div>
                <div className="ml-3 flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(p.id);
                      setShowForm(false);
                    }}
                  >
                    {p.isBuiltin && !p.apiKey ? t('aiProvider.configure') : t('common.edit')}
                  </Button>
                  {!p.isBuiltin && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(p.id);
                      }}
                    >
                      {t('common.delete')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
