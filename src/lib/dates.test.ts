import {
  addDaysISO,
  dayNumber,
  daysInclusive,
  defaultArcDates,
  formatLongDate,
  isValidISODate,
  toISODate,
  weekdayOf,
} from './dates';

describe('dates', () => {
  it('formate en date locale', () => {
    expect(toISODate(new Date(2026, 10, 1, 23, 59))).toBe('2026-11-01');
  });

  it('compte 92 jours du 1er novembre au 31 janvier', () => {
    expect(daysInclusive('2026-11-01', '2027-01-31')).toBe(92);
  });

  it('numérote les jours de l’Arc', () => {
    expect(dayNumber('2026-11-01', '2026-11-01')).toBe(1);
    expect(dayNumber('2026-11-01', '2027-01-31')).toBe(92);
    expect(dayNumber('2026-11-01', '2026-10-26')).toBe(-5);
  });

  it('ajoute des jours en traversant le changement d’heure', () => {
    expect(addDaysISO('2026-10-24', 2)).toBe('2026-10-26');
    expect(addDaysISO('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('donne le jour ISO de la semaine', () => {
    expect(weekdayOf('2026-11-01')).toBe(7);
    expect(weekdayOf('2026-11-02')).toBe(1);
  });

  it('propose la saison à venir ou en cours', () => {
    expect(defaultArcDates(new Date(2026, 9, 26))).toEqual({
      start: '2026-11-01',
      end: '2027-01-31',
      year: 2026,
    });
    expect(defaultArcDates(new Date(2027, 0, 10)).start).toBe('2026-11-01');
    expect(defaultArcDates(new Date(2026, 11, 10)).start).toBe('2026-11-01');
  });

  it('valide les dates ISO', () => {
    expect(isValidISODate('2026-11-01')).toBe(true);
    expect(isValidISODate('2026-13-01')).toBe(false);
    expect(isValidISODate('')).toBe(false);
  });
});

describe('formatLongDate', () => {
  it('écrit « 1er » pour le premier du mois', () => {
    expect(formatLongDate('2026-11-01')).toBe('1er novembre');
    expect(formatLongDate('2027-01-31', true)).toBe('31 janvier 2027');
    expect(formatLongDate('2026-11-11')).toBe('11 novembre');
  });
});
