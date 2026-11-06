/**
 * Audio stub: speaks Persian with the browser's speechSynthesis.
 * A recorded-audio pipeline will replace the internals later; keep the signature.
 */
export function speak(text: string, opts: { rate?: number } = {}): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    const voice = voices.find((v) => v.lang === "fa-IR") ?? voices.find((v) => v.lang.startsWith("fa"));
    // Voices load asynchronously. An empty list means "not loaded yet", so let the
    // browser resolve lang="fa-IR" itself; a loaded list with no Persian voice is a no-op.
    if (voices.length > 0 && !voice) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fa-IR";
    if (voice) u.voice = voice;
    u.rate = opts.rate ?? 1;
    synth.cancel();
    synth.speak(u);
  } catch {
    // Audio is a nicety; never break the lesson over it.
  }
}
