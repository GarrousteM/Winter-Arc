import { GearSixIcon } from '@phosphor-icons/react';
import { copy } from '@/copy';
import { IconButton } from './Button';

type AppHeaderProps = {
  /** Numéro du jour dans l'Arc ; ≤ 0 avant le début (affiche un compte à rebours). */
  day: number;
  totalDays: number;
  onSettings?: () => void;
};

/** En-tête de l'écran Aujourd'hui : « Jour 23 / 92 » en gros chiffres, réglages à droite. */
export function AppHeader({ day, totalDays, onSettings }: AppHeaderProps) {
  const before = day < 1;
  const shown = Math.min(day, totalDays);
  return (
    <header className="flex items-center justify-between gap-4">
      {before ? (
        <div className="flex items-baseline gap-2">
          <span className="font-display text-sm font-bold uppercase tracking-display text-muted">
            {copy.common.countdownLabel}
          </span>
          <span className="numeric text-5xl text-frost">{1 - day}</span>
          <span className="font-display text-sm font-bold uppercase tracking-display text-muted">
            {copy.common.countdownUnit(1 - day)}
          </span>
        </div>
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="font-display text-sm font-bold uppercase tracking-display text-muted">
            {copy.common.day}
          </span>
          <span className="numeric text-5xl text-text">{shown}</span>
          <span className="numeric text-2xl text-muted">/ {totalDays}</span>
        </div>
      )}
      <IconButton label={copy.nav.settings} onClick={onSettings}>
        <GearSixIcon size={24} />
      </IconButton>
    </header>
  );
}
