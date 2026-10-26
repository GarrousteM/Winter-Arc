import { goalSuggestions } from '@/features/goals/suggestions';
import { addDaysISO } from '@/lib/dates';
import type { Category, CheckIn, Goal } from '@/lib/types';
import { badges } from './badges';
import { computeGame } from './engine';

// SPEC.md : « Un Arc parfait de 92 jours doit mener autour du niveau 30 ».
describe('calibration', () => {
  it('mène un Arc parfait avec les suggestions par défaut autour du niveau 30', () => {
    const category: Category = {
      id: 'c',
      name: 'Tout',
      icon: 'mountain',
      colorToken: '--cat-1',
      order: 0,
      isDefault: true,
      archived: false,
    };
    const goals: Goal[] = Object.values(goalSuggestions)
      .flat()
      .map((s, i) => ({
        id: `g${i}`,
        categoryId: 'c',
        title: s.title,
        type: s.type,
        ...(s.target !== undefined ? { target: s.target } : {}),
        targetHistory: s.target !== undefined ? [{ from: '2026-11-01', target: s.target }] : [],
        frequency: s.frequency,
        difficulty: s.difficulty,
        status: 'active',
        order: i,
        createdAt: new Date(2026, 10, 1, 8).toISOString(),
      }));
    const checkIns: CheckIn[] = [];
    for (let i = 0; i < 92; i++) {
      const date = addDaysISO('2026-11-01', i);
      for (const g of goals) {
        // Hebdomadaire 5 / 7 : séances du lundi au vendredi (jours ISO 1 à 5).
        if (g.frequency.kind === 'weekly' && [0, 6].includes(new Date(`${date}T12:00`).getDay()))
          continue;
        const value = g.type === 'boolean' ? 1 : (g.target ?? 0);
        checkIns.push({ id: `${g.id}-${date}`, goalId: g.id, date, value, completed: true });
      }
    }
    const game = computeGame({
      arc: { startDate: '2026-11-01', endDate: '2027-01-31' },
      goals,
      categories: [category],
      checkIns,
      today: '2027-01-31',
      badges,
    });
    expect(game.level).toBeGreaterThanOrEqual(27);
    expect(game.level).toBeLessThanOrEqual(33);
  });
});
