import type { PlayerState } from '@/lib/types';
import type { BossId } from './bosses';
import type { GameState } from './engine';
import { levelForXp, rankForLevel, type RankId } from './levels';

// Différence entre la progression recalculée et ce qui a déjà été célébré. Fonctions pures.

export type RewardEvent =
  | { kind: 'perfect' }
  | { kind: 'badge'; badgeId: string }
  | { kind: 'boss'; bossId: BossId; index: number }
  | { kind: 'level'; level: number; rank: RankId; rankChanged: boolean };

/**
 * Récompenses à afficher, dans l'ordre : badges, boss, level-up.
 * Le nouvel état célébré ne recule jamais (« on ne perd jamais d'XP ») : décocher puis recocher
 * un objectif ne rejoue pas un level-up déjà vu.
 */
export function diffRewards(
  seen: PlayerState,
  game: GameState,
): { events: RewardEvent[]; next: PlayerState } {
  const events: RewardEvent[] = [];
  const seenBadges = new Set(seen.unlockedBadges.map((b) => b.badgeId));
  const newBadges = game.badges.filter((b) => !seenBadges.has(b.id));
  for (const badge of newBadges) events.push({ kind: 'badge', badgeId: badge.id });

  const seenBosses = new Set(seen.defeatedBosses);
  const newBosses = game.bosses.filter((w) => w.defeatedOn && !seenBosses.has(w.index));
  for (const boss of newBosses)
    events.push({ kind: 'boss', bossId: boss.bossId, index: boss.index });

  const previousLevel = levelForXp(seen.totalXp);
  if (game.level > previousLevel) {
    events.push({
      kind: 'level',
      level: game.level,
      rank: game.rank,
      rankChanged: game.rank !== rankForLevel(previousLevel),
    });
  }

  return {
    events,
    next: {
      totalXp: Math.max(seen.totalXp, game.totalXp),
      unlockedBadges: [
        ...seen.unlockedBadges,
        ...newBadges.map((b) => ({ badgeId: b.id, date: b.unlockedOn })),
      ],
      freezeTokens: game.freezeTokens,
      defeatedBosses: [...seen.defeatedBosses, ...newBosses.map((w) => w.index)],
    },
  };
}

/**
 * Plusieurs level-ups en attente (ex. une journée remplie d'un coup) n'en font qu'un :
 * le plus haut niveau, placé à la position du dernier, rang marqué si l'un d'eux en changeait.
 */
export function mergeLevels(queue: RewardEvent[]): RewardEvent[] {
  type LevelEvent = Extract<RewardEvent, { kind: 'level' }>;
  const levels = queue.filter((e): e is LevelEvent => e.kind === 'level');
  if (levels.length < 2) return queue;
  const top = levels.reduce((a, b) => (b.level > a.level ? b : a));
  const merged: LevelEvent = { ...top, rankChanged: levels.some((l) => l.rankChanged) };
  const others: RewardEvent[] = queue.filter((e) => e.kind !== 'level');
  // Le level-up fusionné prend la place du dernier : après les récompenses qui l'ont précédé.
  let lastLevel = 0;
  queue.forEach((e, i) => {
    if (e.kind === 'level') lastLevel = i;
  });
  const before = queue.slice(0, lastLevel).filter((e) => e.kind !== 'level').length;
  return [...others.slice(0, before), merged, ...others.slice(before)];
}
