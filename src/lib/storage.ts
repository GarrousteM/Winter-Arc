import { del, get, set } from 'idb-keyval';
import type { StateStorage } from 'zustand/middleware';

/** Stockage Zustand adossé à IndexedDB (idb-keyval). Repli en mémoire si IndexedDB est indisponible. */
const memory = new Map<string, string>();

function hasIndexedDB(): boolean {
  try {
    return typeof indexedDB !== 'undefined';
  } catch {
    return false;
  }
}

export const idbStorage: StateStorage = {
  getItem: async (name) => {
    if (!hasIndexedDB()) return memory.get(name) ?? null;
    try {
      return (await get<string>(name)) ?? null;
    } catch {
      return memory.get(name) ?? null;
    }
  },
  setItem: async (name, value) => {
    memory.set(name, value);
    if (!hasIndexedDB()) return;
    try {
      await set(name, value);
    } catch {
      // Écriture impossible (navigation privée, quota) : la copie en mémoire reste disponible.
    }
  },
  removeItem: async (name) => {
    memory.delete(name);
    if (!hasIndexedDB()) return;
    try {
      await del(name);
    } catch {
      // Rien à faire : la clé n'existe plus en mémoire.
    }
  },
};
