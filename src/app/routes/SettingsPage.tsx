import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/app/store';
import { copy } from '@/copy';
import { daysInclusive, formatLongDate } from '@/lib/dates';
import { Button, IconButton } from '@/ui/Button';
import { Card } from '@/ui/Card';

const t = copy.settings;

export function SettingsPage() {
  const arc = useAppStore((s) => s.arc);
  const resetAll = useAppStore((s) => s.resetAll);
  const navigate = useNavigate();
  // 0 : repos · 1 : première confirmation · 2 : dernière confirmation.
  const [confirmStep, setConfirmStep] = useState(0);

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

      {arc && (
        <section className="flex flex-col gap-2">
          <h2 className="eyebrow">{t.arcSection}</h2>
          <Card className="flex flex-col gap-1">
            <span className="font-medium">{arc.name}</span>
            <span className="text-sm text-muted">
              {formatLongDate(arc.startDate, true)} → {formatLongDate(arc.endDate, true)}
            </span>
            <span className="numeric text-2xl text-accent">
              {daysInclusive(arc.startDate, arc.endDate)}{' '}
              <span className="eyebrow">{copy.onboarding.arc.daysUnit}</span>
            </span>
          </Card>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="eyebrow">{t.dataSection}</h2>
        <p className="m-0 text-sm text-muted">{t.more}</p>
        <Card className="flex flex-col gap-3">
          <p className="m-0 text-sm text-muted">{t.resetHint}</p>
          {confirmStep === 0 && (
            <Button
              variant="danger"
              onClick={() => {
                setConfirmStep(1);
              }}
            >
              {t.reset}
            </Button>
          )}
          {confirmStep > 0 && (
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
