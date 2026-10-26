import {
  BarbellIcon,
  BookOpenIcon,
  ForkKnifeIcon,
  BrainIcon,
  CoinsIcon,
  DeviceMobileSlashIcon,
  FireIcon,
  FootprintsIcon,
  MoonIcon,
  SkullIcon,
  SnowflakeIcon,
  SwordIcon,
  TargetIcon,
  TrophyIcon,
  type Icon,
} from '@phosphor-icons/react';
import { useState, type ReactNode } from 'react';
import { copy } from '@/copy';
import { contrastLevel, contrastRatio, type ContrastLevel } from '@/lib/contrast';
import { AppHeader } from '@/ui/AppHeader';
import { Badge } from '@/ui/Badge';
import { BossPlaceholder } from '@/ui/BossPlaceholder';
import { BottomNav } from '@/ui/BottomNav';
import { Button, IconButton } from '@/ui/Button';
import { Card, CarvedCard } from '@/ui/Card';
import { CategoryMarker } from '@/ui/CategoryMarker';
import { CheckToggle } from '@/ui/CheckToggle';
import { KnotDivider } from '@/ui/KnotDivider';
import { ProgressBar } from '@/ui/ProgressBar';
import { ProgressRing } from '@/ui/ProgressRing';
import { RuneRow } from '@/ui/Rune';
import { futhark } from '@/ui/runes';
import { SnowField } from '@/ui/SnowField';
import { Stepper } from '@/ui/Stepper';
import { XpBar } from '@/ui/XpBar';
import { Field, TextInput } from '@/ui/Field';
import { Segmented, ToggleChip } from '@/ui/Segmented';
import { Sheet } from '@/ui/Sheet';

const sg = copy.styleguide;

const baseTokens = [
  { token: '--color-bg', name: 'Nuit polaire' },
  { token: '--color-surface', name: 'Pierre sombre' },
  { token: '--color-surface-raised', name: 'Pierre surélevée' },
  { token: '--color-border', name: 'Fer froid' },
  { token: '--color-text', name: 'Neige' },
  { token: '--color-text-muted', name: 'Brume' },
  { token: '--color-accent', name: 'Or viking' },
  { token: '--color-frost', name: 'Glace' },
  { token: '--color-frost-deep', name: 'Acier des fjords' },
  { token: '--color-sky', name: 'Ciel polaire' },
  { token: '--color-success', name: 'Aurore verte' },
  { token: '--color-warning', name: 'Torche' },
];

const categoryTokens: { token: string; name: string; label: string; icon: Icon }[] = [
  { token: '--cat-1', name: 'Braise', label: copy.samples.categorySport, icon: BarbellIcon },
  { token: '--cat-2', name: 'Lichen', label: copy.samples.categoryNutrition, icon: ForkKnifeIcon },
  { token: '--cat-3', name: 'Fjord', label: copy.samples.categoryReading, icon: BookOpenIcon },
  {
    token: '--cat-4',
    name: 'Givre',
    label: copy.samples.categoryScreen,
    icon: DeviceMobileSlashIcon,
  },
  { token: '--cat-5', name: 'Cuir', label: copy.samples.categoryExtra1, icon: CoinsIcon },
  { token: '--cat-6', name: 'Crépuscule', label: copy.samples.categoryExtra2, icon: MoonIcon },
];

const backgrounds = [
  { token: '--color-bg', label: sg.contrast.onBg },
  { token: '--color-surface', label: sg.contrast.onSurface },
  { token: '--color-surface-raised', label: sg.contrast.onRaised },
];

const icons: Icon[] = [
  BarbellIcon,
  FootprintsIcon,
  ForkKnifeIcon,
  BookOpenIcon,
  DeviceMobileSlashIcon,
  MoonIcon,
  BrainIcon,
  CoinsIcon,
  FireIcon,
  SnowflakeIcon,
  SwordIcon,
  SkullIcon,
  TrophyIcon,
  TargetIcon,
];

function readToken(token: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}

function useTokenValues(tokens: string[]): Record<string, string> {
  // Les feuilles de style sont chargées avant le premier rendu : lecture unique.
  const [values] = useState(() => Object.fromEntries(tokens.map((t) => [t, readToken(t)])));
  return values;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg">{title}</h2>
      {children}
    </section>
  );
}

function Swatch({
  token,
  name,
  value,
}: {
  token: string;
  name: string;
  value: string | undefined;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="h-11 w-11 shrink-0 rounded border border-border"
        style={{ background: `var(${token})` }}
      />
      <div className="flex min-w-0 flex-col">
        <span className="text-sm font-medium">{name}</span>
        <code className="numeric text-sm text-muted">
          {token} · {value}
        </code>
      </div>
    </div>
  );
}

