import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { RuneStone } from './RuneStone';

type BossStoneProps = {
  name: string;
  role: string;
  week: string;
  status?: string;
  statusTone?: 'accent' | 'success' | 'warning' | 'muted';
  defeated?: boolean;
  /** Gravure du boss. */
  art: ReactNode;
  /** Mur de boucliers (PV) et sa légende, sous le nom. */
  wall: ReactNode;
  footer?: ReactNode;
};

const toneClass = {
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  muted: 'text-muted',
};

/** Boss de la semaine gravé dans une pierre runique à bande-serpent ; ses PV en mur de boucliers. */
export function BossStone({
  name,
  role,
  week,
  status,
  statusTone = 'muted',
  defeated = false,
  art,
  wall,
  footer,
}: BossStoneProps) {
  return (
    <div className="flex flex-col gap-3">
      <RuneStone bandToken={defeated ? '--color-accent' : '--color-frost-deep'}>
        <div className="flex h-full flex-col items-center gap-2 text-center">
          <div className="flex flex-col items-center gap-0.5">
            <span className="eyebrow">{week}</span>
            {status && <span className={cn('eyebrow', toneClass[statusTone])}>{status}</span>}
          </div>
          {art}
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-black">{name}</h3>
            <p className="m-0 text-sm text-muted">{role}</p>
          </div>
          <div className="mt-1 flex w-full flex-col items-center gap-1">{wall}</div>
        </div>
      </RuneStone>
      {footer}
    </div>
  );
}
