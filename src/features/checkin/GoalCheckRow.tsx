import { AnimatePresence, motion } from 'framer-motion';
import { copy } from '@/copy';
import { formatNumber, goalSummary } from '@/features/goals/summary';
import { cn } from '@/lib/cn';
import { durations, easeHeavy } from '@/lib/motion';
import { CheckToggle } from '@/ui/CheckToggle';
import { ProgressBar } from '@/ui/ProgressBar';
import { Stepper } from '@/ui/Stepper';
import type { GoalDayState } from './dayModel';

const t = copy.today;

/** Pas par défaut si l'objectif n'en définit pas. */
const DEFAULT_STEP = 1;

type GoalCheckRowProps = {
  state: GoalDayState;
  colorToken: string;
  onChange: (value: number | undefined) => void;
  /** Gain d'XP à afficher brièvement ; la clé change à chaque nouveau gain. */
  gain: { xp: number; key: number } | undefined;
  /** Appelé à la fin de l'animation du gain, pour ne pas la rejouer. */
  onGainShown: () => void;
};

function subtitle(state: GoalDayState): string {
  const { goal, weekly } = state;
  if (weekly) {
    if (weekly.done >= weekly.times) return t.weeklyDone;
    const text = t.weekly(weekly.done, weekly.times);
    return state.counts ? text : `${text} · ${t.restDay}`;
  }
  return goalSummary(goal);
}

function valueLine(state: GoalDayState): string {
  const { value, target, goal, nextTarget } = state;
  const unit = goal.unit ?? '';
  if (value === undefined || target === undefined) {
    // Progression hebdomadaire : cible du jour et marche de lundi, même sans saisie.
    return nextTarget !== undefined && target !== undefined
      ? `${t.notEntered} · ${t.rampToday(formatNumber(target), formatNumber(nextTarget), unit)}`
      : t.notEntered;
  }
  const line =
    goal.type === 'limit'
      ? t.limitValue(formatNumber(value), formatNumber(target), unit)
      : t.progressValue(formatNumber(value), formatNumber(target), unit);
  return nextTarget === undefined
    ? line
    : `${line} · ${t.nextTarget(formatNumber(nextTarget), '')}`;
}

function XpGain({ gain, onDone }: { gain: GoalCheckRowProps['gain']; onDone: () => void }) {
  return (
    <AnimatePresence>
      {gain && gain.xp > 0 && (
        <motion.span
          key={gain.key}
          aria-hidden="true"
          className="numeric pointer-events-none absolute right-3 top-1 text-lg text-accent"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: [0, 1, 1, 0], y: -18 }}
          transition={{ duration: durations.reward, ease: easeHeavy, times: [0, 0.15, 0.7, 1] }}
          onAnimationComplete={onDone}
        >
          {t.xpGain(gain.xp)}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export function GoalCheckRow({
  state,
  colorToken,
  onChange,
  gain,
  onGainShown,
}: GoalCheckRowProps) {
  const { goal, completed, value, target } = state;

  if (goal.type === 'boolean') {
    return (
      <div className="relative flex min-h-14 items-center gap-3 border-b border-surface-raised py-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className={cn('font-medium', completed && 'text-muted line-through')}>
            {goal.title}
          </span>
          <span
            className={cn('text-sm', state.weekly && state.counts ? 'text-frost' : 'text-muted')}
          >
            {subtitle(state)}
          </span>
        </div>
        <CheckToggle
          checked={completed}
          label={goal.title}
          colorToken={colorToken}
          onChange={(checked) => {
            onChange(checked ? 1 : undefined);
          }}
        />
        <XpGain gain={gain} onDone={onGainShown} />
      </div>
    );
  }

  const ratio = value !== undefined && target ? value / target : 0;
  const over = goal.type === 'limit' && value !== undefined && !completed;
  return (
    <div className="relative flex flex-col gap-2 border-b border-surface-raised py-2">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-medium">{goal.title}</span>
          <span
            className={cn(
              'text-sm',
              over ? 'text-warning' : completed ? 'text-success' : 'text-muted',
            )}
          >
            {over ? `${valueLine(state)} · ${t.overLimit}` : valueLine(state)}
          </span>
        </div>
        <Stepper
          value={value}
          step={goal.step ?? DEFAULT_STEP}
          label={goal.title}
          onChange={onChange}
        />
      </div>
      <ProgressBar
        thin
        value={ratio}
        label={goal.title}
        colorToken={over ? '--color-warning' : completed ? '--color-success' : colorToken}
      />
      <XpGain gain={gain} onDone={onGainShown} />
    </div>
  );
}
