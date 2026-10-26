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
import { indexCheckIns } from '@/features/checkin/dayModel';
import { dayNumber, toISODate, today } from '@/lib/dates';
import {
  lastActiveDay,
  milestones,
  shouldShowRecap,
  shouldWelcomeBack,
  weeklyRecap,
  type WeeklyRecap,
} from './retention';
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
  const arc = useAppStore((s) => s.arc);
  const goals = useAppStore((s) => s.goals);
  const categories = useAppStore((s) => s.categories);
  const checkIns = useAppStore((s) => s.checkIns);
  const seen = useAppStore((s) => s.player);
  const acknowledge = useAppStore((s) => s.acknowledge);
  const push = useRewardQueue((s) => s.push);
  const current = useRewardQueue((s) => s.queue[0]);
  const next = useRewardQueue((s) => s.next);

  useEffect(() => {
    if (!game || !arc) return;
    const now = today();
    // Jour de création de l'Arc : rien d'antérieur (Arc antidaté) ne déclenche retour ni récap.
    const createdOn = toISODate(new Date(arc.createdAt));
    const since = createdOn > arc.startDate ? createdOn : arc.startDate;
    const { events, next: nextSeen } = diffRewards(seen, game);
    // Écrans d'information d'abord (retour après absence, récap de la semaine), puis les récompenses.
    const info: RewardEvent[] = [];
    const lastActive = lastActiveDay(checkIns);
    if (
      shouldWelcomeBack({
        today: now,
        startDate: since,
        endDate: arc.endDate,
        lastActive,
        lastShown: seen.lastWelcomeBack,
      })
    ) {
      info.push({ kind: 'return' });
      nextSeen.lastWelcomeBack = now;
    }
    const recap = weeklyRecap(game, now, { goals, categories, index: indexCheckIns(checkIns) });
    if (recap && shouldShowRecap(recap, seen.lastRecapWeek, createdOn)) {
      info.push({ kind: 'recap', recap });
      nextSeen.lastRecapWeek = recap.start;
    }
    if (info.length + events.length > 0) push(...info, ...events);
    if (JSON.stringify(nextSeen) !== JSON.stringify(seen)) acknowledge(nextSeen);
  }, [game, arc, goals, categories, checkIns, seen, push, acknowledge]);

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
    case 'return':
      return r.returnTitle;
    case 'recap':
      return r.recapEyebrow(event.recap.index + 1);
  }
}

function RewardContent({ event }: { event: RewardEvent }) {
  switch (event.kind) {
    case 'return':
      return <ReturnContent />;
    case 'recap':
      return <RecapContent recap={event.recap} />;
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

function ReturnContent() {
  const game = useGame();
  const arc = useAppStore((s) => s.arc);
  if (!game || !arc) return null;
  const now = today();
  const m = milestones(game, now);
  const daysLeft = dayNumber(now, arc.endDate);
  return (
    <>
      <RuneRow lit />
      <Reveal delay={0.4}>
        <h2 className="text-3xl font-black text-accent">{r.returnTitle}</h2>
      </Reveal>
      <Reveal delay={0.7}>
        <p className="m-0 max-w-xs text-muted">{r.returnBody}</p>
      </Reveal>
      <Reveal delay={1}>
        <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm">
          <li className="numeric text-2xl text-text">{r.returnDaysLeft(daysLeft)}</li>
          {m.boss && !m.boss.defeated && (
            <li>
              {copy.today.bossLeft(
                copy.bosses[m.boss.bossId].name,
                m.boss.toBreak,
                m.boss.daysLeft,
              )}
            </li>
          )}
          <li>
            {m.next.kind === 'rank'
              ? copy.today.nextRank(copy.ranks[m.next.rank], m.next.xp)
              : copy.today.nextLevel(m.next.level, m.next.xp)}
          </li>
        </ul>
      </Reveal>
    </>
  );
}

function RecapContent({ recap }: { recap: WeeklyRecap }) {
  const boss = copy.bosses[recap.bossId].name;
  return (
    <>
      <span className="eyebrow text-accent">{r.recapEyebrow(recap.index + 1)}</span>
      <Reveal delay={0.2}>
        <BossSilhouette defeated={recap.defeated} size={110} />
      </Reveal>
      <Reveal delay={0.4}>
        <h2 className={recap.defeated ? 'text-3xl font-black text-accent' : 'text-3xl font-black'}>
          {recap.defeated ? r.recapBossDefeated(boss) : r.recapBossEscaped(boss)}
        </h2>
      </Reveal>
      <Reveal delay={0.7}>
        <div className="flex flex-col items-center gap-1">
          <span className="numeric text-5xl text-accent">{r.recapXp(recap.xp)}</span>
          {recap.xpDelta !== undefined && recap.xpDelta > 0 && (
            <span className="text-sm text-success">{r.recapDelta(recap.xpDelta)}</span>
          )}
        </div>
      </Reveal>
      <Reveal delay={1}>
        <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm text-muted">
          <li>{r.recapStrongDays(recap.strongDays, recap.days)}</li>
          {recap.perfectDays > 0 && <li>{r.recapPerfect(recap.perfectDays)}</li>}
          {recap.bestGoal && (
            <li>
              {r.recapBestGoal(recap.bestGoal.title, recap.bestGoal.done, recap.bestGoal.total)}
            </li>
          )}
          {recap.streak > 0 && <li className="text-frost">{r.recapStreak(recap.streak)}</li>}
        </ul>
      </Reveal>
    </>
  );
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
    else if (event.kind === 'badge') playShieldThud();
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
