import { CaretLeftIcon, CheckIcon, PencilSimpleIcon, PlusIcon, XIcon } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/app/store';
import { copy } from '@/copy';
import { CategoryForm, type CategoryDraft } from '@/features/goals/CategoryForm';
import { iconFor } from '@/features/goals/categoryIcons';
import { GoalForm } from '@/features/goals/GoalForm';
import { nextColorToken, type GoalDraft } from '@/features/goals/goalModel';
import {
  defaultCategories,
  goalSuggestions,
  type GoalSuggestion,
} from '@/features/goals/suggestions';
import { goalSummary } from '@/features/goals/summary';
import { cn } from '@/lib/cn';
import {
  dayNumber,
  daysInclusive,
  defaultArcDates,
  formatLongDate,
  isValidISODate,
  today,
} from '@/lib/dates';
import { newId } from '@/lib/id';
import { durations, easeHeavy, usePrefersReducedMotion } from '@/lib/motion';
import { FimbulLogo } from '@/ui/FimbulLogo';
import { Button, IconButton } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { CategoryMarker } from '@/ui/CategoryMarker';
import { Field, TextInput } from '@/ui/Field';
import { KnotDivider } from '@/ui/KnotDivider';
import { RuneRow } from '@/ui/Rune';
import { Sheet } from '@/ui/Sheet';
import { SnowField } from '@/ui/SnowField';

const t = copy.onboarding;
const TOTAL_STEPS = 4;
const MIN_ARC_DAYS = 8;

type GoalItem = { id: string; draft: GoalSuggestion };

type DraftCategory = CategoryDraft & {
  key: string;
  isDefault: boolean;
  selected: boolean;
  goals: GoalItem[];
};

type GoalEditing = { categoryKey: string; goalId: string | null };

function initialCategories(): DraftCategory[] {
  return defaultCategories.map((c) => ({
    key: c.key,
    name: c.name,
    icon: c.icon,
    colorToken: c.colorToken,
    isDefault: true,
    selected: true,
    goals: goalSuggestions[c.key].map((draft) => ({ id: newId(), draft })),
  }));
}

