import {
  appearsOn,
  checkInKey,
  dayStates,
  indexCheckIns,
  summarizeDay,
  weekStart,
  type DayContext,
} from '@/features/checkin/dayModel';
import { addDaysISO, dayNumber, daysInclusive } from '@/lib/dates';
import type { Arc, Category, CheckIn, Goal, ISODate } from '@/lib/types';
import type { BadgeContext } from './badges';
import { BOSS_DEFEAT_RATIO, bossForWeek, type BossId } from './bosses';
import { levelForXp, rankForLevel, type RankId } from './levels';
import { stepStreak, streakMultiplier, STREAK_THRESHOLD, type StreakState } from './streak';
import { BOSS_BONUS, PERFECT_DAY_BONUS, XP_BY_DIFFICULTY } from './xp';

// Moteur de gamification : tout est recalculé depuis l'historique, pour qu'une modification
// d'un jour passé reste cohérente (SPEC.md, « Modèle de données »). Fonctions pures, sans React.

export type DayResult = {
  date: ISODate;
  counted: number;
  completed: number;
  ratio: number;
  perfect: boolean;
  /** `pending` : jour en cours, pas encore à 80 %. */
  outcome: 'success' | 'missed' | 'pending';
  frozen: boolean;
  streak: number;
  multiplier: number;
  xp: number;
};

export type BossStatus = 'upcoming' | 'active' | 'defeated' | 'escaped';

export type BossWeek = {
  index: number;
  bossId: BossId;
  start: ISODate;
  end: ISODate;
  hp: number;
  damage: number;
  defeatedOn: ISODate | undefined;
  status: BossStatus;
};

export type GoalStreak = { current: number; best: number; unit: 'days' | 'weeks' };

export type GameState = {
  days: DayResult[];
  totalXp: number;
  level: number;
  rank: RankId;
  streak: number;
  bestStreak: number;
  freezeTokens: number;
  multiplier: number;
  /** Jour « prologue » sans boss (première semaine réduite à un jour). */
  prologue: { start: ISODate; end: ISODate } | undefined;
  bosses: BossWeek[];
  currentBoss: BossWeek | undefined;
  goalStreaks: Record<string, GoalStreak>;
  badges: { id: string; unlockedOn: ISODate }[];
  overallCompletion: number;
};

export type GameInput = {
  arc: Pick<Arc, 'startDate' | 'endDate'>;
  goals: Goal[];
  categories: Category[];
  checkIns: CheckIn[];
  today: ISODate;
  badges: { id: string; condition: (c: BadgeContext) => boolean }[];
};

const minDate = (a: ISODate, b: ISODate) => (a < b ? a : b);
const maxDate = (a: ISODate, b: ISODate) => (a > b ? a : b);

/** XP maximal d'une semaine : objectifs prévus à 100 % + une journée parfaite par jour. */
export function weekMaxXp(days: ISODate[], ctx: DayContext): number {
  let hp = 0;
  const weeklyAppearances = new Map<string, number>();
  for (const date of days) {
    for (const goal of ctx.goals) {
      if (!appearsOn(goal, ctx.categories, date)) continue;
      if (goal.frequency.kind === 'weekly') {
        weeklyAppearances.set(goal.id, (weeklyAppearances.get(goal.id) ?? 0) + 1);
      } else {
        hp += XP_BY_DIFFICULTY[goal.difficulty];
      }
    }
    hp += PERFECT_DAY_BONUS;
  }
  for (const [goalId, appearances] of weeklyAppearances) {
    const goal = ctx.goals.find((g) => g.id === goalId);
    if (goal?.frequency.kind !== 'weekly') continue;
    hp += Math.min(goal.frequency.timesPerWeek, appearances) * XP_BY_DIFFICULTY[goal.difficulty];
  }
  return hp;
}

