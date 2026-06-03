// Requires Upstash Redis env vars (add via Vercel Marketplace → Upstash):
//   KV_REST_API_URL, KV_REST_API_TOKEN
// Vercel KV is built on Upstash — @vercel/kv is the official client.
import { kv } from "@vercel/kv";

interface PaymentRecord {
  email: string;
  url: string;
  paidAt: number;
  expiresAt: number;
}

const EXPIRY_SECONDS = 30 * 24 * 60 * 60; // 30 days

export async function savePayment(email: string, url: string): Promise<void> {
  const key = `payment:${email.toLowerCase()}:${normalizeUrl(url)}`;
  const now = Date.now();
  const record: PaymentRecord = {
    email: email.toLowerCase(),
    url: normalizeUrl(url),
    paidAt: now,
    expiresAt: now + EXPIRY_SECONDS * 1000,
  };
  await kv.set(key, record, { ex: EXPIRY_SECONDS });
}

export async function checkPayment(email: string, url: string): Promise<PaymentRecord | null> {
  const key = `payment:${email.toLowerCase()}:${normalizeUrl(url)}`;
  return kv.get<PaymentRecord>(key);
}

function normalizeUrl(url: string): string {
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "")
    .trim();
}
