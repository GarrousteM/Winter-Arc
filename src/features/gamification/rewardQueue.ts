import { create } from 'zustand';
import { mergeLevels, type RewardEvent } from './rewards';

type RewardQueue = {
  queue: RewardEvent[];
  /** Journées parfaites déjà célébrées pendant cette session (pas de rejeu après décocher / recocher). */
  perfectDates: string[];
  push: (...events: RewardEvent[]) => void;
  pushPerfect: (date: string) => void;
  /** Ferme l'écran affiché et passe au suivant. */
  next: () => void;
};

/** File des écrans de récompense (non persistée) : ils s'enchaînent un par un. */
export const useRewardQueue = create<RewardQueue>()((set) => ({
  queue: [],
  perfectDates: [],
  push: (...events) => {
    set((s) => ({ queue: mergeLevels([...s.queue, ...events]) }));
  },
  pushPerfect: (date) => {
    set((s) =>
      s.perfectDates.includes(date)
        ? s
        : { perfectDates: [...s.perfectDates, date], queue: [...s.queue, { kind: 'perfect' }] },
    );
  },
  next: () => {
    set((s) => ({ queue: s.queue.slice(1) }));
  },
}));
