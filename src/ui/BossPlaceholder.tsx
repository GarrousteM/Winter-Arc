import { useId, type ReactNode } from 'react';
import { copy } from '@/copy';
import { cn } from '@/lib/cn';
import { CarvedCard } from './Card';
import { ProgressBar } from './ProgressBar';

/** Silhouette gravée (hachures) en attendant les illustrations. Vaincu : barrée en or. */
export function BossSilhouette({
  defeated = false,
  size = 140,
}: {
  defeated?: boolean;
  size?: number;
}) {
  const id = useId().replace(/:/g, '');
  const stroke = defeated ? 'var(--color-frost-deep)' : 'var(--color-text-muted)';
  return (
    <svg width={size} height={(size * 120) / 140} viewBox="0 0 140 120" aria-hidden="true">
      <defs>
        <pattern
          id={`${id}-h`}
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="5" stroke={stroke} strokeWidth="1" />
        </pattern>
      </defs>
      <path
        d="M20 120L24 84L40 70L54 64L58 48L56 34L62 22L70 18L78 22L84 34L82 48L86 64L100 70L116 84L120 120Z"
        fill={`url(#${id}-h)`}
        stroke={stroke}
        strokeWidth="1.25"
        strokeLinejoin="miter"
      />
      {!defeated && (
        <path d="M64 36L68 38M76 38L80 36" stroke="var(--color-accent)" strokeWidth="1.5" />
      )}
      {defeated && (
        <path d="M30 30L110 110M110 30L30 110" stroke="var(--color-accent)" strokeWidth="2" />
      )}
      <line x1="0" y1="119.5" x2="140" y2="119.5" stroke="var(--color-border)" />
    </svg>
  );
}

type BossPlaceholderProps = {
  name: string;
  role: string;
  week: string;
  /** PV restants. */
  hp: number;
  maxHp: number;
  status?: string;
  statusTone?: 'accent' | 'success' | 'warning' | 'muted';
  defeated?: boolean;
  footer?: ReactNode;
};

const toneClass = {
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  muted: 'text-muted',
};

/** Carte de boss : silhouette, nom en Cinzel, barre de PV restants. */
export function BossPlaceholder({
  name,
  role,
  week,
  hp,
  maxHp,
  status,
  statusTone = 'muted',
  defeated = false,
  footer,
}: BossPlaceholderProps) {
  const ratio = maxHp > 0 ? hp / maxHp : 0;
  return (
    <CarvedCard
      ruleToken={defeated ? '--color-accent' : '--color-border'}
      innerClassName="flex flex-col items-center gap-3 text-center"
    >
      <div className="flex w-full items-baseline justify-between gap-2">
        <span className="eyebrow">{week}</span>
        {status && <span className={cn('eyebrow', toneClass[statusTone])}>{status}</span>}
      </div>
      <BossSilhouette defeated={defeated} />
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-black">{name}</h3>
        <p className="m-0 text-sm text-muted">{role}</p>
      </div>
      <div className="flex w-full flex-col gap-1">
        <ProgressBar
          value={ratio}
          colorToken="--color-warning"
          label={`${copy.common.hp} ${name}`}
          marker={0.2}
        />
        <span className="numeric self-end text-sm text-muted">
          {hp} / {maxHp} {copy.common.hp}
        </span>
      </div>
      {footer}
    </CarvedCard>
  );
}
