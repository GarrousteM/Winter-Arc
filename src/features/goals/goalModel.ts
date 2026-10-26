import type { Category, Goal, GoalType, ISODate, TargetChange } from '@/lib/types';
import { categoryColorTokens } from './categoryIcons';

/** Cible applicable à une date : dernier changement dont `from` ≤ date, sinon le plus ancien. */
export function targetOn(
  goal: Pick<Goal, 'target' | 'targetHistory'>,
  date: ISODate,
): number | undefined {
  const history = [...goal.targetHistory].sort((a, b) => a.from.localeCompare(b.from));
  if (history.length === 0) return goal.target;
  let current: TargetChange | undefined = history[0];
  for (const change of history) {
    if (change.from <= date) current = change;
  }
  return current?.target;
}

/**
 * Applique une nouvelle cible à partir de `from` (inclus). Les jours précédents gardent leur cible :
 * les changements postérieurs ou égaux à `from` sont remplacés.
 */
export function withTarget<T extends Pick<Goal, 'target' | 'targetHistory'>>(
  goal: T,
  target: number,
  from: ISODate,
): T {
  if (targetOn(goal, from) === target && goal.targetHistory.length > 0) return goal;
  const kept = goal.targetHistory.filter((c) => c.from < from);
  return { ...goal, target, targetHistory: [...kept, { from, target }] };
}

export function needsTarget(type: GoalType): boolean {
  return type !== 'boolean';
}

export type GoalDraft = Pick<Goal, 'title' | 'type' | 'frequency' | 'difficulty' | 'categoryId'> & {
  target?: number | undefined;
  unit?: string | undefined;
  step?: number | undefined;
};

export type GoalDraftError = 'title' | 'target' | 'frequency';

export function validateGoalDraft(draft: GoalDraft): GoalDraftError[] {
  const errors: GoalDraftError[] = [];
  if (draft.title.trim().length === 0) errors.push('title');
  if (needsTarget(draft.type) && !(draft.target !== undefined && draft.target > 0)) {
    errors.push('target');
  }
  const f = draft.frequency;
  if (f.kind === 'weekly' && !(f.timesPerWeek >= 1 && f.timesPerWeek <= 7))
    errors.push('frequency');
  if (f.kind === 'days' && f.days.length === 0) errors.push('frequency');
  return errors;
}

/** Déplace un élément d'un cran dans une liste ordonnée et renvoie les nouveaux ordres. */
export function moveInOrder<T extends { id: string; order: number }>(
  items: T[],
  id: string,
  direction: -1 | 1,
): T[] {
  const sorted = [...items].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex((item) => item.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= sorted.length) return sorted;
  const a = sorted[index];
  const b = sorted[target];
  if (!a || !b) return sorted;
  sorted[index] = b;
  sorted[target] = a;
  return sorted.map((item, i) => ({ ...item, order: i }));
}

/** Première couleur de la palette non utilisée par une catégorie active, sinon rotation. */
export function nextColorToken(categories: Pick<Category, 'colorToken' | 'archived'>[]): string {
  const used = new Set(categories.filter((c) => !c.archived).map((c) => c.colorToken));
  const free = categoryColorTokens.find((token) => !used.has(token));
  return free ?? categoryColorTokens[categories.length % categoryColorTokens.length] ?? '--cat-1';
}
