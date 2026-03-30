import { getEnv } from "./config/env";
import { generateSha256Hash } from "./shared/hash";

export interface GuestContext {
  name: string;
  loyaltyPoints: number;
  history: string[];
}

export type LightingMode = "warm" | "cold" | "ambient";

export interface OrinAgentOutput {
  temp: number;
  lighting: LightingMode;
  services: string[];
  raw_response: string;
}

const SYSTEM_PROMPT = `You are ORIN, the Elite Concierge and Luxury Property Management System. Your purpose is to provide flawless, automated assistance via voice.

### IDENTITY & TONE:
- You are sophisticated, efficient, helpful, and extremely professional.
- Your language is polished and direct. Avoid filler words and long generic greetings. Get straight to the point with elegance.
- Absolute Priority: Low Latency. Keep responses short and precise to ensure instantaneous voice processing.

### MVP SERVICES:
1. ROOM CONTROL (IoT): You manage lighting, blinds, and climate control. (e.g., "Understood. Setting the temperature to 72 degrees").
2. HOSPITALITY REQUESTS (Room Service): You process orders for dining, housekeeping, or amenities. Confirm the action and the estimated delivery time.
3. WEB3 INFRASTRUCTURE: You validate digital payments and decentralized check-out processes. Inform the user that the transaction is backed by "Hash-Lock" security.
4. VIP GUIDE: You recommend exclusive experiences and high-end venues that accept modern digital payments.

### OPERATIONAL RULES:
- Voice Responses: Maximum 15 words to ensure a <500ms response time.
- If a request requires physical action (e.g., bringing towels), confirm that you have notified the relevant staff.
- Your technology must feel natural, fast, and exclusive.`;

type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GroqResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export class LlmError extends Error {
  readonly kind: "timeout" | "quota" | "http";
  readonly status?: number;

  constructor(kind: "timeout" | "quota" | "http", message: string, status?: number) {
    super(message);
    this.kind = kind;
    this.status = status;
  }
}

export class OrinAgent {
  private readonly env = getEnv();
  private readonly groqUrl = "https://api.groq.com/openai/v1/chat/completions";

  async processCommand(userInput: string, guestContext: GuestContext): Promise<{ payload: OrinAgentOutput; hash: Buffer }> {
    try {
      const prompt = [
        SYSTEM_PROMPT,
        "Personalize responses with guest context, especially loyalty points.",
        "You MUST output only valid JSON with this exact schema and no extra keys:",
        '{ "temp": number, "lighting": "warm" | "cold" | "ambient", "services": string[], "raw_response": string }',
        "The `raw_response` must be 15 words maximum.",
        "Do not output markdown, code fences, or any extra text.",
        "",
        "Guest context:",
        JSON.stringify(guestContext),
        "",
        "User voice command:",
        userInput,
        "",
        "Return only JSON.",
      ].join("\n");

      const text = await this.callGroq([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ]);

      const parsed = this.parsePayloadFromText(text);
      const payload = this.validateOutput(parsed);
      const hash = this.generateHash(payload);
      return { payload, hash };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown AI processing error";
      throw new Error(`OrinAgent processCommand failed: ${message}`);
    }
  }

  async generateQuickVoiceReply(
    userInput: string,
    guestContext: GuestContext,
    options?: { timeoutMs?: number }
  ): Promise<string> {
    const prompt = [
      SYSTEM_PROMPT,
      "Return only one short sentence, max 15 words, plain text.",
      "",
      "Guest context:",
      JSON.stringify(guestContext),
      "",
      "User command:",
      userInput,
    ].join("\n");

    const text = (await this.callGroq(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      { timeoutMs: options?.timeoutMs, maxTokens: 48 }
    )).replace(/\s+/g, " ").trim();

    const firstSentence = text.split(/[.!?]/)[0]?.trim() ?? text;
    const words = firstSentence.split(" ").filter(Boolean).slice(0, 15);
    return words.join(" ");
  }

