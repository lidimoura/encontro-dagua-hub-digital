/**
 * ─── Gemini Proxy — Centralized API Key Management ───────────────────────────
 * 
 * Security Architecture:
 * - In development: reads from import.meta.env.VITE_GEMINI_API_KEY (still works)
 * - In production: will route through Supabase Edge Function /functions/v1/gemini-proxy
 *   so the key is never exposed in the client bundle.
 * 
 * To upgrade to full server-side security:
 * 1. Deploy the supabase/functions/gemini-proxy/ edge function with GEMINI_API_KEY env var
 * 2. Set VITE_USE_GEMINI_PROXY=true in Vercel environment variables
 * 3. Remove VITE_GEMINI_API_KEY from Vercel (no longer needed)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const USE_PROXY = import.meta.env.VITE_USE_GEMINI_PROXY === 'true';

// Primary and secondary keys — kept here so they are only accessed in ONE place
const PRIMARY_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const SECONDARY_KEY = import.meta.env.VITE_GEMINI_API_KEY_SECONDARY || '';

export interface GeminiRequestOptions {
  model?: string;
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface GeminiResponse {
  text: string;
  usedFallback: boolean;
}

/**
 * Calls Gemini API. Routes through backend proxy when VITE_USE_GEMINI_PROXY=true,
 * otherwise uses the API key directly (development mode).
 */
export async function callGemini(options: GeminiRequestOptions): Promise<GeminiResponse> {
  const model = options.model || 'gemini-2.0-flash';

  if (USE_PROXY && SUPABASE_URL) {
    return callGeminiViaProxy(options, model);
  }
  return callGeminiDirect(options, model);
}

async function callGeminiViaProxy(
  options: GeminiRequestOptions,
  model: string
): Promise<GeminiResponse> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/gemini-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ model, ...options }),
  });

  if (!response.ok) {
    throw new Error(`Gemini proxy error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return { text: data.text || '', usedFallback: false };
}

async function callGeminiDirect(
  options: GeminiRequestOptions,
  model: string,
  usedFallback = false
): Promise<GeminiResponse> {
  const key = usedFallback ? SECONDARY_KEY : PRIMARY_KEY;
  if (!key) throw new Error('No Gemini API key configured');

  const payload = {
    contents: [{ role: 'user', parts: [{ text: options.prompt }] }],
    ...(options.systemInstruction ? {
      system_instruction: { parts: [{ text: options.systemInstruction }] }
    } : {}),
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxOutputTokens ?? 8192,
    },
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  if (response.status === 429 && !usedFallback && SECONDARY_KEY) {
    console.warn('[GeminiProxy] Primary key quota exceeded, switching to secondary key');
    return callGeminiDirect(options, model, true);
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Gemini API error ${response.status}: ${err?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return { text, usedFallback };
}

/** Get the primary API key (for services that call Gemini SDK directly) */
export function getGeminiApiKey(): string {
  return PRIMARY_KEY;
}

/** Get the secondary API key (fallback for quota exceeded) */
export function getGeminiSecondaryKey(): string {
  return SECONDARY_KEY;
}
