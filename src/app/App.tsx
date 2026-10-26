import { IconContext } from '@phosphor-icons/react';
import { MotionConfig } from 'framer-motion';
import {
  createBrowserRouter,
  createMemoryRouter,
  Navigate,
  RouterProvider,
  type RouteObject,
} from 'react-router-dom';
import { GoalsPage } from '@/features/goals/GoalsPage';
import { AppLayout, RootGate } from './AppLayout';
import { TodayPage } from '@/features/checkin/TodayPage';
import { TrophiesPage } from '@/features/gamification/TrophiesPage';
import { GoalDetailPage } from '@/features/stats/GoalDetailPage';
import { ProgressPage } from '@/features/stats/ProgressPage';

// Écrans rarement ouverts chargés à la demande, pour que l'écran Aujourd'hui s'ouvre vite.
const routes: RouteObject[] = [
  {
    path: '/styleguide',
    hydrateFallbackElement: <></>,
    lazy: async () => ({ Component: (await import('./routes/StyleguidePage')).StyleguidePage }),
  },
  {
    element: <RootGate />,
    children: [
      {
        path: '/bienvenue',
        hydrateFallbackElement: <></>,
        lazy: async () => ({
          Component: (await import('@/features/arc/OnboardingPage')).OnboardingPage,
        }),
      },
      {
        path: '/reglages',
        hydrateFallbackElement: <></>,
        lazy: async () => ({ Component: (await import('./routes/SettingsPage')).SettingsPage }),
      },
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <TodayPage /> },
          { path: '/progression', element: <ProgressPage /> },
          { path: '/trophees', element: <TrophiesPage /> },
          { path: '/objectifs', element: <GoalsPage /> },
          { path: '/objectifs/:goalId', element: <GoalDetailPage /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
];

// Build de démo (aperçu hébergé sans contrôle de l'URL) : routeur en mémoire.
const router =
  import.meta.env.VITE_ROUTER === 'memory'
    ? createMemoryRouter(routes, { initialEntries: ['/'] })
    : createBrowserRouter(routes);

// Une seule librairie d'icônes (Phosphor), un seul poids (bold).
const iconDefaults = { weight: 'bold', size: 24, color: 'currentColor', mirrored: false } as const;

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <IconContext.Provider value={iconDefaults}>
        <RouterProvider router={router} />
      </IconContext.Provider>
    </MotionConfig>
  );
}
