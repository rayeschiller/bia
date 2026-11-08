import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { getAllItems } from "@/lib/content";

export const runtime = "nodejs";

const VOICE = "fa-IR-DilaraNeural";

/** Only Persian text from our own content can be spoken, so this can't be used as an open TTS proxy. */
const ALLOWED = new Set(getAllItems().map((item) => item.fa));

async function synthesize(text: string): Promise<Buffer> {
  const tts = new MsEdgeTTS({ connectionTimeoutMs: 8000, synthesisTimeoutMs: 15000 });
  try {
    await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(text);
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      audioStream.on("data", (c: Buffer) => chunks.push(c));
      audioStream.on("close", () => resolve());
      audioStream.on("error", reject);
    });
    return Buffer.concat(chunks);
  } finally {
    tts.close();
  }
}

/** GET /api/tts?t=<persian text> → MP3. Cached at the CDN, so each phrase is generated once. */
export async function GET(req: Request) {
  const text = new URL(req.url).searchParams.get("t")?.trim() ?? "";
  if (!ALLOWED.has(text)) return new Response("Unknown text", { status: 404 });
  try {
    const audio = await synthesize(text);
    if (audio.length === 0) throw new Error("empty audio");
    return new Response(new Uint8Array(audio), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("tts failed", err);
    return new Response("TTS unavailable", { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