/** Semaines de boss (lundi → dimanche) bornées par l'Arc. */
export function bossWeeks(
  start: ISODate,
  end: ISODate,
): {
  prologue: { start: ISODate; end: ISODate } | undefined;
  weeks: { start: ISODate; end: ISODate }[];
} {
  const weeks: { start: ISODate; end: ISODate }[] = [];
  for (let monday = weekStart(start); monday <= end; monday = addDaysISO(monday, 7)) {
    weeks.push({ start: maxDate(monday, start), end: minDate(addDaysISO(monday, 6), end) });
  }
  const first = weeks[0];
  // Décision 1 : une première semaine d'un seul jour est un prologue sans boss.
  if (first && first.start === first.end && weeks.length > 1) {
    return { prologue: first, weeks: weeks.slice(1) };
  }
  return { prologue: undefined, weeks };
}

function datesBetween(start: ISODate, end: ISODate): ISODate[] {
  const out: ISODate[] = [];
  for (let d = start; d <= end; d = addDaysISO(d, 1)) out.push(d);
  return out;
}

/** Séries par objectif : jours prévus consécutifs réussis, ou semaines au quota pour un hebdomadaire. */
export function goalStreak(
  goal: Goal,
  start: ISODate,
  until: ISODate,
  today: ISODate,
  ctx: DayContext,
): GoalStreak {
  let current = 0;
  let best = 0;
  if (goal.frequency.kind === 'weekly') {
    const times = goal.frequency.timesPerWeek;
    for (let monday = weekStart(start); monday <= until; monday = addDaysISO(monday, 7)) {
      const sunday = addDaysISO(monday, 6);
      let done = 0;
      let appears = false;
      for (const d of datesBetween(maxDate(monday, start), minDate(sunday, until))) {
        if (!appearsOn(goal, ctx.categories, d)) continue;
        appears = true;
        if (ctx.index.get(checkInKey(goal.id, d))?.completed) done += 1;
      }
      if (!appears) continue;
      if (done >= times) {
        current += 1;
        best = Math.max(best, current);
      } else if (sunday >= today) {
        // Semaine en cours, pas encore au quota : rien n'est perdu.
      } else {
        current = 0;
      }
    }
    return { current, best, unit: 'weeks' };
  }
  for (const d of datesBetween(start, until)) {
    if (!appearsOn(goal, ctx.categories, d)) continue;
    if (ctx.index.get(checkInKey(goal.id, d))?.completed) {
      current += 1;
      best = Math.max(best, current);
    } else if (d !== today) {
      current = 0;
    }
  }
  return { current, best, unit: 'days' };
}

