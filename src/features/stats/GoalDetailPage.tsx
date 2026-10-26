import { CaretLeftIcon, CheckIcon, PencilSimpleIcon, XIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/app/store';
import { copy } from '@/copy';
import { indexCheckIns, type DayContext } from '@/features/checkin/dayModel';
import { useGame } from '@/features/gamification/useGame';
import { iconFor } from '@/features/goals/categoryIcons';
import { GoalEditSheet, type GoalSheetTarget } from '@/features/goals/GoalEditSheet';
import { formatNumber, goalSummary } from '@/features/goals/summary';
import { cn } from '@/lib/cn';
import { formatShortDate, formatWeekdayDate, today } from '@/lib/dates';
import type { ISODate } from '@/lib/types';
import { Button, IconButton } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { CategoryMarker } from '@/ui/CategoryMarker';
import { Heatmap, type HeatCell } from '@/ui/Heatmap';
import { LineChart } from '@/ui/LineChart';
import { calendarWeeks, formatRate, goalRate, goalSeries } from './statsModel';

const t = copy.goalDetail;

const HISTORY_LIMIT = 30;

function StatTile({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <Card className="flex flex-1 flex-col gap-1 px-3 py-3">
      <span className="eyebrow">{label}</span>
      <span className="numeric text-3xl">{value}</span>
      {unit && <span className="text-xs text-muted">{unit}</span>}
    </Card>
  );
}

export function GoalDetailPage() {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const arc = useAppStore((s) => s.arc);
  const goals = useAppStore((s) => s.goals);
  const categories = useAppStore((s) => s.categories);
  const checkIns = useAppStore((s) => s.checkIns);
  const game = useGame();
  const [sheet, setSheet] = useState<GoalSheetTarget | null>(null);
  const [selected, setSelected] = useState<ISODate | undefined>(undefined);
  const now = today();

  const goal = goals.find((g) => g.id === goalId);
  const category = categories.find((c) => c.id === goal?.categoryId);
  if (!arc || !game) return null;
  if (!goal || !category) return <p className="m-0 text-muted">{t.notFound}</p>;

  const ctx: DayContext = { goals, categories, index: indexCheckIns(checkIns) };
  const until = now < arc.endDate ? now : arc.endDate;
  const rate = goalRate(goal, arc.startDate, until, now, ctx);
  const streak = game.goalStreaks[goal.id];
  const unit = (n: number) => (streak?.unit === 'weeks' ? t.unitWeeks(n) : t.unitDays(n));
  const series = goalSeries(goal, arc.startDate, until, ctx);
  const goalUnit = goal.unit ?? '';
  const history = checkIns
    .filter((c) => c.goalId === goal.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, HISTORY_LIMIT);
  const byDate = new Map(series.map((p) => [p.date, p]));

  const weeks: HeatCell[][] = calendarWeeks(arc.startDate, arc.endDate).map((week) =>
    week.map((cell) => {
      const point = byDate.get(cell.date);
      const label = `${formatWeekdayDate(cell.date)}, ${point?.completed ? t.done : point ? copy.progress.dayEmpty : copy.progress.dayFuture}`;
      return {
        date: cell.date,
        inArc: cell.inArc,
        level: !point || cell.date > now ? undefined : point.completed ? 4 : 0,
        perfect: false,
        frozen: false,
        today: cell.date === now,
        label,
      };
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <IconButton
            label={t.back}
            onClick={() => {
              void navigate(-1);
            }}
          >
            <CaretLeftIcon size={22} />
          </IconButton>
          <Button
            variant="secondary"
            className="px-3"
            icon={<PencilSimpleIcon size={18} />}
            onClick={() => {
              setSheet({ mode: 'edit', goal });
            }}
          >
            {t.edit}
          </Button>
        </div>
        <CategoryMarker
          name={category.name}
          colorToken={category.colorToken}
          icon={iconFor(category.icon)}
        />
        <h1 className="text-2xl font-black">{goal.title}</h1>
        <p className="m-0 text-sm text-muted">
          {goalSummary(goal)}
          {goal.status !== 'active' && ` · ${t.status[goal.status]}`}
        </p>
      </header>

      <div className="flex gap-2">
        <StatTile label={t.rate} value={formatRate(rate)} />
        <StatTile
          label={t.streak}
          value={String(streak?.current ?? 0)}
          unit={unit(streak?.current ?? 0)}
        />
        <StatTile label={t.best} value={String(streak?.best ?? 0)} unit={unit(streak?.best ?? 0)} />
      </div>

      {goal.type === 'boolean' ? (
        <section className="flex flex-col gap-3" aria-label={t.calendar}>
          <h2 className="eyebrow">{t.calendar}</h2>
          <Heatmap
            weeks={weeks}
            weekdays={copy.progress.weekdays}
            formatDay={copy.progress.dayNumber}
            selected={selected}
            onSelect={setSelected}
            label={t.calendar}
          />
          {selected && (
            <p className="m-0 text-sm text-muted" aria-live="polite">
              {weeks.flat().find((c) => c.date === selected)?.label}
            </p>
          )}
        </section>
      ) : (
        <section className="flex flex-col gap-3" aria-label={t.chart}>
          <h2 className="eyebrow">{t.chart}</h2>
          {series.length > 0 ? (
            <LineChart
              points={series.map((p) => ({
                label: formatWeekdayDate(p.date),
                value: p.value,
                target: p.target,
              }))}
              colorToken={category.colorToken}
              ariaLabel={t.chartLabel(goal.title)}
              formatValue={(v) => t.tooltipValue(formatNumber(v), goalUnit)}
              formatTick={formatNumber}
              unit={goalUnit}
              targetLabel={goal.type === 'limit' ? t.limit : t.target}
              noValueLabel={t.tooltipNone}
              firstLabel={formatShortDate(series[0]?.date ?? arc.startDate)}
              lastLabel={formatShortDate(series[series.length - 1]?.date ?? until)}
            />
          ) : (
            <p className="m-0 text-sm text-muted">{copy.progress.beforeStart}</p>
          )}
        </section>
      )}

      <section className="flex flex-col gap-2" aria-label={t.history}>
        <h2 className="eyebrow">{t.history}</h2>
        {history.length === 0 && <p className="m-0 text-sm text-muted">{t.historyEmpty}</p>}
        <ul className="m-0 flex list-none flex-col p-0">
          {history.map((c) => (
            <li
              key={c.id}
              className="flex min-h-touch items-center gap-3 border-b border-border py-2"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded',
                  c.completed ? 'bg-success text-bg' : 'border border-border text-muted',
                )}
              >
                {c.completed ? <CheckIcon size={14} /> : <XIcon size={14} />}
              </span>
              <span className="flex-1 text-sm">{formatWeekdayDate(c.date)}</span>
              <span className="numeric text-base">
                {goal.type === 'boolean' ? t.done : t.tooltipValue(formatNumber(c.value), goalUnit)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <GoalEditSheet
        target={sheet}
        onClose={() => {
          setSheet(null);
        }}
        onArchived={() => {
          void navigate('/objectifs');
        }}
      />
    </div>
  );
}
