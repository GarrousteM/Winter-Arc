import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { durations, easeHeavy } from '@/lib/motion';

type ProgressBarProps = {
  /** Progression entre 0 et 1 (au-delà de 1, la barre reste pleine). */
  value: number;
  colorToken?: string;
  label: string;
  className?: string;
  /** Repère vertical (0 à 1), ex. le seuil de 50 % ou la limite. */
  marker?: number;
};

export function ProgressBar({
  value,
  colorToken = '--color-accent',
  label,
  className,
  marker,
}: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <div
      className={cn('relative h-2 w-full border border-border bg-bg', className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
    >
      <motion.div
        className="h-full origin-left"
        style={{ background: `var(${colorToken})` }}
        initial={false}
        animate={{ scaleX: clamped }}
        transition={{ duration: durations.base, ease: easeHeavy }}
      />
      {marker !== undefined && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -bottom-1 w-px bg-text"
          style={{ left: `${Math.min(1, Math.max(0, marker)) * 100}%` }}
        />
      )}
    </div>
  );
}
