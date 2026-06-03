export interface PaidReport {
  url: string;
  paidAt: string;
  expiresAt: string;
}

const STORAGE_KEY = "fixlytics_paid_reports";
const EXPIRY_DAYS = 30;

export function markAsPaid(url: string): void {
  const normalized = normalizeStorageUrl(url);
  const existing = getPaidReports();
  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + EXPIRY_DAYS);

  existing[normalized] = {
    url: normalized,
    paidAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function isPaid(url: string): boolean {
  const normalized = normalizeStorageUrl(url);
  const reports = getPaidReports();
  const report = reports[normalized];

  if (!report) return false;

  const now = new Date();
  const expires = new Date(report.expiresAt);

  if (now > expires) {
    delete reports[normalized];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    return false;
  }

  return true;
}

export function getDaysRemaining(url: string): number {
  const normalized = normalizeStorageUrl(url);
  const reports = getPaidReports();
  const report = reports[normalized];
  if (!report) return 0;

  const now = new Date();
  const expires = new Date(report.expiresAt);
  const diffMs = expires.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function getAllPaidReports(): PaidReport[] {
  return Object.values(getPaidReports()).filter((r) => {
    const now = new Date();
    const expires = new Date(r.expiresAt);
    return now <= expires;
  });
}

function getPaidReports(): Record<string, PaidReport> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

// Strip protocol, www, and trailing slash so google.com and https://www.google.com
// map to the same key.
function normalizeStorageUrl(url: string): string {
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "")
    .trim();
}
