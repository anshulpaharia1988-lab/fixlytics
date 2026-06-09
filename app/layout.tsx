import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import SessionWrapper from "@/components/SessionWrapper";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fixlytics | Fix Your Website in Minutes with AI",
  description:
    "Paste your link. We'll find the UX, SEO and speed issues holding you back - and write the fixes for you. No code. No jargon.",
};

const GA_ID      = process.env.NEXT_PUBLIC_GA_ID      || "G-E4T776TDLR";
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "x1b3tvzpef";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
        />

        {/* Google Analytics - only injected when ID is configured */}
        {GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}');
                `,
              }}
            />
          </>
        )}

        {/* Microsoft Clarity - only injected when ID is configured */}
        {CLARITY_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${CLARITY_ID}");
              `,
            }}
          />
        )}
      </head>
      <body>
        <SessionWrapper>
          {children}
        </SessionWrapper>
        <Script src="https://unpkg.com/lucide@latest" strategy="lazyOnload" />
      </body>
    </html>
  );
}
