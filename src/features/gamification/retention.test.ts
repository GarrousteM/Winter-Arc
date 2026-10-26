import { indexCheckIns } from '@/features/checkin/dayModel';
import { addDaysISO } from '@/lib/dates';
import type { Category, CheckIn, Goal } from '@/lib/types';
import { badges } from './badges';
import { computeGame } from './engine';
import { nextRankLevel } from './levels';
import {
  lastActiveDay,
  milestones,
  missingEntries,
  shouldShowRecap,
  shouldWelcomeBack,
  weeklyRecap,
} from './retention';

const category: Category = {
  id: 'c',
  name: 'Nutrition',
  icon: 'food',
  colorToken: '--cat-2',
  order: 0,
  isDefault: true,
  archived: false,
};

const goal = (id: string, extra: Partial<Goal> = {}): Goal => ({
  id,
  categoryId: 'c',
  title: id,
  type: 'boolean',
  targetHistory: [],
  frequency: { kind: 'daily' },
  difficulty: 2,
  status: 'active',
  order: 0,
  createdAt: new Date(2026, 9, 1, 12).toISOString(),
  ...extra,
});

const sugar = goal('Sucre');
const water = goal('Eau');

const done = (goalId: string, dates: string[]): CheckIn[] =>
  dates.map((date) => ({ id: `${goalId}-${date}`, goalId, date, value: 1, completed: true }));
const range = (start: string, n: number) =>
  Array.from({ length: n }, (_, i) => addDaysISO(start, i));

const arc = { startDate: '2026-11-02', endDate: '2026-11-29' };
const ctxOf = (checkIns: CheckIn[]) => ({
  goals: [sugar, water],
  categories: [category],
  index: indexCheckIns(checkIns),
});
const gameOf = (checkIns: CheckIn[], today: string) =>
  computeGame({ arc, goals: [sugar, water], categories: [category], checkIns, today, badges });

describe('nextRankLevel', () => {
  it('donne le premier niveau du rang suivant', () => {
    expect(nextRankLevel(1)).toBe(5);
    expect(nextRankLevel(12)).toBe(15);
    expect(nextRankLevel(24)).toBe(25);
    expect(nextRankLevel(25)).toBeUndefined();
  });
});

describe('milestones', () => {
  it('donne les boucliers restants, le prochain rang et le prochain joker', () => {
    const checks = [
      ...done('Sucre', range('2026-11-02', 3)),
      ...done('Eau', range('2026-11-02', 3)),
    ];
    const m = milestones(gameOf(checks, '2026-11-04'), '2026-11-04');
    // Semaine : PV = 7 × (20 + 20 + 50) = 630 ; 3 jours parfaits = 270 de dégâts → 6 debout sur 10.
    expect(m.boss).toEqual({ bossId: 'draugr', toBreak: 4, daysLeft: 5, defeated: false });
    expect(m.next).toEqual({ kind: 'rank', rank: 'karl', xp: 400 - 270 });
    expect(m.jokerIn).toBe(4);
  });
});

describe('missingEntries', () => {
  it('compte les objectifs du jour sans saisie', () => {
    expect(missingEntries('2026-11-02', ctxOf(done('Sucre', ['2026-11-02'])))).toBe(1);
    expect(missingEntries('2026-11-03', ctxOf([]))).toBe(2);
  });
});

describe('écran de retour', () => {
  const base = { startDate: '2026-11-02', endDate: '2026-11-29', lastShown: undefined };

  it('se déclenche quand un jour sort de la fenêtre de rattrapage', () => {
    expect(shouldWelcomeBack({ ...base, today: '2026-11-08', lastActive: '2026-11-05' })).toBe(
      false,
    );
    expect(shouldWelcomeBack({ ...base, today: '2026-11-09', lastActive: '2026-11-05' })).toBe(
      true,
    );
  });

  it('se déclenche aussi sans aucune saisie depuis le début de l’Arc', () => {
    expect(shouldWelcomeBack({ ...base, today: '2026-11-04', lastActive: undefined })).toBe(false);
    expect(shouldWelcomeBack({ ...base, today: '2026-11-05', lastActive: undefined })).toBe(true);
  });

  it('ne se montre qu’une fois par absence, et pas hors de l’Arc', () => {
    expect(
      shouldWelcomeBack({
        ...base,
        today: '2026-11-12',
        lastActive: '2026-11-05',
        lastShown: '2026-11-09',
      }),
    ).toBe(false);
    expect(
      shouldWelcomeBack({
        ...base,
        today: '2026-11-20',
        lastActive: '2026-11-10',
        lastShown: '2026-11-09',
      }),
    ).toBe(true);
    expect(
      shouldWelcomeBack({
        ...base,
        today: '2026-12-05',
        lastActive: '2026-11-10',
        lastShown: undefined,
      }),
    ).toBe(false);
  });

  it('trouve le dernier jour actif', () => {
    expect(lastActiveDay(done('Sucre', ['2026-11-03', '2026-11-07', '2026-11-05']))).toBe(
      '2026-11-07',
    );
    expect(lastActiveDay([])).toBeUndefined();
  });
});

describe('récap hebdomadaire', () => {
  it('résume la dernière semaine terminée', () => {
    const checks = [
      ...done('Sucre', range('2026-11-02', 7)),
      ...done('Eau', range('2026-11-02', 3)),
    ];
    const recap = weeklyRecap(gameOf(checks, '2026-11-10'), '2026-11-10', ctxOf(checks));
    expect(recap).toMatchObject({
      index: 0,
      bossId: 'draugr',
      defeated: false,
      strongDays: 3,
      days: 7,
      perfectDays: 3,
      xpDelta: undefined,
      bestGoal: { title: 'Sucre', done: 7, total: 7 },
    });
  });

  it('n’existe pas avant la fin de la première semaine et ne s’affiche qu’une fois', () => {
    expect(weeklyRecap(gameOf([], '2026-11-08'), '2026-11-08', ctxOf([]))).toBeUndefined();
    const recap = weeklyRecap(gameOf([], '2026-11-10'), '2026-11-10', ctxOf([]));
    expect(shouldShowRecap(recap, undefined, '2026-11-02')).toBe(true);
    expect(shouldShowRecap(recap, '2026-11-02', '2026-11-02')).toBe(false);
    // Arc créé après la fin de cette semaine (début antidaté) : pas de récap.
    expect(shouldShowRecap(recap, undefined, '2026-11-10')).toBe(false);
    expect(recap?.bestGoal).toBeUndefined();
  });

  it('compare l’XP avec la semaine précédente', () => {
    // Semaine 2 : l'eau s'ajoute au sucre quatre jours sur sept.
    const checks = [
      ...done('Sucre', range('2026-11-02', 14)),
      ...done('Eau', range('2026-11-09', 4)),
    ];
    const recap = weeklyRecap(gameOf(checks, '2026-11-17'), '2026-11-17', ctxOf(checks));
    expect(recap?.index).toBe(1);
    expect(recap?.xpDelta).toBeGreaterThan(0);
    const flat = done('Sucre', range('2026-11-02', 14));
    expect(weeklyRecap(gameOf(flat, '2026-11-17'), '2026-11-17', ctxOf(flat))?.xpDelta).toBe(0);
  });
});
