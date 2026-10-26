import type { Goal } from '@/lib/types';
import { moveInOrder, nextColorToken, targetOn, validateGoalDraft, withTarget } from './goalModel';

const base: Pick<Goal, 'target' | 'targetHistory'> = {
  target: 20,
  targetHistory: [{ from: '2026-11-01', target: 20 }],
};

describe('targetOn / withTarget', () => {
  it('garde l’ancienne cible pour les jours passés', () => {
    const g = withTarget(base, 30, '2026-11-10');
    expect(g.target).toBe(30);
    expect(targetOn(g, '2026-11-09')).toBe(20);
    expect(targetOn(g, '2026-11-10')).toBe(30);
    expect(targetOn(g, '2026-12-01')).toBe(30);
  });

  it('remplace un changement prévu le même jour ou après', () => {
    const g = withTarget(withTarget(base, 30, '2026-11-10'), 25, '2026-11-10');
    expect(g.targetHistory).toEqual([
      { from: '2026-11-01', target: 20 },
      { from: '2026-11-10', target: 25 },
    ]);
  });

  it('utilise la plus ancienne cible avant le premier changement', () => {
    expect(targetOn(base, '2026-10-20')).toBe(20);
  });

  it('ne crée pas d’entrée si la cible ne change pas', () => {
    expect(withTarget(base, 20, '2026-11-10')).toBe(base);
  });
});

describe('validateGoalDraft', () => {
  const draft = {
    title: 'Pages lues',
    type: 'quantity' as const,
    target: 20,
    frequency: { kind: 'daily' as const },
    difficulty: 2 as const,
    categoryId: 'c',
  };

  it('accepte un brouillon complet', () => {
    expect(validateGoalDraft(draft)).toEqual([]);
  });

  it('exige un titre et une cible positive', () => {
    expect(validateGoalDraft({ ...draft, title: ' ', target: 0 })).toEqual(['title', 'target']);
  });

  it('n’exige pas de cible pour un objectif oui / non', () => {
    expect(validateGoalDraft({ ...draft, type: 'boolean', target: undefined })).toEqual([]);
  });

  it('vérifie la fréquence', () => {
    expect(validateGoalDraft({ ...draft, frequency: { kind: 'days', days: [] } })).toEqual([
      'frequency',
    ]);
    expect(validateGoalDraft({ ...draft, frequency: { kind: 'weekly', timesPerWeek: 8 } })).toEqual(
      ['frequency'],
    );
  });
});

describe('moveInOrder', () => {
  const items = [
    { id: 'a', order: 0 },
    { id: 'b', order: 1 },
    { id: 'c', order: 2 },
  ];

  it('échange avec le voisin et renumérote', () => {
    expect(moveInOrder(items, 'c', -1).map((i) => i.id)).toEqual(['a', 'c', 'b']);
    expect(moveInOrder(items, 'a', 1).map((i) => [i.id, i.order])).toEqual([
      ['b', 0],
      ['a', 1],
      ['c', 2],
    ]);
  });

  it('ne bouge pas au bord', () => {
    expect(moveInOrder(items, 'a', -1).map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('nextColorToken', () => {
  it('prend la première couleur libre', () => {
    expect(
      nextColorToken([
        { colorToken: '--cat-1', archived: false },
        { colorToken: '--cat-2', archived: true },
      ]),
    ).toBe('--cat-2');
  });
});
