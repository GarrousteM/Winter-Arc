import { MinusIcon, PlusIcon } from '@phosphor-icons/react';
import { useId } from 'react';
import { copy } from '@/copy';
import { IconButton } from './Button';

type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  unit?: string;
  label: string;
};

/** Saisie rapide pour les objectifs quantité et limite : boutons +/- et champ numérique. */
export function Stepper({ value, onChange, step = 1, min = 0, unit, label }: StepperProps) {
  const id = useId();
  const set = (next: number) => {
    onChange(Math.max(min, Number.isFinite(next) ? next : min));
  };
  return (
    <div className="inline-flex items-stretch rounded border border-border bg-bg">
      <IconButton
        label={`${copy.common.decrease} ${label}`}
        onClick={() => {
          set(value - step);
        }}
        disabled={value <= min}
        className="rounded-none border-0 disabled:opacity-40"
      >
        <MinusIcon size={18} />
      </IconButton>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        value={value}
        onChange={(e) => {
          set(e.target.valueAsNumber);
        }}
        className="numeric w-16 border-x border-border bg-transparent text-center text-xl text-text outline-none focus:bg-surface-raised"
      />
      {unit && (
        <span className="flex items-center border-r border-border px-2 text-sm text-muted">
          {unit}
        </span>
      )}
      <IconButton
        label={`${copy.common.increase} ${label}`}
        onClick={() => {
          set(value + step);
        }}
        className="rounded-none border-0"
      >
        <PlusIcon size={18} />
      </IconButton>
    </div>
  );
}