export function computeGame(input: GameInput): GameState {
  const { arc, goals, categories, checkIns, today } = input;
  const ctx: DayContext = { goals, categories, index: indexCheckIns(checkIns) };
  const until = minDate(today, arc.endDate);
  const totalDays = daysInclusive(arc.startDate, arc.endDate);
  const { prologue, weeks } = bossWeeks(arc.startDate, arc.endDate);

  const bosses: BossWeek[] = weeks.map((w, index) => ({
    index,
    bossId: bossForWeek(index, weeks.length),
    start: w.start,
    end: w.end,
    hp: weekMaxXp(datesBetween(w.start, w.end), ctx),
    damage: 0,
    defeatedOn: undefined,
    status: today > w.end ? 'escaped' : today >= w.start ? 'active' : 'upcoming',
  }));

  const taggedGoalIds = (tag: Goal['tag']) =>
    new Set(goals.filter((g) => g.tag === tag).map((g) => g.id));
  const pagesIds = taggedGoalIds('reading-pages');
  const workoutIds = taggedGoalIds('workout');
  const screenIds = taggedGoalIds('screen-time');

  const days: DayResult[] = [];
  const unlocked = new Map<string, ISODate>();
  let state: StreakState = { streak: 0, best: 0, tokens: 0 };
  let totalXp = 0;
  let perfectDays = 0;
  let countedSum = 0;
  let completedSum = 0;
  let pagesRead = 0;
  let workouts = 0;
  let screenStreak = 0;
  let bestScreenStreak = 0;
  let checkInCount = 0;
  let bossesDefeated = 0;

  for (const date of until >= arc.startDate ? datesBetween(arc.startDate, until) : []) {
    const states = dayStates(date, ctx);
    const summary = summarizeDay(states);
    const reached = summary.counted === 0 || summary.ratio >= STREAK_THRESHOLD;
    const outcome = reached ? 'success' : date === today ? 'pending' : 'missed';
    const step = stepStreak(state, outcome);
    state = { streak: step.streak, best: step.best, tokens: step.tokens };

    const multiplier = streakMultiplier(state.streak);
    const goalsBase = states.reduce((sum, s) => sum + s.xp.base, 0);
    const bonuses = states.reduce((sum, s) => sum + s.xp.bonus, 0);
    const dayXp =
      Math.round(goalsBase * multiplier) + bonuses + (summary.perfect ? PERFECT_DAY_BONUS : 0);
    totalXp += dayXp;

    const boss = bosses.find((w) => date >= w.start && date <= w.end);
    if (boss) {
      boss.damage += dayXp;
      if (!boss.defeatedOn && boss.hp > 0 && boss.damage >= boss.hp * BOSS_DEFEAT_RATIO) {
        boss.defeatedOn = date;
        boss.status = 'defeated';
        totalXp += BOSS_BONUS;
        bossesDefeated += 1;
      }
    }

    if (summary.perfect) perfectDays += 1;
    countedSum += summary.counted;
    completedSum += summary.completed;
    for (const c of checkIns) {
      if (c.date !== date) continue;
      checkInCount += 1;
      if (pagesIds.has(c.goalId)) pagesRead += c.value;
      if (workoutIds.has(c.goalId) && c.completed) workouts += 1;
    }
    const screenStates = states.filter((s) => screenIds.has(s.goal.id));
    if (screenStates.length > 0) {
      if (screenStates.every((s) => s.completed)) {
        screenStreak += 1;
        bestScreenStreak = Math.max(bestScreenStreak, screenStreak);
      } else if (date !== today) {
        screenStreak = 0;
      }
    }

    days.push({
      date,
      counted: summary.counted,
      completed: summary.completed,
      ratio: summary.ratio,
      perfect: summary.perfect,
      outcome,
      frozen: step.frozen,
      streak: state.streak,
      multiplier,
      xp: dayXp,
    });

    const badgeContext: BadgeContext = {
      date,
      dayNumber: dayNumber(arc.startDate, date),
      totalDays,
      isLastDay: date === arc.endDate,
      checkInCount,
      globalStreak: state.streak,
      bestGlobalStreak: state.best,
      perfectDays,
      pagesRead,
      bestScreenLimitStreak: bestScreenStreak,
      workouts,
      bossesDefeated,
      overallCompletion: countedSum === 0 ? 0 : completedSum / countedSum,
    };
    for (const badge of input.badges) {
      if (!unlocked.has(badge.id) && badge.condition(badgeContext)) unlocked.set(badge.id, date);
    }
  }

  const goalStreaks: Record<string, GoalStreak> = {};
  for (const goal of goals) {
    goalStreaks[goal.id] = goalStreak(goal, arc.startDate, until, today, ctx);
  }

  const level = levelForXp(totalXp);
  return {
    days,
    totalXp,
    level,
    rank: rankForLevel(level),
    streak: state.streak,
    bestStreak: state.best,
    freezeTokens: state.tokens,
    multiplier: streakMultiplier(state.streak),
    prologue,
    bosses,
    currentBoss: bosses.find(
      (w) => w.status === 'active' || (w.defeatedOn && today >= w.start && today <= w.end),
    ),
    goalStreaks,
    badges: [...unlocked].map(([id, unlockedOn]) => ({ id, unlockedOn })),
    overallCompletion: countedSum === 0 ? 0 : completedSum / countedSum,
  };
}
