import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserPayments } from "@/lib/paymentDB";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reports = await getUserPayments(session.user.email);
    const now = Date.now();
    const enriched = reports.map((r) => ({
      ...r,
      daysRemaining: Math.max(0, Math.ceil((r.expiresAt - now) / (1000 * 60 * 60 * 24))),
    }));
    return Response.json({ reports: enriched });
  } catch {
    return Response.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
