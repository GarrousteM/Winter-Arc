import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { durations, easeHeavy } from '@/lib/motion';

type ProgressRingProps = {
  /** Progression entre 0 et 1. */
  value: number;
  size?: number;
  stroke?: number;
  colorToken?: string;
  label: string;
  children?: ReactNode;
};

const TICKS = 24;

/** Anneau de progression du jour : piste en fer froid, arc en or, graduations gravées. */
export function ProgressRing({
  value,
  size = 160,
  stroke = 8,
  colorToken = '--color-accent',
  label,
  children,
}: ProgressRingProps) {
  const clamped = Math.min(1, Math.max(0, value));
  const radius = (size - stroke) / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {Array.from({ length: TICKS }, (_, i) => {
          const angle = (i / TICKS) * 2 * Math.PI;
          const outer = size / 2 - 1;
          const inner = outer - (i % 6 === 0 ? 5 : 3);
          return (
            <line
              key={i}
              x1={center + Math.sin(angle) * inner}
              y1={center - Math.cos(angle) * inner}
              x2={center + Math.sin(angle) * outer}
              y2={center - Math.cos(angle) * outer}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
          );
        })}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`var(${colorToken})`}
          strokeWidth={stroke}
          strokeLinecap="butt"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: circumference * (1 - clamped) }}
          transition={{ duration: durations.base, ease: easeHeavy }}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}
