import { addDays, differenceInCalendarDays, format, getISODay, parseISO } from 'date-fns';
import type { ISODate, Weekday } from './types';

// Tous les calculs se font dans le fuseau local de l'appareil.

export function toISODate(date: Date): ISODate {
  return format(date, 'yyyy-MM-dd');
}

export function fromISODate(iso: ISODate): Date {
  return parseISO(iso);
}

export function today(now: Date = new Date()): ISODate {
  return toISODate(now);
}

export function addDaysISO(iso: ISODate, days: number): ISODate {
  return toISODate(addDays(fromISODate(iso), days));
}

/** Nombre de jours entre deux dates incluses. */
export function daysInclusive(start: ISODate, end: ISODate): number {
  return differenceInCalendarDays(fromISODate(end), fromISODate(start)) + 1;
}

/** Numéro du jour dans l'Arc (1 = premier jour). Peut être ≤ 0 avant le début. */
export function dayNumber(start: ISODate, date: ISODate): number {
  return differenceInCalendarDays(fromISODate(date), fromISODate(start)) + 1;
}

export function weekdayOf(iso: ISODate): Weekday {
  return getISODay(fromISODate(iso)) as Weekday;
}

/**
 * Dates par défaut d'un Winter Arc : 1er novembre → 31 janvier.
 * Pendant la saison (novembre à janvier), on propose la saison en cours.
 */
export function defaultArcDates(now: Date = new Date()): {
  start: ISODate;
  end: ISODate;
  year: number;
} {
  const month = now.getMonth(); // 0 = janvier
  const year = month === 0 ? now.getFullYear() - 1 : now.getFullYear();
  return { start: `${year}-11-01`, end: `${year + 1}-01-31`, year };
}

export function isValidISODate(iso: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) && !Number.isNaN(fromISODate(iso).getTime());
}

const longDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' });
const longDateYear = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** Date en toutes lettres, avec « 1er » pour le premier du mois : « 1er novembre ». */
export function formatLongDate(iso: ISODate, withYear = false): string {
  const formatted = (withYear ? longDateYear : longDate).format(fromISODate(iso));
  return formatted.replace(/^1 /, '1er ');
}

const shortDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const weekdayDate = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

/** Date courte : « 3 nov. », « 1er nov. ». */
export function formatShortDate(iso: ISODate): string {
  return shortDate.format(fromISODate(iso)).replace(/^1 /, '1er ');
}

/** Date avec le jour : « Lundi 2 novembre ». */
export function formatWeekdayDate(iso: ISODate): string {
  const text = weekdayDate.format(fromISODate(iso)).replace(/ 1 /, ' 1er ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}
