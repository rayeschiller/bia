/**
 * Tiny synthesized sound effects (Web Audio, no files). Every call is a no-op
 * when unsupported. Phones only allow audio after a tap, so the first sound
 * should come from a click handler (the Check button) to unlock the context.
 */
type Win = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctor = window.AudioContext ?? (window as Win).webkitAudioContext;
    if (!Ctor) return null;
    ctx ??= new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

interface Note {
  freq: number;
  start: number; // seconds from now
  dur: number;
  type?: OscillatorType;
  gain?: number;
}

function play(notes: Note[]): void {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + 0.01;
  for (const n of notes) {
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = n.type ?? "sine";
    osc.frequency.setValueAtTime(n.freq, t0 + n.start);
    const peak = n.gain ?? 0.18;
    // Quick attack, smooth decay so nothing clicks.
    amp.gain.setValueAtTime(0.0001, t0 + n.start);
    amp.gain.exponentialRampToValueAtTime(peak, t0 + n.start + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + n.start + n.dur);
    osc.connect(amp).connect(ac.destination);
    osc.start(t0 + n.start);
    osc.stop(t0 + n.start + n.dur + 0.02);
  }
}

/** Bright rising two-note "ding". */
export function playCorrect(): void {
  play([
    { freq: 784, start: 0, dur: 0.14, type: "triangle" }, // G5
    { freq: 1175, start: 0.09, dur: 0.32, type: "triangle" }, // D6
  ]);
}

/** Soft low double buzz. */
export function playWrong(): void {
  play([
    { freq: 196, start: 0, dur: 0.16, type: "square", gain: 0.07 },
    { freq: 165, start: 0.15, dur: 0.24, type: "square", gain: 0.07 },
  ]);
}

/** Little rising fanfare for finishing a lesson. */
export function playComplete(): void {
  play([
    { freq: 523, start: 0, dur: 0.16, type: "triangle" }, // C5
    { freq: 659, start: 0.12, dur: 0.16, type: "triangle" }, // E5
    { freq: 784, start: 0.24, dur: 0.16, type: "triangle" }, // G5
    { freq: 1047, start: 0.36, dur: 0.5, type: "triangle", gain: 0.2 }, // C6
  ]);
}
