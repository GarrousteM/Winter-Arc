import type { Category, CheckIn, Goal } from '@/lib/types';
import {
  appearsOn,
  baseTotalXp,
  dayStates,
  fillableDays,
  goalDayState,
  indexCheckIns,
  isCompleted,
  summarizeDay,
  weekStart,
} from './dayModel';

const category: Category = {
  id: 'c',
  name: 'Sport',
  icon: 'barbell',
  colorToken: '--cat-1',
  order: 0,
  isDefault: true,
  archived: false,
};

function goal(partial: Partial<Goal> & Pick<Goal, 'id' | 'type'>): Goal {
  return {
    categoryId: 'c',
    title: partial.id,
    targetHistory:
      partial.target !== undefined ? [{ from: '2026-10-26', target: partial.target }] : [],
    frequency: { kind: 'daily' },
    difficulty: 2,
    status: 'active',
    order: 0,
    createdAt: new Date(2026, 9, 26, 12).toISOString(),
    ...partial,
  };
}

function check(goalId: string, date: string, value: number, completed: boolean): CheckIn {
  return { id: `${goalId}-${date}`, goalId, date, value, completed };
}

const sugar = goal({ id: 'sugar', type: 'boolean' });
const pages = goal({ id: 'pages', type: 'quantity', target: 20 });
const screen = goal({ id: 'screen', type: 'limit', target: 120 });
const workout = goal({
  id: 'workout',
  type: 'boolean',
  frequency: { kind: 'weekly', timesPerWeek: 5 },
  difficulty: 3,
});
const monWed = goal({ id: 'monwed', type: 'boolean', frequency: { kind: 'days', days: [1, 3] } });

describe('isCompleted', () => {
  it('suit le type et la cible', () => {
    expect(isCompleted(sugar, 1, '2026-11-02')).toBe(true);
    expect(isCompleted(sugar, undefined, '2026-11-02')).toBe(false);
    expect(isCompleted(pages, 19, '2026-11-02')).toBe(false);
    expect(isCompleted(pages, 20, '2026-11-02')).toBe(true);
    expect(isCompleted(screen, 120, '2026-11-02')).toBe(true);
    expect(isCompleted(screen, 121, '2026-11-02')).toBe(false);
  });

  it('exige une saisie pour une limite', () => {
    expect(isCompleted(screen, undefined, '2026-11-02')).toBe(false);
  });

  it('utilise la cible valable ce jour-là', () => {
    const changed: Goal = {
      ...pages,
      target: 30,
      targetHistory: [
        { from: '2026-10-26', target: 20 },
        { from: '2026-11-10', target: 30 },
      ],
    };
    expect(isCompleted(changed, 25, '2026-11-09')).toBe(true);
    expect(isCompleted(changed, 25, '2026-11-10')).toBe(false);
  });
});

describe('appearsOn', () => {
  it('filtre les jours choisis, les pauses et les catégories archivées', () => {
    expect(appearsOn(monWed, [category], '2026-11-02')).toBe(true);
    expect(appearsOn(monWed, [category], '2026-11-03')).toBe(false);
    expect(appearsOn({ ...sugar, status: 'paused' }, [category], '2026-11-02')).toBe(false);
    expect(appearsOn(sugar, [{ ...category, archived: true }], '2026-11-02')).toBe(false);
  });

  it('ne montre pas un objectif avant sa création', () => {
    expect(appearsOn(sugar, [category], '2026-10-25')).toBe(false);
  });
});

