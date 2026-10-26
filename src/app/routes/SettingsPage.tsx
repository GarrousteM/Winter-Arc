import {
  CaretLeftIcon,
  CaretRightIcon,
  DownloadSimpleIcon,
  UploadSimpleIcon,
} from '@phosphor-icons/react';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore, type AppData } from '@/app/store';
import { copy } from '@/copy';
import {
  backupFileName,
  buildBackup,
  parseBackup,
  type Backup,
  type ImportError,
} from '@/features/settings/backup';
import { daysInclusive, isValidISODate, today } from '@/lib/dates';
import { Button, IconButton } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Field, TextInput } from '@/ui/Field';
import { Switch } from '@/ui/Switch';

const t = copy.settings;
const MIN_ARC_DAYS = 8;

/** Propose le fichier au partage (mobile) ou le télécharge (ordinateur). */
async function saveFile(name: string, text: string): Promise<void> {
  const file = new File([text], name, { type: 'application/json' });
  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name });
      return;
    } catch (error) {
      // Partage annulé par l'utilisateur : rien d'autre à faire.
      if (error instanceof DOMException && error.name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

function ArcSection() {
  const arc = useAppStore((s) => s.arc);
  const updateArc = useAppStore((s) => s.updateArc);
  const [name, setName] = useState(arc?.name ?? '');
  const [start, setStart] = useState(arc?.startDate ?? '');
  const [end, setEnd] = useState(arc?.endDate ?? '');
  const [saved, setSaved] = useState(false);
  if (!arc) return null;

  const datesValid =
    isValidISODate(start) && isValidISODate(end) && daysInclusive(start, end) >= MIN_ARC_DAYS;
  const valid = name.trim() !== '' && datesValid;
  const changed = name.trim() !== arc.name || start !== arc.startDate || end !== arc.endDate;

  return (
    <section className="flex flex-col gap-3" aria-label={t.arcSection}>
      <h2 className="eyebrow">{t.arcSection}</h2>
      <Card className="flex flex-col gap-4">
        <Field
          label={t.arcName}
          error={name.trim() === '' ? copy.onboarding.arc.errorName : undefined}
        >
          {({ id, describedBy, invalid }) => (
            <TextInput
              id={id}
              value={name}
              maxLength={40}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
            />
          )}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.arcStart}>
            {({ id }) => (
              <TextInput
                id={id}
                type="date"
                value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                  setSaved(false);
                }}
              />
            )}
          </Field>
          <Field label={t.arcEnd}>
            {({ id }) => (
              <TextInput
                id={id}
                type="date"
                value={end}
                min={start}
                onChange={(e) => {
                  setEnd(e.target.value);
                  setSaved(false);
                }}
              />
            )}
          </Field>
        </div>
        <p className={datesValid ? 'm-0 text-sm text-muted' : 'm-0 text-sm text-warning'}>
          {datesValid
            ? `${daysInclusive(start, end)} ${copy.onboarding.arc.daysUnit} · ${t.arcDatesHint}`
            : copy.onboarding.arc.errorDates}
        </p>
        <Button
          variant="secondary"
          disabled={!valid || !changed}
          onClick={() => {
            updateArc({ name: name.trim(), startDate: start, endDate: end });
            setSaved(true);
          }}
        >
          {saved ? t.arcSaved : t.arcSave}
        </Button>
      </Card>
    </section>
  );
}

