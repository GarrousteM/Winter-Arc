import { useId } from 'react';
import { bossArt, type EngravingFills } from './bossArt';
import type { BossId } from './bosses';

/** Gravure du boss. Vaincu : la gravure s'éteint et une entaille d'or la barre. */
export function BossEngraving({
  bossId,
  defeated = false,
  size = 140,
}: {
  bossId: BossId;
  defeated?: boolean;
  size?: number;
}) {
  const id = useId().replace(/:/g, '');
  const ids = {
    hatch: `${id}-h`,
    hatchDense: `${id}-hd`,
    cross: `${id}-x`,
    hatchSoft: `${id}-hs`,
    glow: `${id}-g`,
  };
  const fills: EngravingFills = {
    hatch: `url(#${ids.hatch})`,
    hatchDense: `url(#${ids.hatchDense})`,
    cross: `url(#${ids.cross})`,
    hatchSoft: `url(#${ids.hatchSoft})`,
    glow: `url(#${ids.glow})`,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <pattern
          id={ids.hatch}
          width="4"
          height="4"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="4" stroke="var(--color-frost-deep)" strokeWidth="1.1" />
        </pattern>
        <pattern
          id={ids.hatchDense}
          width="2.6"
          height="2.6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="2.6" stroke="var(--color-frost-deep)" strokeWidth="1.2" />
        </pattern>
        <pattern
          id={ids.cross}
          width="3"
          height="3"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <path d="M0 0V3M0 0H3" stroke="var(--color-frost-deep)" strokeWidth="1" />
        </pattern>
        <pattern
          id={ids.hatchSoft}
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-45)"
        >
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--color-border)" strokeWidth="1" />
        </pattern>
        <radialGradient id={ids.glow}>
          <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g style={defeated ? { filter: 'grayscale(1)', opacity: 0.35 } : undefined}>
        {bossArt[bossId](fills)}
      </g>
      {defeated && (
        <path
          d="M40 166 L160 34"
          stroke="var(--color-accent)"
          strokeWidth="5"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
