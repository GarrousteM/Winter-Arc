import { useMemo } from 'react';
import { useAppStore } from '@/app/store';
import { today } from '@/lib/dates';
import { badges } from './badges';
import { computeGame, type GameState } from './engine';

/** Progression recalculée depuis l'historique ; `undefined` sans Arc. */
export function useGame(): GameState | undefined {
  const arc = useAppStore((s) => s.arc);
  const goals = useAppStore((s) => s.goals);
  const categories = useAppStore((s) => s.categories);
  const checkIns = useAppStore((s) => s.checkIns);
  const now = today();
  return useMemo(
    () => (arc ? computeGame({ arc, goals, categories, checkIns, today: now, badges }) : undefined),
    [arc, goals, categories, checkIns, now],
  );
}
