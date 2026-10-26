import { useId, type ReactNode } from 'react';

type Fills = Record<'hatch' | 'hatchDense' | 'glow', string>;

/** Cadre commun des vignettes gravées : motifs à identifiants uniques, 200 × 200. */
function Engraving({ size, children }: { size: number; children: (u: Fills) => ReactNode }) {
  const id = useId().replace(/:/g, '');
  const i: Fills = { hatch: `${id}-h`, hatchDense: `${id}-hd`, glow: `${id}-g` };
  const u: Fills = {
    hatch: `url(#${i.hatch})`,
    hatchDense: `url(#${i.hatchDense})`,
    glow: `url(#${i.glow})`,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
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
          id={i.hatchDense}
          width="2.6"
          height="2.6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="2.6" stroke="var(--color-frost-deep)" strokeWidth="1.2" />
        </pattern>
        <radialGradient id={i.glow}>
          <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {children(u)}
    </svg>
  );
}

/** Drakkar à quai (veille et fin de l'Arc) : la lanterne de proue est le seul or. */
export function DrakkarVignette({ size = 240 }: { size?: number }) {
  return (
    <Engraving size={size}>
      {(u) => (
        <g fill="none" strokeLinejoin="round" strokeLinecap="round">
          {/* montagnes et quai */}
          <path
            d="M0 120 L30 92 L52 104 L80 70 L104 96 L128 80 L156 100 L178 76 L200 98"
            stroke="var(--color-border)"
            strokeWidth="1.3"
          />
          <path
            d="M80 70 L74 82 M178 76 L172 88"
            stroke="var(--color-frost-deep)"
            strokeWidth="1"
          />
          {/* haubans */}
          <path
            d="M100 30 L34 70 M100 30 L178 84"
            stroke="var(--color-text-muted)"
            strokeWidth="0.9"
          />
          {/* mât, vergue, voile rayée */}
          <path d="M100 124 V28" stroke="var(--color-text)" strokeWidth="1.6" />
          <path d="M62 40 H138" stroke="var(--color-text)" strokeWidth="1.6" />
          <path
            d="M66 42 H134 L132 100 Q100 110 68 100 Z"
            fill="var(--color-surface)"
            stroke="var(--color-frost)"
            strokeWidth="1.4"
          />
          <path
            d="M79 42 H92 L91.5 106 Q85 105 80 104 Z M106 42 H119 L119.5 104 Q113 105 106.5 106 Z"
            fill={u.hatch}
            stroke="var(--color-frost)"
            strokeWidth="1"
          />
          {/* coque */}
          <path
            d="M22 122 Q36 154 100 156 Q164 154 178 122 Q100 134 22 122 Z"
            fill="var(--color-surface)"
            stroke="var(--color-frost)"
            strokeWidth="1.6"
          />
          <path
            d="M30 132 Q100 146 170 132 M40 142 Q100 154 160 142"
            stroke="var(--color-frost)"
            strokeWidth="1"
          />
          <path
            d="M22 122 Q36 154 100 156 Q164 154 178 122 Q100 146 30 132 Z"
            fill={u.hatch}
            stroke="none"
            opacity="0.6"
          />
          {/* proue en tête de dragon */}
          <path
            d="M22 122 Q12 104 16 84 Q20 68 32 62 L46 60 L40 66 L48 70 L36 74 Q28 78 28 90 Q28 106 34 120"
            fill="var(--color-surface)"
            stroke="var(--color-text)"
            strokeWidth="1.5"
          />
          <path d="M32 62 L28 52 M38 61 L36 50" stroke="var(--color-text)" strokeWidth="1.3" />
          <path
            d="M26 80 L22 84 M27 92 L22 96 M28 104 L23 108"
            stroke="var(--color-frost)"
            strokeWidth="1"
          />
          <circle cx="34" cy="66" r="2.5" fill="var(--color-accent)" stroke="none" />
          {/* poupe enroulée */}
          <path
            d="M178 122 Q190 104 186 84 Q184 74 176 74 Q170 76 172 82 Q176 86 180 82"
            stroke="var(--color-text)"
            strokeWidth="1.5"
          />
          {/* boucliers le long du bordage */}
          <g stroke="var(--color-frost)" strokeWidth="1.2">
            <circle cx="46" cy="125" r="7" fill="var(--color-surface-raised)" />
            <circle cx="62" cy="127" r="7" fill={u.hatchDense} />
            <circle cx="78" cy="128.5" r="7" fill="var(--color-surface-raised)" />
            <circle cx="94" cy="129" r="7" fill={u.hatchDense} />
            <circle cx="110" cy="129" r="7" fill="var(--color-surface-raised)" />
            <circle cx="126" cy="128.5" r="7" fill={u.hatchDense} />
            <circle cx="142" cy="127" r="7" fill="var(--color-surface-raised)" />
            <circle cx="158" cy="125" r="7" fill={u.hatchDense} />
          </g>
          <g fill="var(--color-text-muted)" stroke="none">
            <circle cx="46" cy="125" r="1.6" />
            <circle cx="62" cy="127" r="1.6" />
            <circle cx="78" cy="128.5" r="1.6" />
            <circle cx="94" cy="129" r="1.6" />
            <circle cx="110" cy="129" r="1.6" />
            <circle cx="126" cy="128.5" r="1.6" />
            <circle cx="142" cy="127" r="1.6" />
            <circle cx="158" cy="125" r="1.6" />
          </g>
          {/* lanterne de proue */}
          <path d="M46 60 L52 70" stroke="var(--color-text-muted)" strokeWidth="1" />
          <circle cx="52" cy="74" r="9" fill={u.glow} stroke="none" />
          <path
            d="M49.5 71 H54.5 L54 77 H50 Z"
            fill="var(--color-accent)"
            stroke="var(--color-accent)"
            strokeWidth="0.8"
          />
          {/* eau */}
          <path d="M0 160 H200" stroke="var(--color-frost-deep)" strokeWidth="1.4" />
          <g stroke="var(--color-frost-deep)" strokeWidth="1">
            <path d="M12 170 H54 M76 168 H124 M146 170 H190 M24 182 H70 M92 180 H112 M132 182 H178 M40 194 H96 M120 194 H164" />
          </g>
          <path
            d="M49 168 H55 M50 178 H54"
            stroke="var(--color-accent)"
            strokeWidth="1.1"
            opacity="0.7"
          />
          <g fill="var(--color-frost)" stroke="none" opacity="0.7">
            <circle cx="20" cy="24" r="1" />
            <circle cx="160" cy="16" r="1.2" />
            <circle cx="184" cy="44" r="0.9" />
            <circle cx="56" cy="14" r="1" />
          </g>
        </g>
      )}
    </Engraving>
  );
}

