import { useState } from 'react';
import { useAppStore } from '@/app/store';
import { copy } from '@/copy';
import { CampfireIcon, FireIcon, SnowflakeIcon } from '@phosphor-icons/react';
import { levelProgress, nextRankLevel, rankForLevel } from '@/features/gamification/levels';
import { useRewardQueue } from '@/features/gamification/rewardQueue';
import { missingEntries } from '@/features/gamification/retention';
import { useGame } from '@/features/gamification/useGame';
import { iconFor } from '@/features/goals/categoryIcons';
import { dayNumber, formatLongDate, today } from '@/lib/dates';
import { vibrate } from '@/lib/haptics';
import { playShieldThud } from '@/lib/sound';
import type { ISODate } from '@/lib/types';
import { FjordHorizon } from '@/ui/FjordHorizon';
import { CampfireVignette, DrakkarVignette } from '@/ui/Vignettes';
import { Button } from '@/ui/Button';
import { CategoryMarker } from '@/ui/CategoryMarker';
import { DayShield } from '@/ui/DayShield';
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
  const restDays = useAppStore((s) => s.restDays);
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
        <h1 className="text-2xl font-black">{before ? t.beforeStartTitle : t.afterEndTitle}</h1>
        <DrakkarVignette size={260} />
        <p className="m-0 max-w-xs text-muted">
          {before ? t.beforeStart(formatLongDate(arc.startDate)) : t.afterEnd}
        </p>
      </div>
    );
  }

  const activeCategories = categories.filter((c) => !c.archived).sort((a, b) => a.order - b.order);
  const percent = Math.round(summary.ratio * 100);
  const rank = rankForLevel(progress.level);
  const nextRank = nextRankLevel(progress.level);
  const isTruce = restDays.includes(date);
  const campfire = isTruce && summary.completed === 0;
  // Jours encore rattrapables avec des objectifs non saisis (seulement depuis l'onglet Aujourd'hui).
  const missing =
    date === now
      ? days
          .filter((d) => d < now)
          .map((d) => ({ day: d, count: missingEntries(d, ctx) }))
          .filter((m) => m.count > 0)
      : [];

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

      {missing.map(({ day, count }) => (
        <div
          key={day}
          role="status"
          className="flex items-center justify-between gap-3 rounded border border-warning px-3 py-2"
        >
          <span className="text-sm">
            {t.missing(t.dayLabels[dayNumber(day, now) - 1] ?? formatLongDate(day), count)}
          </span>
          <Button
            variant="secondary"
            className="shrink-0 px-3"
            onClick={() => {
              setSelected(day);
            }}
          >
            {t.missingCta}
          </Button>
        </div>
      ))}

      {/* Jour de trêve sans rien de coché : le feu de camp remplace le bouclier du jour. */}
      {campfire ? (
        <section aria-label={t.truceTitle} className="flex flex-col items-center gap-2 text-center">
          <CampfireVignette size={200} />
          <h2 className="eyebrow text-frost">{t.truceTitle}</h2>
          <p className="m-0 max-w-xs text-sm text-muted">{t.truceRest}</p>
        </section>
      ) : (
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
        </section>
      )}

      <div className="flex flex-col gap-1.5 border-y border-border py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="truncate font-display text-xs font-bold uppercase tracking-display">
            <span className="text-muted">{t.level(progress.level)}</span>
            <span className="text-muted"> · </span>
            <span className="text-accent">{copy.ranks[rank]}</span>
          </span>
          {game && (
            <span className="flex shrink-0 items-center gap-1.5 text-sm text-frost">
              <FireIcon size={16} aria-hidden="true" />
              <span>{t.streak(game.streak)}</span>
              {multiplier > 1 && (
                <span className="numeric text-accent">{t.multiplier(multiplier)}</span>
              )}
              {game.freezeTokens > 0 && (
                <span
                  className="flex items-center gap-0.5"
                  role="img"
                  aria-label={copy.streak.tokens(game.freezeTokens)}
                >
                  {Array.from({ length: game.freezeTokens }, (_, i) => (
                    <SnowflakeIcon key={i} size={14} />
                  ))}
                </span>
              )}
            </span>
          )}
        </div>
        <ProgressBar
          thin
          value={progress.needed > 0 ? progress.current / progress.needed : 0}
          label={`${copy.common.level} ${progress.level}, ${progress.current} / ${progress.needed} ${copy.common.xp}`}
        />
        <div className="flex items-baseline justify-between gap-3 text-xs text-muted">
          <span className="numeric">
            {progress.current} / {progress.needed} {copy.common.xp}
          </span>
          {nextRank !== undefined && (
            <span>{t.nextRankAt(copy.ranks[rankForLevel(nextRank)], nextRank)}</span>
          )}
        </div>
      </div>
      {dayResult?.frozen && <p className="m-0 text-sm text-frost">{copy.streak.frozenNote}</p>}

      {isTruce && !campfire && (
        <p className="m-0 flex items-center gap-2 text-sm text-frost">
          <CampfireIcon size={18} />
          {t.truceDay}
        </p>
      )}

      {states.length === 0 && <p className="m-0 text-muted">{t.nothingToday}</p>}

      {activeCategories.map((category) => {
        const rows = states
          .filter((s) => s.goal.categoryId === category.id)
          .sort((a, b) => a.goal.order - b.goal.order);
        if (rows.length === 0) return null;
        return (
          <section key={category.id} className="mt-4 flex flex-col" aria-label={category.name}>
            {/* En-tête de section : pierre runique, nom, trait gravé jusqu'au compte du jour. */}
            <div className="flex items-center gap-3 border-b-2 border-border pb-2">
              <CategoryMarker
                name={category.name}
                colorToken={category.colorToken}
                icon={iconFor(category.icon)}
              />
              <span aria-hidden="true" className="h-px flex-1 bg-frost-deep" />
              <span className="numeric text-sm text-muted">
                {t.categoryDone(rows.filter((r) => r.completed).length, rows.length)}
              </span>
            </div>
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

      {/* Point final de la journée : petit fjord, visible seulement en bas de la liste. */}
      <FjordHorizon band className="-mx-4 -mb-8 mt-2 block w-[calc(100%+2rem)]" />
    </div>
  );
}
