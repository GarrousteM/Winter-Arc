import { useState } from 'react';
import { useAppStore } from '@/app/store';
import { copy } from '@/copy';
import { FireIcon, SnowflakeIcon } from '@phosphor-icons/react';
import { levelProgress, rankForLevel } from '@/features/gamification/levels';
import { useRewardQueue } from '@/features/gamification/rewardQueue';
import { useGame } from '@/features/gamification/useGame';
import { iconFor } from '@/features/goals/categoryIcons';
import { dayNumber, formatLongDate, today } from '@/lib/dates';
import { vibrate } from '@/lib/haptics';
import { playShieldThud } from '@/lib/sound';
import type { ISODate } from '@/lib/types';
import { CategoryMarker } from '@/ui/CategoryMarker';
import { DayShield } from '@/ui/DayShield';
import { RuneRow } from '@/ui/Rune';
import { Segmented } from '@/ui/Segmented';
import { ProgressBar } from '@/ui/ProgressBar';
import { dayStates, fillableDays, indexCheckIns, summarizeDay, type DayContext } from './dayModel';
import { DayNoteField } from './DayNoteField';
import { GoalCheckRow } from './GoalCheckRow';

const t = copy.today;

const CHECK_VIBRATION_MS = 15;

export function TodayPage() {
  const arc = useAppStore((s) => s.arc);
  const goals = useAppStore((s) => s.goals);
  const categories = useAppStore((s) => s.categories);
  const checkIns = useAppStore((s) => s.checkIns);
  const vibrationOn = useAppStore((s) => s.preferences.vibration);
  const soundOn = useAppStore((s) => s.preferences.sound);
  const setCheckIn = useAppStore((s) => s.setCheckIn);

  const now = today();
  const days = arc ? fillableDays(arc.startDate, arc.endDate, now) : [];
  const [selected, setSelected] = useState<ISODate | null>(null);
  const date = selected && days.includes(selected) ? selected : days[days.length - 1];

  const [gains, setGains] = useState<Record<string, { xp: number; key: number }>>({});
  const pushPerfect = useRewardQueue((s) => s.pushPerfect);
  const game = useGame();

  const ctx: DayContext = { goals, categories, index: indexCheckIns(checkIns) };

  const states = date ? dayStates(date, ctx) : [];
  const summary = summarizeDay(states);

  const progress = levelProgress(game?.totalXp ?? 0);
  const dayResult = game?.days.find((d) => d.date === date);
  const multiplier = dayResult?.multiplier ?? 1;

  const handleChange = (goalId: string, value: number | undefined) => {
    if (!date) return;
    const before = states.find((s) => s.goal.id === goalId);
    const beforeSummary = summarizeDay(states);
    setCheckIn(goalId, date, value);

    // Recalcul immédiat à partir du store mis à jour, pour le retour visuel.
    const { goals: g, categories: c, checkIns: ci } = useAppStore.getState();
    const afterStates = dayStates(date, { goals: g, categories: c, index: indexCheckIns(ci) });
    const after = afterStates.find((s) => s.goal.id === goalId);
    // Gain affiché : XP de l'objectif avec le multiplicateur du jour, plus son bonus.
    const worth = (x: typeof after) => (x ? Math.round(x.xp.base * multiplier) + x.xp.bonus : 0);
    const delta = worth(after) - worth(before);
    if (delta > 0) {
      setGains((current) => ({
        ...current,
        [`${goalId}|${date}`]: { xp: delta, key: Date.now() },
      }));
    }
    if (after?.completed && !before?.completed) {
      if (vibrationOn) vibrate(CHECK_VIBRATION_MS);
      if (soundOn) playShieldThud();
    }
    if (summarizeDay(afterStates).perfect && !beforeSummary.perfect) pushPerfect(date);
  };

  if (!arc) return null;

  if (!date) {
    const before = now < arc.startDate;
    return (
      <div className="flex flex-col items-center gap-5 pt-8 text-center">
        <RuneRow />
        <h1 className="text-2xl font-black">{before ? t.beforeStartTitle : t.afterEndTitle}</h1>
        <p className="m-0 text-muted">
          {before ? t.beforeStart(formatLongDate(arc.startDate)) : t.afterEnd}
        </p>
      </div>
    );
  }

  const activeCategories = categories.filter((c) => !c.archived).sort((a, b) => a.order - b.order);
  const percent = Math.round(summary.ratio * 100);
  // Objectifs affichés mais facultatifs aujourd'hui (hebdomadaire en jour de repos).
  const optionalNames = states
    .filter((s) => !s.counts)
    .map((s) => s.goal.title)
    .join(', ');

  return (
    <div className="flex flex-col gap-6">
      {days.length > 1 && (
        <Segmented
          label={t.dayTabs}
          value={date}
          onChange={setSelected}
          options={days.map((d) => ({
            value: d,
            label: t.dayLabels[dayNumber(d, now) - 1] ?? formatLongDate(d),
          }))}
        />
      )}

      <section aria-label={t.progressLabel} className="flex flex-col items-center gap-3">
        <DayShield
          done={summary.completed}
          total={summary.counted}
          unit={t.shieldUnit}
          label={t.shieldLabel(summary.completed, summary.counted, percent)}
        />
        <span className="text-sm text-muted">
          <span className="numeric text-base text-text">{t.dayPercent(percent)}</span> ·{' '}
          <span className="numeric text-base text-accent">{t.xpToday(dayResult?.xp ?? 0)}</span>
        </span>
        {optionalNames && (
          <span className="text-center text-xs text-frost">{t.optional(optionalNames)}</span>
        )}
      </section>

      <div className="flex items-center gap-3 border-y border-border py-2">
        <span className="numeric text-2xl text-accent">{progress.level}</span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate font-display text-xs font-bold uppercase tracking-display">
            {copy.ranks[rankForLevel(progress.level)]}
          </span>
          <ProgressBar
            thin
            value={progress.needed > 0 ? progress.current / progress.needed : 0}
            label={`${copy.common.level} ${progress.level}, ${progress.current} / ${progress.needed} ${copy.common.xp}`}
          />
        </div>
        {game && (
          <>
            <span aria-hidden="true" className="h-7 w-px bg-border" />
            <span
              className="flex items-center gap-1"
              aria-label={`${copy.streak.label} ${game.streak} ${copy.streak.unit(game.streak)}`}
            >
              <FireIcon size={16} className="text-frost" />
              <span className="numeric text-xl text-frost">{game.streak}</span>
            </span>
            <span className="numeric text-base text-accent">
              {copy.streak.multiplier(multiplier)}
            </span>
            {game.freezeTokens > 0 && (
              <span
                className="flex items-center gap-0.5"
                role="img"
                aria-label={copy.streak.tokens(game.freezeTokens)}
              >
                {Array.from({ length: game.freezeTokens }, (_, i) => (
                  <SnowflakeIcon key={i} size={14} className="text-frost" />
                ))}
              </span>
            )}
          </>
        )}
      </div>
      {dayResult?.frozen && <p className="m-0 text-sm text-frost">{copy.streak.frozenNote}</p>}

      {states.length === 0 && <p className="m-0 text-muted">{t.nothingToday}</p>}

      {activeCategories.map((category) => {
        const rows = states
          .filter((s) => s.goal.categoryId === category.id)
          .sort((a, b) => a.goal.order - b.goal.order);
        if (rows.length === 0) return null;
        return (
          <section key={category.id} className="flex flex-col" aria-label={category.name}>
            <CategoryMarker
              className="pb-1"
              muted
              name={category.name}
              colorToken={category.colorToken}
              icon={iconFor(category.icon)}
            />
            {rows.map((state) => (
              <GoalCheckRow
                key={`${state.goal.id}-${date}`}
                state={state}
                colorToken={category.colorToken}
                gain={gains[`${state.goal.id}|${date}`]}
                onGainShown={() => {
                  setGains((current) => {
                    const key = `${state.goal.id}|${date}`;
                    return Object.fromEntries(Object.entries(current).filter(([k]) => k !== key));
                  });
                }}
                onChange={(value) => {
                  handleChange(state.goal.id, value);
                }}
              />
            ))}
          </section>
        );
      })}

      <DayNoteField key={date} date={date} />
    </div>
  );
}
