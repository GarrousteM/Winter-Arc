import { copy } from '@/copy';
import { today } from '@/lib/dates';
import type { Frequency, GoalType, TargetChange } from '@/lib/types';
import { rampOn, targetOn } from './goalModel';

const numberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function frequencyLabel(frequency: Frequency): string {
  switch (frequency.kind) {
    case 'daily':
      return copy.goalSummary.daily;
    case 'weekly':
      return copy.goalSummary.weekly(frequency.timesPerWeek);
    case 'days':
      return copy.goalSummary.days(
        [...frequency.days]
          .sort((a, b) => a - b)
          .map((d) => copy.goalForm.weekdayNames[d - 1]?.slice(0, 3) ?? '')
          .join(' · '),
      );
  }
}

/**
 * Résumé court d'un objectif, ex. « 8 000 pas · chaque jour » ou « 25 pompes · +5 / semaine ».
 * Avec un historique, la cible est celle du jour, progression comprise.
 */
export function goalSummary(goal: {
  type: GoalType;
  target?: number | undefined;
  targetHistory?: TargetChange[];
  unit?: string | undefined;
  frequency: Frequency;
}): string {
  const parts: string[] = [];
  const now = today();
  const current = goal.targetHistory
    ? targetOn({ target: goal.target, targetHistory: goal.targetHistory }, now)
    : goal.target;
  if (goal.type !== 'boolean' && current !== undefined) {
    const target = formatNumber(current);
    const unit = goal.unit ?? '';
    parts.push(
      goal.type === 'limit'
        ? copy.goalSummary.atMost(target, unit)
        : copy.goalSummary.atLeast(target, unit),
    );
    const ramp = goal.targetHistory
      ? rampOn({ targetHistory: goal.targetHistory }, now)
      : undefined;
    if (ramp) {
      const step = `${ramp.step > 0 ? '+' : '−'}${formatNumber(Math.abs(ramp.step))}`;
      parts.push(copy.goalSummary.ramp(step));
    }
  }
  parts.push(frequencyLabel(goal.frequency));
  return parts.join(' · ');
}
