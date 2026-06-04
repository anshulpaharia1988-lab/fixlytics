import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkPayment } from "@/lib/paymentDB";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const url = req.nextUrl.searchParams.get("url") ?? "";

  if (!session?.user?.email || !url) {
    return Response.json({ paid: false });
  }

  try {
    const paid = await checkPayment(session.user.email, url);
    return Response.json({ paid });
  } catch {
    return Response.json({ paid: false }, { status: 500 });
  }
}
