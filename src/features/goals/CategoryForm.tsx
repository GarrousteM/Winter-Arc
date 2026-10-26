import { useState, type FormEvent } from 'react';
import { copy } from '@/copy';
import { cn } from '@/lib/cn';
import { Field, TextInput } from '@/ui/Field';
import {
  categoryColorTokens,
  categoryIconKeys,
  categoryIcons,
  type CategoryIconKey,
} from './categoryIcons';

const t = copy.categoryForm;

export type CategoryDraft = { name: string; icon: string; colorToken: string };

type CategoryFormProps = {
  formId: string;
  initial: CategoryDraft;
  onSubmit: (draft: CategoryDraft) => void;
};

export function CategoryForm({ formId, initial, onSubmit }: CategoryFormProps) {
  const [name, setName] = useState(initial.name);
  const [icon, setIcon] = useState(initial.icon);
  const [colorToken, setColorToken] = useState(initial.colorToken);
  const [error, setError] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim() === '') {
      setError(true);
      return;
    }
    onSubmit({ name: name.trim(), icon, colorToken });
  };

  return (
    <form id={formId} onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <Field label={t.name} error={error ? t.errorName : undefined}>
        {({ id, describedBy, invalid }) => (
          <TextInput
            id={id}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            maxLength={24}
            autoComplete="off"
          />
        )}
      </Field>

      <fieldset className="m-0 border-0 p-0">
        <legend className="eyebrow mb-1.5">{t.color}</legend>
        <div className="flex flex-wrap gap-2">
          {categoryColorTokens.map((token, i) => (
            <button
              key={token}
              type="button"
              aria-pressed={token === colorToken}
              aria-label={`${t.color} ${i + 1}`}
              onClick={() => {
                setColorToken(token);
              }}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded border',
                token === colorToken ? 'border-text' : 'border-transparent',
              )}
            >
              <span className="block h-7 w-7 rounded" style={{ background: `var(${token})` }} />
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="m-0 border-0 p-0">
        <legend className="eyebrow mb-1.5">{t.icon}</legend>
        <div className="grid grid-cols-6 gap-2">
          {categoryIconKeys.map((key: CategoryIconKey) => {
            const IconCmp = categoryIcons[key];
            const selected = key === icon;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={selected}
                aria-label={t.iconNames[key]}
                onClick={() => {
                  setIcon(key);
                }}
                className={cn(
                  'flex min-h-touch items-center justify-center rounded border transition-colors duration-fast ease-heavy',
                  selected ? 'border-accent bg-surface-raised' : 'border-border bg-bg',
                )}
              >
                <IconCmp
                  size={22}
                  color={selected ? `var(${colorToken})` : 'var(--color-text-muted)'}
                />
              </button>
            );
          })}
        </div>
      </fieldset>
    </form>
  );
}
