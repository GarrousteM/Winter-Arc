import { GearSixIcon } from '@phosphor-icons/react';
import { copy } from '@/copy';
import { IconButton } from './Button';
import { Drakkar } from './FjordHorizon';
import { TallyStick } from './TallyStick';

type AppHeaderProps = {
  /** Numéro du jour dans l'Arc ; ≤ 0 avant le début (affiche un compte à rebours). */
  day: number;
  totalDays: number;
  onSettings?: () => void;
};

/** En-tête des écrans à onglets : « Jour 23 / 92 », réglages à droite, bâton de comptage dessous. */
export function AppHeader({ day, totalDays, onSettings }: AppHeaderProps) {
  const before = day < 1;
  const shown = Math.min(day, totalDays);
  return (
    <header className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
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
      </div>
      <div className="relative mt-3">
        <TallyStick
          done={before ? 0 : shown}
          total={totalDays}
          label={copy.today.tallyLabel(before ? 0 : shown, totalDays)}
        />
        {/* Le drakkar navigue sur le bâton : posé sur le jour en cours. */}
        <div
          className="pointer-events-none absolute bottom-[10px] -translate-x-1/2"
          style={{
            // Centré sur le jour en cours, sans jamais déborder du bâton (avant le début, dernier jour).
            left: `clamp(15px, ${((before ? 0 : shown - 0.5) / Math.max(1, totalDays)) * 100}%, calc(100% - 15px))`,
          }}
        >
          <Drakkar size={30} />
        </div>
      </div>
    </header>
  );
}
