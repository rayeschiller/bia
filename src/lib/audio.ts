/**
 * Persian audio. Plays a neural-voice MP3 from /api/tts (generated once, then
 * CDN-cached). If that fails, falls back to the browser's own Persian voice when
 * it has one. Audio is a nicety: it never throws.
 */
let player: HTMLAudioElement | null = null;

export function audioUrl(text: string): string {
  return `/api/tts?t=${encodeURIComponent(text)}`;
}

export function speak(text: string, opts: { rate?: number } = {}): void {
  if (typeof window === "undefined") return;
  const rate = opts.rate ?? 1;
  try {
    window.speechSynthesis?.cancel();
    if (!player) player = new Audio();
    player.pause();
    player.src = audioUrl(text);
    player.playbackRate = rate; // browsers keep pitch when slowing down
    player.play().catch((err: unknown) => {
      // NotAllowedError = autoplay blocked before any tap; stay quiet, the speaker button still works.
      if (err instanceof DOMException && err.name === "NotAllowedError") return;
      speakWithBrowserVoice(text, rate);
    });
  } catch {
    speakWithBrowserVoice(text, rate);
  }
}

function speakWithBrowserVoice(text: string, rate: number): void {
  try {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith("fa"));
    if (!voice) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voice.lang;
    u.voice = voice;
    u.rate = rate;
    synth.cancel();
    synth.speak(u);
  } catch {
    // ignore
  }
}
