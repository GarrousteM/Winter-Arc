import { CaretRightIcon, ScrollIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/app/store';
import { copy } from '@/copy';
import { indexCheckIns, type DayContext } from '@/features/checkin/dayModel';
import { useGame } from '@/features/gamification/useGame';
import { useRewardQueue } from '@/features/gamification/rewardQueue';
import { weeklyRecap } from '@/features/gamification/retention';
import { Button } from '@/ui/Button';
import { iconFor } from '@/features/goals/categoryIcons';
import { addDaysISO, formatWeekdayDate, today } from '@/lib/dates';
import type { ISODate } from '@/lib/types';
import { Card } from '@/ui/Card';
import { CategoryMarker } from '@/ui/CategoryMarker';
import { HeatLegend, Heatmap, type HeatCell } from '@/ui/Heatmap';
import { ProgressBar } from '@/ui/ProgressBar';
import { calendarWeeks, categoryRate, formatRate, goalRate, heatLevel } from './statsModel';

const t = copy.progress;

const LAST_DAYS = 7;

export function ProgressPage() {
  const arc = useAppStore((s) => s.arc);
  const goals = useAppStore((s) => s.goals);
  const categories = useAppStore((s) => s.categories);
  const checkIns = useAppStore((s) => s.checkIns);
  const restDays = useAppStore((s) => s.restDays);
  const pushReward = useRewardQueue((s) => s.push);
  const game = useGame();
  const now = today();
  const [selected, setSelected] = useState<ISODate | undefined>(undefined);

  if (!arc || !game) return null;

  const ctx: DayContext = { goals, categories, index: indexCheckIns(checkIns) };
  const until = now < arc.endDate ? now : arc.endDate;
  const started = until >= arc.startDate;
  const byDate = new Map(game.days.map((d) => [d.date, d]));
  const rest = new Set(restDays);
  const recap = weeklyRecap(game, now, ctx);

  const weeks: HeatCell[][] = calendarWeeks(arc.startDate, arc.endDate).map((week) =>
    week.map((cell) => {
      const day = byDate.get(cell.date);
      const future = cell.date > now;
      const level = future || !day ? undefined : heatLevel(day.ratio, day.counted);
      const percent = day ? Math.round(day.ratio * 100) : 0;
      const parts = [formatWeekdayDate(cell.date)];
      if (future) parts.push(t.dayFuture);
      else if (day) parts.push(t.dayDetail(percent, day.completed, day.counted));
      if (day?.perfect) parts.push(t.perfect);
      if (day?.frozen) parts.push(t.frozen);
      if (rest.has(cell.date)) parts.push(t.rest);
      return {
        date: cell.date,
        inArc: cell.inArc,
        level,
        perfect: day?.perfect ?? false,
        frozen: day?.frozen ?? false,
        rest: rest.has(cell.date),
        today: cell.date === now,
        label: parts.join(', '),
      };
    }),
  );

  const selectedDay = selected ? byDate.get(selected) : undefined;
  const activeCategories = categories.filter((c) => !c.archived).sort((a, b) => a.order - b.order);
  const weekFrom = addDaysISO(until, -(LAST_DAYS - 1));
  const recentFrom = weekFrom < arc.startDate ? arc.startDate : weekFrom;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-black">{t.title}</h1>

      <section className="flex flex-col gap-3" aria-label={t.heatmap}>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="eyebrow">{t.heatmap}</h2>
          <span className="numeric text-sm text-muted">
            {t.overall} {Math.round(game.overallCompletion * 100)} %
          </span>
        </div>
        <Heatmap
          weeks={weeks}
          weekdays={t.weekdays}
          formatDay={t.dayNumber}
          selected={selected}
          onSelect={setSelected}
          label={t.heatmap}
        />
        <HeatLegend
          less={t.legendLess}
          more={t.legendMore}
          perfect={t.legendPerfect}
          frozen={t.legendFrozen}
          rest={t.legendRest}
        />
        <Card
          variant="raised"
          className="flex min-h-touch flex-col justify-center gap-1 py-2"
          aria-live="polite"
        >
          {selected ? (
            <>
              <span className="font-medium">{formatWeekdayDate(selected)}</span>
              <span className="text-sm text-muted">
                {selected > now
                  ? t.dayFuture
                  : selectedDay
                    ? [
                        t.dayDetail(
                          Math.round(selectedDay.ratio * 100),
                          selectedDay.completed,
                          selectedDay.counted,
                        ),
                        t.dayXp(selectedDay.xp),
                        t.dayStreak(selectedDay.streak),
                        selectedDay.perfect ? t.perfect : '',
                        selectedDay.frozen ? t.frozen : '',
                      ]
                        .filter(Boolean)
                        .join(' · ')
                    : t.dayEmpty}
              </span>
            </>
          ) : (
            <span className="text-sm text-muted">{started ? t.heatmapHint : t.beforeStart}</span>
          )}
        </Card>
      </section>

      {recap && (
        <Button
          variant="secondary"
          icon={<ScrollIcon size={18} />}
          onClick={() => {
            pushReward({ kind: 'recap', recap });
          }}
        >
          {t.openRecap}
        </Button>
      )}

      <section className="flex flex-col gap-3" aria-label={t.categories}>
        <h2 className="eyebrow">{t.categories}</h2>
        {activeCategories.map((category) => {
          const recent = categoryRate(category.id, recentFrom, until, now, ctx, rest);
          const whole = categoryRate(category.id, arc.startDate, until, now, ctx, rest);
          return (
            <Card
              key={category.id}
              accentToken={category.colorToken}
              className="flex flex-col gap-3"
            >
              <CategoryMarker
                name={category.name}
                colorToken={category.colorToken}
                icon={iconFor(category.icon)}
              />
              {[
                { label: t.last7, rate: recent },
                { label: t.wholeArc, rate: whole },
              ].map(({ label, rate }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-sm text-muted">{label}</span>
                  <ProgressBar
                    className="flex-1"
                    value={rate.ratio ?? 0}
                    colorToken={category.colorToken}
                    label={`${category.name} ${label}`}
                  />
                  <span className="numeric w-12 text-right text-base">{formatRate(rate)}</span>
                </div>
              ))}
            </Card>
          );
        })}
      </section>

      <section className="flex flex-col gap-3" aria-label={t.goals}>
        <h2 className="eyebrow">{t.goals}</h2>
        {activeCategories.map((category) =>
          goals
            .filter((g) => g.categoryId === category.id && g.status !== 'archived')
            .sort((a, b) => a.order - b.order)
            .map((goal) => {
              const r = goalRate(goal, arc.startDate, until, now, ctx, rest);
              const streak = game.goalStreaks[goal.id];
              return (
                <Link
                  key={goal.id}
                  to={`/objectifs/${goal.id}`}
                  className="flex min-h-touch items-center gap-3 rounded border border-border border-l-rule bg-surface py-2 pl-4 pr-2"
                  style={{ borderLeftColor: `var(${category.colorToken})` }}
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="font-medium">{goal.title}</span>
                    <span className="text-sm text-muted">
                      {streak ? t.streakShort(streak.current, streak.best, streak.unit) : ''}
                    </span>
                  </div>
                  <span className="numeric text-2xl">{formatRate(r)}</span>
                  <CaretRightIcon size={18} className="text-muted" />
                </Link>
              );
            }),
        )}
      </section>
    </div>
  );
}
