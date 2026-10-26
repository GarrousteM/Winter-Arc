import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { copy } from '@/copy';
import { PERFECT_DAY_BONUS } from '@/features/gamification/xp';
import { durations, easeHeavy } from '@/lib/motion';
import { KnotDivider } from '@/ui/KnotDivider';
import { RuneRow } from '@/ui/Rune';

const t = copy.today;

type PerfectDayOverlayProps = {
  onClose: () => void;
};

/** Récompense plein écran de la journée parfaite. Fermeture par tap (ou Échap). */
export function PerfectDayOverlay({ onClose }: PerfectDayOverlayProps) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <motion.button
      ref={ref}
      type="button"
      role="alertdialog"
      aria-label={`${t.perfectTitle} ${t.perfectBonus(PERFECT_DAY_BONUS)}`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-bg px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: durations.base }}
    >
      <RuneRow lit />
      <motion.h2
        className="text-3xl font-black text-accent"
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: durations.base * 2, delay: 0.4, ease: easeHeavy }}
      >
        {t.perfectTitle}
      </motion.h2>
      <motion.span
        className="numeric text-6xl text-text"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: durations.base * 2, delay: 0.8, ease: easeHeavy }}
      >
        {t.perfectBonus(PERFECT_DAY_BONUS)}
      </motion.span>
      <KnotDivider className="w-full max-w-xs" />
      <span className="eyebrow">{t.tapToClose}</span>
    </motion.button>
  );
}
