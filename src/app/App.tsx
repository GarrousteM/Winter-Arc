import { IconContext } from '@phosphor-icons/react';
import { MotionConfig } from 'framer-motion';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePlaceholder } from './routes/HomePlaceholder';
import { StyleguidePage } from './routes/StyleguidePage';

const router = createBrowserRouter([
  { path: '/', element: <HomePlaceholder /> },
  { path: '/styleguide', element: <StyleguidePage /> },
  { path: '*', element: <HomePlaceholder /> },
]);

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
