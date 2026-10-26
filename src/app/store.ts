import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { isCompleted } from '@/features/checkin/dayModel';
import { moveInOrder, withTarget, type GoalDraft } from '@/features/goals/goalModel';
import { fromISODate, today } from '@/lib/dates';
import { newId } from '@/lib/id';
import { idbStorage } from '@/lib/storage';
import type {
  Arc,
  Category,
  CheckIn,
  DayNote,
  Goal,
  GoalStatus,
  GoalTag,
  ISODate,
  PlayerState,
  Preferences,
} from '@/lib/types';

export type GoalInput = GoalDraft & { tag?: GoalTag | undefined };

export type CategoryInput = Pick<Category, 'name' | 'icon' | 'colorToken'> & {
  isDefault?: boolean;
};

export type ArcSetup = {
  name: string;
  startDate: string;
  endDate: string;
  categories: (CategoryInput & { goals: Omit<GoalInput, 'categoryId'>[] })[];
};

export type AppData = {
  arc: Arc | null;
  categories: Category[];
  goals: Goal[];
  checkIns: CheckIn[];
  dayNotes: DayNote[];
  player: PlayerState;
  preferences: Preferences;
};

type AppActions = {
  setupArc: (setup: ArcSetup) => void;
  updateArc: (patch: Partial<Pick<Arc, 'name' | 'startDate' | 'endDate'>>) => void;
  addCategory: (input: CategoryInput) => string;
  updateCategory: (
    id: string,
    patch: Partial<Pick<Category, 'name' | 'icon' | 'colorToken'>>,
  ) => void;
  moveCategory: (id: string, direction: -1 | 1) => void;
  setCategoryArchived: (id: string, archived: boolean) => void;
  addGoal: (input: GoalInput) => string;
  updateGoal: (id: string, input: GoalInput) => void;
  setGoalStatus: (id: string, status: GoalStatus) => void;
  moveGoal: (id: string, direction: -1 | 1) => void;
  /** Enregistre une valeur (ou l'efface avec `undefined`) ; `completed` est recalculé. */
  setCheckIn: (goalId: string, date: string, value: number | undefined) => void;
  setDayNote: (date: string, text: string) => void;
  /** Mémorise la progression déjà célébrée. */
  acknowledge: (player: PlayerState) => void;
  resetAll: () => void;
};

type AppState = AppData & AppActions & { hydrated: boolean };

export const initialData: AppData = {
  arc: null,
  categories: [],
  goals: [],
  checkIns: [],
  dayNotes: [],
  player: { totalXp: 0, unlockedBadges: [], freezeTokens: 0, defeatedBosses: [] },
  preferences: { sound: true, vibration: true },
};

/**
 * `since` : premier jour où l'objectif existe. Les objectifs de l'onboarding existent dès le début
 * de l'Arc, même s'il a commencé avant l'installation, pour pouvoir rattraper ces jours-là.
 */
function buildGoal(input: GoalInput, order: number, since?: ISODate): Goal {
  const from = since && since < today() ? since : today();
  const target = input.type !== 'boolean' ? input.target : undefined;
  return {
    id: newId(),
    categoryId: input.categoryId,
    title: input.title.trim(),
    type: input.type,
    ...(target !== undefined ? { target } : {}),
    targetHistory: target !== undefined ? [{ from, target }] : [],
    ...(input.unit ? { unit: input.unit.trim() } : {}),
    ...(input.step ? { step: input.step } : {}),
    frequency: input.frequency,
    difficulty: input.difficulty,
    status: 'active',
    order,
    ...(input.tag ? { tag: input.tag } : {}),
    createdAt: (from < today() ? fromISODate(from) : new Date()).toISOString(),
  };
}

