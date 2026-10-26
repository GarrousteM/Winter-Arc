import { useMemo } from 'react';
import { usePrefersReducedMotion } from '@/lib/motion';

type SnowFieldProps = {
  count?: number;
};

// Générateur pseudo-aléatoire déterministe pour un rendu stable entre deux rendus.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Neige fine en fond. Rien n'est rendu si l'utilisateur préfère réduire les animations. */
export function SnowField({ count = 36 }: SnowFieldProps) {
  const reduced = usePrefersReducedMotion();
  const flakes = useMemo(() => {
    const rand = mulberry32(1101);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: rand() * 100,
      size: 1 + rand() * 2,
      opacity: 0.15 + rand() * 0.35,
      duration: 14 + rand() * 16,
      delay: -rand() * 30,
      drift: (rand() - 0.5) * 60,
    }));
  }, [count]);

  if (reduced) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {flakes.map((f) => (
        <span
          key={f.id}
          className="absolute top-0 rounded-full bg-text"
          style={{
            left: `${f.left}%`,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
            ['--drift' as string]: `${f.drift}px`,
            animation: `snow-fall ${f.duration}s linear ${f.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
