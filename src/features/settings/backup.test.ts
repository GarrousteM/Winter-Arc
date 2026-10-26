import 'fake-indexeddb/auto';
import { initialData, useAppStore, type AppData } from '@/app/store';
import { goalSuggestions } from '@/features/goals/suggestions';
import { backupFileName, buildBackup, parseBackup } from './backup';

function sampleData(): AppData {
  useAppStore.setState({ ...initialData });
  useAppStore.getState().setupArc({
    name: 'Winter Arc 2026',
    startDate: '2026-11-01',
    endDate: '2027-01-31',
    categories: [
      { name: 'Lecture', icon: 'book', colorToken: '--cat-3', goals: goalSuggestions.reading },
      { name: 'Sport', icon: 'barbell', colorToken: '--cat-1', goals: goalSuggestions.sport },
    ],
  });
  const s = useAppStore.getState();
  const [pages] = s.goals;
  if (!pages) throw new Error('objectif manquant');
  s.setCheckIn(pages.id, '2026-11-02', 25);
  s.setDayNote('2026-11-02', 'Froid');
  s.addRestDay('2026-12-24');
  const { arc, categories, goals, checkIns, dayNotes, restDays, player, preferences } =
    useAppStore.getState();
  return { arc, categories, goals, checkIns, dayNotes, restDays, player, preferences };
}

describe('sauvegarde', () => {
  it('restitue l’état à l’identique après un aller-retour JSON', () => {
    const data = sampleData();
    const text = JSON.stringify(buildBackup(data, new Date('2026-11-03T10:00:00Z')));
    const result = parseBackup(text);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.backup.data).toEqual(data);
  });

  it('refuse un fichier qui n’est pas du JSON', () => {
    expect(parseBackup('pas du json')).toEqual({ ok: false, error: 'json' });
  });

  it('refuse un JSON d’une autre app ou incomplet', () => {
    expect(parseBackup(JSON.stringify({ hello: 'world' }))).toEqual({ ok: false, error: 'format' });
    const broken = buildBackup(sampleData());
    expect(
      parseBackup(JSON.stringify({ ...broken, data: { ...broken.data, goals: [{ id: 1 }] } })),
    ).toEqual({
      ok: false,
      error: 'format',
    });
  });

  it('refuse une sauvegarde d’une version plus récente', () => {
    const backup = { ...buildBackup(sampleData()), schema: 99 };
    expect(parseBackup(JSON.stringify(backup))).toEqual({ ok: false, error: 'version' });
  });

  it('nomme le fichier avec la date', () => {
    expect(backupFileName('2026-11-03')).toBe('winter-arc-2026-11-03.json');
  });
});

describe('sauvegarde antérieure aux trêves', () => {
  it('accepte une sauvegarde du schéma 2 sans jours de trêve', () => {
    const { restDays: _restDays, ...rest } = sampleData();
    const result = parseBackup(
      JSON.stringify({ ...buildBackup({ ...rest, restDays: [] }), schema: 2, data: rest }),
    );
    expect(result.ok && result.backup.data.restDays).toEqual([]);
  });
});