function buildCategory(input: CategoryInput, order: number): Category {
  return {
    id: newId(),
    name: input.name.trim(),
    icon: input.icon,
    colorToken: input.colorToken,
    order,
    isDefault: input.isDefault ?? false,
    archived: false,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialData,
      hydrated: false,

      setupArc: (setup) => {
        const categories: Category[] = [];
        const goals: Goal[] = [];
        setup.categories.forEach((input, index) => {
          const category = buildCategory(input, index);
          categories.push(category);
          input.goals.forEach((goal, goalIndex) => {
            goals.push(buildGoal({ ...goal, categoryId: category.id }, goalIndex, setup.startDate));
          });
        });
        set({
          ...initialData,
          preferences: get().preferences,
          arc: {
            id: newId(),
            name: setup.name.trim(),
            startDate: setup.startDate,
            endDate: setup.endDate,
            createdAt: new Date().toISOString(),
          },
          categories,
          goals,
        });
      },

      updateArc: (patch) => {
        const arc = get().arc;
        if (!arc) return;
        set({ arc: { ...arc, ...patch } });
      },

      addCategory: (input) => {
        const category = buildCategory(input, get().categories.length);
        set({ categories: [...get().categories, category] });
        return category.id;
      },

      updateCategory: (id, patch) => {
        set({
          categories: get().categories.map((c) =>
            c.id === id
              ? { ...c, ...patch, ...(patch.name ? { name: patch.name.trim() } : {}) }
              : c,
          ),
        });
      },

      moveCategory: (id, direction) => {
        const active = get().categories.filter((c) => !c.archived);
        const archived = get().categories.filter((c) => c.archived);
        const moved = moveInOrder(active, id, direction);
        set({
          categories: [...moved, ...archived.map((c, i) => ({ ...c, order: moved.length + i }))],
        });
      },

      setCategoryArchived: (id, archived) => {
        const others = get().categories.filter((c) => c.id !== id);
        const target = get().categories.find((c) => c.id === id);
        if (!target) return;
        // Une catégorie restaurée revient en fin de liste.
        const order = archived ? target.order : others.filter((c) => !c.archived).length;
        set({
          categories: [...others, { ...target, archived, order }].map((c) =>
            c.id === id || c.order < order ? c : { ...c, order: c.order + 1 },
          ),
        });
      },

      addGoal: (input) => {
        const siblings = get().goals.filter((g) => g.categoryId === input.categoryId);
        const goal = buildGoal(input, siblings.length);
        set({ goals: [...get().goals, goal] });
        return goal.id;
      },

      updateGoal: (id, input) => {
        set({
          goals: get().goals.map((goal) => {
            if (goal.id !== id) return goal;
            const { target: _target, unit, step, tag, ...rest } = input;
            let next: Goal = { ...goal, ...rest, title: input.title.trim() };
            delete next.unit;
            delete next.step;
            delete next.tag;
            if (unit?.trim()) next.unit = unit.trim();
            if (step) next.step = step;
            if (tag) next.tag = tag;
            if (input.categoryId !== goal.categoryId) {
              next.order = get().goals.filter((g) => g.categoryId === input.categoryId).length;
            }
            if (input.type === 'boolean') {
              delete next.target;
            } else if (input.target !== undefined) {
              // Une nouvelle cible ne vaut qu'à partir d'aujourd'hui : les jours passés gardent la leur.
              next = withTarget(next, input.target, today());
            }
            return next;
          }),
        });
      },

      setGoalStatus: (id, status) => {
        set({ goals: get().goals.map((g) => (g.id === id ? { ...g, status } : g)) });
      },

      moveGoal: (id, direction) => {
        const goal = get().goals.find((g) => g.id === id);
        if (!goal) return;
        const siblings = get().goals.filter(
          (g) => g.categoryId === goal.categoryId && g.status !== 'archived',
        );
        const moved = new Map(moveInOrder(siblings, id, direction).map((g) => [g.id, g.order]));
        set({
          goals: get().goals.map((g) => {
            const order = moved.get(g.id);
            return order === undefined ? g : { ...g, order };
          }),
        });
      },

      setCheckIn: (goalId, date, value) => {
        const goal = get().goals.find((g) => g.id === goalId);
        if (!goal) return;
        const others = get().checkIns.filter((c) => !(c.goalId === goalId && c.date === date));
        if (value === undefined) {
          set({ checkIns: others });
          return;
        }
        const existing = get().checkIns.find((c) => c.goalId === goalId && c.date === date);
        const checkIn: CheckIn = {
          ...(existing ?? { id: newId(), goalId, date }),
          value,
          completed: isCompleted(goal, value, date),
        };
        set({ checkIns: [...others, checkIn] });
      },

      setDayNote: (date, text) => {
        const others = get().dayNotes.filter((n) => n.date !== date);
        const trimmed = text.trim();
        set({ dayNotes: trimmed ? [...others, { date, text: trimmed }] : others });
      },

      acknowledge: (player) => {
        set({ player });
      },

      resetAll: () => {
        set({ ...initialData });
      },
    }),
    {
      name: 'winter-arc',
      version: 2,
      migrate: (persisted, version) => {
        const data = persisted as AppData;
        // v1 → v2 : ajout de `player.defeatedBosses`.
        if (version < 2) {
          return { ...data, player: { ...initialData.player, ...data.player, defeatedBosses: [] } };
        }
        return data;
      },
      storage: createJSONStorage(() => idbStorage),
      partialize: (state): AppData => ({
        arc: state.arc,
        categories: state.categories,
        goals: state.goals,
        checkIns: state.checkIns,
        dayNotes: state.dayNotes,
        player: state.player,
        preferences: state.preferences,
      }),
      onRehydrateStorage: () => () => {
        useAppStore.setState({ hydrated: true });
      },
    },
  ),
);
