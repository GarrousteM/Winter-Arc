import type { Difficulty, GoalType } from '@/lib/types';

// Barème de SPEC.md, « Gamification > XP ». Fonctions pures, sans React.

export const XP_BY_DIFFICULTY: Record<Difficulty, number> = { 1: 10, 2: 20, 3: 30 };
export const PERFECT_DAY_BONUS = 50;
export const OVERACHIEVE_BONUS = 5;
export const BOSS_BONUS = 150;

/** Seuil sous lequel une quantité partielle ne rapporte rien. */
const PARTIAL_MIN_RATIO = 0.5;
/** Seuil de dépassement qui donne le bonus. */
const OVERACHIEVE_RATIO = 1.5;

export type GoalXp = {
  /** XP de l'objectif, soumis au multiplicateur de série (phase 4). */
  base: number;
  /** Bonus de dépassement, hors multiplicateur. */
  bonus: number;
};

type GoalXpInput = {
  type: GoalType;
  difficulty: Difficulty;
  /** Valeur saisie, `undefined` si rien n'a été saisi. */
  value: number | undefined;
  target: number | undefined;
  completed: boolean;
};

export function goalXp({ type, difficulty, value, target, completed }: GoalXpInput): GoalXp {
  const full = XP_BY_DIFFICULTY[difficulty];
  if (type !== 'quantity') return { base: completed ? full : 0, bonus: 0 };
  if (value === undefined || target === undefined || target <= 0) return { base: 0, bonus: 0 };
  const ratio = value / target;
  if (ratio < PARTIAL_MIN_RATIO) return { base: 0, bonus: 0 };
  return {
    base: Math.round(full * Math.min(1, ratio)),
    bonus: ratio >= OVERACHIEVE_RATIO ? OVERACHIEVE_BONUS : 0,
  };
}
