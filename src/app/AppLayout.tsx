import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { daysInclusive, dayNumber, today } from '@/lib/dates';
import { AppHeader } from '@/ui/AppHeader';
import { BottomNav } from '@/ui/BottomNav';
import { Aurora } from '@/ui/FjordHorizon';
import { SnowField } from '@/ui/SnowField';
import { RewardHost } from '@/features/gamification/RewardHost';
import { useAppStore } from './store';

/** Attend la lecture d'IndexedDB, puis envoie vers l'onboarding tant qu'aucun Arc n'existe. */
export function RootGate() {
  const hydrated = useAppStore((s) => s.hydrated);
  const arc = useAppStore((s) => s.arc);
  const location = useLocation();
  if (!hydrated) return null;
  const onboarding = location.pathname === '/bienvenue';
  if (!arc && !onboarding) return <Navigate to="/bienvenue" replace />;
  if (arc && onboarding) return <Navigate to="/" replace />;
  return <Outlet />;
}

/** Écrans à onglets : en-tête « Jour X / N », contenu, barre de navigation basse. */
export function AppLayout() {
  const arc = useAppStore((s) => s.arc);
  const navigate = useNavigate();
  if (!arc) return null;
  const total = daysInclusive(arc.startDate, arc.endDate);
  const day = dayNumber(arc.startDate, today());
  return (
    <div className="relative mx-auto flex min-h-dvh max-w-xl flex-col">
      <Aurora className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 w-full opacity-70" />
      <SnowField count={20} />
      <div className="px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <AppHeader
          day={day}
          totalDays={total}
          onSettings={() => {
            void navigate('/reglages');
          }}
        />
      </div>
      <main className="flex-1 px-4 pt-6 pb-28">
        <Outlet />
      </main>
      <BottomNav />
      <RewardHost />
    </div>
  );
}
