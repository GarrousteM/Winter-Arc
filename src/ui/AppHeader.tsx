import { GearSixIcon } from '@phosphor-icons/react';
import { copy } from '@/copy';
import { IconButton } from './Button';

type AppHeaderProps = {
  day: number;
  totalDays: number;
  onSettings?: () => void;
};

/** En-tête de l'écran Aujourd'hui : « Jour 23 / 92 » en gros chiffres, réglages à droite. */
export function AppHeader({ day, totalDays, onSettings }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-sm font-bold uppercase tracking-display text-muted">
          {copy.common.day}
        </span>
        <span className="numeric text-5xl text-text">{day}</span>
        <span className="numeric text-2xl text-muted">/ {totalDays}</span>
      </div>
      <IconButton label={copy.nav.settings} onClick={onSettings}>
        <GearSixIcon size={24} />
      </IconButton>
    </header>
  );
}
