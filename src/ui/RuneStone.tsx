import type { ReactNode } from 'react';

type RuneStoneProps = {
  /** Couleur de la bande-serpent : acier (boss) ou or (rang). */
  bandToken?: string;
  children: ReactNode;
  className?: string;
};

// Pierre dressée (sommet arrondi, base plate) et bande-serpent gravée qui suit son bord,
// tête en bas à gauche, queue en bas à droite, à la manière des pierres runiques scandinaves.
const STONE = 'M20 408 L12 124 C12 52 90 6 179 6 C268 6 346 52 346 124 L338 408 Z';
const BAND = 'M38 404 L31 126 C31 70 102 26 179 26 C256 26 327 70 327 126 L320 404';

export function RuneStone({
  bandToken = '--color-frost-deep',
  children,
  className,
}: RuneStoneProps) {
  const band = `var(${bandToken})`;
  return (
    <div
      className={className}
      style={{ position: 'relative', width: '100%', aspectRatio: '358 / 410' }}
    >
      <svg
        viewBox="0 0 358 410"
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <path
          d={STONE}
          fill="var(--color-surface-raised)"
          stroke="var(--color-border)"
          strokeWidth={2}
        />
        <path d={BAND} fill="none" stroke={band} strokeWidth={14} strokeLinejoin="round" />
        <path
          d={BAND}
          fill="none"
          stroke="var(--color-surface-raised)"
          strokeWidth={2}
          strokeDasharray="1 9"
        />
        <path d="M24 404 L45 404 L38 386 Z" fill={band} />
        <circle cx={36} cy={397} r={2} fill="var(--color-accent)" />
        <path
          d="M320 404 C326 396 334 398 332 406"
          fill="none"
          stroke={band}
          strokeWidth={5}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: '9% 14% 4% 14%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    </div>
  );
}
