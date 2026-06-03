import type { NextRequest } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(_req: NextRequest) {
  try {
    const order = await razorpay.orders.create({
      amount: 240000,
      currency: "INR",
      receipt: `fixlytics_${Date.now()}`,
    });
    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("[payment] create-order failed:", err);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
}
