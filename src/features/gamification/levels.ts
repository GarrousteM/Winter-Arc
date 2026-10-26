// Niveaux et rangs (SPEC.md, « Niveaux et rangs »). Fonctions pures.

/** XP total nécessaire pour atteindre un niveau : 25 × (niveau − 1)². */
export function xpForLevel(level: number): number {
  return 25 * (level - 1) ** 2;
}

export function levelForXp(totalXp: number): number {
  let level = Math.floor(Math.sqrt(Math.max(0, totalXp) / 25)) + 1;
  // Garde-fou contre les arrondis flottants aux bornes exactes.
  while (xpForLevel(level + 1) <= totalXp) level += 1;
  while (level > 1 && xpForLevel(level) > totalXp) level -= 1;
  return level;
}

export type LevelProgress = {
  level: number;
  /** XP acquis dans le niveau courant. */
  current: number;
  /** XP du niveau courant au suivant. */
  needed: number;
};

export function levelProgress(totalXp: number): LevelProgress {
  const level = levelForXp(totalXp);
  const floor = xpForLevel(level);
  return { level, current: totalXp - floor, needed: xpForLevel(level + 1) - floor };
}

export type RankId = 'thrall' | 'karl' | 'drengr' | 'huscarl' | 'jarl' | 'einherjar';

const RANKS: { from: number; id: RankId }[] = [
  { from: 25, id: 'einherjar' },
  { from: 20, id: 'jarl' },
  { from: 15, id: 'huscarl' },
  { from: 10, id: 'drengr' },
  { from: 5, id: 'karl' },
  { from: 1, id: 'thrall' },
];

export function rankForLevel(level: number): RankId {
  return RANKS.find((r) => level >= r.from)?.id ?? 'thrall';
}
