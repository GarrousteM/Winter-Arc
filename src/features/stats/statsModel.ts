import {
  appearsOn,
  checkInKey,
  dayStates,
  weekStart,
  type DayContext,
} from '@/features/checkin/dayModel';
import { targetOn } from '@/features/goals/goalModel';
import { addDaysISO } from '@/lib/dates';
import type { Goal, ISODate } from '@/lib/types';

// Statistiques de la page Progression et du détail d'un objectif. Fonctions pures, sans React.

export type Rate = { done: number; total: number; ratio: number | undefined };

/** « 72 % », ou un tiret sans donnée. */
export function formatRate(r: Rate, empty = '—'): string {
  return r.ratio === undefined ? empty : `${Math.round(r.ratio * 100)} %`;
}

function rate(done: number, total: number): Rate {
  return { done, total, ratio: total === 0 ? undefined : done / total };
}

function datesBetween(start: ISODate, end: ISODate): ISODate[] {
  const out: ISODate[] = [];
  for (let d = start; d <= end; d = addDaysISO(d, 1)) out.push(d);
  return out;
}

/**
 * Taux de réussite d'un objectif : jours prévus réussis, ou semaines au quota pour un hebdomadaire.
 * La journée (ou la semaine) en cours ne compte que si elle est déjà réussie.
 */
export function goalRate(
  goal: Goal,
  start: ISODate,
  until: ISODate,
  today: ISODate,
  ctx: DayContext,
): Rate {
  if (until < start) return rate(0, 0);
  if (goal.frequency.kind === 'weekly') {
    const times = goal.frequency.timesPerWeek;
    let done = 0;
    let total = 0;
    for (let monday = weekStart(start); monday <= until; monday = addDaysISO(monday, 7)) {
      const sunday = addDaysISO(monday, 6);
      const days = datesBetween(
        monday < start ? start : monday,
        sunday < until ? sunday : until,
      ).filter((d) => appearsOn(goal, ctx.categories, d));
      if (days.length === 0) continue;
      const met =
        days.filter((d) => ctx.index.get(checkInKey(goal.id, d))?.completed).length >= times;
      if (met) done += 1;
      if (met || sunday < today) total += 1;
    }
    return rate(done, total);
  }
  let done = 0;
  let total = 0;
  for (const d of datesBetween(start, until)) {
    if (!appearsOn(goal, ctx.categories, d)) continue;
    const completed = ctx.index.get(checkInKey(goal.id, d))?.completed ?? false;
    if (completed) done += 1;
    if (completed || d !== today) total += 1;
  }
  return rate(done, total);
}

/** Taux de réussite d'une catégorie : objectifs qui comptent ce jour-là (règle des hebdomadaires comprise). */
export function categoryRate(
  categoryId: string,
  from: ISODate,
  until: ISODate,
  today: ISODate,
  ctx: DayContext,
): Rate {
  if (until < from) return rate(0, 0);
  let done = 0;
  let total = 0;
  for (const d of datesBetween(from, until)) {
    for (const s of dayStates(d, ctx)) {
      if (s.goal.categoryId !== categoryId || !s.counts) continue;
      if (s.completed) done += 1;
      if (s.completed || d !== today) total += 1;
    }
  }
  return rate(done, total);
}

export type SeriesPoint = {
  date: ISODate;
  /** Valeur saisie, `undefined` si rien n'a été saisi ce jour-là. */
  value: number | undefined;
  target: number | undefined;
  completed: boolean;
};

/** Valeurs saisies jour par jour (jours où l'objectif est prévu). */
export function goalSeries(
  goal: Goal,
  start: ISODate,
  until: ISODate,
  ctx: DayContext,
): SeriesPoint[] {
  if (until < start) return [];
  return datesBetween(start, until)
    .filter((d) => appearsOn(goal, ctx.categories, d))
    .map((date) => {
      const checkIn = ctx.index.get(checkInKey(goal.id, date));
      return {
        date,
        value: checkIn?.value,
        target: goal.type === 'boolean' ? undefined : targetOn(goal, date),
        completed: checkIn?.completed ?? false,
      };
    });
}

export type HeatLevel = 0 | 1 | 2 | 3 | 4;

/** Intensité d'une case : 0 rien, 1 < 40 %, 2 < 80 %, 3 < 100 %, 4 journée parfaite. */
export function heatLevel(ratio: number, counted: number): HeatLevel {
  if (counted === 0 || ratio <= 0) return 0;
  if (ratio >= 1) return 4;
  if (ratio >= 0.8) return 3;
  if (ratio >= 0.4) return 2;
  return 1;
}

export type CalendarCell = { date: ISODate; inArc: boolean };

/** Semaines (lundi → dimanche) couvrant l'Arc, pour la heatmap. */
export function calendarWeeks(start: ISODate, end: ISODate): CalendarCell[][] {
  const weeks: CalendarCell[][] = [];
  for (let monday = weekStart(start); monday <= end; monday = addDaysISO(monday, 7)) {
    weeks.push(
      Array.from({ length: 7 }, (_, i) => {
        const date = addDaysISO(monday, i);
        return { date, inArc: date >= start && date <= end };
      }),
    );
  }
  return weeks;
}
