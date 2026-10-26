import { copy } from '@/copy';
import type { Frequency, GoalType } from '@/lib/types';

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

/** Résumé court d'un objectif, ex. « 8 000 pas · chaque jour ». */
export function goalSummary(goal: {
  type: GoalType;
  target?: number | undefined;
  unit?: string | undefined;
  frequency: Frequency;
}): string {
  const parts: string[] = [];
  if (goal.type !== 'boolean' && goal.target !== undefined) {
    const target = formatNumber(goal.target);
    const unit = goal.unit ?? '';
    parts.push(
      goal.type === 'limit'
        ? copy.goalSummary.atMost(target, unit)
        : copy.goalSummary.atLeast(target, unit),
    );
  }
  parts.push(frequencyLabel(goal.frequency));
  return parts.join(' · ');
}
