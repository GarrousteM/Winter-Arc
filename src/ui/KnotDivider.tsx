import { useId } from 'react';
import { cn } from '@/lib/cn';

type KnotDividerProps = {
  className?: string;
  /** Losange central en or. */
  ornament?: boolean;
  /** Token de la surface sur laquelle est posé le séparateur (pour le détourage des croisements). */
  bgToken?: string;
};

/**
 * Séparateur en entrelacs : tresse à deux brins qui passent alternativement dessus et dessous.
 * Le dessus est obtenu en redessinant le brin, détouré par un liseré couleur du fond.
 */
export function KnotDivider({
  className,
  ornament = true,
  bgToken = '--color-bg',
}: KnotDividerProps) {
  const bg = `var(${bgToken})`;
  const id = useId().replace(/:/g, '');
  const strandA = 'M0 2C6 2 6 10 12 10S18 2 24 2';
  const strandB = 'M0 10C6 10 6 2 12 2S18 10 24 10';
  return (
    <div aria-hidden="true" className={cn('relative flex items-center', className)}>
      <svg width="100%" height="12" className="block">
        <defs>
          <clipPath id={`${id}-l`}>
            <rect x="3" y="0" width="6" height="12" />
          </clipPath>
          <clipPath id={`${id}-r`}>
            <rect x="15" y="0" width="6" height="12" />
          </clipPath>
          <pattern id={`${id}-p`} width="24" height="12" patternUnits="userSpaceOnUse">
            <g fill="none" strokeWidth="1.25">
              <path d={strandA} stroke="var(--color-frost-deep)" />
              <path d={strandB} stroke="var(--color-frost-deep)" />
              <g clipPath={`url(#${id}-l)`}>
                <path d={strandA} stroke={bg} strokeWidth="4" />
                <path d={strandA} stroke="var(--color-frost-deep)" />
              </g>
              <g clipPath={`url(#${id}-r)`}>
                <path d={strandB} stroke={bg} strokeWidth="4" />
                <path d={strandB} stroke="var(--color-frost-deep)" />
              </g>
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="12" fill={`url(#${id}-p)`} />
      </svg>
      {ornament && (
        <span className="absolute left-1/2 -translate-x-1/2 px-2" style={{ background: bg }}>
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path
              d="M7 1L13 7L7 13L1 7Z"
              fill={bg}
              stroke="var(--color-accent)"
              strokeWidth="1.25"
            />
            <path d="M7 4.5L9.5 7L7 9.5L4.5 7Z" fill="var(--color-accent)" />
          </svg>
        </span>
      )}
    </div>
  );
}
