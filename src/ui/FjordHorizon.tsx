import { useId } from 'react';

type Ids = Record<'hatch' | 'hatchSoft' | 'curtain' | 'edge' | 'mask' | 'glow', string>;

/** Identifiants uniques des motifs (plusieurs gravures peuvent cohabiter) et leurs `url(#…)`. */
function useFills() {
  const id = useId().replace(/:/g, '');
  const keys = ['hatch', 'hatchSoft', 'curtain', 'edge', 'mask', 'glow'] as const;
  const i = Object.fromEntries(keys.map((k) => [k, `${id}-${k}`])) as Ids;
  const u = Object.fromEntries(keys.map((k) => [k, `url(#${i[k]})`])) as Ids;
  return { i, u };
}

function Defs({ i }: { i: Ids }) {
  return (
    <defs>
      <pattern
        id={i.hatch}
        width="4"
        height="4"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line x1="0" y1="0" x2="0" y2="4" stroke="var(--color-frost-deep)" strokeWidth="1.1" />
      </pattern>
      <pattern
        id={i.hatchSoft}
        width="6"
        height="6"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(-45)"
      >
        <line x1="0" y1="0" x2="0" y2="6" stroke="var(--color-border)" strokeWidth="1" />
      </pattern>
      <pattern id={i.curtain} width="5" height="40" patternUnits="userSpaceOnUse">
        <line x1="2" y1="0" x2="2" y2="40" stroke="var(--color-frost)" strokeWidth="1" />
      </pattern>
      {/* Masque de luminance : l'aurore s'efface sur les bords. */}
      <linearGradient id={i.edge}>
        <stop offset="0" stopColor="var(--color-text)" stopOpacity="0" />
        <stop offset="0.25" stopColor="var(--color-text)" />
        <stop offset="0.75" stopColor="var(--color-text)" />
        <stop offset="1" stopColor="var(--color-text)" stopOpacity="0" />
      </linearGradient>
      <mask id={i.mask}>
        <rect x="0" y="0" width="390" height="100" fill={`url(#${i.edge})`} />
      </mask>
      <radialGradient id={i.glow}>
        <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.6" />
        <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

function AuroraLines({ u }: { u: Ids }) {
  return (
    <g mask={u.mask}>
      <path
        d="M20 46 Q80 18 150 36 Q220 54 290 26 Q340 8 380 22 L380 52 Q340 38 290 56 Q220 84 150 66 Q80 48 20 76 Z"
        fill={u.curtain}
        opacity="0.14"
        stroke="none"
      />
      <path
        d="M20 46 Q80 18 150 36 Q220 54 290 26 Q340 8 380 22"
        stroke="var(--color-frost)"
        strokeWidth="1.2"
        opacity="0.35"
      />
      <path
        d="M60 70 Q130 52 200 64 Q270 76 340 54"
        stroke="var(--color-frost)"
        strokeWidth="0.8"
        opacity="0.2"
        strokeDasharray="1 5"
      />
    </g>
  );
}

/**
 * Horizon de fjord (décor des écrans plein écran) : aurore, montagnes, falaises gravées,
 * drakkar dont la lanterne est le seul point d'or. Collé en bas, rogné sur les côtés si besoin.
 * `band` : bande basse sans ciel (fin de la liste du jour).
 */
export function FjordHorizon({ band = false, className }: { band?: boolean; className?: string }) {
  const { i, u } = useFills();
  return (
    <svg
      viewBox={band ? '0 80 390 136' : '0 0 390 260'}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className={className}
    >
      <Defs i={i} />
      <g fill="none" strokeLinejoin="round" strokeLinecap="round">
        {!band && <AuroraLines u={u} />}
        {/* étoiles */}
        <g fill="var(--color-frost)" stroke="none" opacity="0.7">
          <circle cx="40" cy="14" r="1" />
          <circle cx="118" cy="8" r="0.9" />
          <circle cx="212" cy="18" r="1.1" />
          <circle cx="262" cy="6" r="0.8" />
          <circle cx="350" cy="40" r="1" />
          <circle cx="176" cy="92" r="0.8" />
        </g>
        {/* montagnes lointaines */}
        <path
          d="M0 150 L36 122 L64 134 L104 94 L132 116 L160 102 L196 128 L228 104 L262 120 L298 88 L330 112 L360 100 L390 126 L390 200 L0 200 Z"
          fill={u.hatchSoft}
          stroke="var(--color-border)"
          strokeWidth="1.3"
        />
        <path
          d="M104 94 L96 108 L110 104 M298 88 L290 102 L304 98 M228 104 L222 114"
          stroke="var(--color-frost-deep)"
          strokeWidth="1"
        />
        {/* falaise gauche du fjord */}
        <path
          d="M-4 264 L-4 108 L0 108 L22 98 L46 120 L70 116 L96 146 L124 176 L150 196 L158 200 L0 200 Z"
          fill="var(--color-surface)"
          stroke="var(--color-frost)"
          strokeWidth="1.5"
        />
        <path
          d="M22 98 L34 132 L46 120 M70 116 L76 150 L96 146 M34 132 L20 200 M76 150 L64 200 M110 160 L104 200"
          stroke="var(--color-frost)"
          strokeWidth="1"
        />
        <path
          d="M22 98 L34 132 L20 200 L0 200 L0 108 Z M70 116 L76 150 L64 200 L50 200 Z M96 146 L110 160 L104 200 L80 200 Z"
          fill={u.hatch}
          stroke="none"
        />
        <path
          d="M8 104 L22 98 L30 108 M58 118 L70 116 L78 126"
          stroke="var(--color-text)"
          strokeWidth="1.4"
        />
        {/* falaise droite */}
        <path
          d="M394 264 L394 96 L390 96 L366 88 L340 112 L318 108 L296 140 L268 172 L242 196 L232 200 L390 200 Z"
          fill="var(--color-surface)"
          stroke="var(--color-frost)"
          strokeWidth="1.5"
        />
        <path
          d="M366 88 L356 126 L340 112 M318 108 L310 146 L296 140 M356 126 L372 200 M310 146 L324 200 M280 160 L288 200"
          stroke="var(--color-frost)"
          strokeWidth="1"
        />
        <path
          d="M366 88 L356 126 L372 200 L390 200 L390 96 Z M318 108 L310 146 L324 200 L340 200 Z M296 140 L280 160 L288 200 L310 200 Z"
          fill={u.hatch}
          stroke="none"
        />
        <path
          d="M378 92 L366 88 L358 98 M330 110 L318 108 L312 118"
          stroke="var(--color-text)"
          strokeWidth="1.4"
        />
        {/* drakkar */}
        <g transform="translate(195 198)">
          <path
            d="M-30 -2 Q-28 8 -14 9 L14 9 Q28 8 30 -2"
            fill="var(--color-surface)"
            stroke="var(--color-text)"
            strokeWidth="1.3"
          />
          <path
            d="M-30 -2 Q-34 -10 -30 -18 Q-26 -22 -24 -18 Q-26 -16 -27 -12"
            stroke="var(--color-text)"
            strokeWidth="1.3"
          />
          <path d="M30 -2 Q34 -10 31 -16" stroke="var(--color-text)" strokeWidth="1.3" />
          <g fill="var(--color-surface-raised)" stroke="var(--color-frost)" strokeWidth="0.9">
            <circle cx="-16" cy="2" r="2.4" />
            <circle cx="-8" cy="2" r="2.4" />
            <circle cx="0" cy="2" r="2.4" />
            <circle cx="8" cy="2" r="2.4" />
            <circle cx="16" cy="2" r="2.4" />
          </g>
          <path d="M0 -1 V-36" stroke="var(--color-text)" strokeWidth="1.3" />
          <path
            d="M-14 -33 H14 L12 -8 H-12 Z"
            fill={u.hatch}
            stroke="var(--color-frost)"
            strokeWidth="1.2"
          />
          <path d="M-5 -33 L-4.5 -8 M5 -33 L4.5 -8" stroke="var(--color-frost)" strokeWidth="1" />
          <circle cx="-27" cy="-14" r="6" fill={u.glow} stroke="none" />
          <circle cx="-27" cy="-14" r="1.4" fill="var(--color-accent)" stroke="none" />
        </g>
        {/* eau du fjord et reflets */}
        <path d="M0 200 H390" stroke="var(--color-frost-deep)" strokeWidth="1.4" />
        <g stroke="var(--color-frost-deep)" strokeWidth="1">
          <path d="M20 210 H70 M96 210 H150 M178 212 H212 M244 210 H296 M326 210 H372 M40 222 H82 M120 224 H160 M186 222 H206 M232 224 H274 M300 222 H350 M8 236 H40 M70 238 H130 M180 236 H210 M250 238 H312 M344 236 H384 M30 250 H96 M150 252 H240 M290 250 H360" />
        </g>
        <g stroke="var(--color-frost)" strokeWidth="1" opacity="0.6">
          <path d="M186 216 H204 M190 228 H200" />
        </g>
        <path d="M168 210 H174" stroke="var(--color-accent)" strokeWidth="1.2" opacity="0.7" />
      </g>
    </svg>
  );
}

/** Aurore seule, pour le ciel en haut des écrans à onglets. */
export function Aurora({ className }: { className?: string }) {
  const { i, u } = useFills();
  return (
    <svg
      viewBox="0 0 390 100"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
      className={className}
    >
      <Defs i={i} />
      <g fill="none" strokeLinejoin="round" strokeLinecap="round">
        <AuroraLines u={u} />
      </g>
    </svg>
  );
}

/** Petit drakkar (bâton de comptage). */
export function Drakkar({ size = 28 }: { size?: number }) {
  const { i, u } = useFills();
  return (
    <svg width={size} height={(size * 50) / 72} viewBox="-36 -40 72 50" aria-hidden="true">
      <Defs i={i} />
      <g fill="none" strokeLinejoin="round" strokeLinecap="round">
        <path
          d="M-30 -2 Q-28 8 -14 9 L14 9 Q28 8 30 -2"
          fill="var(--color-surface)"
          stroke="var(--color-text)"
          strokeWidth="1.3"
        />
        <path
          d="M-30 -2 Q-34 -10 -30 -18 Q-26 -22 -24 -18 Q-26 -16 -27 -12"
          stroke="var(--color-text)"
          strokeWidth="1.3"
        />
        <path d="M30 -2 Q34 -10 31 -16" stroke="var(--color-text)" strokeWidth="1.3" />
        <g fill="var(--color-surface-raised)" stroke="var(--color-frost)" strokeWidth="0.9">
          <circle cx="-16" cy="2" r="2.4" />
          <circle cx="-8" cy="2" r="2.4" />
          <circle cx="0" cy="2" r="2.4" />
          <circle cx="8" cy="2" r="2.4" />
          <circle cx="16" cy="2" r="2.4" />
        </g>
        <path d="M0 -1 V-36" stroke="var(--color-text)" strokeWidth="1.3" />
        <path
          d="M-14 -33 H14 L12 -8 H-12 Z"
          fill={u.hatch}
          stroke="var(--color-frost)"
          strokeWidth="1.2"
        />
        <path d="M-5 -33 L-4.5 -8 M5 -33 L4.5 -8" stroke="var(--color-frost)" strokeWidth="1" />
        <circle cx="-27" cy="-14" r="6" fill={u.glow} stroke="none" />
        <circle cx="-27" cy="-14" r="1.4" fill="var(--color-accent)" stroke="none" />
      </g>
    </svg>
  );
}
