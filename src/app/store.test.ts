import 'fake-indexeddb/auto';
import { goalSuggestions } from '@/features/goals/suggestions';
import { targetOn } from '@/features/goals/goalModel';
import { toISODate } from '@/lib/dates';
import { initialData, useAppStore } from './store';

function setup() {
  useAppStore.getState().setupArc({
    name: ' Winter Arc 2026 ',
    startDate: '2026-11-01',
    endDate: '2027-01-31',
    categories: [
      {
        name: 'Sport',
        icon: 'barbell',
        colorToken: '--cat-1',
        isDefault: true,
        goals: goalSuggestions.sport,
      },
      {
        name: 'Lecture',
        icon: 'book',
        colorToken: '--cat-3',
        isDefault: true,
        goals: goalSuggestions.reading,
      },
    ],
  });
}

describe('store', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 1, 9));
    useAppStore.setState({ ...initialData });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('crée l’Arc, les catégories et les objectifs en une fois', () => {
    setup();
    const s = useAppStore.getState();
    expect(s.arc?.name).toBe('Winter Arc 2026');
    expect(s.categories.map((c) => [c.name, c.order])).toEqual([
      ['Sport', 0],
      ['Lecture', 1],
    ]);
    expect(s.goals).toHaveLength(3);
    const pages = s.goals.find((g) => g.tag === 'reading-pages');
    expect(pages?.targetHistory).toEqual([{ from: '2026-11-01', target: 20 }]);
    expect(s.goals.find((g) => g.tag === 'workout')?.target).toBeUndefined();
  });

  it('change une cible sans toucher aux jours passés', () => {
    setup();
    const pages = useAppStore.getState().goals.find((g) => g.tag === 'reading-pages');
    if (!pages) throw new Error('objectif manquant');
    vi.setSystemTime(new Date(2026, 10, 10, 9));
    useAppStore.getState().updateGoal(pages.id, { ...pages, target: 30 });
    const updated = useAppStore.getState().goals.find((g) => g.id === pages.id);
    if (!updated) throw new Error('objectif manquant');
    expect(targetOn(updated, '2026-11-09')).toBe(20);
    expect(targetOn(updated, '2026-11-10')).toBe(30);
    expect(updated.tag).toBe('reading-pages');
  });

  it('réordonne et archive les catégories', () => {
    setup();
    const [sport, lecture] = useAppStore.getState().categories;
    if (!sport || !lecture) throw new Error('catégories manquantes');
    useAppStore.getState().moveCategory(lecture.id, -1);
    expect(
      [...useAppStore.getState().categories].sort((a, b) => a.order - b.order).map((c) => c.name),
    ).toEqual(['Lecture', 'Sport']);
    useAppStore.getState().setCategoryArchived(sport.id, true);
    expect(useAppStore.getState().categories.find((c) => c.id === sport.id)?.archived).toBe(true);
    expect(useAppStore.getState().goals.filter((g) => g.categoryId === sport.id)).toHaveLength(2);
  });

  it('met en pause et archive un objectif sans le supprimer', () => {
    setup();
    const goal = useAppStore.getState().goals[0];
    if (!goal) throw new Error('objectif manquant');
    useAppStore.getState().setGoalStatus(goal.id, 'paused');
    expect(useAppStore.getState().goals[0]?.status).toBe('paused');
    useAppStore.getState().setGoalStatus(goal.id, 'archived');
    expect(useAppStore.getState().goals).toHaveLength(3);
  });

  it('passe un objectif en oui / non et retire sa cible', () => {
    setup();
    const steps = useAppStore.getState().goals.find((g) => g.unit === 'pas');
    if (!steps) throw new Error('objectif manquant');
    useAppStore.getState().updateGoal(steps.id, { ...steps, type: 'boolean', unit: undefined });
    const updated = useAppStore.getState().goals.find((g) => g.id === steps.id);
    expect(updated?.target).toBeUndefined();
    expect(updated?.unit).toBeUndefined();
  });

  it('réinitialise tout', () => {
    setup();
    useAppStore.getState().resetAll();
    expect(useAppStore.getState().arc).toBeNull();
    expect(useAppStore.getState().goals).toEqual([]);
  });
});

describe('check-ins', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 1, 9));
    useAppStore.setState({ ...initialData });
    useAppStore.getState().setupArc({
      name: 'Arc',
      startDate: '2026-11-01',
      endDate: '2027-01-31',
      categories: [
        { name: 'Lecture', icon: 'book', colorToken: '--cat-3', goals: goalSuggestions.reading },
      ],
    });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const pagesId = () => useAppStore.getState().goals[0]?.id ?? '';

  it('crée une seule entrée par objectif et par jour, et recalcule `completed`', () => {
    const { setCheckIn } = useAppStore.getState();
    setCheckIn(pagesId(), '2026-11-02', 12);
    setCheckIn(pagesId(), '2026-11-02', 25);
    const list = useAppStore.getState().checkIns;
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ value: 25, completed: true });
  });

  it('efface une saisie', () => {
    const { setCheckIn } = useAppStore.getState();
    setCheckIn(pagesId(), '2026-11-02', 12);
    setCheckIn(pagesId(), '2026-11-02', undefined);
    expect(useAppStore.getState().checkIns).toEqual([]);
  });

  it('enregistre et efface la note du jour', () => {
    const { setDayNote } = useAppStore.getState();
    setDayNote('2026-11-02', '  Froid mais motivé ');
    expect(useAppStore.getState().dayNotes).toEqual([
      { date: '2026-11-02', text: 'Froid mais motivé' },
    ]);
    setDayNote('2026-11-02', '  ');
    expect(useAppStore.getState().dayNotes).toEqual([]);
  });
});

describe('Arc commencé avant l’installation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 3, 9));
    useAppStore.setState({ ...initialData });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('fait exister les objectifs de l’onboarding dès le début de l’Arc', () => {
    useAppStore.getState().setupArc({
      name: 'Arc',
      startDate: '2026-11-01',
      endDate: '2027-01-31',
      categories: [
        { name: 'Lecture', icon: 'book', colorToken: '--cat-3', goals: goalSuggestions.reading },
      ],
    });
    const goal = useAppStore.getState().goals[0];
    expect(goal && toISODate(new Date(goal.createdAt))).toBe('2026-11-01');
    expect(goal?.targetHistory).toEqual([{ from: '2026-11-01', target: 20 }]);
  });

  it('fait exister un objectif ajouté ensuite à partir d’aujourd’hui seulement', () => {
    useAppStore.getState().setupArc({
      name: 'Arc',
      startDate: '2026-11-01',
      endDate: '2027-01-31',
      categories: [{ name: 'Lecture', icon: 'book', colorToken: '--cat-3', goals: [] }],
    });
    const categoryId = useAppStore.getState().categories[0]?.id ?? '';
    const [pages] = goalSuggestions.reading;
    if (!pages) throw new Error('suggestion manquante');
    useAppStore.getState().addGoal({ ...pages, categoryId });
    const goal = useAppStore.getState().goals[0];
    expect(goal && toISODate(new Date(goal.createdAt))).toBe('2026-11-03');
  });
});
