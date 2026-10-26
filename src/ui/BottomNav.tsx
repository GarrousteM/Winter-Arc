import {
  ChartLineUpIcon,
  ShieldStarIcon,
  SunIcon,
  TargetIcon,
  type Icon,
} from '@phosphor-icons/react';
import { NavLink } from 'react-router-dom';
import { copy } from '@/copy';
import { cn } from '@/lib/cn';

type Tab = { to: string; label: string; icon: Icon };

const tabs: Tab[] = [
  { to: '/', label: copy.nav.today, icon: SunIcon },
  { to: '/progression', label: copy.nav.progress, icon: ChartLineUpIcon },
  { to: '/trophees', label: copy.nav.trophies, icon: ShieldStarIcon },
  { to: '/objectifs', label: copy.nav.goals, icon: TargetIcon },
];

type BottomNavProps = {
  /** En styleguide, la barre est affichée dans le flux plutôt que fixée en bas. */
  inline?: boolean;
  /** Force l'onglet actif (démonstration dans le styleguide). */
  activeTo?: string;
};

export function BottomNav({ inline = false, activeTo }: BottomNavProps) {
  return (
    <nav
      aria-label={copy.nav.mainLabel}
      className={cn(
        'border-t border-border bg-surface',
        !inline && 'fixed inset-x-0 bottom-0 z-20 pb-[env(safe-area-inset-bottom)]',
      )}
    >
      <ul className="mx-auto grid max-w-xl grid-cols-4">
        {tabs.map(({ to, label, icon: IconCmp }) => (
          <li key={to}>
            <NavLink
              to={to}
              end
              className={({ isActive: routeActive }) => {
                const isActive = activeTo ? activeTo === to : routeActive;
                return cn(
                  'relative flex min-h-touch flex-col items-center justify-center gap-1 py-2',
                  'text-xs font-medium',
                  'transition-colors duration-fast ease-heavy',
                  isActive ? 'text-accent' : 'text-muted hover:text-text',
                );
              }}
            >
              {({ isActive: routeActive }) => (
                <>
                  {(activeTo ? activeTo === to : routeActive) && (
                    <span aria-hidden="true" className="absolute inset-x-6 top-0 h-px bg-accent" />
                  )}
                  <IconCmp size={22} />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
