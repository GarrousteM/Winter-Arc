import { addDaysISO } from '@/lib/dates';
import type { Category, CheckIn, Goal } from '@/lib/types';
import { badges } from './badges';
import { bossForWeek } from './bosses';
import { bossWeeks, computeGame, goalStreak, weekMaxXp } from './engine';
import { indexCheckIns } from '@/features/checkin/dayModel';
import { stepStreak, streakMultiplier } from './streak';

const category: Category = {
  id: 'c',
  name: 'Nutrition',
  icon: 'food',
  colorToken: '--cat-2',
  order: 0,
  isDefault: true,
  archived: false,
};

function goal(partial: Partial<Goal> & Pick<Goal, 'id' | 'type'>): Goal {
  return {
    categoryId: 'c',
    title: partial.id,
    targetHistory:
      partial.target !== undefined ? [{ from: '2026-10-01', target: partial.target }] : [],
    frequency: { kind: 'daily' },
    difficulty: 2,
    status: 'active',
    order: 0,
    createdAt: new Date(2026, 9, 1, 12).toISOString(),
    ...partial,
  };
}

const sugar = goal({ id: 'sugar', type: 'boolean' });

function done(goalId: string, dates: string[], value = 1): CheckIn[] {
  return dates.map((date) => ({ id: `${goalId}-${date}`, goalId, date, value, completed: true }));
}

/** n jours consécutifs à partir de `start`. */
function range(start: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => addDaysISO(start, i));
}

// Arc de 4 semaines pile, du lundi 2 novembre au dimanche 29 novembre 2026.
const arc = { startDate: '2026-11-02', endDate: '2026-11-29' };

function game(checkIns: CheckIn[], today: string, goals: Goal[] = [sugar]) {
  return computeGame({ arc, goals, categories: [category], checkIns, today, badges });
}

describe('streak', () => {
  it('suit les paliers du multiplicateur', () => {
    expect([0, 6, 7, 13, 14, 29, 30, 60].map(streakMultiplier)).toEqual([
      1, 1, 1.1, 1.1, 1.25, 1.25, 1.5, 1.5,
    ]);
  });

  it('gagne un joker tous les 7 jours, 3 au maximum', () => {
    let s = { streak: 0, best: 0, tokens: 0 };
    for (let i = 0; i < 35; i++) s = stepStreak(s, 'success');
    expect(s).toMatchObject({ streak: 35, tokens: 3 });
  });

  it('consomme un joker sur un jour raté, sinon remet à zéro', () => {
    const saved = stepStreak({ streak: 9, best: 9, tokens: 1 }, 'missed');
    expect(saved).toMatchObject({ streak: 9, tokens: 0, frozen: true });
    expect(stepStreak({ streak: 9, best: 9, tokens: 0 }, 'missed')).toMatchObject({
      streak: 0,
      best: 9,
    });
  });

  it('ne touche à rien tant que la journée est en cours', () => {
    expect(stepStreak({ streak: 4, best: 4, tokens: 1 }, 'pending')).toMatchObject({
      streak: 4,
      tokens: 1,
    });
  });

  it('ne gaspille pas de joker sans série à sauver', () => {
    expect(stepStreak({ streak: 0, best: 3, tokens: 2 }, 'missed')).toMatchObject({ tokens: 2 });
  });
});

