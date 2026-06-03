import type { NextRequest } from "next/server";
import { checkPayment } from "@/lib/paymentDB";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email") ?? "";
  const url   = request.nextUrl.searchParams.get("url")   ?? "";

  if (!email || !url) {
    return Response.json({ paid: false }, { status: 400 });
  }

  try {
    const paid = await checkPayment(email, url);
    return Response.json({ paid });
  } catch {
    return Response.json({ paid: false }, { status: 500 });
  }
}
