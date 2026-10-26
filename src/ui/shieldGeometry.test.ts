import { plankPath, plankSeams, rivets } from './shieldGeometry';

describe('shieldGeometry', () => {
  it('découpe le bouclier en planches depuis le haut', () => {
    expect(plankPath(0, 6, 70, 70, 58)).toBe('M70 70 L70 12 A58 58 0 0 1 120.2 41 Z');
    expect(plankPath(5, 6, 70, 70, 58)).toBe('M70 70 L19.8 41 A58 58 0 0 1 70 12 Z');
  });

  it('dessine un disque plein pour une seule planche', () => {
    expect(plankPath(0, 1, 20, 20, 10)).toBe('M10 20 A10 10 0 1 1 30 20 A10 10 0 1 1 10 20 Z');
  });

  it('trace une jointure par planche, aucune pour une seule', () => {
    expect(plankSeams(4, 20, 20, 10)).toBe('M20 20L20 10M20 20L30 20M20 20L20 30M20 20L10 20');
    expect(plankSeams(1, 20, 20, 10)).toBe('');
  });

  it('répartit les rivets sur le bord', () => {
    expect(rivets(4, 0, 0, 10)).toEqual([
      [10, 0],
      [0, 10],
      [-10, 0],
      [-0, -10],
    ]);
  });
});
