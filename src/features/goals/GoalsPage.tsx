import {
  ArchiveIcon,
  ArrowCounterClockwiseIcon,
  CaretDownIcon,
  CaretUpIcon,
  PauseIcon,
  PencilSimpleIcon,
  PlayIcon,
  PlusIcon,
} from '@phosphor-icons/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/app/store';
import { copy } from '@/copy';
import { cn } from '@/lib/cn';
import type { Category, Goal } from '@/lib/types';
import { Button, IconButton } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { CategoryMarker } from '@/ui/CategoryMarker';
import { KnotDivider } from '@/ui/KnotDivider';
import { Sheet } from '@/ui/Sheet';
import { CategoryForm } from './CategoryForm';
import { iconFor } from './categoryIcons';
import { GoalEditSheet, type GoalSheetTarget } from './GoalEditSheet';
import { nextColorToken } from './goalModel';
import { goalSummary } from './summary';

const t = copy.goals;

type CategorySheet = { mode: 'new' } | { mode: 'edit'; category: Category };

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

export function GoalsPage() {
  const categories = useAppStore((s) => s.categories);
  const goals = useAppStore((s) => s.goals);
  const addCategory = useAppStore((s) => s.addCategory);
  const updateCategory = useAppStore((s) => s.updateCategory);
  const moveCategory = useAppStore((s) => s.moveCategory);
  const setCategoryArchived = useAppStore((s) => s.setCategoryArchived);
  const setGoalStatus = useAppStore((s) => s.setGoalStatus);
  const moveGoal = useAppStore((s) => s.moveGoal);
  const navigate = useNavigate();

  const [categorySheet, setCategorySheet] = useState<CategorySheet | null>(null);
  const [goalSheet, setGoalSheet] = useState<GoalSheetTarget | null>(null);

  const active = categories.filter((c) => !c.archived).sort(byOrder);
  const archivedCategories = categories.filter((c) => c.archived).sort(byOrder);
  const archivedGoals = goals.filter(
    (g) => g.status === 'archived' && active.some((c) => c.id === g.categoryId),
  );

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-black">{t.title}</h1>

      {active.map((category, index) => {
        const categoryGoals = goals
          .filter((g) => g.categoryId === category.id && g.status !== 'archived')
          .sort(byOrder);
        return (
          <section key={category.id} className="flex flex-col gap-2" aria-label={category.name}>
            <div className="flex items-center gap-1">
              <CategoryMarker
                className="flex-1"
                name={category.name}
                colorToken={category.colorToken}
                icon={iconFor(category.icon)}
              />
              <IconButton
                label={`${t.moveUp} ${category.name}`}
                disabled={index === 0}
                className="disabled:opacity-30"
                onClick={() => {
                  moveCategory(category.id, -1);
                }}
              >
                <CaretUpIcon size={20} />
              </IconButton>
              <IconButton
                label={`${t.moveDown} ${category.name}`}
                disabled={index === active.length - 1}
                className="disabled:opacity-30"
                onClick={() => {
                  moveCategory(category.id, 1);
                }}
              >
                <CaretDownIcon size={20} />
              </IconButton>
              <IconButton
                label={`${t.editCategory} ${category.name}`}
                onClick={() => {
                  setCategorySheet({ mode: 'edit', category });
                }}
              >
                <PencilSimpleIcon size={20} />
              </IconButton>
            </div>

            {categoryGoals.length === 0 && <p className="m-0 text-sm text-muted">{t.empty}</p>}

            {categoryGoals.map((goal, goalIndex) => (
              <GoalRow
                key={goal.id}
                goal={goal}
                colorToken={category.colorToken}
                first={goalIndex === 0}
                last={goalIndex === categoryGoals.length - 1}
                onEdit={() => {
                  void navigate(`/objectifs/${goal.id}`);
                }}
                onMove={(direction) => {
                  moveGoal(goal.id, direction);
                }}
              />
            ))}

            <Button
              variant="ghost"
              className="self-start px-2"
              icon={<PlusIcon size={18} />}
              onClick={() => {
                setGoalSheet({ mode: 'new', categoryId: category.id });
              }}
            >
              {t.addGoal}
            </Button>
          </section>
        );
      })}

      <Button
        variant="secondary"
        icon={<PlusIcon size={18} />}
        onClick={() => {
          setCategorySheet({ mode: 'new' });
        }}
      >
        {t.addCategory}
      </Button>

      <KnotDivider />

      <section className="flex flex-col gap-2">
        <h2 className="text-base text-muted">{t.archivedSection}</h2>
        {archivedCategories.length === 0 && archivedGoals.length === 0 && (
          <p className="m-0 text-sm text-muted">{t.archivedEmpty}</p>
        )}
        {archivedCategories.map((category) => (
          <Card key={category.id} className="flex items-center justify-between gap-3 py-2 pr-2">
            <div className="flex flex-col gap-1">
              <CategoryMarker
                name={category.name}
                colorToken={category.colorToken}
                icon={iconFor(category.icon)}
              />
              <span className="text-xs text-muted">{t.archivedCategory}</span>
            </div>
            <IconButton
              label={`${t.restore} ${category.name}`}
              onClick={() => {
                setCategoryArchived(category.id, false);
              }}
            >
              <ArrowCounterClockwiseIcon size={20} />
            </IconButton>
          </Card>
        ))}
        {archivedGoals.map((goal) => (
          <Card key={goal.id} className="flex items-center justify-between gap-3 py-2 pr-2">
            <div className="flex flex-col">
              <span className="font-medium text-muted">{goal.title}</span>
              <span className="text-xs text-muted">
                {categories.find((c) => c.id === goal.categoryId)?.name}
              </span>
            </div>
            <IconButton
              label={`${t.restore} ${goal.title}`}
              onClick={() => {
                setGoalStatus(goal.id, 'active');
              }}
            >
              <ArrowCounterClockwiseIcon size={20} />
            </IconButton>
          </Card>
        ))}
      </section>

      <Sheet
        open={categorySheet !== null}
        onOpenChange={(open) => {
          if (!open) setCategorySheet(null);
        }}
        title={
          categorySheet?.mode === 'edit' ? copy.categoryForm.editTitle : copy.categoryForm.newTitle
        }
        closeLabel={copy.goalForm.close}
        footer={
          <>
            {categorySheet?.mode === 'edit' && (
              <Button
                variant="danger"
                icon={<ArchiveIcon size={18} />}
                onClick={() => {
                  setCategoryArchived(categorySheet.category.id, true);
                  setCategorySheet(null);
                }}
              >
                {t.archive}
              </Button>
            )}
            <Button block type="submit" form="category-form" className="flex-1">
              {categorySheet?.mode === 'edit' ? copy.categoryForm.save : copy.categoryForm.create}
            </Button>
          </>
        }
      >
        {categorySheet && (
          <div className="flex flex-col gap-4">
            <CategoryForm
              key={categorySheet.mode === 'edit' ? categorySheet.category.id : 'new'}
              formId="category-form"
              initial={
                categorySheet.mode === 'edit'
                  ? categorySheet.category
                  : { name: '', icon: 'mountain', colorToken: nextColorToken(categories) }
              }
              onSubmit={(draft) => {
                if (categorySheet.mode === 'edit') {
                  updateCategory(categorySheet.category.id, draft);
                } else {
                  addCategory(draft);
                }
                setCategorySheet(null);
              }}
            />
            {categorySheet.mode === 'edit' && (
              <p className="m-0 text-sm text-muted">{t.historyKept}</p>
            )}
          </div>
        )}
      </Sheet>

      <GoalEditSheet
        target={goalSheet}
        onClose={() => {
          setGoalSheet(null);
        }}
      />
    </div>
  );
}

