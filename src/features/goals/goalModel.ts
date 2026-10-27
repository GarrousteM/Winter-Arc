import { addDaysISO, dayNumber, weekStart } from '@/lib/dates';
import type { Category, Goal, GoalType, ISODate, TargetChange, TargetRamp } from '@/lib/types';
import { categoryColorTokens } from './categoryIcons';

/** Ce qu'il faut pour lire une cible : la cible courante et son historique. */
type TargetSource = { target?: number | undefined; targetHistory: TargetChange[] };

/** Changement de cible en vigueur à une date : dernier dont `from` ≤ date, sinon le plus ancien. */
function changeOn(goal: Pick<Goal, 'targetHistory'>, date: ISODate): TargetChange | undefined {
  const history = [...goal.targetHistory].sort((a, b) => a.from.localeCompare(b.from));
  let current: TargetChange | undefined = history[0];
  for (const change of history) {
    if (change.from <= date) current = change;
  }
  return current;
}

/**
 * Valeur d'une cible à une date, progression comprise : `ramp.step` de plus à chaque lundi passé
 * depuis `from`, sans dépasser `ramp.bound` (ni descendre sous 0 pour une limite).
 */
export function rampedTarget(change: TargetChange, date: ISODate): number {
  const { target, ramp } = change;
  if (!ramp || date <= change.from) return target;
  const weeks = (dayNumber(weekStart(change.from), weekStart(date)) - 1) / 7;
  const raw = Math.round((target + ramp.step * weeks) * 100) / 100;
  if (ramp.step > 0) return ramp.bound !== undefined ? Math.min(raw, ramp.bound) : raw;
  return Math.max(raw, ramp.bound ?? 0);
}

/** Cible applicable à une date (historique des cibles et progression hebdomadaire). */
export function targetOn(goal: TargetSource, date: ISODate): number | undefined {
  const change = changeOn(goal, date);
  return change ? rampedTarget(change, date) : goal.target;
}

/** Progression en vigueur à une date, s'il y en a une. */
export function rampOn(goal: Pick<Goal, 'targetHistory'>, date: ISODate): TargetRamp | undefined {
  return changeOn(goal, date)?.ramp;
}

/** Prochaine marche de la progression : le lundi suivant et sa cible, si elle change. */
export function nextRampStep(
  goal: TargetSource,
  date: ISODate,
): { on: ISODate; target: number } | undefined {
  const on = addDaysISO(weekStart(date), 7);
  const now = targetOn(goal, date);
  const later = targetOn(goal, on);
  return now !== undefined && later !== undefined && later !== now
    ? { on, target: later }
    : undefined;
}

function sameRamp(a: TargetRamp | undefined, b: TargetRamp | undefined): boolean {
  return a?.step === b?.step && a?.bound === b?.bound;
}

/**
 * Applique une nouvelle cible (et sa progression) à partir de `from` (inclus). Les jours précédents
 * gardent leur cible : les changements postérieurs ou égaux à `from` sont remplacés.
 */
export function withTarget<T extends Pick<Goal, 'target' | 'targetHistory'>>(
  goal: T,
  target: number,
  from: ISODate,
  ramp?: TargetRamp,
): T {
  if (
    goal.targetHistory.length > 0 &&
    targetOn(goal, from) === target &&
    sameRamp(rampOn(goal, from), ramp)
  ) {
    return goal;
  }
  const kept = goal.targetHistory.filter((c) => c.from < from);
  const change: TargetChange = ramp ? { from, target, ramp } : { from, target };
  return { ...goal, target, targetHistory: [...kept, change] };
}

export function needsTarget(type: GoalType): boolean {
  return type !== 'boolean';
}

export type GoalDraft = Pick<Goal, 'title' | 'type' | 'frequency' | 'difficulty' | 'categoryId'> & {
  target?: number | undefined;
  unit?: string | undefined;
  step?: number | undefined;
  /** Progression hebdomadaire, pas signé (négatif pour une limite). */
  ramp?: TargetRamp | undefined;
};

export type GoalDraftError = 'title' | 'target' | 'frequency' | 'ramp';

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
  if (needsTarget(draft.type) && draft.ramp && !validRamp(draft.type, draft.target, draft.ramp)) {
    errors.push('ramp');
  }
  return errors;
}

/** Une quantité monte vers son plafond, une limite descend vers son plancher (jamais sous 0). */
function validRamp(type: GoalType, target: number | undefined, ramp: TargetRamp): boolean {
  if (type === 'quantity') {
    return (
      ramp.step > 0 && (ramp.bound === undefined || target === undefined || ramp.bound >= target)
    );
  }
  return (
    ramp.step < 0 &&
    (ramp.bound === undefined ||
      (ramp.bound >= 0 && (target === undefined || ramp.bound <= target)))
  );
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
