import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type FieldProps = {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  children: (props: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
  className?: string;
};

/** Libellé + contrôle + aide ou erreur, reliés pour l'accessibilité. */
export function Field({ label, error, hint, children, className }: FieldProps) {
  const id = useId();
  const messageId = `${id}-msg`;
  const message = error ?? hint;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="eyebrow">
        {label}
      </label>
      {children({ id, describedBy: message ? messageId : undefined, invalid: Boolean(error) })}
      {message && (
        <p id={messageId} className={cn('m-0 text-sm', error ? 'text-warning' : 'text-muted')}>
          {message}
        </p>
      )}
    </div>
  );
}

export const inputClass =
  'min-h-touch w-full rounded border border-border bg-bg px-3 text-base text-text outline-none transition-colors duration-fast ease-heavy focus:border-accent aria-[invalid=true]:border-warning';

type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ className, ...rest }: TextInputProps) {
  return <input className={cn(inputClass, className)} {...rest} />;
}