describe('objectifs hebdomadaires', () => {
  it('démarre la semaine le lundi', () => {
    expect(weekStart('2026-11-08')).toBe('2026-11-02');
    expect(weekStart('2026-11-02')).toBe('2026-11-02');
  });

  it('ne compte pas un jour de repos tant que le quota reste atteignable', () => {
    const state = goalDayState(workout, '2026-11-02', indexCheckIns([]));
    expect(state.counts).toBe(false);
    expect(state.weekly).toEqual({ done: 0, times: 5 });
  });

  it('compte le jour quand il est coché', () => {
    const state = goalDayState(
      workout,
      '2026-11-02',
      indexCheckIns([check('workout', '2026-11-02', 1, true)]),
    );
    expect(state.counts).toBe(true);
    expect(state.completed).toBe(true);
  });

  it('compte le jour quand le quota n’est plus atteignable sans lui', () => {
    // Jeudi, aucune séance : il reste 4 jours pour 5 séances.
    expect(goalDayState(workout, '2026-11-05', indexCheckIns([])).counts).toBe(true);
    // Jeudi, 2 séances faites : 3 restantes sur 4 jours, le jeudi peut être un repos.
    const two = indexCheckIns([
      check('workout', '2026-11-02', 1, true),
      check('workout', '2026-11-03', 1, true),
    ]);
    expect(goalDayState(workout, '2026-11-05', two).counts).toBe(false);
  });

  it('ne compte plus une fois le quota atteint', () => {
    const five = indexCheckIns(
      ['02', '03', '04', '05', '06'].map((d) => check('workout', `2026-11-${d}`, 1, true)),
    );
    const sunday = goalDayState(workout, '2026-11-08', five);
    expect(sunday.counts).toBe(false);
    expect(sunday.weekly).toEqual({ done: 5, times: 5 });
  });
});

describe('summarizeDay', () => {
  const ctx = (checkIns: CheckIn[]) => ({
    goals: [sugar, pages, screen, workout],
    categories: [category],
    index: indexCheckIns(checkIns),
  });

  it('calcule le ratio sur les objectifs qui comptent', () => {
    const day = summarizeDay(dayStates('2026-11-02', ctx([check('sugar', '2026-11-02', 1, true)])));
    expect(day).toMatchObject({ counted: 3, completed: 1, perfect: false });
    expect(day.ratio).toBeCloseTo(1 / 3);
    expect(day.xp).toBe(20);
  });

  it('ajoute le bonus de journée parfaite', () => {
    const day = summarizeDay(
      dayStates(
        '2026-11-02',
        ctx([
          check('sugar', '2026-11-02', 1, true),
          check('pages', '2026-11-02', 30, true),
          check('screen', '2026-11-02', 60, true),
          check('workout', '2026-11-02', 1, true),
        ]),
      ),
    );
    expect(day.perfect).toBe(true);
    // 20 + 20 (+5 dépassement) + 20 + 30 + 50
    expect(day.xp).toBe(145);
  });

  it('n’est pas parfaite sans objectif', () => {
    expect(summarizeDay([]).perfect).toBe(false);
  });

  it('cumule l’XP sur plusieurs jours', () => {
    const c = ctx([check('sugar', '2026-11-01', 1, true), check('sugar', '2026-11-02', 1, true)]);
    expect(baseTotalXp('2026-11-01', '2026-11-02', c)).toBe(40);
  });
});

describe('fillableDays', () => {
  it('ouvre le jour même et les deux précédents', () => {
    expect(fillableDays('2026-11-01', '2027-01-31', '2026-11-10')).toEqual([
      '2026-11-08',
      '2026-11-09',
      '2026-11-10',
    ]);
  });

  it('ne remonte pas avant le début de l’Arc', () => {
    expect(fillableDays('2026-11-01', '2027-01-31', '2026-11-01')).toEqual(['2026-11-01']);
    expect(fillableDays('2026-11-01', '2027-01-31', '2026-10-26')).toEqual([]);
  });

  it('laisse rattraper les derniers jours après la fin, puis plus rien', () => {
    expect(fillableDays('2026-11-01', '2027-01-31', '2027-02-01')).toEqual([
      '2027-01-30',
      '2027-01-31',
    ]);
    expect(fillableDays('2026-11-01', '2027-01-31', '2027-02-03')).toEqual([]);
  });
});
