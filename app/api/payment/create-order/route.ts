import type { NextRequest } from "next/server";
import Razorpay from "razorpay";
import { validateCoupon } from "@/lib/coupons";

export async function POST(req: NextRequest) {
  console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? "SET" : "NOT SET");
  console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "SET" : "NOT SET");

  const body = await req.json().catch(() => ({}));
  const couponCode = body?.coupon as string | undefined;

  let discountPercent = 0;
  if (couponCode) {
    const result = validateCoupon(couponCode);
    if (result.valid) discountPercent = result.discount;
  }

  if (discountPercent === 100) {
    return Response.json({ free: true });
  }

  const baseAmount = 2900;
  const discountedAmount = discountPercent > 0
    ? Math.round(baseAmount * (1 - discountPercent / 100))
    : baseAmount;

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  try {
    const order = await razorpay.orders.create({
      amount: discountedAmount,
      currency: "USD",
      receipt: `fixlytics_${Date.now()}`,
    });
    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Razorpay error:", err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