function DataSection() {
  const replaceAll = useAppStore((s) => s.replaceAll);
  const resetAll = useAppStore((s) => s.resetAll);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Backup | null>(null);
  const [importError, setImportError] = useState<ImportError | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  // 0 : repos · 1 : première confirmation · 2 : dernière confirmation.
  const [confirmStep, setConfirmStep] = useState(0);

  const exportData = async () => {
    const { arc, categories, goals, checkIns, dayNotes, player, preferences } =
      useAppStore.getState();
    const data: AppData = { arc, categories, goals, checkIns, dayNotes, player, preferences };
    await saveFile(backupFileName(today()), JSON.stringify(buildBackup(data), null, 2));
    setStatus(t.exported);
  };

  return (
    <section className="flex flex-col gap-3" aria-label={t.dataSection}>
      <h2 className="eyebrow">{t.dataSection}</h2>
      <Card className="flex flex-col gap-3">
        <p className="m-0 text-sm text-muted">{t.dataHint}</p>
        <Button
          variant="secondary"
          icon={<DownloadSimpleIcon size={18} />}
          onClick={() => {
            void exportData();
          }}
        >
          {t.export}
        </Button>
        <Button
          variant="secondary"
          icon={<UploadSimpleIcon size={18} />}
          onClick={() => {
            fileRef.current?.click();
          }}
        >
          {t.import}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file) return;
            setStatus(null);
            void file.text().then((text) => {
              const result = parseBackup(text);
              if (result.ok) {
                setPending(result.backup);
                setImportError(null);
              } else {
                setPending(null);
                setImportError(result.error);
              }
            });
          }}
        />
        {importError && <p className="m-0 text-sm text-warning">{t.importErrors[importError]}</p>}
        {pending && (
          <div className="flex flex-col gap-2 rounded border border-warning p-3">
            <span className="font-medium">
              {t.importSummary(pending.data.arc?.name ?? '', pending.data.checkIns.length)}
            </span>
            <span className="text-sm text-muted">{t.importWarning}</span>
            <Button
              variant="danger"
              onClick={() => {
                replaceAll(pending.data);
                setPending(null);
                setStatus(t.importDone);
              }}
            >
              {t.importConfirm}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setPending(null);
              }}
            >
              {t.cancel}
            </Button>
          </div>
        )}
        {status && (
          <p className="m-0 text-sm text-success" role="status">
            {status}
          </p>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <p className="m-0 text-sm text-muted">{t.resetHint}</p>
        {confirmStep === 0 ? (
          <Button
            variant="danger"
            onClick={() => {
              setConfirmStep(1);
            }}
          >
            {t.reset}
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <Button
              variant="danger"
              onClick={() => {
                if (confirmStep === 1) {
                  setConfirmStep(2);
                  return;
                }
                resetAll();
                void navigate('/bienvenue', { replace: true });
              }}
            >
              {confirmStep === 1 ? t.resetConfirm1 : t.resetConfirm2}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setConfirmStep(0);
              }}
            >
              {t.cancel}
            </Button>
          </div>
        )}
      </Card>
    </section>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const preferences = useAppStore((s) => s.preferences);
  const updatePreferences = useAppStore((s) => s.updatePreferences);

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col gap-8 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-12">
      <header className="flex items-center gap-2">
        <IconButton
          label={copy.common.back}
          onClick={() => {
            void navigate(-1);
          }}
        >
          <CaretLeftIcon size={22} />
        </IconButton>
        <h1 className="text-2xl font-black">{t.title}</h1>
      </header>

      <ArcSection />

      <section className="flex flex-col gap-3" aria-label={t.feedbackSection}>
        <h2 className="eyebrow">{t.feedbackSection}</h2>
        <Card className="flex flex-col py-2">
          <Switch
            checked={preferences.sound}
            onChange={(sound) => {
              updatePreferences({ sound });
            }}
            label={t.sound}
            description={t.soundHint}
          />
          <Switch
            checked={preferences.vibration}
            onChange={(vibration) => {
              updatePreferences({ vibration });
            }}
            label={t.vibration}
            description={t.vibrationHint}
          />
        </Card>
      </section>

      <DataSection />

      <Link
        to="/styleguide"
        className="flex min-h-touch items-center justify-between rounded border border-border bg-surface px-4 text-sm font-medium"
      >
        {t.styleguide}
        <CaretRightIcon size={18} />
      </Link>
    </div>
  );
}
