import { targetOn } from '@/features/goals/goalModel';
import { goalXp, PERFECT_DAY_BONUS, type GoalXp } from '@/features/gamification/xp';
import { addDaysISO, toISODate, weekdayOf } from '@/lib/dates';
import type { Category, CheckIn, Goal, ISODate } from '@/lib/types';

// Logique pure d'une journée : objectifs du jour, complétion, XP de base. Sans React.

/** `completed` se déduit toujours de la valeur, jamais saisi (SPEC.md). */
export function isCompleted(
  goal: Pick<Goal, 'type' | 'target' | 'targetHistory'>,
  value: number | undefined,
  date: ISODate,
): boolean {
  if (value === undefined) return false;
  if (goal.type === 'boolean') return value >= 1;
  const target = targetOn(goal, date);
  if (target === undefined) return false;
  return goal.type === 'quantity' ? value >= target : value <= target;
}

/** Lundi de la semaine de `date` (semaines du lundi au dimanche). */
export function weekStart(date: ISODate): ISODate {
  return addDaysISO(date, 1 - weekdayOf(date));
}

export function createdOn(goal: Pick<Goal, 'createdAt'>): ISODate {
  return toISODate(new Date(goal.createdAt));
}

/** L'objectif fait-il partie de la liste du jour ? */
export function appearsOn(goal: Goal, categories: Category[], date: ISODate): boolean {
  if (goal.status !== 'active') return false;
  const category = categories.find((c) => c.id === goal.categoryId);
  if (!category || category.archived) return false;
  if (createdOn(goal) > date) return false;
  if (goal.frequency.kind === 'days') return goal.frequency.days.includes(weekdayOf(date));
  return true;
}

export type CheckInIndex = Map<string, CheckIn>;

export function checkInKey(goalId: string, date: ISODate): string {
  return `${goalId}|${date}`;
}

export function indexCheckIns(checkIns: CheckIn[]): CheckInIndex {
  return new Map(checkIns.map((c) => [checkInKey(c.goalId, c.date), c]));
}

/** Nombre de jours réussis pour un objectif hebdomadaire, dans la semaine de `date`, avant `date`. */
export function weeklyDoneBefore(goalId: string, date: ISODate, index: CheckInIndex): number {
  let done = 0;
  for (let d = weekStart(date); d < date; d = addDaysISO(d, 1)) {
    if (index.get(checkInKey(goalId, d))?.completed) done += 1;
  }
  return done;
}

export type GoalDayState = {
  goal: Goal;
  checkIn: CheckIn | undefined;
  value: number | undefined;
  target: number | undefined;
  completed: boolean;
  /** Compte dans le % du jour (décision 2 pour les hebdomadaires). */
  counts: boolean;
  xp: GoalXp;
  /** Pour un objectif hebdomadaire : réussites de la semaine, ce jour compris. */
  weekly: { done: number; times: number } | undefined;
};

export function goalDayState(goal: Goal, date: ISODate, index: CheckInIndex): GoalDayState {
  const checkIn = index.get(checkInKey(goal.id, date));
  const value = checkIn?.value;
  const target = goal.type === 'boolean' ? undefined : targetOn(goal, date);
  const completed = isCompleted(goal, value, date);
  let counts = true;
  let weekly: GoalDayState['weekly'];
  if (goal.frequency.kind === 'weekly') {
    const times = goal.frequency.timesPerWeek;
    const doneBefore = weeklyDoneBefore(goal.id, date, index);
    const remainingDays = 8 - weekdayOf(date); // ce jour compris, jusqu'à dimanche
    const stillNeeded = times - doneBefore;
    counts = completed || (stillNeeded > 0 && stillNeeded >= remainingDays);
    weekly = { done: doneBefore + (completed ? 1 : 0), times };
  }
  return {
    goal,
    checkIn,
    value,
    target,
    completed,
    counts,
    xp: goalXp({ type: goal.type, difficulty: goal.difficulty, value, target, completed }),
    weekly,
  };
}

export type DaySummary = {
  counted: number;
  completed: number;
  /** Part des objectifs comptés réussis (0 à 1), 0 si aucun objectif ne compte. */
  ratio: number;
  perfect: boolean;
  /** XP de base du jour, bonus compris, avant multiplicateur de série (phase 4). */
  xp: number;
};

export function summarizeDay(states: GoalDayState[]): DaySummary {
  const countedStates = states.filter((s) => s.counts);
  const completed = countedStates.filter((s) => s.completed).length;
  const counted = countedStates.length;
  const perfect = counted > 0 && completed === counted;
  const goalsXp = states.reduce((sum, s) => sum + s.xp.base + s.xp.bonus, 0);
  return {
    counted,
    completed,
    ratio: counted === 0 ? 0 : completed / counted,
    perfect,
    xp: goalsXp + (perfect ? PERFECT_DAY_BONUS : 0),
  };
}

export type DayContext = {
  goals: Goal[];
  categories: Category[];
  index: CheckInIndex;
};

export function dayStates(date: ISODate, ctx: DayContext): GoalDayState[] {
  return ctx.goals
    .filter((g) => appearsOn(g, ctx.categories, date))
    .map((g) => goalDayState(g, date, ctx.index));
}

/** Rattrapage possible : le jour même et les 2 jours précédents, jamais de jour futur. */
export const CATCH_UP_DAYS = 2;

/** Jours remplissables à la date `now`, du plus ancien au plus récent, bornés par l'Arc. */
export function fillableDays(start: ISODate, end: ISODate, now: ISODate): ISODate[] {
  const days: ISODate[] = [];
  for (let offset = CATCH_UP_DAYS; offset >= 0; offset -= 1) {
    const d = addDaysISO(now, -offset);
    if (d >= start && d <= end) days.push(d);
  }
  return days;
}

export type Plank = { goalId: string; colorToken: string; done: boolean };

/** Planches du bouclier du jour : un objectif qui compte = une planche, dans l'ordre d'affichage. */
export function dayPlanks(states: GoalDayState[], categories: Category[]): Plank[] {
  const order = new Map(categories.map((c) => [c.id, c.order]));
  const color = new Map(categories.map((c) => [c.id, c.colorToken]));
  return states
    .filter((s) => s.counts)
    .sort(
      (a, b) =>
        (order.get(a.goal.categoryId) ?? 0) - (order.get(b.goal.categoryId) ?? 0) ||
        a.goal.order - b.goal.order,
    )
    .map((s) => ({
      goalId: s.goal.id,
      colorToken: color.get(s.goal.categoryId) ?? '--color-accent',
      done: s.completed,
    }));
}
