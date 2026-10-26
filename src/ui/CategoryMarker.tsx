import type { Icon } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';

type CategoryMarkerProps = {
  name: string;
  colorToken: string;
  icon: Icon;
  className?: string;
};

/** Pastille de catégorie : la couleur ne porte que l'icône et le losange, le nom reste en neige. */
export function CategoryMarker({
  name,
  colorToken,
  icon: IconCmp,
  className,
}: CategoryMarkerProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        aria-hidden="true"
        className="notched flex h-7 w-7 items-center justify-center"
        style={{ ['--n' as string]: '5px', background: `var(${colorToken})` }}
      >
        <IconCmp size={16} color="var(--color-bg)" />
      </span>
      <span className="font-display text-xs font-bold uppercase tracking-display text-text">
        {name}
      </span>
    </div>
  );
}
