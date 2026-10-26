import type { Config } from 'tailwindcss';

// Toutes les valeurs proviennent de src/theme/tokens.css.
// Les clés sont définies dans `theme` (et non `extend`) pour supprimer la palette Tailwind par défaut.
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      bg: 'var(--color-bg)',
      surface: 'var(--color-surface)',
      'surface-raised': 'var(--color-surface-raised)',
      border: 'var(--color-border)',
      text: 'var(--color-text)',
      muted: 'var(--color-text-muted)',
      'on-accent': 'var(--color-on-accent)',
      accent: 'var(--color-accent)',
      frost: 'var(--color-frost)',
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      cat: {
        1: 'var(--cat-1)',
        2: 'var(--cat-2)',
        3: 'var(--cat-3)',
        4: 'var(--cat-4)',
        5: 'var(--cat-5)',
        6: 'var(--cat-6)',
      },
    },
    fontFamily: {
      display: 'var(--font-display)',
      body: 'var(--font-body)',
      numeric: 'var(--font-numeric)',
    },
    borderRadius: {
      none: '0',
      DEFAULT: 'var(--radius)',
      full: '9999px',
    },
    borderWidth: {
      0: '0',
      DEFAULT: 'var(--border-width)',
      rule: 'var(--accent-rule)',
    },
    boxShadow: {
      none: 'none',
    },
    letterSpacing: {
      normal: '0',
      display: 'var(--tracking-display)',
    },
    transitionDuration: {
      fast: 'var(--duration-fast)',
      impact: 'var(--duration-impact)',
      base: 'var(--duration-base)',
    },
    transitionTimingFunction: {
      heavy: 'var(--ease-heavy)',
    },
    extend: {
      minHeight: { touch: 'var(--touch-min)' },
      minWidth: { touch: 'var(--touch-min)' },
    },
  },
  plugins: [],
};

export default config;
