import type { Icon } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';

type CategoryMarkerProps = {
  name: string;
  colorToken: string;
  icon: Icon;
  className?: string;
  /** Nom en brume (en-tête de liste discret). */
  muted?: boolean;
};

/** Petite pierre runique de la couleur de la catégorie ; le nom reste en neige (ou brume). */
export function CategoryMarker({
  name,
  colorToken,
  icon: IconCmp,
  className,
  muted = false,
}: CategoryMarkerProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span aria-hidden="true" className="relative flex h-7 w-6 items-center justify-center">
        <svg width={24} height={28} viewBox="0 0 24 28" className="absolute inset-0">
          <path d="M3 27L2 10C2 4 6 1 12 1C18 1 22 4 22 10L21 27Z" fill={`var(${colorToken})`} />
        </svg>
        <IconCmp size={14} color="var(--color-bg)" className="relative mt-1" />
      </span>
      <span
        className={cn(
          'font-display text-xs font-bold uppercase tracking-display',
          muted ? 'text-muted' : 'text-text',
        )}
      >
        {name}
      </span>
    </div>
  );
}
