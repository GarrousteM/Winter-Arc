import { CheckIcon, FireIcon, SnowflakeIcon, XIcon } from '@phosphor-icons/react';
import { useAppStore } from '@/app/store';
import { copy } from '@/copy';
import { cn } from '@/lib/cn';
import { formatLongDate } from '@/lib/dates';
import { Badge } from '@/ui/Badge';
import { BossPlaceholder } from '@/ui/BossPlaceholder';
import { Card, CarvedCard } from '@/ui/Card';
import { KnotDivider } from '@/ui/KnotDivider';
import { ProgressBar } from '@/ui/ProgressBar';
import { badges } from './badges';
import type { BossWeek } from './engine';
import { levelProgress, rankForLevel } from './levels';
import { FREEZE_MAX } from './streak';
import { useGame } from './useGame';

const t = copy.trophies;

const statusTone: Record<BossWeek['status'], 'accent' | 'success' | 'warning' | 'muted'> = {
  upcoming: 'muted',
  active: 'accent',
  defeated: 'success',
  escaped: 'warning',
};

const statusClass: Record<BossWeek['status'], string> = {
  upcoming: 'text-muted',
  active: 'text-accent',
  defeated: 'text-success',
  escaped: 'text-warning',
};

/** Premier niveau du rang suivant, ou `undefined` au rang maximal. */
function nextRankLevel(level: number): number | undefined {
  const current = rankForLevel(level);
  for (let l = level + 1; l <= 25; l += 1) {
    if (rankForLevel(l) !== current) return l;
  }
  return undefined;
}

export function TrophiesPage() {
  const game = useGame();
  const arc = useAppStore((s) => s.arc);
  if (!game || !arc) return null;

  const total = game.bosses.length;
  const featured =
    game.currentBoss ??
    game.bosses.find((w) => w.status === 'upcoming') ??
    game.bosses[game.bosses.length - 1];
  const progress = levelProgress(game.totalXp);
  const nextLevel = nextRankLevel(game.level);
  const unlocked = new Map(game.badges.map((b) => [b.id, b.unlockedOn]));
  const inPrologue =
    game.prologue !== undefined &&
    featured?.status === 'upcoming' &&
    arc.startDate <= featured.start;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-black">{t.title}</h1>

      <section className="flex flex-col gap-3" aria-label={t.bossSection}>
        <h2 className="eyebrow">{t.bossSection}</h2>
        {featured && (
          <BossPlaceholder
            name={copy.bosses[featured.bossId].name}
            role={copy.bosses[featured.bossId].role}
            week={t.week(featured.index + 1, total)}
            hp={Math.max(0, featured.hp - featured.damage)}
            maxHp={featured.hp}
            status={t.status[featured.status]}
            statusTone={statusTone[featured.status]}
            defeated={featured.status === 'defeated'}
            footer={
              <p className="m-0 text-sm text-muted">
                {featured.status === 'upcoming'
                  ? inPrologue
                    ? t.prologue(formatLongDate(featured.start))
                    : t.beforeStart(formatLongDate(featured.start))
                  : `${t.endsOn(formatLongDate(featured.end))} · ${t.defeatThreshold}`}
              </p>
            }
          />
        )}
      </section>

      <section className="flex flex-col gap-3" aria-label={t.rankSection}>
        <h2 className="eyebrow">{t.rankSection}</h2>
        <CarvedCard ruleToken="--color-accent" innerClassName="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-display text-3xl font-black uppercase tracking-display text-accent">
              {copy.ranks[game.rank]}
            </span>
            <span className="numeric text-3xl">
              <span className="eyebrow mr-2">{copy.common.level}</span>
              {game.level}
            </span>
          </div>
          <p className="m-0 text-sm text-muted">{copy.rankMeanings[game.rank]}</p>
          <ProgressBar
            value={progress.needed > 0 ? progress.current / progress.needed : 0}
            label={copy.common.xp}
          />
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="numeric text-muted">
              {progress.current} / {progress.needed} {copy.common.xp}
            </span>
            <span className="text-muted">
              {nextLevel ? t.nextRank(copy.ranks[rankForLevel(nextLevel)], nextLevel) : t.maxRank}
            </span>
          </div>
        </CarvedCard>
      </section>

      <section className="flex flex-col gap-3" aria-label={t.streakSection}>
        <h2 className="eyebrow">{t.streakSection}</h2>
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <FireIcon size={22} className="self-center text-frost" />
              <span className="numeric text-4xl text-frost">{game.streak}</span>
              <span className="text-sm text-muted">{copy.streak.unit(game.streak)}</span>
            </div>
            <span className="numeric text-2xl text-accent">
              {copy.streak.multiplier(game.multiplier)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div
              className="flex items-center gap-1"
              role="img"
              aria-label={copy.streak.tokens(game.freezeTokens)}
            >
              {Array.from({ length: FREEZE_MAX }, (_, i) => (
                <SnowflakeIcon
                  key={i}
                  size={22}
                  className={i < game.freezeTokens ? 'text-frost' : 'text-border'}
                />
              ))}
            </div>
            <span className="text-sm text-muted">{copy.streak.best(game.bestStreak)}</span>
          </div>
          <p className="m-0 text-xs text-muted">{t.streakHint}</p>
        </Card>
      </section>

      <section className="flex flex-col gap-3" aria-label={t.badgesSection}>
        <div className="flex items-baseline justify-between">
          <h2 className="eyebrow">{t.badgesSection}</h2>
          <span className="numeric text-sm text-muted">
            {t.badgesCount(unlocked.size, badges.length)}
          </span>
        </div>
        <div className="grid grid-cols-2 justify-items-center gap-x-2 gap-y-6 sm:grid-cols-3">
          {badges.map((badge) => {
            const on = unlocked.get(badge.id);
            return (
              <Badge
                key={badge.id}
                name={badge.name}
                condition={on ? t.unlockedOn(formatLongDate(on)) : badge.description}
                icon={badge.icon}
                shape={badge.shape}
                unlocked={on !== undefined}
                lockedLabel={copy.common.locked}
              />
            );
          })}
        </div>
      </section>

      <KnotDivider />

      <section className="flex flex-col gap-2" aria-label={t.chronicle}>
        <h2 className="eyebrow">{t.chronicle}</h2>
        <ol className="m-0 flex list-none flex-col p-0">
          {game.bosses.map((w) => (
            <li
              key={w.index}
              className="flex min-h-touch items-center gap-3 border-b border-border py-2"
            >
              <span className="numeric w-6 text-right text-muted">{w.index + 1}</span>
              <span
                className={cn(
                  'flex-1 font-display text-sm font-bold uppercase tracking-display',
                  w.status === 'upcoming' && 'text-muted',
                )}
              >
                {copy.bosses[w.bossId].name}
              </span>
              <span className={cn('flex items-center gap-1 text-xs', statusClass[w.status])}>
                {w.status === 'defeated' && <CheckIcon size={14} />}
                {w.status === 'escaped' && <XIcon size={14} />}
                {t.status[w.status]}
              </span>
            </li>
          ))}
        </ol>
        {game.prologue && (
          <p className="m-0 text-xs text-muted">
            {t.prologueTitle} · {formatLongDate(game.prologue.start)}
          </p>
        )}
      </section>
    </div>
  );
}
