import { copy } from '@/copy';
import { ProgressBar } from './ProgressBar';

type XpBarProps = {
  level: number;
  rank: string;
  /** XP acquis dans le niveau courant. */
  current: number;
  /** XP nécessaires pour passer au niveau suivant. */
  needed: number;
};

export function XpBar({ level, rank, current, needed }: XpBarProps) {
  const ratio = needed > 0 ? current / needed : 0;
  return (
    <div className="flex items-center gap-4">
      <div className="flex min-w-touch flex-col items-center">
        <span className="eyebrow">{copy.common.level}</span>
        <span className="numeric text-4xl text-accent">{level}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-sm font-bold uppercase tracking-display">{rank}</span>
          <span className="numeric text-base text-muted">
            {current} / {needed} {copy.common.xp}
          </span>
        </div>
        <ProgressBar value={ratio} label={`${copy.common.xp} ${level}`} />
      </div>
    </div>
  );
}
