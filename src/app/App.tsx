import { IconContext } from '@phosphor-icons/react';
import { MotionConfig } from 'framer-motion';
import { createBrowserRouter, createMemoryRouter, RouterProvider } from 'react-router-dom';
import { HomePlaceholder } from './routes/HomePlaceholder';
import { StyleguidePage } from './routes/StyleguidePage';

const routes = [
  { path: '/', element: <HomePlaceholder /> },
  { path: '/styleguide', element: <StyleguidePage /> },
  { path: '*', element: <HomePlaceholder /> },
];

// Build de démo (aperçu hébergé sans contrôle de l'URL) : routeur en mémoire, ouvert sur le styleguide.
const router =
  import.meta.env.VITE_ROUTER === 'memory'
    ? createMemoryRouter(routes, { initialEntries: ['/styleguide'] })
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
