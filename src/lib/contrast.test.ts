import { contrastLevel, contrastRatio, parseHex } from './contrast';

describe('contrast', () => {
  it('parse les formats courts et longs', () => {
    expect(parseHex('#fff')).toEqual([255, 255, 255]);
    expect(parseHex('0e1116')).toEqual([14, 17, 22]);
  });

  it('rejette une couleur invalide', () => {
    expect(() => parseHex('#zzzzzz')).toThrow();
  });

  it('donne 21 entre noir et blanc', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });

  it('est symétrique', () => {
    expect(contrastRatio('#e8ecef', '#171c24')).toBeCloseTo(contrastRatio('#171c24', '#e8ecef'));
  });

  it('classe les ratios selon WCAG AA', () => {
    expect(contrastLevel(4.5)).toBe('aa-text');
    expect(contrastLevel(3.2)).toBe('aa-ui');
    expect(contrastLevel(2.9)).toBe('fail');
  });
});