/** Feu de camp (jour de trêve) : bouclier posé, hache plantée, flammes en or. */
export function CampfireVignette({ size = 200 }: { size?: number }) {
  return (
    <Engraving size={size}>
      {(u) => (
        <g fill="none" strokeLinejoin="round" strokeLinecap="round">
          {/* sol enneigé */}
          <path
            d="M8 168 Q60 160 100 164 Q150 168 192 160"
            stroke="var(--color-frost-deep)"
            strokeWidth="1.4"
          />
          <ellipse cx="100" cy="158" rx="70" ry="14" fill={u.glow} stroke="none" opacity="0.6" />
          {/* fumée */}
          <path
            d="M102 58 Q94 46 104 36 Q114 26 106 14 M110 66 Q118 52 112 42"
            stroke="var(--color-frost-deep)"
            strokeWidth="1.2"
          />
          {/* bouclier posé à gauche */}
          <circle
            cx="38"
            cy="140"
            r="22"
            fill="var(--color-surface-raised)"
            stroke="var(--color-frost)"
            strokeWidth="1.5"
          />
          <path
            d="M38 118 V162 M18 130 L58 150 M18 150 L58 130"
            stroke="var(--color-frost-deep)"
            strokeWidth="1.1"
          />
          <circle
            cx="38"
            cy="140"
            r="5"
            fill="var(--color-surface)"
            stroke="var(--color-text)"
            strokeWidth="1.2"
          />
          {/* hache plantée dans une bûche à droite */}
          <path
            d="M150 166 L156 146 L184 146 L186 166 Z"
            fill={u.hatch}
            stroke="var(--color-frost)"
            strokeWidth="1.3"
          />
          <ellipse
            cx="170"
            cy="146"
            rx="14"
            ry="3.5"
            fill="var(--color-surface)"
            stroke="var(--color-frost)"
            strokeWidth="1.2"
          />
          <path d="M170 146 L178 96" stroke="var(--color-text)" strokeWidth="2" />
          <path
            d="M176 104 Q164 100 162 110 Q170 116 178 114 Z"
            fill="var(--color-surface-raised)"
            stroke="var(--color-text)"
            strokeWidth="1.3"
          />
          {/* pierres du foyer */}
          <g fill="var(--color-surface-raised)" stroke="var(--color-frost)" strokeWidth="1.2">
            <ellipse cx="62" cy="158" rx="9" ry="5.5" />
            <ellipse cx="80" cy="162" rx="9" ry="5.5" />
            <ellipse cx="100" cy="163" rx="9" ry="5.5" />
            <ellipse cx="120" cy="162" rx="9" ry="5.5" />
            <ellipse cx="138" cy="158" rx="9" ry="5.5" />
          </g>
          {/* bûches croisées */}
          <path
            d="M62 150 L132 126 L136 134 L66 158 Z"
            fill="var(--color-surface)"
            stroke="var(--color-frost)"
            strokeWidth="1.4"
          />
          <path
            d="M138 150 L68 126 L64 134 L134 158 Z"
            fill="var(--color-surface)"
            stroke="var(--color-frost)"
            strokeWidth="1.4"
          />
          <path
            d="M74 150 L126 132 M126 150 L74 132"
            stroke="var(--color-frost-deep)"
            strokeWidth="1"
          />
          <ellipse
            cx="134"
            cy="130"
            rx="3"
            ry="4.5"
            fill="var(--color-surface-raised)"
            stroke="var(--color-text)"
            strokeWidth="1"
          />
          <ellipse
            cx="66"
            cy="130"
            rx="3"
            ry="4.5"
            fill="var(--color-surface-raised)"
            stroke="var(--color-text)"
            strokeWidth="1"
          />
          {/* flammes : seul or de la scène */}
          <circle cx="100" cy="112" r="40" fill={u.glow} stroke="none" />
          <path
            d="M100 142 Q74 124 86 98 Q90 112 96 110 Q88 86 104 62 Q106 86 116 94 Q122 82 118 72 Q138 98 122 128 Q116 140 100 142 Z"
            fill="var(--color-surface)"
            stroke="var(--color-accent)"
            strokeWidth="1.6"
          />
          <path
            d="M100 138 Q88 126 95 110 Q99 120 104 117 Q101 104 108 96 Q118 116 109 130 Q106 136 100 138 Z"
            fill={u.hatchDense}
            stroke="var(--color-accent)"
            strokeWidth="1.1"
          />
          <g fill="var(--color-accent)" stroke="none">
            <circle cx="86" cy="80" r="1.3" />
            <circle cx="120" cy="60" r="1.1" />
            <circle cx="94" cy="52" r="1" />
            <circle cx="128" cy="78" r="0.9" />
          </g>
          <g fill="var(--color-frost)" stroke="none" opacity="0.7">
            <circle cx="24" cy="30" r="1" />
            <circle cx="60" cy="20" r="1.2" />
            <circle cx="160" cy="24" r="0.9" />
            <circle cx="182" cy="56" r="1" />
            <circle cx="30" cy="90" r="0.9" />
          </g>
        </g>
      )}
    </Engraving>
  );
}
