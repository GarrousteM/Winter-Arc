// Série globale, multiplicateur et jokers de gel (SPEC.md, « Streaks et jokers »). Fonctions pures.

/** Seuil de complétion d'une journée pour prolonger la série globale. */
export const STREAK_THRESHOLD = 0.8;
/** Un joker gagné tous les N jours de série, plafonné. */
export const FREEZE_EVERY = 7;
export const FREEZE_MAX = 3;

/** Multiplicateur appliqué à l'XP des objectifs (pas aux bonus). */
export function streakMultiplier(streak: number): number {
  if (streak >= 30) return 1.5;
  if (streak >= 14) return 1.25;
  if (streak >= 7) return 1.1;
  return 1;
}

export type StreakState = { streak: number; best: number; tokens: number };

/** `rest` : jour de trêve déclaré, la série reste en l'état comme pour la journée en cours. */
export type DayOutcome = 'success' | 'missed' | 'pending' | 'rest';

export type StreakStep = StreakState & {
  /** Un joker a été consommé pour sauver la série ce jour-là. */
  frozen: boolean;
  /** Un joker a été gagné ce jour-là. */
  earned: boolean;
};

/**
 * Fait avancer la série d'un jour.
 * `pending` : journée en cours pas encore réussie, la série reste en l'état (rien n'est consommé).
 */
export function stepStreak(state: StreakState, outcome: DayOutcome): StreakStep {
  if (outcome === 'pending' || outcome === 'rest')
    return { ...state, frozen: false, earned: false };
  if (outcome === 'success') {
    const streak = state.streak + 1;
    const earned = streak % FREEZE_EVERY === 0 && state.tokens < FREEZE_MAX;
    return {
      streak,
      best: Math.max(state.best, streak),
      tokens: earned ? state.tokens + 1 : state.tokens,
      frozen: false,
      earned,
    };
  }
  if (state.tokens > 0 && state.streak > 0) {
    return { ...state, tokens: state.tokens - 1, frozen: true, earned: false };
  }
  return { ...state, streak: 0, frozen: false, earned: false };
}
