import { shieldsStanding, shieldsToBreak } from './bosses';

describe('mur de boucliers', () => {
  it('compte les boucliers debout, un bouclier entamé tient encore', () => {
    expect(shieldsStanding(630, 630)).toBe(10);
    expect(shieldsStanding(441, 630)).toBe(7);
    expect(shieldsStanding(1, 630)).toBe(1);
    expect(shieldsStanding(0, 630)).toBe(0);
    expect(shieldsStanding(10, 0)).toBe(0);
  });

  it('demande de briser 8 boucliers sur 10', () => {
    expect(shieldsToBreak()).toBe(8);
  });
});