type GoalRowProps = {
  goal: Goal;
  colorToken: string;
  first: boolean;
  last: boolean;
  onEdit: () => void;
  onMove: (direction: -1 | 1) => void;
};

function GoalRow({ goal, colorToken, first, last, onEdit, onMove }: GoalRowProps) {
  const setGoalStatus = useAppStore((s) => s.setGoalStatus);
  const paused = goal.status === 'paused';
  return (
    <Card accentToken={colorToken} className="flex items-center gap-1 py-1 pr-1">
      <button
        type="button"
        onClick={onEdit}
        className="flex min-h-touch min-w-0 flex-1 flex-col items-start justify-center py-1 text-left"
      >
        <span className={cn('font-medium', paused && 'text-muted')}>{goal.title}</span>
        <span className="text-sm text-muted">
          {paused ? `${t.paused} · ` : ''}
          {goalSummary(goal)}
        </span>
      </button>
      <IconButton
        label={`${paused ? t.resume : t.pause} ${goal.title}`}
        onClick={() => {
          setGoalStatus(goal.id, paused ? 'active' : 'paused');
        }}
      >
        {paused ? <PlayIcon size={20} /> : <PauseIcon size={20} />}
      </IconButton>
      <IconButton
        label={`${t.moveUp} ${goal.title}`}
        disabled={first}
        className="disabled:opacity-30"
        onClick={() => {
          onMove(-1);
        }}
      >
        <CaretUpIcon size={16} />
      </IconButton>
      <IconButton
        label={`${t.moveDown} ${goal.title}`}
        disabled={last}
        className="disabled:opacity-30"
        onClick={() => {
          onMove(1);
        }}
      >
        <CaretDownIcon size={16} />
      </IconButton>
    </Card>
  );
}
