// Boss de la semaine (SPEC.md, « Boss de la semaine »). Données ; les textes sont dans copy.ts.

export const BOSS_IDS = [
  'draugr',
  'mara',
  'ice-troll',
  'hrungnir',
  'thrym',
  'garm',
  'skoll',
  'hati',
  'ymir',
  'nidhogg',
  'hel',
  'jormungandr',
  'fenrir',
] as const;

export type BossId = (typeof BOSS_IDS)[number];

const FINAL_BOSS: BossId = 'fenrir';
const REGULAR_BOSSES = BOSS_IDS.filter((id) => id !== FINAL_BOSS);

/** Part des PV à retirer pour vaincre le boss. */
export const BOSS_DEFEAT_RATIO = 0.8;

/** Boss d'une semaine : dans l'ordre de la spec, Fenrir toujours en dernier. */
export function bossForWeek(index: number, count: number): BossId {
  if (index === count - 1) return FINAL_BOSS;
  return REGULAR_BOSSES[index % REGULAR_BOSSES.length] ?? FINAL_BOSS;
}

/** Nombre de boucliers dans le mur d'un boss. */
export const SHIELD_WALL = 10;

/** Boucliers encore debout pour des PV restants (arrondi au-dessus : un bouclier entamé tient). */
export function shieldsStanding(hpLeft: number, maxHp: number, wall = SHIELD_WALL): number {
  if (maxHp <= 0) return 0;
  return Math.min(wall, Math.max(0, Math.ceil((hpLeft / maxHp) * wall)));
}

/** Boucliers à briser pour vaincre le boss (80 % des PV). */
export function shieldsToBreak(wall = SHIELD_WALL): number {
  return Math.ceil(BOSS_DEFEAT_RATIO * wall);
}
