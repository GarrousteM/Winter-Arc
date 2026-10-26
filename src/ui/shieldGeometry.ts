// Géométrie des boucliers ronds (planches, rivets). Fonctions pures.

const round = (n: number) => Math.round(n * 10) / 10;

function polar(cx: number, cy: number, r: number, degrees: number): [number, number] {
  const a = (degrees * Math.PI) / 180;
  return [round(cx + r * Math.cos(a)), round(cy + r * Math.sin(a))];
}

/** Chemin SVG de la planche `index` sur `count`, en partant du haut, dans le sens horaire. */
export function plankPath(index: number, count: number, cx: number, cy: number, r: number): string {
  if (count <= 1) {
    return `M${cx - r} ${cy} A${r} ${r} 0 1 1 ${cx + r} ${cy} A${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
  }
  const step = 360 / count;
  const [x0, y0] = polar(cx, cy, r, -90 + index * step);
  const [x1, y1] = polar(cx, cy, r, -90 + (index + 1) * step);
  const large = step > 180 ? 1 : 0;
  return `M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
}

/** Lignes de jointure entre les planches (du centre au bord). */
export function plankSeams(count: number, cx: number, cy: number, r: number): string {
  if (count <= 1) return '';
  const step = 360 / count;
  return Array.from({ length: count }, (_, i) => {
    const [x, y] = polar(cx, cy, r, -90 + i * step);
    return `M${cx} ${cy}L${x} ${y}`;
  }).join('');
}

/** Positions des rivets répartis sur le bord. */
export function rivets(count: number, cx: number, cy: number, r: number): [number, number][] {
  return Array.from({ length: count }, (_, i) => polar(cx, cy, r, (i * 360) / count));
}
