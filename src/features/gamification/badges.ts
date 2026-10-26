import {
  BarbellIcon,
  BookOpenIcon,
  DeviceMobileSlashIcon,
  DiamondIcon,
  FootprintsIcon,
  HourglassMediumIcon,
  MountainsIcon,
  ShieldIcon,
  SwordIcon,
  TrophyIcon,
  type Icon,
} from '@phosphor-icons/react';
import { copy } from '@/copy';
import type { ISODate } from '@/lib/types';

/** Ce que voit une condition de badge, à la fin d'un jour donné. */
export type BadgeContext = {
  date: ISODate;
  /** Numéro du jour dans l'Arc (1 = premier jour). */
  dayNumber: number;
  totalDays: number;
  isLastDay: boolean;
  checkInCount: number;
  globalStreak: number;
  bestGlobalStreak: number;
  perfectDays: number;
  pagesRead: number;
  bestScreenLimitStreak: number;
  workouts: number;
  bossesDefeated: number;
  /** Complétion globale depuis le début de l'Arc (0 à 1). */
  overallCompletion: number;
};

export type BadgeDefinition = {
  id: string;
  name: string;
  description: string;
  icon: Icon;
  shape: 'runestone' | 'shield';
  condition: (c: BadgeContext) => boolean;
};

const b = copy.badges;

/**
 * Badges de l'Arc. Pour en ajouter un : une entrée ici (et ses textes dans copy.ts), rien d'autre.
 * La date de déblocage est le premier jour où la condition est vraie.
 */
export const badges: BadgeDefinition[] = [
  {
    id: 'first-step',
    name: b['first-step'].name,
    description: b['first-step'].condition,
    icon: FootprintsIcon,
    shape: 'runestone',
    condition: (c) => c.checkInCount >= 1,
  },
  {
    id: 'iron-week',
    name: b['iron-week'].name,
    description: b['iron-week'].condition,
    icon: ShieldIcon,
    shape: 'shield',
    condition: (c) => c.bestGlobalStreak >= 7,
  },
  {
    id: 'unbroken-month',
    name: b['unbroken-month'].name,
    description: b['unbroken-month'].condition,
    icon: MountainsIcon,
    shape: 'runestone',
    condition: (c) => c.bestGlobalStreak >= 30,
  },
  {
    id: 'perfect-10',
    name: b['perfect-10'].name,
    description: b['perfect-10'].condition,
    icon: DiamondIcon,
    shape: 'shield',
    condition: (c) => c.perfectDays >= 10,
  },
  {
    id: 'bookworm',
    name: b.bookworm.name,
    description: b.bookworm.condition,
    icon: BookOpenIcon,
    shape: 'runestone',
    condition: (c) => c.pagesRead >= 500,
  },
  {
    id: 'detox',
    name: b.detox.name,
    description: b.detox.condition,
    icon: DeviceMobileSlashIcon,
    shape: 'runestone',
    condition: (c) => c.bestScreenLimitStreak >= 14,
  },
  {
    id: 'machine',
    name: b.machine.name,
    description: b.machine.condition,
    icon: BarbellIcon,
    shape: 'shield',
    condition: (c) => c.workouts >= 50,
  },
  {
    id: 'boss-slayer',
    name: b['boss-slayer'].name,
    description: b['boss-slayer'].condition,
    icon: SwordIcon,
    shape: 'shield',
    condition: (c) => c.bossesDefeated >= 5,
  },
  {
    id: 'halfway',
    name: b.halfway.name,
    description: b.halfway.condition,
    icon: HourglassMediumIcon,
    shape: 'runestone',
    condition: (c) => c.dayNumber >= 46,
  },
  {
    id: 'arc-complete',
    name: b['arc-complete'].name,
    description: b['arc-complete'].condition,
    icon: TrophyIcon,
    shape: 'shield',
    condition: (c) => c.isLastDay && c.overallCompletion >= 0.7,
  },
];
