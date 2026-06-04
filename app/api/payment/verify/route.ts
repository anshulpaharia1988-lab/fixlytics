import type { NextRequest } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { savePayment } from "@/lib/paymentDB";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, auditUrl } = body;

    console.log("[verify] payload:", { email, auditUrl, hasOrderId: !!razorpay_order_id });

    const hmacBody = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(hmacBody)
      .digest("hex");

    const success = expected === razorpay_signature;
    console.log("[verify] signature match:", success);

    if (success && email) {
      // Persist to Upstash Redis for cross-device recovery
      try {
        await savePayment(email, auditUrl ?? "");
        console.log("[verify] KV save OK for:", email);
      } catch (kvErr) {
        console.error("[verify] KV save failed:", kvErr);
      }

      // Send confirmation email via Resend
      // Initialised inside handler so RESEND_API_KEY is read at runtime, not build time
      const resend = new Resend(process.env.RESEND_API_KEY);
      console.log("[verify] RESEND_API_KEY:", process.env.RESEND_API_KEY ? "SET" : "NOT SET");
      console.log("[verify] Sending email to:", email);

      try {
        const emailResult = await resend.emails.send({
          from: "Fixlytics <onboarding@resend.dev>",
          to: email,
          subject: "Your Fixlytics Report is Unlocked! 🎉",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #0a1628;">
              <h1 style="font-size: 28px; font-weight: 800; margin: 0 0 16px;">Your full report is ready! 🎉</h1>
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px; color: #374151;">
                Thanks for your payment. Your full audit report for
                <strong>${auditUrl ?? "your site"}</strong> is now unlocked.
              </p>
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px; color: #374151;">
                <strong>Access is valid for 30 days</strong> on the same browser.
                Use "Already paid?" on any device to restore access with your email.
              </p>
              <a href="https://fixlytics.vercel.app"
                 style="display: inline-block; background: #00c758; color: #fff;
                        padding: 14px 28px; border-radius: 10px; text-decoration: none;
                        font-weight: 700; font-size: 16px; margin-bottom: 28px;">
                View Full Report →
              </a>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px;">
                Questions? Reply to this email or write to
                <a href="mailto:support@fixlytics.app" style="color: #00c758;">support@fixlytics.app</a>
              </p>
              <p style="font-size: 14px; color: #6b7280; margin: 0;">— Anshul, Fixlytics</p>
            </div>
          `,
        });
        console.log("[verify] email result:", emailResult);
      } catch (emailErr) {
        console.error("[verify] email send failed:", emailErr);
      }
    }

    return Response.json({ success });
  } catch (err) {
    console.error("[verify] handler error:", err);
    return Response.json({ success: false }, { status: 400 });
  }
}
