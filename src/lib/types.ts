// Modèle de données (voir SPEC.md, « Modèle de données », et les décisions de CLAUDE.md).

/** Date calendaire locale au format YYYY-MM-DD. */
export type ISODate = string;

export type Arc = {
  id: string;
  name: string;
  startDate: ISODate;
  endDate: ISODate;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  /** Clé d'icône de `src/features/goals/categoryIcons.ts`. */
  icon: string;
  /** Token CSS de la palette, ex. "--cat-1". Jamais une couleur en dur. */
  colorToken: string;
  order: number;
  isDefault: boolean;
  archived: boolean;
};

export type GoalType = 'boolean' | 'quantity' | 'limit';

/** Jour ISO : 1 = lundi … 7 = dimanche. */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Frequency =
  { kind: 'daily' } | { kind: 'weekly'; timesPerWeek: number } | { kind: 'days'; days: Weekday[] };

export type Difficulty = 1 | 2 | 3;

/** Étiquette invisible qui relie un objectif aux badges, indépendamment de son titre. */
export type GoalTag = 'workout' | 'reading-pages' | 'screen-time';

/** Une cible valable à partir d'une date (incluse). */
export type TargetChange = { from: ISODate; target: number };

export type GoalStatus = 'active' | 'paused' | 'archived';

export type Goal = {
  id: string;
  categoryId: string;
  title: string;
  type: GoalType;
  /** Cible courante (requise pour quantity et limit). L'historique fait foi pour les jours passés. */
  target?: number;
  targetHistory: TargetChange[];
  unit?: string;
  /** Pas du stepper pour la saisie rapide. */
  step?: number;
  frequency: Frequency;
  difficulty: Difficulty;
  /** `active` de SPEC.md, étendu pour distinguer pause et archivage. */
  status: GoalStatus;
  order: number;
  tag?: GoalTag;
  createdAt: string;
};

export type CheckIn = {
  id: string;
  goalId: string;
  date: ISODate;
  value: number;
  completed: boolean;
  note?: string;
};

export type DayNote = {
  date: ISODate;
  text: string;
};

export type PlayerState = {
  totalXp: number;
  unlockedBadges: { badgeId: string; date: ISODate }[];
  freezeTokens: number;
};

export type Preferences = {
  sound: boolean;
  vibration: boolean;
};
