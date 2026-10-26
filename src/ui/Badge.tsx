import type { Icon } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';

type BadgeProps = {
  name: string;
  condition: string;
  icon: Icon;
  unlocked: boolean;
  shape?: 'runestone' | 'shield';
  lockedLabel: string;
};

// Pierre runique dressée : sommet arrondi irrégulier, base plate.
const RUNESTONE = 'M14 78L10 30C10 14 22 4 36 4C50 4 62 14 62 30L58 78Z';

/** Badge en pierre runique ou bouclier rond. Verrouillé : silhouette en fer froid, condition visible. */
export function Badge({
  name,
  condition,
  icon: IconCmp,
  unlocked,
  shape = 'runestone',
  lockedLabel,
}: BadgeProps) {
  const stroke = unlocked ? 'var(--color-accent)' : 'var(--color-border)';
  const fill = unlocked ? 'var(--color-surface-raised)' : 'var(--color-surface)';
  return (
    <figure className="m-0 flex w-28 flex-col items-center gap-2 text-center">
      <div className="relative flex h-20 w-[72px] items-center justify-center">
        <svg
          width="72"
          height="80"
          viewBox="0 0 72 80"
          aria-hidden="true"
          className="absolute inset-0"
        >
          {shape === 'runestone' ? (
            <>
              <path d={RUNESTONE} fill={fill} stroke={stroke} strokeWidth="1.5" />
              <path
                d="M18 70L15 31C15 18 25 9 36 9C47 9 57 18 57 31L54 70"
                fill="none"
                stroke={stroke}
                strokeWidth="1"
                opacity="0.6"
              />
            </>
          ) : (
            <>
              <circle cx="36" cy="42" r="32" fill={fill} stroke={stroke} strokeWidth="1.5" />
              <circle
                cx="36"
                cy="42"
                r="26"
                fill="none"
                stroke={stroke}
                strokeWidth="1"
                opacity="0.6"
              />
              <circle cx="36" cy="42" r="9" fill="none" stroke={stroke} strokeWidth="1.5" />
            </>
          )}
        </svg>
        <IconCmp
          size={26}
          className={cn('relative', shape === 'shield' && 'mt-1')}
          color={unlocked ? 'var(--color-accent)' : 'var(--color-text-muted)'}
        />
      </div>
      <figcaption className="flex flex-col gap-0.5">
        <span
          className={cn(
            'font-display text-xs font-bold uppercase tracking-display',
            unlocked ? 'text-text' : 'text-muted',
          )}
        >
          {name}
        </span>
        <span className="text-xs text-muted">
          {!unlocked && <span className="sr-only">{lockedLabel} : </span>}
          {condition}
        </span>
      </figcaption>
    </figure>
  );
}
