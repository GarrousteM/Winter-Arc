import { CheckIcon } from '@phosphor-icons/react';
import { motion, useAnimationControls } from 'framer-motion';
import { cn } from '@/lib/cn';
import { durations, usePrefersReducedMotion } from '@/lib/motion';

type CheckToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  colorToken?: string;
};

/** Case de validation : un tap valide (impact court + tremblement), un second annule. */
export function CheckToggle({
  checked,
  onChange,
  label,
  colorToken = '--color-accent',
}: CheckToggleProps) {
  const controls = useAnimationControls();
  const reduced = usePrefersReducedMotion();
  const toggle = () => {
    const next = !checked;
    onChange(next);
    if (next && !reduced) {
      void controls.start({
        x: [0, -2, 2, -1, 0],
        scale: [1, 0.9, 1.04, 1],
        transition: { duration: durations.impact },
      });
    }
  };
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={toggle}
      animate={controls}
      className="notched inline-flex h-11 w-11 shrink-0 p-px transition-colors duration-fast ease-heavy"
      style={{
        ['--n' as string]: '6px',
        background: checked ? `var(${colorToken})` : 'var(--color-border)',
      }}
    >
      {/* Calque intérieur : le filet suit aussi les coins coupés. */}
      <span
        className={cn(
          'notched flex h-full w-full items-center justify-center',
          checked ? 'text-on-accent' : 'bg-bg text-transparent',
        )}
        style={{ ['--n' as string]: 'calc(6px - 0.586px)' }}
      >
        <CheckIcon size={22} />
      </span>
    </motion.button>
  );
}
