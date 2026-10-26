/** Vibration légère si l'appareil la permet (Android ; ignorée ailleurs). */
export function vibrate(pattern: number | number[]): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
  } catch {
    // Certains navigateurs refusent la vibration hors geste utilisateur : sans conséquence.
  }
}
