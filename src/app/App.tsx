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
import { ProgressPlaceholder, TodayPlaceholder, TrophiesPlaceholder } from './routes/Placeholders';

// Écrans rarement ouverts chargés à la demande, pour que l'écran Aujourd'hui s'ouvre vite.
const routes: RouteObject[] = [
  {
    path: '/styleguide',
    lazy: async () => ({ Component: (await import('./routes/StyleguidePage')).StyleguidePage }),
  },
  {
    element: <RootGate />,
    children: [
      {
        path: '/bienvenue',
        lazy: async () => ({
          Component: (await import('@/features/arc/OnboardingPage')).OnboardingPage,
        }),
      },
      {
        path: '/reglages',
        lazy: async () => ({ Component: (await import('./routes/SettingsPage')).SettingsPage }),
      },
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <TodayPlaceholder /> },
          { path: '/progression', element: <ProgressPlaceholder /> },
          { path: '/trophees', element: <TrophiesPlaceholder /> },
          { path: '/objectifs', element: <GoalsPage /> },
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