describe('computeGame : XP, série et multiplicateur', () => {
  it('applique le multiplicateur aux objectifs seulement, et le boss vaincu', () => {
    const g = game(done('sugar', range('2026-11-02', 7)), '2026-11-08');
    // Jours 1 à 6 : 20 + 50. Jour 7 : round(20 × 1,1) + 50 = 72. Boss vaincu : +150.
    expect(g.days.map((d) => d.xp)).toEqual([70, 70, 70, 70, 70, 70, 72]);
    expect(g.totalXp).toBe(70 * 6 + 72 + 150);
    expect(g.streak).toBe(7);
    expect(g.multiplier).toBe(1.1);
    expect(g.freezeTokens).toBe(1);
  });

  it('sauve la série avec un joker sur un jour raté', () => {
    const dates = [...range('2026-11-02', 7), '2026-11-10'];
    const g = game(done('sugar', dates), '2026-11-10');
    expect(g.days[7]).toMatchObject({
      date: '2026-11-09',
      outcome: 'missed',
      frozen: true,
      streak: 7,
    });
    expect(g.streak).toBe(8);
    expect(g.freezeTokens).toBe(0);
  });

  it('remet la série à zéro sans joker', () => {
    const g = game(done('sugar', ['2026-11-02', '2026-11-03', '2026-11-05']), '2026-11-05');
    expect(g.days.map((d) => d.streak)).toEqual([1, 2, 0, 1]);
    expect(g.bestStreak).toBe(2);
  });

  it('ne casse pas la série sur la journée en cours', () => {
    const g = game(done('sugar', range('2026-11-02', 3)), '2026-11-05');
    expect(g.days[3]).toMatchObject({ outcome: 'pending', streak: 3 });
    expect(g.streak).toBe(3);
  });

  it('recalcule tout quand un jour passé est modifié', () => {
    const all = done('sugar', range('2026-11-02', 7));
    const before = game(all, '2026-11-08');
    const after = game(
      all.filter((c) => c.date !== '2026-11-04'),
      '2026-11-08',
    );
    expect(after.totalXp).toBeLessThan(before.totalXp);
    expect(after.streak).toBe(4);
    expect(after.freezeTokens).toBe(0);
  });

  it('compte une quantité partielle dans l’XP mais pas dans la réussite', () => {
    const pages = goal({ id: 'pages', type: 'quantity', target: 20 });
    const g = game(
      done('pages', ['2026-11-02'], 15).map((c) => ({ ...c, completed: false })),
      '2026-11-02',
      [pages],
    );
    expect(g.days[0]).toMatchObject({ xp: 15, perfect: false, outcome: 'pending' });
  });
});

describe('boss', () => {
  it('fait du 1er novembre 2026 un prologue et finit par Fenrir', () => {
    const { prologue, weeks } = bossWeeks('2026-11-01', '2027-01-31');
    expect(prologue).toEqual({ start: '2026-11-01', end: '2026-11-01' });
    expect(weeks).toHaveLength(13);
    expect(weeks[0]).toEqual({ start: '2026-11-02', end: '2026-11-08' });
    expect(weeks[12]).toEqual({ start: '2027-01-25', end: '2027-01-31' });
    expect(bossForWeek(0, 13)).toBe('draugr');
    expect(bossForWeek(12, 13)).toBe('fenrir');
  });

  it('réduit la première semaine partielle au lieu d’en faire un prologue', () => {
    const { prologue, weeks } = bossWeeks('2026-11-05', '2026-11-22');
    expect(prologue).toBeUndefined();
    expect(weeks[0]).toEqual({ start: '2026-11-05', end: '2026-11-08' });
  });

  it('calcule les PV avec les hebdomadaires plafonnés aux jours disponibles', () => {
    const workout = goal({
      id: 'workout',
      type: 'boolean',
      difficulty: 3,
      frequency: { kind: 'weekly', timesPerWeek: 5 },
    });
    const ctx = { goals: [sugar, workout], categories: [category], index: indexCheckIns([]) };
    expect(weekMaxXp(range('2026-11-02', 7), ctx)).toBe(7 * 20 + 5 * 30 + 7 * 50);
    expect(weekMaxXp(range('2026-11-05', 4), ctx)).toBe(4 * 20 + 4 * 30 + 4 * 50);
  });

  it('marque le boss vaincu dès 80 % des PV, sinon enfui en fin de semaine', () => {
    const g = game(done('sugar', range('2026-11-02', 6)), '2026-11-16');
    expect(g.bosses[0]).toMatchObject({ hp: 490, status: 'defeated', defeatedOn: '2026-11-07' });
    expect(g.bosses[1]).toMatchObject({ status: 'escaped', damage: 0 });
    expect(g.bosses[2]).toMatchObject({ status: 'active' });
    expect(g.currentBoss?.index).toBe(2);
  });
});

describe('séries par objectif', () => {
  it('compte les jours prévus consécutifs', () => {
    const ctx = {
      goals: [sugar],
      categories: [category],
      index: indexCheckIns(done('sugar', ['2026-11-02', '2026-11-04', '2026-11-05'])),
    };
    expect(goalStreak(sugar, '2026-11-02', '2026-11-06', '2026-11-06', ctx)).toEqual({
      current: 2,
      best: 2,
      unit: 'days',
    });
  });

  it('compte les semaines au quota pour un hebdomadaire', () => {
    const workout = goal({
      id: 'workout',
      type: 'boolean',
      frequency: { kind: 'weekly', timesPerWeek: 2 },
    });
    const checks = done('workout', ['2026-11-02', '2026-11-04', '2026-11-10', '2026-11-12']);
    const ctx = { goals: [workout], categories: [category], index: indexCheckIns(checks) };
    expect(goalStreak(workout, '2026-11-02', '2026-11-17', '2026-11-17', ctx)).toEqual({
      current: 2,
      best: 2,
      unit: 'weeks',
    });
  });
});

