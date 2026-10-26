import {
  BarbellIcon,
  BedIcon,
  BookOpenIcon,
  BrainIcon,
  CoinsIcon,
  DeviceMobileSlashIcon,
  DropIcon,
  FlowerLotusIcon,
  ForkKnifeIcon,
  HeartIcon,
  MoonIcon,
  MountainsIcon,
  MusicNotesIcon,
  PenNibIcon,
  PersonSimpleRunIcon,
  TranslateIcon,
  type Icon,
} from '@phosphor-icons/react';

// Icônes proposées pour les catégories. La clé est stockée dans Category.icon.
export const categoryIcons = {
  barbell: BarbellIcon,
  run: PersonSimpleRunIcon,
  food: ForkKnifeIcon,
  drop: DropIcon,
  book: BookOpenIcon,
  'screen-off': DeviceMobileSlashIcon,
  bed: BedIcon,
  moon: MoonIcon,
  lotus: FlowerLotusIcon,
  brain: BrainIcon,
  coins: CoinsIcon,
  heart: HeartIcon,
  pen: PenNibIcon,
  music: MusicNotesIcon,
  language: TranslateIcon,
  mountain: MountainsIcon,
} as const satisfies Record<string, Icon>;

export type CategoryIconKey = keyof typeof categoryIcons;

export const categoryIconKeys = Object.keys(categoryIcons) as CategoryIconKey[];

export function iconFor(key: string): Icon {
  return key in categoryIcons ? categoryIcons[key as CategoryIconKey] : MountainsIcon;
}

/** Palette des catégories (tokens de src/theme/tokens.css). */
export const categoryColorTokens = [
  '--cat-1',
  '--cat-2',
  '--cat-3',
  '--cat-4',
  '--cat-5',
  '--cat-6',
];
