import type { AppData } from '@/app/store';

// Export / import JSON de toutes les données (SPEC.md, « Modèle de données »). Fonctions pures.

export const BACKUP_APP = 'winter-arc';
export const BACKUP_SCHEMA = 3;

export type Backup = {
  app: typeof BACKUP_APP;
  schema: number;
  exportedAt: string;
  data: AppData;
};

export function buildBackup(data: AppData, now: Date = new Date()): Backup {
  return { app: BACKUP_APP, schema: BACKUP_SCHEMA, exportedAt: now.toISOString(), data };
}

export function backupFileName(date: string): string {
  return `winter-arc-${date}.json`;
}

export type ImportError = 'json' | 'format' | 'version';

export type ImportResult = { ok: true; backup: Backup } | { ok: false; error: ImportError };

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isString = (v: unknown): v is string => typeof v === 'string';
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

function validData(d: unknown): d is AppData {
  if (!isObject(d)) return false;
  const { arc, categories, goals, checkIns, dayNotes, player, preferences } = d;
  if (
    arc !== null &&
    !(
      isObject(arc) &&
      isString(arc.id) &&
      isString(arc.name) &&
      isString(arc.startDate) &&
      isString(arc.endDate)
    )
  ) {
    return false;
  }
  if (
    !Array.isArray(categories) ||
    !categories.every((c) => isObject(c) && isString(c.id) && isString(c.name))
  ) {
    return false;
  }
  if (
    !Array.isArray(goals) ||
    !goals.every(
      (g) =>
        isObject(g) &&
        isString(g.id) &&
        isString(g.categoryId) &&
        isString(g.title) &&
        ['boolean', 'quantity', 'limit'].includes(g.type as string) &&
        isObject(g.frequency) &&
        Array.isArray(g.targetHistory),
    )
  ) {
    return false;
  }
  if (
    !Array.isArray(checkIns) ||
    !checkIns.every(
      (c) => isObject(c) && isString(c.goalId) && isString(c.date) && isNumber(c.value),
    )
  ) {
    return false;
  }
  if (
    !Array.isArray(dayNotes) ||
    !dayNotes.every((n) => isObject(n) && isString(n.date) && isString(n.text))
  ) {
    return false;
  }
  if (!isObject(player) || !isNumber(player.totalXp) || !Array.isArray(player.unlockedBadges))
    return false;
  if (!isObject(preferences)) return false;
  if (d.restDays !== undefined && !(Array.isArray(d.restDays) && d.restDays.every(isString)))
    return false;
  return true;
}

/** Lit un fichier de sauvegarde ; refuse tout ce qui ne ressemble pas à un export Winter Arc. */
export function parseBackup(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'json' };
  }
  if (!isObject(raw) || raw.app !== BACKUP_APP || !isNumber(raw.schema))
    return { ok: false, error: 'format' };
  if (raw.schema > BACKUP_SCHEMA) return { ok: false, error: 'version' };
  const data = raw.data;
  if (!validData(data)) return { ok: false, error: 'format' };
  const player = {
    ...data.player,
    defeatedBosses: Array.isArray(data.player.defeatedBosses) ? data.player.defeatedBosses : [],
  };
  return {
    ok: true,
    backup: {
      app: BACKUP_APP,
      schema: BACKUP_SCHEMA,
      exportedAt: isString(raw.exportedAt) ? raw.exportedAt : '',
      // Une sauvegarde antérieure aux trêves (schéma 2) n'a pas de `restDays`.
      data: { ...data, restDays: Array.isArray(data.restDays) ? data.restDays : [], player },
    },
  };
}
