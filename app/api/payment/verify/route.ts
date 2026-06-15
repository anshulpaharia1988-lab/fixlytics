import type { NextRequest } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { savePayment } from "@/lib/paymentDB";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email: bodyEmail, auditUrl, coupon } = body;

    // Prefer session email (guaranteed authentic) over body email
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email ?? bodyEmail ?? "";

    console.log("[verify] payload:", { userEmail, auditUrl, hasOrderId: !!razorpay_order_id });

    // Coupon-based free unlock: skip signature check, save record + notify
    if (coupon === true) {
      if (userEmail) {
        try { await savePayment(userEmail, auditUrl ?? ""); } catch {}
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: "Fixlytics <support@fixlytics.app>",
            to: "anshul.paharia1988@gmail.com",
            subject: `🎉 New beta user: ${userEmail}`,
            html: `<p>New beta user: <strong>${userEmail}</strong> used BETA100 for <strong>${auditUrl ?? "unknown"}</strong></p>`,
          });
        } catch {}
      }
      return Response.json({ success: true });
    }

    const hmacBody = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(hmacBody)
      .digest("hex");

    const success = expected === razorpay_signature;
    console.log("[verify] signature match:", success);

    if (success && userEmail) {
      // Save to Upstash Redis - enables cross-device access recovery
      try {
        await savePayment(userEmail, auditUrl ?? "");
        console.log("[verify] KV save OK for:", userEmail);
      } catch (kvErr) {
        console.error("[verify] KV save failed:", kvErr);
      }

      const resend = new Resend(process.env.RESEND_API_KEY);
      console.log("[verify] RESEND_API_KEY:", process.env.RESEND_API_KEY ? "SET" : "NOT SET");
      console.log("[verify] Sending email to:", userEmail);

      try {
        const emailResult = await resend.emails.send({
          from: "Fixlytics <support@fixlytics.app>",
          to: userEmail,
          subject: "Your Fixlytics report is ready! 🎉",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">

              <img src="https://fixlytics.app/logo.png" width="40"
                style="margin-bottom: 24px; border-radius: 8px;" />

              <h1 style="color: #0a1628; font-size: 22px; margin: 0 0 8px;">
                Your full report is unlocked! 🎉
              </h1>

              <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Thanks for trying Fixlytics. Your full audit report for
                <strong>${auditUrl ?? "your site"}</strong> is now unlocked and ready to view.
              </p>

              <a href="https://fixlytics.app"
                style="display: inline-block; background: #00c758; color: #fff;
                padding: 14px 28px; border-radius: 10px; text-decoration: none;
                font-weight: 700; font-size: 16px; margin-bottom: 32px;">
                View My Full Report
              </a>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

              <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
                A quick note from me -
              </p>

              <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
                I built Fixlytics because most website audit tools are
                either too expensive or too technical for everyday site owners.
                I hope your report gives you clear, actionable steps to
                improve your site.
              </p>

              <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 32px;">
                If you have any questions about the fixes, or anything
                is unclear - just reply to this email.
                I read and respond to every message personally.
              </p>

              <p style="color: #374151; font-size: 15px; margin: 0 0 4px;">
                - Anshul
              </p>
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 32px;">
                Founder, Fixlytics
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 24px;" />

              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Your access is valid for 30 days.
                Questions? Reply to this email or write to
                <a href="mailto:support@fixlytics.app"
                  style="color: #00c758;">support@fixlytics.app</a>
              </p>

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
