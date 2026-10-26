import { rivets } from './shieldGeometry';

type DayShieldProps = {
  /** Objectifs réussis parmi ceux à faire aujourd'hui. */
  done: number;
  /** Objectifs à faire aujourd'hui (les facultatifs ne comptent pas). */
  total: number;
  /** Libellé sous le compte, ex. « objectifs ». */
  unit: string;
  label: string;
  size?: number;
};

const C = 70;
const GAUGE_R = 64;
const CIRCUMFERENCE = 2 * Math.PI * GAUGE_R;

/**
 * Bouclier du jour : le bord en or se remplit comme une jauge (part des objectifs réussis),
 * le compte « 4/5 » est gravé sur la bosse. Les planches de bois ne sont qu'un décor.
 */
export function DayShield({ done, total, unit, label, size = 190 }: DayShieldProps) {
  const ratio = total > 0 ? Math.min(1, done / total) : 0;
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" role="img" aria-label={label}>
      <circle cx={C} cy={C} r={60} fill="var(--color-surface)" />
      <g stroke="var(--color-surface-raised)" strokeWidth={2}>
        <path d="M70 12V128M12 70H128M29 29L111 111M111 29L29 111" />
      </g>
      <g stroke="var(--color-border)" strokeWidth={1} fill="none">
        <path d="M84 30 Q94 36 100 32M44 30 Q52 26 58 32M36 96 Q46 92 54 98M88 104 Q96 100 104 106" />
      </g>
      <circle cx={C} cy={C} r={GAUGE_R} fill="none" stroke="var(--color-border)" strokeWidth={8} />
      {ratio > 0 && (
        <circle
          cx={C}
          cy={C}
          r={GAUGE_R}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={8}
          strokeDasharray={`${(ratio * CIRCUMFERENCE).toFixed(1)} ${CIRCUMFERENCE.toFixed(1)}`}
          transform={`rotate(-90 ${C} ${C})`}
        />
      )}
      <g fill="var(--color-bg)">
        {rivets(8, C, C, GAUGE_R).map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={1.8} />
        ))}
      </g>
      <circle
        cx={C}
        cy={C}
        r={30}
        fill="var(--color-border)"
        stroke="var(--color-text-muted)"
        strokeWidth={2}
      />
      <circle cx={C} cy={C} r={25} fill="none" stroke="var(--color-frost-deep)" strokeWidth={1} />
      <text
        x={C}
        y={C + 4}
        textAnchor="middle"
        fill="var(--color-text)"
        style={{ fontFamily: 'var(--font-numeric)', fontWeight: 700, fontSize: 26 }}
      >
        {total > 0 ? `${done}/${total}` : '–'}
      </text>
      <text
        x={C}
        y={C + 18}
        textAnchor="middle"
        fill="var(--color-text-muted)"
        style={{ fontFamily: 'var(--font-body)', fontSize: 8 }}
      >
        {unit}
      </text>
    </svg>
  );
}
