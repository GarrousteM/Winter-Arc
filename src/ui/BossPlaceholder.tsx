import { useId } from 'react';
import { copy } from '@/copy';
import { CarvedCard } from './Card';
import { ProgressBar } from './ProgressBar';

type BossPlaceholderProps = {
  name: string;
  role: string;
  week: string;
  hp: number;
  maxHp: number;
};

/** Carte de boss en attendant les illustrations : silhouette gravée (hachures) et nom en Cinzel. */
export function BossPlaceholder({ name, role, week, hp, maxHp }: BossPlaceholderProps) {
  const id = useId().replace(/:/g, '');
  const ratio = maxHp > 0 ? hp / maxHp : 0;
  return (
    <CarvedCard innerClassName="flex flex-col items-center gap-3 text-center">
      <span className="eyebrow">{week}</span>
      <svg width="140" height="120" viewBox="0 0 140 120" aria-hidden="true">
        <defs>
          <pattern
            id={`${id}-h`}
            width="5"
            height="5"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="5" stroke="var(--color-text-muted)" strokeWidth="1" />
          </pattern>
        </defs>
        <path
          d="M20 120L24 84L40 70L54 64L58 48L56 34L62 22L70 18L78 22L84 34L82 48L86 64L100 70L116 84L120 120Z"
          fill={`url(#${id}-h)`}
          stroke="var(--color-text-muted)"
          strokeWidth="1.25"
          strokeLinejoin="miter"
        />
        <path d="M64 36L68 38M76 38L80 36" stroke="var(--color-accent)" strokeWidth="1.5" />
        <line x1="0" y1="119.5" x2="140" y2="119.5" stroke="var(--color-border)" />
      </svg>
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-black">{name}</h3>
        <p className="text-sm text-muted">{role}</p>
      </div>
      <div className="flex w-full flex-col gap-1">
        <ProgressBar
          value={ratio}
          colorToken="--color-warning"
          label={`${copy.common.hp} ${name}`}
        />
        <span className="numeric self-end text-sm text-muted">
          {hp} / {maxHp} {copy.common.hp}
        </span>
      </div>
    </CarvedCard>
  );
}