function blankGoal(categoryKey: string): GoalDraft {
  return {
    title: '',
    categoryId: categoryKey,
    type: 'boolean',
    frequency: { kind: 'daily' },
    difficulty: 2,
  };
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const setupArc = useAppStore((s) => s.setupArc);
  const defaults = defaultArcDates();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(t.arc.defaultName(defaults.year));
  const [start, setStart] = useState(defaults.start);
  const [end, setEnd] = useState(defaults.end);
  const [categories, setCategories] = useState<DraftCategory[]>(initialCategories);
  const [showErrors, setShowErrors] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalEditing | null>(null);

  const selected = categories.filter((c) => c.selected);
  const datesValid =
    isValidISODate(start) && isValidISODate(end) && daysInclusive(start, end) >= MIN_ARC_DAYS;
  const totalDays = datesValid ? daysInclusive(start, end) : 0;
  const missingGoals = selected.filter((c) => c.goals.length === 0);

  const stepValid =
    step === 1
      ? name.trim() !== '' && datesValid
      : step === 2
        ? selected.length > 0
        : step === 3
          ? missingGoals.length === 0
          : true;

  const next = () => {
    if (!stepValid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  const back = () => {
    setShowErrors(false);
    setStep((s) => Math.max(1, s - 1));
  };

  const launch = () => {
    setupArc({
      name,
      startDate: start,
      endDate: end,
      categories: selected.map((c) => ({
        name: c.name,
        icon: c.icon,
        colorToken: c.colorToken,
        isDefault: c.isDefault,
        goals: c.goals.map((g) => g.draft),
      })),
    });
    void navigate('/', { replace: true });
  };

  const updateCategory = (key: string, update: (c: DraftCategory) => DraftCategory) => {
    setCategories((list) => list.map((c) => (c.key === key ? update(c) : c)));
  };

  const editingCategory = editingGoal
    ? categories.find((c) => c.key === editingGoal.categoryKey)
    : undefined;
  const editingItem =
    editingGoal && editingCategory
      ? editingCategory.goals.find((g) => g.id === editingGoal.goalId)
      : undefined;

  const saveGoal = (draft: GoalDraft) => {
    if (!editingGoal) return;
    const { categoryId: _categoryId, ...rest } = draft;
    const tag = editingItem?.draft.tag;
    const value: GoalSuggestion = tag ? { ...rest, tag } : rest;
    updateCategory(editingGoal.categoryKey, (c) => ({
      ...c,
      goals: editingItem
        ? c.goals.map((g) => (g.id === editingItem.id ? { ...g, draft: value } : g))
        : [...c.goals, { id: newId(), draft: value }],
    }));
    setEditingGoal(null);
  };

  if (step === TOTAL_STEPS) {
    const goalCount = selected.reduce((n, c) => n + c.goals.length, 0);
    return (
      <LaunchScreen
        name={name}
        totalDays={totalDays}
        startsInFuture={dayNumber(start, today()) < 1}
        startLabel={formatLongDate(start)}
        summary={t.launch.summary(selected.length, goalCount)}
        onBack={back}
        onLaunch={launch}
      />
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
      <header className="flex items-center gap-2 px-4 pt-4">
        {step > 1 ? (
          <IconButton label={t.back} onClick={back}>
            <CaretLeftIcon size={22} />
          </IconButton>
        ) : (
          <span className="min-w-touch" />
        )}
        <span className="eyebrow flex-1 text-center">{t.stepOf(step, TOTAL_STEPS)}</span>
        <span className="min-w-touch" />
      </header>
      <StepDots step={step} />

      <main className="flex flex-1 flex-col gap-6 px-4 pt-6 pb-32">
        {step === 1 && (
          <>
            <div className="flex flex-col items-center gap-1 text-center">
              <FimbulLogo size={96} />
              <span className="font-display text-3xl font-black uppercase tracking-display">
                {copy.app.name}
              </span>
              <span className="text-sm text-muted">{copy.app.tagline}</span>
            </div>
            <StepTitle title={t.arc.title} intro={t.arc.intro} />
            <Field
              label={t.arc.name}
              error={showErrors && name.trim() === '' ? t.arc.errorName : undefined}
            >
              {({ id, describedBy, invalid }) => (
                <TextInput
                  id={id}
                  value={name}
                  maxLength={40}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  autoComplete="off"
                />
              )}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t.arc.start}>
                {({ id }) => (
                  <TextInput
                    id={id}
                    type="date"
                    value={start}
                    onChange={(e) => {
                      setStart(e.target.value);
                    }}
                  />
                )}
              </Field>
              <Field label={t.arc.end}>
                {({ id }) => (
                  <TextInput
                    id={id}
                    type="date"
                    value={end}
                    min={start}
                    onChange={(e) => {
                      setEnd(e.target.value);
                    }}
                  />
                )}
              </Field>
            </div>
            {datesValid ? (
              <p className="m-0 flex items-baseline gap-2">
                <span className="numeric text-5xl text-accent">{totalDays}</span>
                <span className="eyebrow">{t.arc.daysUnit}</span>
              </p>
            ) : (
              <p className="m-0 text-sm text-warning">{t.arc.errorDates}</p>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <StepTitle title={t.categories.title} intro={t.categories.intro} />
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {categories.map((c) => (
                <li key={c.key}>
                  <button
                    type="button"
                    aria-pressed={c.selected}
                    onClick={() => {
                      updateCategory(c.key, (x) => ({ ...x, selected: !x.selected }));
                    }}
                    className={cn(
                      'flex min-h-touch w-full items-center justify-between gap-3 rounded border px-4 py-3 text-left transition-colors duration-fast ease-heavy',
                      c.selected ? 'border-accent bg-surface-raised' : 'border-border bg-surface',
                    )}
                  >
                    <CategoryMarker
                      name={c.name}
                      colorToken={c.colorToken}
                      icon={iconFor(c.icon)}
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded border',
                        c.selected ? 'border-accent bg-accent text-on-accent' : 'border-border',
                      )}
                    >
                      {c.selected && <CheckIcon size={16} />}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <Button
              variant="secondary"
              icon={<PlusIcon size={18} />}
              onClick={() => {
                setAddingCategory(true);
              }}
            >
              {t.categories.add}
            </Button>
            {showErrors && selected.length === 0 && (
              <p className="m-0 text-sm text-warning">{t.categories.errorNone}</p>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <StepTitle title={t.goals.title} intro={t.goals.intro} />
            {selected.map((c) => (
              <section key={c.key} className="flex flex-col gap-2">
                <CategoryMarker name={c.name} colorToken={c.colorToken} icon={iconFor(c.icon)} />
                {c.goals.map((g) => (
                  <Card
                    key={g.id}
                    accentToken={c.colorToken}
                    className="flex items-center gap-2 py-2 pr-1"
                  >
                    <button
                      type="button"
                      className="flex min-h-touch flex-1 flex-col items-start justify-center text-left"
                      onClick={() => {
                        setEditingGoal({ categoryKey: c.key, goalId: g.id });
                      }}
                    >
                      <span className="font-medium">{g.draft.title}</span>
                      <span className="text-sm text-muted">{goalSummary(g.draft)}</span>
                    </button>
                    <IconButton
                      label={`${t.goals.edit} ${g.draft.title}`}
                      onClick={() => {
                        setEditingGoal({ categoryKey: c.key, goalId: g.id });
                      }}
                    >
                      <PencilSimpleIcon size={20} />
                    </IconButton>
                    <IconButton
                      label={`${t.goals.remove} ${g.draft.title}`}
                      onClick={() => {
                        updateCategory(c.key, (x) => ({
                          ...x,
                          goals: x.goals.filter((item) => item.id !== g.id),
                        }));
                      }}
                    >
                      <XIcon size={20} />
                    </IconButton>
                  </Card>
                ))}
                <Button
                  variant="ghost"
                  className="self-start px-2"
                  icon={<PlusIcon size={18} />}
                  onClick={() => {
                    setEditingGoal({ categoryKey: c.key, goalId: null });
                  }}
                >
                  {t.goals.add}
                </Button>
              </section>
            ))}
            {showErrors && missingGoals.length > 0 && (
              <p className="m-0 text-sm text-warning">
                {t.goals.errorMissing(missingGoals.map((c) => c.name).join(', '))}
              </p>
            )}
          </>
        )}
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-bg px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-xl">
          <Button block onClick={next}>
            {t.next}
          </Button>
        </div>
      </footer>

      <Sheet
        open={addingCategory}
        onOpenChange={setAddingCategory}
        title={copy.categoryForm.newTitle}
        closeLabel={copy.goalForm.close}
        footer={
          <Button block type="submit" form="onboarding-category">
            {copy.categoryForm.create}
          </Button>
        }
      >
        <CategoryForm
          formId="onboarding-category"
          initial={{
            name: '',
            icon: 'mountain',
            colorToken: nextColorToken(selected.map((c) => ({ ...c, archived: false }))),
          }}
          onSubmit={(draft) => {
            setCategories((list) => [
              ...list,
              { ...draft, key: newId(), isDefault: false, selected: true, goals: [] },
            ]);
            setAddingCategory(false);
          }}
        />
      </Sheet>

      <Sheet
        open={editingGoal !== null}
        onOpenChange={(open) => {
          if (!open) setEditingGoal(null);
        }}
        title={editingItem ? copy.goalForm.editTitle : copy.goalForm.newTitle}
        closeLabel={copy.goalForm.close}
        footer={
          <Button block type="submit" form="onboarding-goal">
            {editingItem ? copy.goalForm.save : copy.goalForm.create}
          </Button>
        }
      >
        {editingGoal && (
          <GoalForm
            key={`${editingGoal.categoryKey}-${editingGoal.goalId ?? 'new'}`}
            formId="onboarding-goal"
            initial={
              editingItem
                ? { ...editingItem.draft, categoryId: editingGoal.categoryKey }
                : blankGoal(editingGoal.categoryKey)
            }
            onSubmit={saveGoal}
          />
        )}
      </Sheet>
    </div>
  );
}

function StepTitle({ title, intro }: { title: string; intro: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-black">{title}</h1>
      <p className="m-0 text-muted">{intro}</p>
    </div>
  );
}

function StepDots({ step }: { step: number }) {
  return (
    <div aria-hidden="true" className="flex justify-center gap-2 px-4 pt-2">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <span key={i} className={cn('h-px w-10', i < step ? 'bg-accent' : 'bg-border')} />
      ))}
    </div>
  );
}

type LaunchScreenProps = {
  name: string;
  totalDays: number;
  startsInFuture: boolean;
  startLabel: string;
  summary: string;
  onBack: () => void;
  onLaunch: () => void;
};

function Reveal({ delay, children }: { delay: number; children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: durations.base * 2, delay: reduced ? 0 : delay, ease: easeHeavy }}
    >
      {children}
    </motion.div>
  );
}

function LaunchScreen({
  name,
  totalDays,
  startsInFuture,
  startLabel,
  summary,
  onBack,
  onLaunch,
}: LaunchScreenProps) {
  const reduced = usePrefersReducedMotion();
  return (
    <div className="relative mx-auto flex min-h-dvh max-w-xl flex-col px-4">
      <SnowField />
      <header className="relative flex items-center pt-4">
        <IconButton label={t.back} onClick={onBack}>
          <CaretLeftIcon size={22} />
        </IconButton>
      </header>
      <main className="relative flex flex-1 flex-col items-center justify-center gap-6 pb-32 text-center">
        <RuneRow lit />
        <Reveal delay={0.9}>
          <span className="eyebrow">{t.launch.eyebrow}</span>
        </Reveal>
        <Reveal delay={1.1}>
          <h1 className="text-2xl font-black">{name}</h1>
        </Reveal>
        <motion.div
          className="flex items-baseline gap-3"
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: durations.reward, delay: reduced ? 0 : 1.3, ease: easeHeavy }}
        >
          <span className="font-display text-lg font-bold uppercase tracking-display text-muted">
            {t.launch.day}
          </span>
          <span className="numeric text-8xl text-text">1</span>
          <span className="numeric text-4xl text-muted">/ {totalDays}</span>
        </motion.div>
        <Reveal delay={1.8}>
          <div className="flex flex-col gap-1">
            {startsInFuture && <span className="text-frost">{t.launch.startsOn(startLabel)}</span>}
            <span className="text-sm text-muted">{summary}</span>
          </div>
        </Reveal>
        <KnotDivider className="w-full" />
      </main>
      <footer className="fixed inset-x-0 bottom-0 z-10 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-xl">
          <Button block onClick={onLaunch}>
            {t.launch.cta}
          </Button>
        </div>
      </footer>
    </div>
  );
}
