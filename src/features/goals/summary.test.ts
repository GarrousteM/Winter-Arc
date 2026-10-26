import { goalSummary } from './summary';

describe('goalSummary', () => {
  it('résume une quantité quotidienne', () => {
    expect(
      goalSummary({ type: 'quantity', target: 8000, unit: 'pas', frequency: { kind: 'daily' } }),
    ).toBe('8 000 pas · chaque jour');
  });

  it('résume une limite', () => {
    expect(
      goalSummary({ type: 'limit', target: 120, unit: 'min', frequency: { kind: 'daily' } }),
    ).toBe('moins de 120 min · chaque jour');
  });

  it('résume un objectif hebdomadaire ou à jours fixes', () => {
    expect(goalSummary({ type: 'boolean', frequency: { kind: 'weekly', timesPerWeek: 5 } })).toBe(
      '5 fois / semaine',
    );
    expect(goalSummary({ type: 'boolean', frequency: { kind: 'days', days: [3, 1] } })).toBe(
      'Lun · Mer',
    );
  });
});
