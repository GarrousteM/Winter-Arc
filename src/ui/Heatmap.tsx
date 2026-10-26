import { CampfireIcon, SnowflakeIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';
import type { ISODate } from '@/lib/types';

export type HeatCell = {
  date: ISODate;
  inArc: boolean;
  /** 0 à 4 ; `undefined` pour un jour à venir. */
  level: 0 | 1 | 2 | 3 | 4 | undefined;
  perfect: boolean;
  frozen: boolean;
  /** Jour de trêve déclaré. */
  rest: boolean;
  today: boolean;
  /** Libellé complet pour les lecteurs d'écran. */
  label: string;
};

type HeatmapProps = {
  weeks: HeatCell[][];
  weekdays: readonly string[];
  selected: ISODate | undefined;
  onSelect: (date: ISODate) => void;
  label: string;
  /** Numéro affiché dans la case (ex. « 1er » le premier du mois). */
  formatDay: (day: number) => string;
};

/**
 * Calendrier de l'Arc : 7 colonnes (lundi → dimanche), une ligne par semaine.
 * Intensité en une seule teinte (glace) ; journée parfaite = liseré or, joker = flocon.
 */
export function Heatmap({ weeks, weekdays, selected, onSelect, label, formatDay }: HeatmapProps) {
  return (
    <div role="grid" aria-label={label} className="flex flex-col gap-1">
      <div role="row" className="grid grid-cols-7 gap-1">
        {weekdays.map((d, i) => (
          <span key={i} role="columnheader" className="eyebrow text-center">
            {d}
          </span>
        ))}
      </div>
      {weeks.map((week) => (
        <div key={week[0]?.date} role="row" className="grid grid-cols-7 gap-1">
          {week.map((cell) => {
            if (!cell.inArc) return <span key={cell.date} role="gridcell" aria-hidden="true" />;
            const day = Number(cell.date.slice(8));
            // Encre lisible sur chaque palier : brume sur fond neutre, neige sur glace pâle, nuit sur glace vive.
            const ink =
              cell.level === undefined || cell.level === 0
                ? 'text-muted'
                : cell.level <= 2
                  ? 'text-text'
                  : 'text-bg';
            return (
              <button
                key={cell.date}
                type="button"
                role="gridcell"
                aria-label={cell.label}
                aria-selected={selected === cell.date}
                onClick={() => {
                  onSelect(cell.date);
                }}
                className={cn(
                  'relative flex aspect-square min-h-touch items-center justify-center rounded border text-xs',
                  'transition-colors duration-fast ease-heavy',
                  cell.level === undefined ? 'border-border' : 'border-transparent',
                  cell.perfect && 'border-accent',
                  selected === cell.date && 'outline outline-1 outline-offset-2 outline-text',
                )}
                style={{
                  background:
                    cell.level === undefined ? 'transparent' : `var(--heat-${cell.level})`,
                }}
              >
                <span
                  className={cn(
                    'numeric',
                    cell.today && cell.level !== undefined && cell.level >= 3
                      ? 'text-bg'
                      : cell.today
                        ? 'text-accent'
                        : ink,
                  )}
                >
                  {formatDay(day)}
                </span>
                {cell.rest && (
                  <CampfireIcon size={10} className="absolute left-0.5 top-0.5 text-frost" />
                )}
                {cell.frozen && (
                  <SnowflakeIcon size={10} className="absolute right-0.5 top-0.5 text-frost" />
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

type HeatLegendProps = {
  less: string;
  more: string;
  perfect: string;
  frozen: string;
  rest: string;
};

export function HeatLegend({ less, more, perfect, frozen, rest }: HeatLegendProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
      <span className="flex items-center gap-1">
        {less}
        {[0, 1, 2, 3, 4].map((l) => (
          <span
            key={l}
            aria-hidden="true"
            className="h-3 w-3 rounded"
            style={{ background: `var(--heat-${l})` }}
          />
        ))}
        {more}
      </span>
      <span className="flex items-center gap-1">
        <span aria-hidden="true" className="h-3 w-3 rounded border border-accent" />
        {perfect}
      </span>
      <span className="flex items-center gap-1">
        <SnowflakeIcon size={12} className="text-frost" />
        {frozen}
      </span>
      <span className="flex items-center gap-1">
        <CampfireIcon size={12} className="text-frost" />
        {rest}
      </span>
    </div>
  );
}
