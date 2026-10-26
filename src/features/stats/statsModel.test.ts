import { indexCheckIns } from '@/features/checkin/dayModel';
import type { Category, CheckIn, Goal } from '@/lib/types';
import { calendarWeeks, categoryRate, goalRate, goalSeries, heatLevel } from './statsModel';

const category: Category = {
  id: 'c',
  name: 'Lecture',
  icon: 'book',
  colorToken: '--cat-3',
  order: 0,
  isDefault: true,
  archived: false,
};

function goal(partial: Partial<Goal> & Pick<Goal, 'id' | 'type'>): Goal {
  return {
    categoryId: 'c',
    title: partial.id,
    targetHistory: [],
    frequency: { kind: 'daily' },
    difficulty: 2,
    status: 'active',
    order: 0,
    createdAt: new Date(2026, 9, 1, 12).toISOString(),
    ...partial,
  };
}

const check = (goalId: string, date: string, value = 1, completed = true): CheckIn => ({
  id: `${goalId}-${date}`,
  goalId,
  date,
  value,
  completed,
});

const sugar = goal({ id: 'sugar', type: 'boolean' });
const ctxOf = (goals: Goal[], checkIns: CheckIn[]) => ({
  goals,
  categories: [category],
  index: indexCheckIns(checkIns),
});

describe('goalRate', () => {
  it('compte les jours prévus et ignore la journée en cours non faite', () => {
    const ctx = ctxOf([sugar], [check('sugar', '2026-11-02'), check('sugar', '2026-11-04')]);
    expect(goalRate(sugar, '2026-11-02', '2026-11-05', '2026-11-05', ctx)).toEqual({
      done: 2,
      total: 3,
      ratio: 2 / 3,
    });
  });

  it('compte les semaines au quota pour un hebdomadaire', () => {
    const workout = goal({
      id: 'w',
      type: 'boolean',
      frequency: { kind: 'weekly', timesPerWeek: 2 },
    });
    const ctx = ctxOf(
      [workout],
      [check('w', '2026-11-02'), check('w', '2026-11-03'), check('w', '2026-11-10')],
    );
    // Semaine 1 au quota, semaine 2 ratée, semaine 3 en cours (pas comptée).
    expect(goalRate(workout, '2026-11-02', '2026-11-17', '2026-11-17', ctx)).toEqual({
      done: 1,
      total: 2,
      ratio: 0.5,
    });
  });

  it('n’a pas de taux sans jour écoulé', () => {
    expect(
      goalRate(sugar, '2026-11-02', '2026-11-01', '2026-11-01', ctxOf([sugar], [])).ratio,
    ).toBeUndefined();
  });
});

describe('categoryRate', () => {
  it('agrège les objectifs de la catégorie', () => {
    const pages = goal({
      id: 'pages',
      type: 'quantity',
      target: 20,
      targetHistory: [{ from: '2026-10-01', target: 20 }],
    });
    const ctx = ctxOf(
      [sugar, pages],
      [check('sugar', '2026-11-02'), check('pages', '2026-11-02', 10, false)],
    );
    expect(categoryRate('c', '2026-11-02', '2026-11-02', '2026-11-03', ctx)).toEqual({
      done: 1,
      total: 2,
      ratio: 0.5,
    });
  });
});

describe('goalSeries', () => {
  it('donne valeur et cible du jour, avec les trous', () => {
    const pages = goal({
      id: 'pages',
      type: 'quantity',
      target: 30,
      targetHistory: [
        { from: '2026-10-01', target: 20 },
        { from: '2026-11-03', target: 30 },
      ],
    });
    const series = goalSeries(
      pages,
      '2026-11-02',
      '2026-11-04',
      ctxOf([pages], [check('pages', '2026-11-02', 25)]),
    );
    expect(series).toEqual([
      { date: '2026-11-02', value: 25, target: 20, completed: true },
      { date: '2026-11-03', value: undefined, target: 30, completed: false },
      { date: '2026-11-04', value: undefined, target: 30, completed: false },
    ]);
  });
});

describe('heatmap', () => {
  it('classe les intensités', () => {
    expect([
      heatLevel(0, 3),
      heatLevel(0.3, 3),
      heatLevel(0.5, 3),
      heatLevel(0.8, 5),
      heatLevel(1, 3),
      heatLevel(1, 0),
    ]).toEqual([0, 1, 2, 3, 4, 0]);
  });

  it('couvre l’Arc en semaines complètes', () => {
    const weeks = calendarWeeks('2026-11-01', '2027-01-31');
    expect(weeks).toHaveLength(14);
    expect(weeks[0]?.[0]).toEqual({ date: '2026-10-26', inArc: false });
    expect(weeks[0]?.[6]).toEqual({ date: '2026-11-01', inArc: true });
    expect(weeks[13]?.[6]).toEqual({ date: '2027-01-31', inArc: true });
  });
});
