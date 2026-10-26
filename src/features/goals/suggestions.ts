import { copy } from '@/copy';
import type { CategoryIconKey } from './categoryIcons';
import type { GoalDraft } from './goalModel';
import type { GoalTag } from '@/lib/types';

export type CategoryTemplateKey = 'sport' | 'nutrition' | 'reading' | 'screen';

export type CategoryTemplate = {
  key: CategoryTemplateKey;
  name: string;
  icon: CategoryIconKey;
  colorToken: string;
};

const s = copy.suggestions;

export const defaultCategories: CategoryTemplate[] = [
  { key: 'sport', name: s.categories.sport, icon: 'barbell', colorToken: '--cat-1' },
  { key: 'nutrition', name: s.categories.nutrition, icon: 'food', colorToken: '--cat-2' },
  { key: 'reading', name: s.categories.reading, icon: 'book', colorToken: '--cat-3' },
  { key: 'screen', name: s.categories.screen, icon: 'screen-off', colorToken: '--cat-4' },
];

export type GoalSuggestion = Omit<GoalDraft, 'categoryId'> & { tag?: GoalTag };

/** Suggestions pré-remplies de SPEC.md (Onboarding), modifiables avant validation. */
export const goalSuggestions: Record<CategoryTemplateKey, GoalSuggestion[]> = {
  sport: [
    {
      title: s.goals.workout,
      type: 'boolean',
      frequency: { kind: 'weekly', timesPerWeek: 5 },
      difficulty: 3,
      tag: 'workout',
    },
    {
      title: s.goals.steps,
      type: 'quantity',
      target: 8000,
      unit: s.units.steps,
      step: 500,
      frequency: { kind: 'daily' },
      difficulty: 2,
    },
  ],
  nutrition: [
    {
      title: s.goals.noSugar,
      type: 'boolean',
      frequency: { kind: 'daily' },
      difficulty: 2,
    },
    {
      title: s.goals.water,
      type: 'quantity',
      target: 2,
      unit: s.units.liters,
      step: 0.25,
      frequency: { kind: 'daily' },
      difficulty: 1,
    },
  ],
  reading: [
    {
      title: s.goals.pages,
      type: 'quantity',
      target: 20,
      unit: s.units.pages,
      step: 5,
      frequency: { kind: 'daily' },
      difficulty: 2,
      tag: 'reading-pages',
    },
  ],
  screen: [
    {
      title: s.goals.screenTime,
      type: 'limit',
      target: 120,
      unit: s.units.minutes,
      step: 15,
      frequency: { kind: 'daily' },
      difficulty: 2,
      tag: 'screen-time',
    },
  ],
};
