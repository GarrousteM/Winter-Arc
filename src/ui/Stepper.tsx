import { MinusIcon, PlusIcon } from '@phosphor-icons/react';
import { useId, useState } from 'react';
import { copy } from '@/copy';
import { IconButton } from './Button';

type StepperProps = {
  /** `undefined` : rien saisi (champ vide). */
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  step?: number;
  min?: number;
  unit?: string | undefined;
  label: string;
};

function format(value: number | undefined): string {
  return value === undefined ? '' : String(Math.round(value * 100) / 100);
}

/** Saisie rapide pour les objectifs quantité et limite : boutons +/- et champ numérique. */
export function Stepper({ value, onChange, step = 1, min = 0, unit, label }: StepperProps) {
  const id = useId();
  // Brouillon local pendant l'édition, pour permettre une saisie partielle (« 1, » ou champ vidé).
  const [draft, setDraft] = useState<string | null>(null);

  const commit = (next: number | undefined) => {
    onChange(next === undefined ? undefined : Math.max(min, Math.round(next * 100) / 100));
  };

  return (
    <div className="inline-flex items-stretch rounded border border-border bg-bg">
      <IconButton
        label={`${copy.common.decrease} ${label}`}
        onClick={() => {
          if (value !== undefined) commit(value - step);
        }}
        disabled={value === undefined || value <= min}
        className="rounded-none border-0 disabled:opacity-40"
      >
        <MinusIcon size={18} />
      </IconButton>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        placeholder="0"
        value={draft ?? format(value)}
        onFocus={() => {
          setDraft(format(value));
        }}
        onChange={(e) => {
          const raw = e.target.value;
          setDraft(raw);
          if (raw.trim() === '') {
            commit(undefined);
            return;
          }
          const n = Number(raw.replace(',', '.'));
          if (Number.isFinite(n)) commit(n);
        }}
        onBlur={() => {
          setDraft(null);
        }}
        className="numeric w-16 border-x border-border bg-transparent text-center text-xl text-text outline-none placeholder:text-muted focus:bg-surface-raised"
      />
      {unit && (
        <span className="flex items-center border-r border-border px-2 text-sm text-muted">
          {unit}
        </span>
      )}
      <IconButton
        label={`${copy.common.increase} ${label}`}
        onClick={() => {
          commit((value ?? 0) + step);
        }}
        className="rounded-none border-0"
      >
        <PlusIcon size={18} />
      </IconButton>
    </div>
  );
}
