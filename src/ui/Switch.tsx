import { cn } from '@/lib/cn';

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
};

/** Interrupteur on / off (rôle switch), toute la ligne est cliquable. */
export function Switch({ checked, onChange, label, description }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => {
        onChange(!checked);
      }}
      className="flex min-h-touch w-full items-center justify-between gap-4 py-2 text-left"
    >
      <span className="flex flex-col">
        <span className="font-medium">{label}</span>
        {description && <span className="text-sm text-muted">{description}</span>}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'relative h-7 w-12 shrink-0 rounded border transition-colors duration-fast ease-heavy',
          checked ? 'border-accent bg-surface-raised' : 'border-border bg-bg',
        )}
      >
        <span
          className={cn(
            'absolute top-1 h-[18px] w-[18px] rounded transition-all duration-fast ease-heavy',
            checked ? 'left-[24px] bg-accent' : 'left-1 bg-muted',
          )}
        />
      </span>
    </button>
  );
}
