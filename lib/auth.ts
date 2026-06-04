import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export const authOptions: NextAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: UpstashRedisAdapter(redis) as any,
  providers: [
    EmailProvider({
      from: "Fixlytics <support@fixlytics.app>",
      async sendVerificationRequest({ identifier, url }) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "Fixlytics <support@fixlytics.app>",
          to: identifier,
          subject: "Sign in to Fixlytics",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <img src="https://fixlytics.app/logo.png" width="40" style="margin-bottom: 24px;" />
              <h1 style="color: #0a1628; font-size: 24px; margin: 0 0 16px;">Sign in to Fixlytics</h1>
              <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">
                Click the button below to sign in. This link expires in 24 hours.
              </p>
              <a href="${url}" style="display: inline-block; background: #00c758; color: #fff;
                 padding: 14px 28px; border-radius: 10px; text-decoration: none;
                 font-weight: 700; font-size: 16px; margin-bottom: 24px;">
                Sign in to Fixlytics →
              </a>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                If you didn't request this, ignore this email.
              </p>
            </div>
          `,
        });
      },
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-email",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user && user?.id) {
        (session.user as { id?: string }).id = user.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
