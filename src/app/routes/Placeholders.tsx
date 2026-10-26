import { useAppStore } from '@/app/store';
import { copy } from '@/copy';
import { iconFor } from '@/features/goals/categoryIcons';
import { goalSummary } from '@/features/goals/summary';
import { dayNumber, daysInclusive, today } from '@/lib/dates';
import { Card, CarvedCard } from '@/ui/Card';
import { CategoryMarker } from '@/ui/CategoryMarker';
import { RuneRow } from '@/ui/Rune';

const p = copy.placeholder;

/** Écran Aujourd'hui provisoire (phase 3) : état de l'Arc et objectifs actifs. */
export function TodayPlaceholder() {
  const arc = useAppStore((s) => s.arc);
  const categories = useAppStore((s) => s.categories);
  const goals = useAppStore((s) => s.goals);
  if (!arc) return null;
  const day = dayNumber(arc.startDate, today());
  const total = daysInclusive(arc.startDate, arc.endDate);
  const active = categories.filter((c) => !c.archived).sort((a, b) => a.order - b.order);
  const activeGoals = goals.filter(
    (g) => g.status === 'active' && active.some((c) => c.id === g.categoryId),
  );
  const status = day < 1 ? p.beforeStart(1 - day) : day > total ? p.afterEnd : p.today;

  return (
    <div className="flex flex-col gap-6">
      <CarvedCard innerClassName="flex flex-col gap-2">
        <span className="eyebrow">{arc.name}</span>
        <p className="m-0 text-lg font-medium">{status}</p>
        <span className="text-sm text-muted">{p.goalsToday(activeGoals.length)}</span>
      </CarvedCard>
      {active.map((category) => {
        const list = activeGoals
          .filter((g) => g.categoryId === category.id)
          .sort((a, b) => a.order - b.order);
        if (list.length === 0) return null;
        return (
          <section key={category.id} className="flex flex-col gap-2">
            <CategoryMarker
              name={category.name}
              colorToken={category.colorToken}
              icon={iconFor(category.icon)}
            />
            {list.map((goal) => (
              <Card key={goal.id} accentToken={category.colorToken} className="flex flex-col py-3">
                <span className="font-medium">{goal.title}</span>
                <span className="text-sm text-muted">{goalSummary(goal)}</span>
              </Card>
            ))}
          </section>
        );
      })}
    </div>
  );
}

function ComingSoon({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-6 pt-10 text-center">
      <RuneRow />
      <h1 className="text-2xl font-black">{title}</h1>
      <p className="m-0 text-muted">{body}</p>
    </div>
  );
}

export function ProgressPlaceholder() {
  return <ComingSoon title={copy.nav.progress} body={p.progress} />;
}

export function TrophiesPlaceholder() {
  return <ComingSoon title={copy.nav.trophies} body={p.trophies} />;
}
