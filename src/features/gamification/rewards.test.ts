import type { PlayerState } from '@/lib/types';
import type { GameState } from './engine';
import { diffRewards, mergeLevels } from './rewards';

const seen: PlayerState = { totalXp: 0, unlockedBadges: [], freezeTokens: 0, defeatedBosses: [] };

function game(partial: Partial<GameState>): GameState {
  return {
    days: [],
    totalXp: 0,
    level: 1,
    rank: 'thrall',
    streak: 0,
    bestStreak: 0,
    freezeTokens: 0,
    multiplier: 1,
    prologue: undefined,
    bosses: [],
    currentBoss: undefined,
    goalStreaks: {},
    badges: [],
    overallCompletion: 0,
    ...partial,
  };
}

describe('diffRewards', () => {
  it('ordonne badges, boss puis level-up', () => {
    const { events } = diffRewards(
      seen,
      game({
        totalXp: 650,
        level: 6,
        rank: 'karl',
        badges: [{ id: 'first-step', unlockedOn: '2026-11-02' }],
        bosses: [
          {
            index: 0,
            bossId: 'draugr',
            start: '2026-11-02',
            end: '2026-11-08',
            hp: 490,
            damage: 400,
            defeatedOn: '2026-11-07',
            status: 'defeated',
          },
        ],
      }),
    );
    expect(events).toEqual([
      { kind: 'badge', badgeId: 'first-step' },
      { kind: 'boss', bossId: 'draugr', index: 0 },
      { kind: 'level', level: 6, rank: 'karl', rankChanged: true },
    ]);
  });

  it('ne rejoue rien de déjà célébré', () => {
    const g = game({
      totalXp: 30,
      level: 2,
      badges: [{ id: 'first-step', unlockedOn: '2026-11-02' }],
    });
    const first = diffRewards(seen, g);
    expect(diffRewards(first.next, g).events).toEqual([]);
  });

  it('ne fait pas reculer l’XP célébré', () => {
    const { next, events } = diffRewards(
      { ...seen, totalXp: 100 },
      game({ totalXp: 40, level: 2 }),
    );
    expect(events).toEqual([]);
    expect(next.totalXp).toBe(100);
  });

  it('signale un level-up sans changement de rang', () => {
    const { events } = diffRewards({ ...seen, totalXp: 30 }, game({ totalXp: 110, level: 3 }));
    expect(events).toEqual([{ kind: 'level', level: 3, rank: 'thrall', rankChanged: false }]);
  });
});

describe('mergeLevels', () => {
  it('fusionne les level-ups en attente en gardant le plus haut', () => {
    expect(
      mergeLevels([
        { kind: 'level', level: 4, rank: 'thrall', rankChanged: false },
        { kind: 'perfect' },
        { kind: 'level', level: 5, rank: 'karl', rankChanged: true },
        { kind: 'level', level: 6, rank: 'karl', rankChanged: false },
      ]),
    ).toEqual([{ kind: 'perfect' }, { kind: 'level', level: 6, rank: 'karl', rankChanged: true }]);
  });
});
