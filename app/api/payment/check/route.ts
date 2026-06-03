import type { NextRequest } from "next/server";
import { checkPayment } from "@/lib/paymentDB";

export async function GET(request: NextRequest) {
  const email  = request.nextUrl.searchParams.get("email") ?? "";
  const url    = request.nextUrl.searchParams.get("url")   ?? "";

  if (!email || !url) {
    return Response.json({ paid: false }, { status: 400 });
  }

  try {
    const record = await checkPayment(email, url);
    if (!record) return Response.json({ paid: false });

    return Response.json({
      paid: true,
      expiresAt: new Date(record.expiresAt).toISOString(),
    });
  } catch {
    return Response.json({ paid: false }, { status: 500 });
  }
}
