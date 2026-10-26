import { useLayoutEffect, useRef, useState, type PointerEvent } from 'react';

export type LinePoint = {
  /** Libellé de l'abscisse (ex. une date formatée). */
  label: string;
  value: number | undefined;
  target: number | undefined;
};

type LineChartProps = {
  points: LinePoint[];
  /** Token de la couleur de la série (identité de l'objectif). */
  colorToken: string;
  ariaLabel: string;
  formatValue: (value: number) => string;
  /** Graduations de l'axe vertical, sans unité pour tenir dans la marge. */
  formatTick: (value: number) => string;
  /** Unité affichée au-dessus de l'axe vertical. */
  unit: string;
  targetLabel: string;
  noValueLabel: string;
  /** Libellés des extrémités de l'axe des abscisses. */
  firstLabel: string;
  lastLabel: string;
};

const HEIGHT = 180;
const PAD = { top: 20, right: 12, bottom: 24, left: 40 };

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(320);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);
  return { ref, width };
}

/** Arrondit le haut de l'échelle à un multiple « propre » (1, 2, 5 × 10^n). */
function niceMax(value: number): number {
  if (value <= 0) return 1;
  const exp = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((m) => m * exp >= value) ?? 10;
  return step * exp;
}

/**
 * Courbe d'une série (valeurs saisies) avec la cible en pointillés.
 * Les jours sans saisie coupent la ligne. Réticule + infobulle au toucher et au clavier.
 */
export function LineChart({
  points,
  colorToken,
  ariaLabel,
  formatValue,
  formatTick,
  unit,
  targetLabel,
  noValueLabel,
  firstLabel,
  lastLabel,
}: LineChartProps) {
  const { ref, width } = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | undefined>(undefined);

  const max = niceMax(
    Math.max(...points.map((p) => Math.max(p.value ?? 0, p.target ?? 0)), 0) * 1.1,
  );
  const innerW = Math.max(1, width - PAD.left - PAD.right);
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) =>
    PAD.left + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;

  // Segments continus de valeurs saisies.
  const segments: string[] = [];
  let current: string[] = [];
  points.forEach((p, i) => {
    if (p.value === undefined) {
      if (current.length) segments.push(current.join(' '));
      current = [];
      return;
    }
    current.push(`${current.length ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`);
  });
  if (current.length) segments.push(current.join(' '));

  // Cible en escalier (elle peut changer en cours d'Arc).
  const targetPath = points
    .map((p, i) =>
      p.target === undefined
        ? ''
        : `${i === 0 || points[i - 1]?.target === undefined ? 'M' : 'L'}${x(i).toFixed(1)} ${y(p.target).toFixed(1)}`,
    )
    .join(' ');

  const ticks = [0, max / 2, max];
  const lastIndex = points.reduce((acc, p, i) => (p.value !== undefined ? i : acc), -1);
  const lastValue = points[lastIndex]?.value;

  const pick = (event: PointerEvent<SVGRectElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / box.width;
    setActive(Math.max(0, Math.min(points.length - 1, Math.round(ratio * (points.length - 1)))));
  };

  const activePoint = active === undefined ? undefined : points[active];

  return (
    <div ref={ref} className="relative w-full">
      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={ariaLabel}
        tabIndex={0}
        className="block outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const step = e.key === 'ArrowRight' ? 1 : -1;
            setActive((a) => Math.max(0, Math.min(points.length - 1, (a ?? lastIndex) + step)));
          }
        }}
        onBlur={() => {
          setActive(undefined);
        }}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 6}
              y={y(tick)}
              dy="0.32em"
              textAnchor="end"
              fill="var(--color-text-muted)"
              className="numeric text-xs"
            >
              {formatTick(tick)}
            </text>
          </g>
        ))}
        {unit && (
          <text
            x={PAD.left - 6}
            y={10}
            textAnchor="end"
            fill="var(--color-text-muted)"
            className="text-xs"
          >
            {unit}
          </text>
        )}
        <text x={PAD.left} y={HEIGHT - 6} fill="var(--color-text-muted)" className="text-xs">
          {firstLabel}
        </text>
        <text
          x={width - PAD.right}
          y={HEIGHT - 6}
          textAnchor="end"
          fill="var(--color-text-muted)"
          className="text-xs"
        >
          {lastLabel}
        </text>

        {targetPath && (
          <path
            d={targetPath}
            fill="none"
            stroke="var(--color-text-muted)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
        )}
        {segments.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={`var(${colorToken})`}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {/* Points isolés (jour saisi entre deux trous) : sinon invisibles. */}
        {points.map((p, i) =>
          p.value !== undefined &&
          points[i - 1]?.value === undefined &&
          points[i + 1]?.value === undefined ? (
            <circle key={i} cx={x(i)} cy={y(p.value)} r={2.5} fill={`var(${colorToken})`} />
          ) : null,
        )}
        {lastValue !== undefined && (
          <circle
            cx={x(lastIndex)}
            cy={y(lastValue)}
            r={4}
            fill={`var(${colorToken})`}
            stroke="var(--color-surface)"
            strokeWidth={2}
          />
        )}

        {activePoint && active !== undefined && (
          <g pointerEvents="none">
            <line
              x1={x(active)}
              x2={x(active)}
              y1={PAD.top}
              y2={PAD.top + innerH}
              stroke="var(--color-text-muted)"
              strokeWidth={1}
            />
            {activePoint.value !== undefined && (
              <circle
                cx={x(active)}
                cy={y(activePoint.value)}
                r={5}
                fill={`var(${colorToken})`}
                stroke="var(--color-surface)"
                strokeWidth={2}
              />
            )}
          </g>
        )}

        <rect
          x={PAD.left}
          y={PAD.top}
          width={innerW}
          height={innerH}
          fill="transparent"
          onPointerMove={pick}
          onPointerDown={pick}
          onPointerLeave={() => {
            setActive(undefined);
          }}
        />
      </svg>

      {activePoint && active !== undefined && (
        <div
          role="status"
          className="pointer-events-none absolute top-0 flex flex-col gap-0.5 rounded border border-border bg-surface-raised px-2 py-1 text-xs"
          style={x(active) > width / 2 ? { right: width - x(active) + 8 } : { left: x(active) + 8 }}
        >
          <span className="numeric text-base text-text">
            {activePoint.value === undefined ? noValueLabel : formatValue(activePoint.value)}
          </span>
          {activePoint.target !== undefined && (
            <span className="flex items-center gap-1 text-muted">
              <span
                aria-hidden="true"
                className="inline-block w-3 border-t border-dashed border-muted"
              />
              {targetLabel} {formatValue(activePoint.target)}
            </span>
          )}
          <span className="text-muted">{activePoint.label}</span>
        </div>
      )}
    </div>
  );
}
