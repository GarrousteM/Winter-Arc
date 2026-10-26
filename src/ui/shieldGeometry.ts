// Géométrie des boucliers ronds (rivets). Fonctions pures.

const round = (n: number) => Math.round(n * 10) / 10;

function polar(cx: number, cy: number, r: number, degrees: number): [number, number] {
  const a = (degrees * Math.PI) / 180;
  return [round(cx + r * Math.cos(a)), round(cy + r * Math.sin(a))];
}

/** Positions des rivets répartis sur le bord. */
export function rivets(count: number, cx: number, cy: number, r: number): [number, number][] {
  return Array.from({ length: count }, (_, i) => polar(cx, cy, r, (i * 360) / count));
}
