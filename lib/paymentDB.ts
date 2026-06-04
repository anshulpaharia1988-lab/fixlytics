import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export interface PaymentRecord {
  email: string;
  url: string;
  paidAt: number;
  expiresAt: number;
}

const EXPIRY_SECONDS = 30 * 24 * 60 * 60; // 30 days

export async function savePayment(email: string, url: string): Promise<void> {
  const key = `payment:${normalizeUrl(email)}:${normalizeUrl(url)}`;
  const record: PaymentRecord = {
    email,
    url,
    paidAt: Date.now(),
    expiresAt: Date.now() + EXPIRY_SECONDS * 1000,
  };
  await redis.set(key, record, { ex: EXPIRY_SECONDS });
}

export async function checkPayment(email: string, url: string): Promise<boolean> {
  const key = `payment:${normalizeUrl(email)}:${normalizeUrl(url)}`;
  const data = await redis.get(key);
  return !!data;
}

export async function getUserPayments(email: string): Promise<PaymentRecord[]> {
  const pattern = `payment:${normalizeUrl(email)}:*`;
  const keys = await redis.keys(pattern);
  if (!keys.length) return [];

  const records: PaymentRecord[] = [];
  for (const key of keys) {
    const data = await redis.get<PaymentRecord>(key);
    if (data) records.push(data);
  }
  // Sort newest first
  return records.sort((a, b) => b.paidAt - a.paidAt);
}

function normalizeUrl(input: string): string {
  return input
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "")
    .trim();
}
