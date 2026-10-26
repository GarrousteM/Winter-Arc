type ShieldWallProps = {
  standing: number;
  total: number;
  /** Boucliers à briser pour vaincre : les derniers debout de ce seuil sont cerclés d'or. */
  toBreak: number;
  label: string;
};

/** PV du boss en mur de boucliers : brisés à gauche (pointillés), debout en braise. */
export function ShieldWall({ standing, total, toBreak, label }: ShieldWallProps) {
  const broken = total - standing;
  // Les boucliers qui peuvent rester debout à la victoire (au-delà du seuil) sont cerclés d'or.
  const spare = total - toBreak;
  return (
    <svg
      width="100%"
      viewBox={`0 0 ${total * 25} 30`}
      role="img"
      aria-label={label}
      style={{ maxWidth: total * 25 }}
    >
      {Array.from({ length: total }, (_, i) => {
        const cx = 12 + i * 25;
        if (i < broken) {
          return (
            <circle
              key={i}
              cx={cx}
              cy={15}
              r={11}
              fill="var(--color-bg)"
              stroke="var(--color-border)"
              strokeWidth={2}
              strokeDasharray="4 3"
            />
          );
        }
        return (
          <g key={i}>
            <circle
              cx={cx}
              cy={15}
              r={11}
              fill="var(--cat-1)"
              stroke={i >= total - spare ? 'var(--color-accent)' : 'var(--color-text-muted)'}
              strokeWidth={2}
            />
            <circle cx={cx} cy={15} r={3} fill="var(--color-text-muted)" />
          </g>
        );
      })}
    </svg>
  );
}
