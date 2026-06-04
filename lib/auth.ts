import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export const authOptions: NextAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: UpstashRedisAdapter(redis) as any,
  providers: [
    EmailProvider({
      server: {
        host: "smtp.resend.com",
        port: 465,
        auth: {
          user: "resend",
          pass: process.env.RESEND_API_KEY,
        },
      },
      from: "Fixlytics <support@fixlytics.app>",
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
