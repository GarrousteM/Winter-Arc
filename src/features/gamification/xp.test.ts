import { levelForXp, levelProgress, rankForLevel, xpForLevel } from './levels';
import { goalXp } from './xp';

describe('goalXp', () => {
  it('donne l’XP de la difficulté pour un objectif oui / non validé', () => {
    expect(
      goalXp({ type: 'boolean', difficulty: 1, value: 1, target: undefined, completed: true }),
    ).toEqual({ base: 10, bonus: 0 });
    expect(
      goalXp({ type: 'boolean', difficulty: 3, value: 0, target: undefined, completed: false }),
    ).toEqual({ base: 0, bonus: 0 });
  });

  it('proportionne une quantité partielle, rien sous 50 %', () => {
    const q = (value: number) =>
      goalXp({ type: 'quantity', difficulty: 2, value, target: 20, completed: value >= 20 });
    expect(q(9)).toEqual({ base: 0, bonus: 0 });
    expect(q(10)).toEqual({ base: 10, bonus: 0 });
    expect(q(15)).toEqual({ base: 15, bonus: 0 });
    expect(q(20)).toEqual({ base: 20, bonus: 0 });
  });

  it('plafonne à 100 % et ajoute +5 dès 150 %', () => {
    const q = (value: number) =>
      goalXp({ type: 'quantity', difficulty: 2, value, target: 20, completed: true });
    expect(q(29)).toEqual({ base: 20, bonus: 0 });
    expect(q(30)).toEqual({ base: 20, bonus: 5 });
  });

  it('ne donne rien sans saisie', () => {
    expect(
      goalXp({ type: 'quantity', difficulty: 2, value: undefined, target: 20, completed: false }),
    ).toEqual({ base: 0, bonus: 0 });
  });

  it('traite une limite comme oui / non', () => {
    expect(
      goalXp({ type: 'limit', difficulty: 2, value: 90, target: 120, completed: true }),
    ).toEqual({ base: 20, bonus: 0 });
    expect(
      goalXp({ type: 'limit', difficulty: 2, value: 150, target: 120, completed: false }),
    ).toEqual({ base: 0, bonus: 0 });
  });
});

describe('niveaux', () => {
  it('suit la formule 25 × (niveau − 1)²', () => {
    expect(xpForLevel(2)).toBe(25);
    expect(xpForLevel(10)).toBe(2025);
    expect(xpForLevel(30)).toBe(21025);
  });

  it('calcule le niveau aux bornes', () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(24)).toBe(1);
    expect(levelForXp(25)).toBe(2);
    expect(levelForXp(2024)).toBe(9);
    expect(levelForXp(2025)).toBe(10);
    expect(levelForXp(21025)).toBe(30);
  });

  it('donne la progression dans le niveau', () => {
    expect(levelProgress(30)).toEqual({ level: 2, current: 5, needed: 75 });
  });

  it('associe les rangs', () => {
    expect([1, 4, 5, 9, 10, 15, 20, 24, 25, 40].map(rankForLevel)).toEqual([
      'thrall',
      'thrall',
      'karl',
      'karl',
      'drengr',
      'huscarl',
      'jarl',
      'jarl',
      'einherjar',
      'einherjar',
    ]);
  });
});
