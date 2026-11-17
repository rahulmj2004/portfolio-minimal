// Turns a chat answer into speech with ElevenLabs (voice "Aby", model Eleven v4) and streams the MP3.
// Needs ELEVENLABS_API_KEY in the environment (.env.local on your Mac, Vercel → Environment Variables live).
// Identical answers are cached by Vercel's CDN, so repeat questions don't use more ElevenLabs credit.

export const runtime = "nodejs";

const VOICE_ID = "jC5gBeWiOWA75lYTC3ux"; // Aby: crisp, clear, conversational
const MODEL_ID = "eleven_v4";
const MAX_CHARS = 900;

// per-visitor limit so nobody can drain the ElevenLabs credit
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 40;
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_REQUESTS;
}

export async function GET(req: Request) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return new Response("not_configured", { status: 503 });

  const params = new URL(req.url).searchParams;
  const text = params.get("t")?.trim() ?? "";
  const language = params.get("l") === "ml" ? "ml" : "en"; // Malayalam or English, same voice
  if (!text || text.length > MAX_CHARS) return new Response("bad_request", { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return new Response("rate_limited", { status: 429 });

  const upstream = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream?output_format=mp3_44100_96`,
    {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({ text, model_id: MODEL_ID, language_code: language }),
    },
  ).catch(() => null);

  if (!upstream?.ok || !upstream.body) {
    // out of credit, bad key or ElevenLabs down → the browser falls back to its own voice
    console.error("tts failed", upstream?.status);
    return new Response("tts_failed", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      // same text → same audio, so let the CDN keep it for a year
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
    },
  });
}
