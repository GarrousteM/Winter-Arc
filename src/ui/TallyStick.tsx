import { useId } from 'react';

type TallyStickProps = {
  /** Jours écoulés (encoches en or). */
  done: number;
  total: number;
  label: string;
};

const HEIGHT = 14;

/** Bâton de comptage : une encoche par jour de l'Arc, en or pour les jours passés, une marque par semaine. */
export function TallyStick({ done, total, label }: TallyStickProps) {
  const id = useId().replace(/:/g, '');
  const width = 350;
  const step = width / Math.max(1, total);
  const goldWidth = Math.min(total, Math.max(0, done)) * step;
  return (
    <svg
      width="100%"
      height={HEIGHT}
      viewBox={`0 0 ${width} ${HEIGHT}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
      className="block"
    >
      <defs>
        <pattern id={`${id}-g`} width={step} height={HEIGHT} patternUnits="userSpaceOnUse">
          <rect
            x={step * 0.25}
            y={3}
            width={Math.max(0.8, step * 0.34)}
            height={8}
            fill="var(--color-accent)"
          />
        </pattern>
        <pattern id={`${id}-i`} width={step} height={HEIGHT} patternUnits="userSpaceOnUse">
          <rect
            x={step * 0.25}
            y={5}
            width={Math.max(0.6, step * 0.28)}
            height={4}
            fill="var(--color-border)"
          />
        </pattern>
        <pattern id={`${id}-w`} width={step * 7} height={HEIGHT} patternUnits="userSpaceOnUse">
          <rect x={0} y={0} width={1.4} height={HEIGHT} fill="var(--color-frost-deep)" />
        </pattern>
      </defs>
      <rect x={0} y={0} width={goldWidth} height={HEIGHT} fill={`url(#${id}-g)`} />
      <rect x={goldWidth} y={0} width={width - goldWidth} height={HEIGHT} fill={`url(#${id}-i)`} />
      <rect x={0} y={0} width={width} height={HEIGHT} fill={`url(#${id}-w)`} />
    </svg>
  );
}