describe('badges', () => {
  it('débloque les badges à la bonne date', () => {
    const g = game(done('sugar', range('2026-11-02', 7)), '2026-11-08');
    expect(g.badges).toEqual([
      { id: 'first-step', unlockedOn: '2026-11-02' },
      { id: 'iron-week', unlockedOn: '2026-11-08' },
    ]);
  });

  it('compte les pages lues via l’étiquette du badge', () => {
    const pages = goal({
      id: 'pages',
      type: 'quantity',
      target: 20,
      tag: 'reading-pages',
      title: 'Livres',
    });
    const g = game(done('pages', range('2026-11-02', 5), 100), '2026-11-06', [pages]);
    expect(g.badges.find((b) => b.id === 'bookworm')?.unlockedOn).toBe('2026-11-06');
  });

  it('débloque Mi-parcours au jour 46 et Arc complété à 70 %', () => {
    const long = { startDate: '2026-11-01', endDate: '2027-01-31' };
    const all = done('sugar', range('2026-11-01', 92));
    const g = computeGame({
      arc: long,
      goals: [sugar],
      categories: [category],
      checkIns: all,
      today: '2027-01-31',
      badges,
    });
    const ids = Object.fromEntries(g.badges.map((b) => [b.id, b.unlockedOn]));
    expect(ids.halfway).toBe('2026-12-16');
    expect(ids['arc-complete']).toBe('2027-01-31');
    expect(ids['unbroken-month']).toBe('2026-11-30');
    expect(g.level).toBeGreaterThanOrEqual(20);
  });
});

describe('trêve', () => {
  const restGame = (checkIns: CheckIn[], today: string, restDays: string[]) =>
    computeGame({ arc, goals: [sugar], categories: [category], checkIns, today, badges, restDays });

  it('ne casse pas la série ni ne consomme de joker sur un jour de trêve raté', () => {
    const dates = [...range('2026-11-02', 7), '2026-11-10'];
    const g = restGame(done('sugar', dates), '2026-11-10', ['2026-11-09']);
    expect(g.days[7]).toMatchObject({
      date: '2026-11-09',
      outcome: 'rest',
      rest: true,
      frozen: false,
      streak: 7,
    });
    expect(g.streak).toBe(8);
    expect(g.freezeTokens).toBe(1);
  });

  it('compte une trêve réussie comme un jour normal', () => {
    const g = restGame(done('sugar', range('2026-11-02', 3)), '2026-11-04', ['2026-11-03']);
    expect(g.days[1]).toMatchObject({ outcome: 'success', rest: true });
    expect(g.streak).toBe(3);
  });

  it('retire les jours de trêve des PV du boss et de la complétion globale', () => {
    const g = restGame(done('sugar', range('2026-11-02', 5)), '2026-11-09', [
      '2026-11-07',
      '2026-11-08',
    ]);
    expect(g.bosses[0]?.hp).toBe(5 * 70);
    expect(g.overallCompletion).toBe(5 / 6);
  });

  it('allège le quota hebdomadaire et protège les séries par objectif', () => {
    const workout = goal({
      id: 'workout',
      type: 'boolean',
      frequency: { kind: 'weekly', timesPerWeek: 3 },
    });
    const checks = done('workout', ['2026-11-02', '2026-11-03']);
    const ctx = { goals: [workout], categories: [category], index: indexCheckIns(checks) };
    expect(
      goalStreak(workout, '2026-11-02', '2026-11-10', '2026-11-10', ctx, new Set(['2026-11-08'])),
    ).toEqual({
      current: 1,
      best: 1,
      unit: 'weeks',
    });
    const daily = indexCheckIns(done('sugar', ['2026-11-02', '2026-11-04']));
    expect(
      goalStreak(
        sugar,
        '2026-11-02',
        '2026-11-05',
        '2026-11-05',
        { ...ctx, goals: [sugar], index: daily },
        new Set(['2026-11-03']),
      ),
    ).toEqual({ current: 2, best: 2, unit: 'days' });
  });
});
