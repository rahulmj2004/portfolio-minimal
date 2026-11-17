import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/knowledge";

// Streams answers from Claude, grounded only on the portfolio content.
// Needs ANTHROPIC_API_KEY set in the environment (Vercel → Settings → Environment Variables).

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_TURNS = 12;
const MAX_CHARS = 600;

// Basic per-visitor limit so the key can't be drained. In-memory, so it resets
// per server instance; good enough for a portfolio.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 15;
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_REQUESTS;
}

function isValid(messages: unknown): messages is Anthropic.MessageParam[] {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_TURNS) return false;
  return messages.every(
    (m, i) =>
      m &&
      typeof m.content === "string" &&
      m.content.trim().length > 0 &&
      m.content.length <= MAX_CHARS * 4 &&
      m.role === (i % 2 === 0 ? "user" : "assistant"),
  ) && messages[messages.length - 1].role === "user" && messages[messages.length - 1].content.length <= MAX_CHARS;
}

const client = new Anthropic();

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  let body: { messages?: unknown; lang?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  if (!isValid(body.messages)) return Response.json({ error: "bad_request" }, { status: 400 });

  const stream = client.beta.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 2000,
    output_config: { effort: "low" }, // short factual chat: low effort keeps answers fast and cheap
    // Re-runs a declined request on Anthropic's recommended fallback model instead of failing
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    // The system prompt never changes, so cache it (~90% cheaper after the first visitor)
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      ...(body.lang === "ml"
        ? [{ type: "text" as const, text: "Reply in Malayalam. Keep project names, people's names and technical terms in English." }]
        : []),
    ],
    messages: body.messages,
  });

  const encoder = new TextEncoder();
  const out = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\n\nI can't help with that one. Try asking about Rahul's projects or skills."));
        }
      } catch (err) {
        console.error("chat stream failed", err instanceof Anthropic.APIError ? err.status : err);
        controller.enqueue(encoder.encode("\n\nSorry, something went wrong. Please try again in a moment."));
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(out, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
