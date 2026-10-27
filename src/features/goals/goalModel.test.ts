import type { Goal } from '@/lib/types';
import {
  moveInOrder,
  nextColorToken,
  nextRampStep,
  rampOn,
  targetOn,
  validateGoalDraft,
  withTarget,
} from './goalModel';

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

describe('progression hebdomadaire', () => {
  // Lundi 2 novembre 2026 : 20 pompes, +5 chaque lundi.
  const pushups = withTarget({ targetHistory: [] }, 20, '2026-11-02', { step: 5 });

  it('ajoute le pas chaque lundi, pas avant', () => {
    expect(targetOn(pushups, '2026-11-02')).toBe(20);
    expect(targetOn(pushups, '2026-11-08')).toBe(20);
    expect(targetOn(pushups, '2026-11-09')).toBe(25);
    expect(targetOn(pushups, '2026-11-23')).toBe(35);
  });

  it('démarre au lundi suivant même si la progression commence en milieu de semaine', () => {
    const g = withTarget({ targetHistory: [] }, 20, '2026-11-04', { step: 5 });
    expect(targetOn(g, '2026-11-08')).toBe(20);
    expect(targetOn(g, '2026-11-09')).toBe(25);
  });

  it('s’arrête au plafond', () => {
    const g = withTarget({ targetHistory: [] }, 20, '2026-11-02', { step: 5, bound: 30 });
    expect(targetOn(g, '2026-11-16')).toBe(30);
    expect(targetOn(g, '2027-01-25')).toBe(30);
  });

  it('fait baisser une limite jusqu’au plancher, jamais sous 0', () => {
    const screen = withTarget({ targetHistory: [] }, 120, '2026-11-02', { step: -15, bound: 60 });
    expect(targetOn(screen, '2026-11-09')).toBe(105);
    expect(targetOn(screen, '2027-01-25')).toBe(60);
    const noFloor = withTarget({ targetHistory: [] }, 20, '2026-11-02', { step: -15 });
    expect(targetOn(noFloor, '2026-11-16')).toBe(0);
  });

  it('ne touche pas aux jours passés quand on l’active sur un objectif existant', () => {
    const g = withTarget(base, 20, '2026-11-18', { step: 5 });
    expect(targetOn(g, '2026-11-17')).toBe(20);
    expect(targetOn(g, '2026-11-18')).toBe(20);
    expect(targetOn(g, '2026-11-23')).toBe(25);
    expect(rampOn(g, '2026-11-17')).toBeUndefined();
  });

  it('repart de la nouvelle cible quand on la change à la main', () => {
    const g = withTarget(pushups, 40, '2026-11-25', { step: 5 });
    expect(targetOn(g, '2026-11-24')).toBe(35);
    expect(targetOn(g, '2026-11-25')).toBe(40);
    expect(targetOn(g, '2026-11-30')).toBe(45);
  });

  it('ne crée pas d’entrée si la cible du jour et la progression sont inchangées', () => {
    expect(withTarget(pushups, 35, '2026-11-25', { step: 5 })).toBe(pushups);
    expect(withTarget(pushups, 35, '2026-11-25')).not.toBe(pushups);
  });

  it('annonce la marche de lundi', () => {
    expect(nextRampStep(pushups, '2026-11-05')).toEqual({ on: '2026-11-09', target: 25 });
    const capped = withTarget({ targetHistory: [] }, 30, '2026-11-02', { step: 5, bound: 30 });
    expect(nextRampStep(capped, '2026-11-05')).toBeUndefined();
    expect(nextRampStep(base, '2026-11-05')).toBeUndefined();
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

describe('validateGoalDraft : progression', () => {
  const draft = {
    title: 'Pompes',
    type: 'quantity' as const,
    target: 20,
    frequency: { kind: 'daily' as const },
    difficulty: 2 as const,
    categoryId: 'c',
  };

  it('accepte une hausse et un plafond au-dessus de la cible', () => {
    expect(validateGoalDraft({ ...draft, ramp: { step: 5, bound: 60 } })).toEqual([]);
  });

  it('refuse un pas nul ou un plafond sous la cible', () => {
    expect(validateGoalDraft({ ...draft, ramp: { step: 0 } })).toEqual(['ramp']);
    expect(validateGoalDraft({ ...draft, ramp: { step: 5, bound: 10 } })).toEqual(['ramp']);
  });

  it('veut une baisse et un plancher sous la cible pour une limite', () => {
    const limit = { ...draft, type: 'limit' as const, target: 120 };
    expect(validateGoalDraft({ ...limit, ramp: { step: -15, bound: 60 } })).toEqual([]);
    expect(validateGoalDraft({ ...limit, ramp: { step: -15, bound: 150 } })).toEqual(['ramp']);
  });
});
