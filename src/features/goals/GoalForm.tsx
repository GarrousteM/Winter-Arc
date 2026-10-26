import { useState, type FormEvent } from 'react';
import { copy } from '@/copy';
import type { Category, Difficulty, Frequency, GoalType, Weekday } from '@/lib/types';
import { cn } from '@/lib/cn';
import { Field, TextInput } from '@/ui/Field';
import { Segmented, ToggleChip } from '@/ui/Segmented';
import { iconFor } from './categoryIcons';
import { needsTarget, validateGoalDraft, type GoalDraft, type GoalDraftError } from './goalModel';

const t = copy.goalForm;

type GoalFormProps = {
  formId: string;
  initial: GoalDraft;
  /** Catégories proposées ; si absent, la catégorie de `initial` est conservée. */
  categories?: Pick<Category, 'id' | 'name' | 'icon' | 'colorToken'>[];
  /** Affiche l'avertissement sur le changement de cible (édition d'un objectif existant). */
  editing?: boolean;
  onSubmit: (draft: GoalDraft) => void;
};

const XP_BY_DIFFICULTY: Record<Difficulty, number> = { 1: 10, 2: 20, 3: 30 };
const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 7];

function parseNumber(value: string): number | undefined {
  const n = Number(value.replace(',', '.'));
  return value.trim() === '' || !Number.isFinite(n) ? undefined : n;
}

export function GoalForm({
  formId,
  initial,
  categories,
  editing = false,
  onSubmit,
}: GoalFormProps) {
  const [title, setTitle] = useState(initial.title);
  const [categoryId, setCategoryId] = useState(initial.categoryId);
  const [type, setType] = useState<GoalType>(initial.type);
  const [target, setTarget] = useState(initial.target?.toString() ?? '');
  const [unit, setUnit] = useState(initial.unit ?? '');
  const [step, setStep] = useState(initial.step?.toString() ?? '');
  const [frequencyKind, setFrequencyKind] = useState<Frequency['kind']>(initial.frequency.kind);
  const [timesPerWeek, setTimesPerWeek] = useState(
    initial.frequency.kind === 'weekly' ? initial.frequency.timesPerWeek : 5,
  );
  const [days, setDays] = useState<Weekday[]>(
    initial.frequency.kind === 'days' ? initial.frequency.days : [1, 3, 5],
  );
  const [difficulty, setDifficulty] = useState<Difficulty>(initial.difficulty);
  const [errors, setErrors] = useState<GoalDraftError[]>([]);

  const frequency: Frequency =
    frequencyKind === 'daily'
      ? { kind: 'daily' }
      : frequencyKind === 'weekly'
        ? { kind: 'weekly', timesPerWeek }
        : { kind: 'days', days: [...days].sort((a, b) => a - b) };

  const withTarget = needsTarget(type);
  const parsedTarget = parseNumber(target);
  const targetChanged = editing && withTarget && parsedTarget !== initial.target;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const draft: GoalDraft = {
      title,
      categoryId,
      type,
      frequency,
      difficulty,
      ...(withTarget
        ? { target: parsedTarget, unit: unit.trim() || undefined, step: parseNumber(step) }
        : {}),
    };
    const found = validateGoalDraft(draft);
    setErrors(found);
    if (found.length === 0) onSubmit(draft);
  };

  const errorFor = (key: GoalDraftError) => (errors.includes(key) ? t.errors[key] : undefined);

  return (
    <form id={formId} onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <Field label={t.title} error={errorFor('title')}>
        {({ id, describedBy, invalid }) => (
          <TextInput
            id={id}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            autoComplete="off"
            maxLength={60}
          />
        )}
      </Field>

      {categories && categories.length > 1 && (
        <fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
          <legend className="eyebrow mb-1.5">{t.category}</legend>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const IconCmp = iconFor(c.icon);
              const selected = c.id === categoryId;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setCategoryId(c.id);
                  }}
                  className={cn(
                    'inline-flex min-h-touch items-center gap-2 rounded border px-3 text-sm font-medium transition-colors duration-fast ease-heavy',
                    selected
                      ? 'border-accent bg-surface-raised text-text'
                      : 'border-border bg-bg text-muted',
                  )}
                >
                  <IconCmp size={16} color={`var(${c.colorToken})`} />
                  {c.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="eyebrow">{t.type}</span>
        <Segmented
          label={t.type}
          value={type}
          onChange={setType}
          options={(['boolean', 'quantity', 'limit'] as const).map((value) => ({
            value,
            label: t.types[value],
          }))}
        />
        <p className="m-0 text-sm text-muted">{t.typeHints[type]}</p>
      </div>

      {withTarget && (
        <div className="grid grid-cols-[1fr_1fr_1fr] gap-3">
          <Field label={t.target} error={errorFor('target')} className="col-span-1">
            {({ id, describedBy, invalid }) => (
              <TextInput
                id={id}
                inputMode="decimal"
                value={target}
                onChange={(e) => {
                  setTarget(e.target.value);
                }}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                className="numeric text-lg"
              />
            )}
          </Field>
          <Field label={t.unit}>
            {({ id }) => (
              <TextInput
                id={id}
                value={unit}
                onChange={(e) => {
                  setUnit(e.target.value);
                }}
                maxLength={12}
                autoComplete="off"
              />
            )}
          </Field>
          <Field label={t.step}>
            {({ id }) => (
              <TextInput
                id={id}
                inputMode="decimal"
                value={step}
                onChange={(e) => {
                  setStep(e.target.value);
                }}
                className="numeric text-lg"
              />
            )}
          </Field>
          {targetChanged && (
            <p className="col-span-3 m-0 text-sm text-frost">{t.targetChangeHint}</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="eyebrow">{t.frequency}</span>
        <Segmented
          label={t.frequency}
          value={frequencyKind}
          onChange={setFrequencyKind}
          options={(['daily', 'weekly', 'days'] as const).map((value) => ({
            value,
            label: t.frequencies[value],
          }))}
        />
        {frequencyKind === 'weekly' && (
          <div role="group" aria-label={t.timesPerWeek} className="flex flex-wrap gap-2 pt-1">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <ToggleChip
                key={n}
                label={String(n)}
                pressed={timesPerWeek === n}
                onPressedChange={() => {
                  setTimesPerWeek(n);
                }}
                className="numeric text-base"
              />
            ))}
          </div>
        )}
        {frequencyKind === 'days' && (
          <div className="flex flex-wrap gap-2 pt-1">
            {WEEKDAYS.map((d) => (
              <ToggleChip
                key={d}
                label={t.weekdays[d - 1] ?? ''}
                ariaLabel={t.weekdayNames[d - 1]}
                pressed={days.includes(d)}
                onPressedChange={(pressed) => {
                  setDays((current) =>
                    pressed ? [...current, d] : current.filter((x) => x !== d),
                  );
                }}
              />
            ))}
          </div>
        )}
        {errorFor('frequency') && (
          <p className="m-0 text-sm text-warning">{errorFor('frequency')}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="eyebrow">{t.difficulty}</span>
        <Segmented
          label={t.difficulty}
          value={difficulty}
          onChange={setDifficulty}
          options={([1, 2, 3] as const).map((value) => ({
            value,
            label: `${t.difficulties[value]} · ${t.xp(XP_BY_DIFFICULTY[value])}`,
          }))}
        />
      </div>
    </form>
  );
}
