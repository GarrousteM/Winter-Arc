import { useReducedMotion } from 'framer-motion';

// Durées en secondes pour Framer Motion, alignées sur les tokens de src/theme/tokens.css.
export const durations = {
  fast: 0.15,
  impact: 0.2,
  base: 0.3,
  reward: 1.2,
} as const;

export const easeHeavy = [0.3, 0, 0.1, 1] as const;

export function usePrefersReducedMotion(): boolean {
  return useReducedMotion() ?? false;
}
