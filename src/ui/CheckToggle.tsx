import { motion, useAnimationControls } from 'framer-motion';
import { durations, usePrefersReducedMotion } from '@/lib/motion';

type CheckToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  colorToken?: string;
};

const PLANKS = 'M20 20L31.3 8.7M20 20L31.3 31.3M20 20L8.7 31.3M20 20L8.7 8.7';

/**
 * Case de validation en petit bouclier rond : planches nues en fer froid, puis peintes et cerclées d'or
 * une fois validé. Un tap valide (impact court + tremblement), un second annule.
 */
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
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
    >
      <svg width={40} height={40} viewBox="0 0 40 40" aria-hidden="true">
        {checked ? (
          <>
            <circle
              cx={20}
              cy={20}
              r={18}
              fill={`var(${colorToken})`}
              stroke="var(--color-accent)"
              strokeWidth={2.5}
            />
            <path d={PLANKS} stroke="var(--color-bg)" strokeWidth={1.2} opacity={0.5} />
            <circle cx={20} cy={20} r={8} fill="var(--color-accent)" />
            <path
              d="M16.5 20L19 22.5L23.5 17.5"
              stroke="var(--color-bg)"
              strokeWidth={2}
              fill="none"
            />
          </>
        ) : (
          <>
            <circle
              cx={20}
              cy={20}
              r={18}
              fill="var(--color-bg)"
              stroke="var(--color-frost-deep)"
              strokeWidth={2}
            />
            <path d={PLANKS} stroke="var(--color-border)" strokeWidth={1.5} />
            <circle cx={20} cy={20} r={5} fill="var(--color-border)" />
          </>
        )}
      </svg>
    </motion.button>
  );
}