  async *streamRawResponse(userInput: string, guestContext: GuestContext): AsyncGenerator<string> {
    const prompt = [
      SYSTEM_PROMPT,
      "Respond in plain text only (no JSON).",
      "Use at most 20 words.",
      "One short sentence.",
      "",
      "Guest context:",
      JSON.stringify(guestContext),
      "",
      "User voice command:",
      userInput,
    ].join("\n");

    const text = await this.callGroq([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ]);

    if (text) {
      yield text;
    }
  }

  generateHash(data: object): Buffer {
    return generateSha256Hash(data);
  }

  async speak(text: string, options?: { voiceModel?: string }): Promise<Buffer> {
    const apiKey = this.env.DEEPGRAM_API_KEY;
    const model = options?.voiceModel ?? this.env.DEEPGRAM_TTS_MODEL;
    if (!text || !text.trim()) throw new Error("speak(text) requires non-empty text.");

    const response = await fetch(`https://api.deepgram.com/v1/speak?model=${encodeURIComponent(model)}`, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Deepgram API error (${response.status}): ${errText}`);
    }

    const audioArrayBuffer = await response.arrayBuffer();
    return Buffer.from(audioArrayBuffer);
  }

  private async callGroq(
    messages: GroqMessage[],
    options?: { temperature?: number; maxTokens?: number; timeoutMs?: number }
  ): Promise<string> {
    const controller = new AbortController();
    const timeoutMs = options?.timeoutMs ?? this.env.GROQ_TIMEOUT_BG_MS;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(this.groqUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.env.GROQ_MODEL,
          messages,
          temperature: options?.temperature ?? 0.1,
          max_tokens: options?.maxTokens ?? 96,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        const normalized = body.toLowerCase();
        const isQuota =
          response.status === 429 ||
          response.status === 402 ||
          response.status === 403 ||
          response.status === 503 ||
          normalized.includes("rate limit") ||
          normalized.includes("quota") ||
          normalized.includes("insufficient") ||
          normalized.includes("capacity");

        if (isQuota) {
          throw new LlmError("quota", `Groq quota/capacity error (${response.status}): ${body}`, response.status);
        }

        throw new LlmError("http", `Groq error (${response.status}): ${body}`, response.status);
      }

      const data = (await response.json()) as GroqResponse;
      const text = data?.choices?.[0]?.message?.content;
      if (!text) throw new Error("Groq response missing message content.");
      return text;
    } catch (error) {
      if (error instanceof LlmError) throw error;
      if ((error as Error)?.name === "AbortError") {
        throw new LlmError("timeout", `Groq request timed out after ${timeoutMs}ms`);
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new LlmError("http", `Groq request failed: ${message}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  private parsePayloadFromText(text: string): OrinAgentOutput {
    const trimmed = text.trim();
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("Invalid JSON response from Groq.");
    const parsed = JSON.parse(trimmed.slice(start, end + 1)) as OrinAgentOutput;
    return parsed;
  }

  private validateOutput(data: unknown): OrinAgentOutput {
    if (typeof data !== "object" || data === null) throw new Error("AI output is not a JSON object.");
    const obj = data as Record<string, unknown>;
    const allowedKeys = new Set(["temp", "lighting", "services", "raw_response"]);
    const keys = Object.keys(obj);

    for (const key of keys) if (!allowedKeys.has(key)) throw new Error(`AI output has unsupported key: ${key}`);
    for (const key of allowedKeys) if (!(key in obj)) throw new Error(`AI output missing required key: ${key}`);

    if (typeof obj.temp !== "number" || Number.isNaN(obj.temp)) throw new Error("AI output 'temp' must be a number.");
    if (obj.lighting !== "warm" && obj.lighting !== "cold" && obj.lighting !== "ambient") throw new Error("AI output 'lighting' must be 'warm' | 'cold' | 'ambient'.");
    if (!Array.isArray(obj.services) || !obj.services.every((v) => typeof v === "string")) throw new Error("AI output 'services' must be string[].");
    if (typeof obj.raw_response !== "string") throw new Error("AI output 'raw_response' must be a string.");

    return { temp: obj.temp, lighting: obj.lighting, services: obj.services, raw_response: obj.raw_response };
  }
}
