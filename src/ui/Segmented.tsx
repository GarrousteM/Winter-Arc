import { cn } from '@/lib/cn';

type Option<T extends string | number> = { value: T; label: string };

type SegmentedProps<T extends string | number> = {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/** Choix exclusif en ligne (radiogroup). */
export function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'grid auto-cols-fr grid-flow-col rounded border border-border bg-bg',
        className,
      )}
    >
      {options.map((option, i) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => {
              onChange(option.value);
            }}
            className={cn(
              'min-h-touch px-2 text-sm font-medium transition-colors duration-fast ease-heavy',
              i > 0 && 'border-l border-border',
              selected ? 'bg-surface-raised text-accent' : 'text-muted hover:text-text',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

type ToggleChipProps = {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  label: string;
  /** Libellé complet pour les lecteurs d'écran si `label` est abrégé. */
  ariaLabel?: string | undefined;
  className?: string;
};

/** Pastille à bascule (ex. jours de la semaine). */
export function ToggleChip({
  pressed,
  onPressedChange,
  label,
  ariaLabel,
  className,
}: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={ariaLabel}
      onClick={() => {
        onPressedChange(!pressed);
      }}
      className={cn(
        'min-h-touch min-w-touch rounded border px-2 text-sm font-medium transition-colors duration-fast ease-heavy',
        pressed ? 'border-accent bg-surface-raised text-accent' : 'border-border bg-bg text-muted',
        className,
      )}
    >
      {label}
    </button>
  );
}
