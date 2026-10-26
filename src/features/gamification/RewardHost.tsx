import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';
import { useAppStore } from '@/app/store';
import { copy } from '@/copy';
import { durations, easeHeavy, usePrefersReducedMotion } from '@/lib/motion';
import { playCrash, playShieldThud, playWarHorn } from '@/lib/sound';
import { Badge } from '@/ui/Badge';
import { BossSilhouette } from '@/ui/BossPlaceholder';
import { KnotDivider } from '@/ui/KnotDivider';
import { RuneRow } from '@/ui/Rune';
import { RuneStone } from '@/ui/RuneStone';
import { futhark } from '@/ui/runes';
import { badges } from './badges';
import { useRewardQueue } from './rewardQueue';
import { diffRewards, type RewardEvent } from './rewards';
import { useGame } from './useGame';
import { BOSS_BONUS, PERFECT_DAY_BONUS } from './xp';

const r = copy.rewards;

/**
 * Surveille la progression recalculée, met en file les nouvelles récompenses
 * (badges, boss, level-up) et les affiche une par une en plein écran.
 */
export function RewardHost() {
  const game = useGame();
  const seen = useAppStore((s) => s.player);
  const acknowledge = useAppStore((s) => s.acknowledge);
  const push = useRewardQueue((s) => s.push);
  const current = useRewardQueue((s) => s.queue[0]);
  const next = useRewardQueue((s) => s.next);

  useEffect(() => {
    if (!game) return;
    const { events, next: nextSeen } = diffRewards(seen, game);
    if (events.length > 0) push(...events);
    if (JSON.stringify(nextSeen) !== JSON.stringify(seen)) acknowledge(nextSeen);
  }, [game, seen, push, acknowledge]);

  return (
    <AnimatePresence mode="wait">
      {current && <RewardOverlay key={JSON.stringify(current)} event={current} onClose={next} />}
    </AnimatePresence>
  );
}

function Reveal({ delay, children }: { delay: number; children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: durations.base * 2, delay: reduced ? 0 : delay, ease: easeHeavy }}
    >
      {children}
    </motion.div>
  );
}

function label(event: RewardEvent): string {
  switch (event.kind) {
    case 'perfect':
      return copy.today.perfectTitle;
    case 'badge':
      return `${r.badge} : ${badges.find((b) => b.id === event.badgeId)?.name ?? ''}`;
    case 'boss':
      return `${r.boss} : ${copy.bosses[event.bossId].name}`;
    case 'level':
      return `${r.level(event.level)} · ${copy.ranks[event.rank]}`;
  }
}

function RewardContent({ event }: { event: RewardEvent }) {
  switch (event.kind) {
    case 'perfect':
      return (
        <>
          <RuneRow lit />
          <Reveal delay={0.4}>
            <h2 className="text-3xl font-black text-accent">{copy.today.perfectTitle}</h2>
          </Reveal>
          <Reveal delay={0.8}>
            <span className="numeric text-6xl text-text">
              {copy.today.perfectBonus(PERFECT_DAY_BONUS)}
            </span>
          </Reveal>
        </>
      );
    case 'badge': {
      const badge = badges.find((b) => b.id === event.badgeId);
      if (!badge) return null;
      return (
        <>
          <span className="eyebrow">{r.badge}</span>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.4, opacity: 1 }}
            transition={{ duration: durations.base * 2, delay: 0.2, ease: easeHeavy }}
            className="py-6"
          >
            <Badge
              name={badge.name}
              condition={badge.description}
              icon={badge.icon}
              shape={badge.shape}
              unlocked
              lockedLabel={copy.common.locked}
            />
          </motion.div>
        </>
      );
    }
    case 'boss':
      return (
        <>
          <span className="eyebrow">{r.boss}</span>
          <Reveal delay={0.2}>
            <BossSilhouette defeated />
          </Reveal>
          <Reveal delay={0.5}>
            <h2 className="text-4xl font-black">{copy.bosses[event.bossId].name}</h2>
          </Reveal>
          <Reveal delay={0.8}>
            <span className="numeric text-5xl text-accent">{r.bossBonus(BOSS_BONUS)}</span>
          </Reveal>
        </>
      );
    case 'level':
      return event.rankChanged ? (
        <>
          <RuneRow lit runes={futhark.slice(0, 8)} />
          <div className="w-64">
            <RuneStone bandToken="--color-accent">
              <div className="flex h-full flex-col items-center justify-center gap-3 pb-8">
                <Reveal delay={1}>
                  <span className="eyebrow text-accent">{r.newRank}</span>
                </Reveal>
                <motion.h2
                  className="text-4xl font-black text-accent"
                  initial={{ scale: 1.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: durations.reward, delay: 1.1, ease: easeHeavy }}
                >
                  {copy.ranks[event.rank]}
                </motion.h2>
                <Reveal delay={1.6}>
                  <p className="m-0 max-w-[10rem] text-sm text-muted">
                    {copy.rankMeanings[event.rank]}
                  </p>
                </Reveal>
                <Reveal delay={1.8}>
                  <span className="numeric text-3xl text-text">{r.level(event.level)}</span>
                </Reveal>
              </div>
            </RuneStone>
          </div>
          <RuneRow lit runes={futhark.slice(8, 16)} />
        </>
      ) : (
        <>
          <RuneRow lit />
          <Reveal delay={0.6}>
            <span className="eyebrow">{r.levelUp}</span>
          </Reveal>
          <motion.span
            className="numeric text-8xl text-accent"
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: durations.reward, delay: 0.8, ease: easeHeavy }}
          >
            {event.level}
          </motion.span>
          <Reveal delay={1.2}>
            <span className="font-display text-lg font-bold uppercase tracking-display">
              {copy.ranks[event.rank]}
            </span>
          </Reveal>
        </>
      );
  }
}

/** Écran plein de récompense : fermeture par tap ou Échap. */
function RewardOverlay({ event, onClose }: { event: RewardEvent; onClose: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const soundOn = useAppStore((s) => s.preferences.sound);
  useEffect(() => {
    if (!soundOn) return;
    if (event.kind === 'level') playWarHorn(true);
    else if (event.kind === 'perfect') playWarHorn(false);
    else if (event.kind === 'boss') playCrash();
    else playShieldThud();
  }, [event, soundOn]);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <motion.button
      ref={ref}
      type="button"
      role="alertdialog"
      aria-label={label(event)}
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-bg px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: durations.base }}
    >
      <RewardContent event={event} />
      <KnotDivider className="w-full max-w-xs" />
      <span className="eyebrow">{r.tapToClose}</span>
    </motion.button>
  );
}
