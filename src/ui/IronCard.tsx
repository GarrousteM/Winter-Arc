import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type IronCardProps = HTMLAttributes<HTMLDivElement> & {
  /** Filet principal : fer froid (défaut) ou or pour une carte clé. */
  gilded?: boolean;
};

const corner = 'pointer-events-none absolute h-[5px] w-[5px] rounded-full bg-iron';

/** Carte en fer riveté : double filet et un rivet à chaque coin. */
export function IronCard({ gilded = false, className, children, ...rest }: IronCardProps) {
  return (
    <div
      className={cn(
        'relative m-1 rounded border bg-surface outline outline-1 outline-offset-[3px] outline-border',
        gilded ? 'border-accent' : 'border-frost-deep',
        className,
      )}
      {...rest}
    >
      <span aria-hidden="true" className={cn(corner, 'left-1 top-1')} />
      <span aria-hidden="true" className={cn(corner, 'right-1 top-1')} />
      <span aria-hidden="true" className={cn(corner, 'bottom-1 left-1')} />
      <span aria-hidden="true" className={cn(corner, 'bottom-1 right-1')} />
      {children}
    </div>
  );
}
