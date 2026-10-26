import { rivets } from './shieldGeometry';

describe('shieldGeometry', () => {
  it('répartit les rivets sur le bord', () => {
    expect(rivets(4, 0, 0, 10)).toEqual([
      [10, 0],
      [0, 10],
      [-10, 0],
      [-0, -10],
    ]);
  });
});
