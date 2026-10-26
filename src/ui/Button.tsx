import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  icon?: ReactNode;
  block?: boolean;
};

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent border border-accent hover:bg-transparent hover:text-accent',
  secondary: 'bg-surface-raised text-text border border-border hover:border-accent',
  ghost: 'bg-transparent text-muted border border-transparent hover:text-text',
  danger: 'bg-transparent text-warning border border-warning hover:bg-surface-raised',
};

export function Button({
  variant = 'primary',
  icon,
  block = false,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-touch items-center justify-center gap-2 rounded px-5',
        'font-display text-sm font-bold uppercase tracking-display',
        'transition-colors duration-fast ease-heavy',
        'disabled:pointer-events-none disabled:opacity-40',
        variants[variant],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
};

export function IconButton({
  label,
  className,
  children,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex min-h-touch min-w-touch items-center justify-center rounded',
        'border border-transparent text-muted transition-colors duration-fast ease-heavy',
        'hover:border-border hover:text-text',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