const verdictLabel: Record<ContrastLevel, string> = {
  'aa-text': sg.contrast.aaText,
  'aa-ui': sg.contrast.aaUi,
  fail: sg.contrast.fail,
};

const verdictClass: Record<ContrastLevel, string> = {
  'aa-text': 'text-success',
  'aa-ui': 'text-frost',
  fail: 'text-warning',
};

function ContrastTable({ values }: { values: Record<string, string> }) {
  const foregrounds = [
    ...baseTokens.filter(
      (t) =>
        !backgrounds.some((b) => b.token === t.token) &&
        !['--color-border', '--color-frost-deep', '--color-sky'].includes(t.token),
    ),
    ...categoryTokens,
  ];
  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="py-2 pr-3 font-medium">{sg.contrast.foreground}</th>
              {backgrounds.map((bg) => (
                <th key={bg.token} className="px-2 py-2 text-xs font-medium">
                  <span
                    className="mr-1 inline-block h-3 w-3 border border-border align-middle"
                    style={{ background: `var(${bg.token})` }}
                  />
                  {bg.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {foregrounds.map(({ token, name }) => (
              <tr key={token} className="border-b border-border">
                <td className="py-2 pr-3">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 shrink-0" style={{ background: `var(${token})` }} />
                    {name}
                  </span>
                </td>
                {backgrounds.map(({ token: bg }) => {
                  const fg = values[token];
                  const bgValue = values[bg];
                  if (!fg || !bgValue) return <td key={bg} />;
                  const ratio = contrastRatio(fg, bgValue);
                  const level = contrastLevel(ratio);
                  return (
                    <td key={bg} className="px-2 py-2">
                      <span className={`numeric text-base ${verdictClass[level]}`}>
                        {ratio.toFixed(2)}
                      </span>
                      <span className="block text-[0.625rem] text-muted">
                        {verdictLabel[level]}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">{sg.contrast.note}</p>
    </div>
  );
}

export function StyleguidePage() {
  const values = useTokenValues([
    ...baseTokens.map((t) => t.token),
    ...categoryTokens.map((t) => t.token),
  ]);
  const [sugar, setSugar] = useState(true);
  const [workout, setWorkout] = useState(false);
  const [pages, setPages] = useState<number | undefined>(14);
  const [screen, setScreen] = useState<number | undefined>(undefined);
  const [runePlay, setRunePlay] = useState(0);
  const [textValue, setTextValue] = useState<string>(copy.samples.goalQuantity);
  const [segment, setSegment] = useState<'daily' | 'weekly' | 'days'>('daily');
  const [chips, setChips] = useState<number[]>([1, 3, 5]);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="relative">
      <SnowField count={18} />
      <main className="relative mx-auto flex max-w-xl flex-col gap-10 px-4 pb-16 pt-8">
        <header className="flex flex-col gap-3">
          <span className="eyebrow">{copy.app.name}</span>
          <h1 className="text-4xl font-black">{sg.title}</h1>
          <p className="text-muted">{sg.intro}</p>
          <KnotDivider className="mt-2" />
        </header>

        <Section title={sg.sections.colors}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {baseTokens.map((t) => (
              <Swatch key={t.token} token={t.token} name={t.name} value={values[t.token]} />
            ))}
          </div>
        </Section>

        <Section title={sg.sections.categories}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {categoryTokens.map((t) => (
              <Swatch key={t.token} token={t.token} name={t.name} value={values[t.token]} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {categoryTokens.map((t) => (
              <CategoryMarker key={t.token} name={t.label} colorToken={t.token} icon={t.icon} />
            ))}
          </div>
        </Section>

        <Section title={sg.sections.contrast}>
          <ContrastTable values={values} />
        </Section>

        <Section title={sg.sections.typography}>
          <Card className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="eyebrow">{sg.typography.display}</span>
              <span className="font-display text-3xl font-black uppercase tracking-display">
                {sg.typography.sampleTitle}
              </span>
              <span className="font-display text-xl font-bold uppercase tracking-display">
                {sg.typography.sampleTitle}
              </span>
              <span className="font-display text-base font-semibold uppercase tracking-display">
                {sg.typography.sampleTitle}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="eyebrow">{sg.typography.body}</span>
              <p className="m-0">{sg.typography.sampleBody}</p>
              <p className="m-0 font-medium">{sg.typography.sampleBodyMedium}</p>
              <p className="m-0 text-sm text-muted">{sg.typography.sampleBody}</p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="eyebrow">{sg.typography.numeric}</span>
              <div className="flex items-baseline gap-4">
                <span className="numeric text-6xl">23</span>
                <span className="numeric text-4xl text-accent">2 025</span>
                <span className="numeric text-2xl text-frost">14</span>
              </div>
              <span className="numeric text-xl text-muted">0123456789</span>
            </div>
          </Card>
        </Section>

        <Section title={sg.sections.shapes}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card>
              <span className="text-sm">{sg.shapes.plain}</span>
            </Card>
            <Card variant="raised">
              <span className="text-sm">{sg.shapes.raised}</span>
            </Card>
            <Card accentToken="--cat-3">
              <span className="text-sm">{sg.shapes.radius}</span>
            </Card>
          </div>
          <CarvedCard>
            <span className="text-sm">{sg.shapes.carved}</span>
          </CarvedCard>
          <CarvedCard ruleToken="--color-accent">
            <span className="text-sm">{sg.shapes.carved}</span>
          </CarvedCard>
        </Section>

        <Section title={sg.sections.buttons}>
          <div className="flex flex-wrap gap-3">
            <Button>{sg.buttons.primary}</Button>
            <Button variant="secondary">{sg.buttons.secondary}</Button>
            <Button variant="ghost">{sg.buttons.ghost}</Button>
            <Button variant="danger">{sg.buttons.danger}</Button>
            <Button disabled>{sg.buttons.disabled}</Button>
            <IconButton label={sg.buttons.icon}>
              <SwordIcon size={24} />
            </IconButton>
          </div>
          <Button block icon={<FireIcon size={18} />}>
            {sg.buttons.primary}
          </Button>
        </Section>

        <Section title={sg.sections.progress}>
          <Card className="flex flex-col items-center gap-6">
            <span className="eyebrow self-start">{sg.progress.ring}</span>
            <ProgressRing value={0.75} label={sg.progress.ring}>
              <span className="numeric text-5xl">75</span>
              <span className="eyebrow">{sg.progress.ringCaption}</span>
            </ProgressRing>
          </Card>
          <CarvedCard ruleToken="--color-accent">
            <span className="eyebrow mb-3 block">{sg.progress.xpBar}</span>
            <XpBar level={12} rank={copy.samples.rank} current={430} needed={575} />
          </CarvedCard>
          <Card className="flex flex-col gap-3">
            <span className="eyebrow">{sg.progress.quantity}</span>
            <ProgressBar
              value={0.35}
              colorToken="--cat-3"
              label={copy.samples.goalQuantity}
              marker={0.5}
            />
            <ProgressBar value={0.8} colorToken="--color-frost" label={copy.common.streak} />
            <ProgressBar value={1} colorToken="--color-success" label={copy.samples.goalBoolean} />
          </Card>
        </Section>

        <Section title={sg.sections.inputs}>
          <Card accentToken="--cat-2" className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="eyebrow">{sg.inputs.boolean}</span>
              <span className="font-medium">{copy.samples.goalBoolean}</span>
            </div>
            <CheckToggle checked={sugar} onChange={setSugar} label={copy.samples.goalBoolean} />
          </Card>
          <Card accentToken="--cat-1" className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="eyebrow">{sg.inputs.boolean}</span>
              <span className="font-medium">{copy.samples.categorySport}</span>
            </div>
            <CheckToggle
              checked={workout}
              onChange={setWorkout}
              label={copy.samples.categorySport}
            />
          </Card>
          <Card accentToken="--cat-3" className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="eyebrow">{sg.inputs.quantity}</span>
                <span className="font-medium">{copy.samples.goalQuantity}</span>
              </div>
              <Stepper
                value={pages}
                onChange={setPages}
                unit={copy.samples.unitPages}
                label={copy.samples.goalQuantity}
              />
            </div>
            <ProgressBar
              value={(pages ?? 0) / 20}
              colorToken="--cat-3"
              label={copy.samples.goalQuantity}
            />
          </Card>
          <Card accentToken="--cat-4" className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="eyebrow">{sg.inputs.limit}</span>
                <span className="font-medium">{copy.samples.goalLimit}</span>
              </div>
              <Stepper
                value={screen}
                onChange={setScreen}
                step={5}
                unit={copy.samples.unitMin}
                label={copy.samples.goalLimit}
              />
            </div>
            <ProgressBar
              value={(screen ?? 0) / 120}
              colorToken={(screen ?? 0) > 120 ? '--color-warning' : '--cat-4'}
              label={copy.samples.goalLimit}
            />
          </Card>
        </Section>

        <Section title={sg.sections.forms}>
          <Field label={copy.goalForm.title}>
            {({ id }) => (
              <TextInput
                id={id}
                value={textValue}
                onChange={(e) => {
                  setTextValue(e.target.value);
                }}
              />
            )}
          </Field>
          <Field label={copy.goalForm.target} error={copy.goalForm.errors.target}>
            {({ id, describedBy, invalid }) => (
              <TextInput
                id={id}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                value="0"
                readOnly
              />
            )}
          </Field>
          <Segmented
            label={copy.goalForm.frequency}
            value={segment}
            onChange={setSegment}
            options={(['daily', 'weekly', 'days'] as const).map((value) => ({
              value,
              label: copy.goalForm.frequencies[value],
            }))}
          />
          <div className="flex flex-wrap gap-2">
            {copy.goalForm.weekdays.map((label, i) => (
              <ToggleChip
                key={i}
                label={label}
                ariaLabel={copy.goalForm.weekdayNames[i]}
                pressed={chips.includes(i)}
                onPressedChange={(pressed) => {
                  setChips((c) => (pressed ? [...c, i] : c.filter((x) => x !== i)));
                }}
              />
            ))}
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setSheetOpen(true);
            }}
          >
            {sg.forms.openSheet}
          </Button>
          <Sheet
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            title={copy.goalForm.newTitle}
            closeLabel={copy.goalForm.close}
            footer={
              <Button
                block
                onClick={() => {
                  setSheetOpen(false);
                }}
              >
                {copy.goalForm.create}
              </Button>
            }
          >
            <p className="m-0 text-muted">{sg.forms.sheetBody}</p>
          </Sheet>
        </Section>

        <Section title={sg.sections.ornaments}>
          <div className="flex flex-col gap-2">
            <span className="eyebrow">{sg.ornaments.divider}</span>
            <KnotDivider />
            <KnotDivider ornament={false} />
          </div>
          <div className="flex flex-col gap-3">
            <span className="eyebrow">{sg.ornaments.runes}</span>
            <RuneRow runes={futhark.slice(0, 11)} />
            <RuneRow runes={futhark.slice(11)} />
          </div>
          <p className="text-sm text-muted">{sg.ornaments.grain}</p>
          <p className="text-sm text-muted">{sg.ornaments.snow}</p>
        </Section>

        <Section title={sg.sections.rewards}>
          <span className="eyebrow">{sg.rewards.boss}</span>
          <BossPlaceholder
            name={copy.samples.boss}
            role={copy.samples.bossRole}
            week={copy.samples.week}
            hp={620}
            maxHp={1400}
          />
          <span className="eyebrow">{sg.rewards.badges}</span>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge
              name={copy.samples.badgeFirst}
              condition={sg.rewards.unlocked}
              icon={FootprintsIcon}
              unlocked
              lockedLabel={copy.common.locked}
            />
            <Badge
              name={copy.samples.badgeIron}
              condition={copy.samples.badgeIronCondition}
              icon={SnowflakeIcon}
              unlocked={false}
              lockedLabel={copy.common.locked}
            />
            <Badge
              name={copy.samples.badgeFirst}
              condition={sg.rewards.unlocked}
              icon={SwordIcon}
              unlocked
              shape="shield"
              lockedLabel={copy.common.locked}
            />
            <Badge
              name={copy.samples.badgeIron}
              condition={copy.samples.badgeIronCondition}
              icon={SkullIcon}
              unlocked={false}
              shape="shield"
              lockedLabel={copy.common.locked}
            />
          </div>
        </Section>

        <Section title={sg.sections.motion}>
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm">{sg.motion.impact}</span>
              <CheckToggle checked={workout} onChange={setWorkout} label={sg.motion.impact} />
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-sm">{sg.motion.levelUp}</span>
              <RuneRow lit={runePlay > 0} playKey={runePlay} />
              <Button
                variant="secondary"
                onClick={() => {
                  setRunePlay((n) => n + 1);
                }}
              >
                {sg.motion.replay}
              </Button>
            </div>
          </Card>
        </Section>

        <Section title={sg.sections.navigation}>
          <Card className="flex flex-col gap-4">
            <AppHeader day={23} totalDays={92} />
          </Card>
          <BottomNav inline activeTo="/" />
        </Section>

        <Section title={sg.sections.icons}>
          <div className="flex flex-wrap gap-4 text-text">
            {icons.map((IconCmp, i) => (
              <IconCmp key={i} size={28} />
            ))}
          </div>
        </Section>
      </main>
    </div>
  );
}
