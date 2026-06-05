import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPayment } from "@/lib/paymentDB";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const url = req.nextUrl.searchParams.get("url") ?? "";

  if (!session?.user?.email || !url) {
    return Response.json({ paid: false });
  }

  try {
    const record = await getPayment(session.user.email, url);
    if (!record) return Response.json({ paid: false });

    // Verify not expired
    if (Date.now() > record.expiresAt) {
      return Response.json({ paid: false });
    }

    return Response.json({ paid: true, expiresAt: record.expiresAt });
  } catch {
    return Response.json({ paid: false }, { status: 500 });
  }
}
