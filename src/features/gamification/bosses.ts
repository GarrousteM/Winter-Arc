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
