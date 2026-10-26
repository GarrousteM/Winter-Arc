import { checkInKey, dayStates, type DayContext } from '@/features/checkin/dayModel';
import { addDaysISO, dayNumber } from '@/lib/dates';
import type { CheckIn, ISODate } from '@/lib/types';
import { SHIELD_WALL, shieldsStanding, shieldsToBreak, type BossId } from './bosses';
import type { BossWeek, GameState } from './engine';
import { nextRankLevel, rankForLevel, xpForLevel, type RankId } from './levels';
import { FREEZE_EVERY, FREEZE_MAX } from './streak';
import { BOSS_BONUS } from './xp';

// Ce qui aide à ne pas lâcher en cours d'Arc : prochains paliers, saisies oubliées, retour après
// une absence, récap de la semaine. Fonctions pures, sans React.

export type Milestones = {
  /** Boss de la semaine : boucliers encore à briser (0 si vaincu) et jours restants, ce jour compris. */
  boss: { bossId: BossId; toBreak: number; daysLeft: number; defeated: boolean } | undefined;
  /** Prochain rang (ou prochain niveau au rang maximal) et XP manquants. */
  next: { kind: 'rank'; rank: RankId; xp: number } | { kind: 'level'; level: number; xp: number };
  /** Jours de série avant le prochain joker, `undefined` si la réserve est pleine. */
  jokerIn: number | undefined;
};

export function milestones(game: GameState, today: ISODate): Milestones {
  const current = game.currentBoss;
  let boss: Milestones['boss'];
  if (current) {
    const standing = shieldsStanding(Math.max(0, current.hp - current.damage), current.hp);
    const broken = SHIELD_WALL - standing;
    boss = {
      bossId: current.bossId,
      toBreak: current.defeatedOn ? 0 : Math.max(0, shieldsToBreak() - broken),
      daysLeft: dayNumber(today, current.end),
      defeated: current.defeatedOn !== undefined,
    };
  }
  const rankLevel = nextRankLevel(game.level);
  const next: Milestones['next'] =
    rankLevel !== undefined
      ? { kind: 'rank', rank: rankForLevel(rankLevel), xp: xpForLevel(rankLevel) - game.totalXp }
      : { kind: 'level', level: game.level + 1, xp: xpForLevel(game.level + 1) - game.totalXp };
  const jokerIn =
    game.freezeTokens >= FREEZE_MAX ? undefined : FREEZE_EVERY - (game.streak % FREEZE_EVERY);
  return { boss, next, jokerIn };
}

/** Objectifs qui comptent ce jour-là et n'ont aucune saisie. */
export function missingEntries(date: ISODate, ctx: DayContext): number {
  return dayStates(date, ctx).filter((s) => s.counts && !ctx.index.has(checkInKey(s.goal.id, date)))
    .length;
}

/** Dernier jour où quelque chose a été saisi. */
export function lastActiveDay(checkIns: CheckIn[]): ISODate | undefined {
  return checkIns.reduce<ISODate | undefined>(
    (last, c) => (!last || c.date > last ? c.date : last),
    undefined,
  );
}

/**
 * Écran de retour : au moins un jour est sorti de la fenêtre de rattrapage sans aucune saisie,
 * et il n'a pas déjà été montré depuis la dernière activité.
 */
export function shouldWelcomeBack(input: {
  today: ISODate;
  startDate: ISODate;
  endDate: ISODate;
  lastActive: ISODate | undefined;
  lastShown: ISODate | undefined;
}): boolean {
  const { today, startDate, endDate, lastActive, lastShown } = input;
  if (today < startDate || today > endDate) return false;
  const reference = lastActive ?? addDaysISO(startDate, -1);
  // Jours perdus : de reference + 1 à aujourd'hui − 3 (la fenêtre couvre J−2 et J−1).
  if (addDaysISO(reference, 1) > addDaysISO(today, -3)) return false;
  return lastShown === undefined || lastShown < reference;
}

export type WeeklyRecap = {
  index: number;
  bossId: BossId;
  start: ISODate;
  end: ISODate;
  defeated: boolean;
  /** Jours à 80 % ou plus (hors jours sans objectif) sur les jours de la semaine. */
  strongDays: number;
  days: number;
  perfectDays: number;
  xp: number;
  /** Écart d'XP avec la semaine précédente, `undefined` pour la première. */
  xpDelta: number | undefined;
  bestGoal: { title: string; done: number; total: number } | undefined;
  streak: number;
};

function weekXp(game: GameState, week: BossWeek): number {
  const xp = game.days
    .filter((d) => d.date >= week.start && d.date <= week.end)
    .reduce((sum, d) => sum + d.xp, 0);
  return xp + (week.defeatedOn ? BOSS_BONUS : 0);
}

/** Récap de la dernière semaine terminée, `undefined` s'il n'y en a pas encore. */
export function weeklyRecap(
  game: GameState,
  today: ISODate,
  ctx: DayContext,
): WeeklyRecap | undefined {
  const finished = game.bosses.filter((w) => w.end < today);
  const week = finished[finished.length - 1];
  if (!week) return undefined;
  const previous = finished[finished.length - 2];
  const days = game.days.filter((d) => d.date >= week.start && d.date <= week.end);

  const tally = new Map<string, { title: string; done: number; total: number }>();
  for (const d of days) {
    for (const s of dayStates(d.date, ctx)) {
      if (!s.counts) continue;
      const entry = tally.get(s.goal.id) ?? { title: s.goal.title, done: 0, total: 0 };
      entry.total += 1;
      if (s.completed) entry.done += 1;
      tally.set(s.goal.id, entry);
    }
  }
  const bestGoal = [...tally.values()]
    .filter((g) => g.done > 0)
    .sort((a, b) => b.done / b.total - a.done / a.total || b.done - a.done)[0];

  const xp = weekXp(game, week);
  return {
    index: week.index,
    bossId: week.bossId,
    start: week.start,
    end: week.end,
    defeated: week.defeatedOn !== undefined,
    strongDays: days.filter((d) => d.counted > 0 && d.ratio >= 0.8).length,
    days: days.length,
    perfectDays: days.filter((d) => d.perfect).length,
    xp,
    xpDelta: previous ? xp - weekXp(game, previous) : undefined,
    bestGoal,
    streak: days[days.length - 1]?.streak ?? game.streak,
  };
}

/**
 * Le récap d'une semaine ne s'affiche qu'une fois, et seulement pour une semaine terminée après
 * la création de l'Arc (`since`) : pas de récap d'une semaine vécue avant l'installation.
 */
export function shouldShowRecap(
  recap: WeeklyRecap | undefined,
  lastShownWeek: ISODate | undefined,
  since: ISODate,
): boolean {
  return (
    recap !== undefined &&
    recap.end >= since &&
    (lastShownWeek === undefined || lastShownWeek < recap.start)
  );
}
