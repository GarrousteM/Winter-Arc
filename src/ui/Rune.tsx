import { motion } from 'framer-motion';
import { durations, usePrefersReducedMotion } from '@/lib/motion';
import { futhark, runePaths, type RuneName } from './runes';

type RuneProps = {
  name: RuneName;
  size?: number;
  colorToken?: string;
};

export function Rune({ name, size = 16, colorToken = '--color-border' }: RuneProps) {
  return (
    <svg
      aria-hidden="true"
      width={(size * 10) / 16}
      height={size}
      viewBox="-1 -1 12 18"
      fill="none"
      stroke={`var(${colorToken})`}
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      <path d={runePaths[name]} />
    </svg>
  );
}

type RuneRowProps = {
  runes?: RuneName[];
  size?: number;
  /** Illumine les runes en or l'une après l'autre (level-up). */
  lit?: boolean;
  /** Change de valeur pour rejouer l'animation. */
  playKey?: number;
};

export function RuneRow({
  runes = futhark.slice(0, 8),
  size = 18,
  lit = false,
  playKey = 0,
}: RuneRowProps) {
  const reduced = usePrefersReducedMotion();
  return (
    <div aria-hidden="true" className="flex items-center justify-center gap-3">
      {runes.map((name, i) => (
        <motion.svg
          key={`${name}-${playKey}`}
          width={(size * 10) / 16}
          height={size}
          viewBox="-1 -1 12 18"
          fill="none"
          strokeWidth={1.5}
          strokeLinecap="square"
          initial={{ stroke: 'var(--color-border)' }}
          animate={{ stroke: lit ? 'var(--color-accent)' : 'var(--color-border)' }}
          transition={{
            duration: reduced ? 0 : durations.base,
            delay: reduced || !lit ? 0 : i * 0.12,
          }}
        >
          <path d={runePaths[name]} />
        </motion.svg>
      ))}
    </div>
  );
}
