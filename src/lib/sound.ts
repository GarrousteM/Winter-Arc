// Sons synthétisés via Web Audio API (décision 11) : discrets, sans fichier à charger.
// Remplaçables plus tard par de vrais enregistrements sans changer les appels.

let context: AudioContext | undefined;

/** Contexte audio créé à la demande (il doit naître pendant un geste de l'utilisateur sur iOS). */
function audio(): AudioContext | undefined {
  try {
    // Sans geste préalable de l'utilisateur, le navigateur refuserait le son : on s'abstient.
    if (
      typeof navigator !== 'undefined' &&
      'userActivation' in navigator &&
      !navigator.userActivation.hasBeenActive
    ) {
      return undefined;
    }
    if (!context) {
      const Ctor = window.AudioContext as typeof AudioContext | undefined;
      if (!Ctor) return undefined;
      context = new Ctor();
    }
    if (context.state === 'suspended') void context.resume();
    return context;
  } catch {
    return undefined;
  }
}

/** Volume général : discret. */
const MASTER = 0.18;

function noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function envelope(ctx: AudioContext, peak: number, attack: number, decay: number): GainNode {
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak * MASTER, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);
  gain.connect(ctx.destination);
  return gain;
}

/** Coup sourd sur un bouclier : grave court + souffle de bois. */
export function playShieldThud(): void {
  const ctx = audio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const body = ctx.createOscillator();
  body.type = 'sine';
  body.frequency.setValueAtTime(140, now);
  body.frequency.exponentialRampToValueAtTime(55, now + 0.15);
  body.connect(envelope(ctx, 1, 0.005, 0.18));
  body.start(now);
  body.stop(now + 0.25);

  const knock = ctx.createBufferSource();
  knock.buffer = noiseBuffer(ctx, 0.08);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  knock.connect(filter);
  filter.connect(envelope(ctx, 0.5, 0.002, 0.06));
  knock.start(now);
}

/** Cor de guerre : deux notes graves cuivrées, avec léger vibrato. */
export function playWarHorn(long = true): void {
  const ctx = audio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes: [number, number, number][] = long
    ? [
        [110, 0, 0.6],
        [165, 0.55, 1.1],
      ]
    : [[146.8, 0, 0.7]];
  for (const [freq, start, length] of notes) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq * 0.97, now + start);
    osc.frequency.linearRampToValueAtTime(freq, now + start + 0.12);
    const vibrato = ctx.createOscillator();
    vibrato.frequency.value = 5;
    const depth = ctx.createGain();
    depth.gain.value = 2;
    vibrato.connect(depth);
    depth.connect(osc.frequency);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now + start);
    gain.gain.exponentialRampToValueAtTime(0.7 * MASTER, now + start + 0.15);
    gain.gain.setValueAtTime(0.7 * MASTER, now + start + length - 0.25);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + length);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + start);
    vibrato.start(now + start);
    osc.stop(now + start + length + 0.05);
    vibrato.stop(now + start + length + 0.05);
  }
}

/** Fracas : bruit large qui s'éteint, sur un impact grave. */
export function playCrash(): void {
  const ctx = audio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const crash = ctx.createBufferSource();
  crash.buffer = noiseBuffer(ctx, 1.2);
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.setValueAtTime(2200, now);
  band.frequency.exponentialRampToValueAtTime(500, now + 1);
  crash.connect(band);
  band.connect(envelope(ctx, 0.9, 0.01, 1));
  crash.start(now);

  const boom = ctx.createOscillator();
  boom.type = 'sine';
  boom.frequency.setValueAtTime(90, now);
  boom.frequency.exponentialRampToValueAtTime(35, now + 0.4);
  boom.connect(envelope(ctx, 1, 0.005, 0.45));
  boom.start(now);
  boom.stop(now + 0.5);
}
