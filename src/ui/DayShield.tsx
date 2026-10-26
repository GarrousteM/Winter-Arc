import { plankPath, plankSeams, rivets } from './shieldGeometry';

export type ShieldPlank = { key: string; colorToken: string; done: boolean };

type DayShieldProps = {
  planks: ShieldPlank[];
  /** Texte de la bosse centrale (ex. le pourcentage). */
  center: string;
  label: string;
  size?: number;
};

const C = 70;
const RIM = 68;
const FACE = 58;

/**
 * Bouclier du jour : une planche par objectif qui compte, peinte à la couleur de sa catégorie
 * quand il est réussi. Bord en or riveté, bosse en fer au centre.
 */
export function DayShield({ planks, center, label, size = 168 }: DayShieldProps) {
  const count = Math.max(1, planks.length);
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" role="img" aria-label={label}>
      <circle
        cx={C}
        cy={C}
        r={RIM}
        fill="var(--color-surface-raised)"
        stroke="var(--color-accent)"
        strokeWidth={3}
      />
      {planks.length === 0 ? (
        <circle cx={C} cy={C} r={FACE} fill="var(--color-surface)" />
      ) : (
        planks.map((plank, i) => (
          <path
            key={plank.key}
            d={plankPath(i, count, C, C, FACE)}
            fill={plank.done ? `var(${plank.colorToken})` : 'var(--color-surface)'}
          />
        ))
      )}
      {/* Veines du bois sur les planches nues. */}
      <g stroke="var(--color-border)" strokeWidth={1} fill="none" opacity={0.8}>
        <path d="M84 30 Q94 36 100 32M44 30 Q52 26 58 32M36 96 Q46 92 54 98M88 104 Q96 100 104 106" />
      </g>
      <path d={plankSeams(planks.length, C, C, FACE)} stroke="var(--color-bg)" strokeWidth={2.5} />
      <circle cx={C} cy={C} r={FACE} fill="none" stroke="var(--color-bg)" strokeWidth={2} />
      <g fill="var(--color-text-muted)">
        {rivets(12, C, C, 63).map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={2.2} />
        ))}
      </g>
      <circle
        cx={C}
        cy={C}
        r={24}
        fill="var(--color-border)"
        stroke="var(--color-text-muted)"
        strokeWidth={2}
      />
      <circle cx={C} cy={C} r={19} fill="none" stroke="var(--color-frost-deep)" strokeWidth={1} />
      <text
        x={C}
        y={C + 7}
        textAnchor="middle"
        fill="var(--color-text)"
        style={{ fontFamily: 'var(--font-numeric)', fontWeight: 700, fontSize: 22 }}
      >
        {center}
      </text>
    </svg>
  );
}
