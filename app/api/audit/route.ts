import type { NextRequest } from "next/server";
import { load } from "cheerio";
import { getDeterministicScores, getDynamicIssues, toneFor, type AuditScores, type RealSEO } from "@/lib/scoring";
import type { Issue } from "@/lib/data";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const OPPORTUNITY_AUDITS = [
  "uses-optimized-images",
  "render-blocking-resources",
  "uses-text-compression",
  "unused-javascript",
  "unused-css-rules",
  "uses-long-cache-ttl",
];

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url") ?? "";
  const deterministicScores = getDeterministicScores(url);

  const realSEO: RealSEO = {
    htmlFetched: false,
    hasMetaDesc: false,
    titleLength: 0,
    h1Count: 0,
    imgWithoutAlt: 0,
  };

  const apiKey = process.env.PAGESPEED_API_KEY;
  if (apiKey && url) {
    try {
      const targetUrl = url.startsWith("http") ? url : `https://${url}`;

      // Start HTML fetch immediately and consume the body right away so the
      // AbortSignal timeout cannot fire mid-read when PageSpeed takes 30-45 s.
      const htmlFetchPromise: Promise<string | null> = fetch(targetUrl, {
        signal: AbortSignal.timeout(15_000),
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      })
        .then((r) => (r.ok ? r.text() : null))
        .catch(() => null);

      // PageSpeed: try mobile first (60s), then retry with desktop (usually faster).
      const psBase = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetUrl)}&key=${encodeURIComponent(apiKey)}`;
      let psResponse: Response | null = null;
      const psStart = Date.now();

      console.log("[PageSpeed] Starting request for:", targetUrl);

      try {
        const r = await fetch(`${psBase}&strategy=mobile`, { signal: AbortSignal.timeout(60_000) });
        if (r.ok) {
          psResponse = r;
          console.log("[PageSpeed] Mobile succeeded in", Date.now() - psStart, "ms");
        } else {
          console.log("[PageSpeed] Mobile returned HTTP", r.status);
        }
      } catch (e) {
        console.log("[PageSpeed] Mobile timed out / failed after", Date.now() - psStart, "ms:", String(e));
      }

      if (!psResponse) {
        const desktopStart = Date.now();
        try {
          const r = await fetch(`${psBase}&strategy=desktop`, { signal: AbortSignal.timeout(60_000) });
          if (r.ok) {
            psResponse = r;
            console.log("[PageSpeed] Desktop succeeded in", Date.now() - desktopStart, "ms");
          } else {
            console.log("[PageSpeed] Desktop returned HTTP", r.status);
          }
        } catch (e) {
          console.log("[PageSpeed] Desktop timed out / failed after", Date.now() - desktopStart, "ms:", String(e));
        }
      }

      if (!psResponse) {
        console.log("[PageSpeed] Both strategies failed — falling back to deterministic. Total:", Date.now() - psStart, "ms");
      }

      // htmlFetchPromise resolves to the full HTML string (or null if failed/blocked).
      const html = await htmlFetchPromise;
      if (html) {
        try {
          const $ = load(html);

          // 4-method bulletproof meta description detection
          const metaDesc = (() => {
            // Method 1: standard CSS selector
            let el = $('meta[name="description"]').first();
            if (el.length) return el.attr("content") || "";

            // Method 2: case-insensitive attribute scan
            let content = "";
            $("meta").each((_, node) => {
              const name = ($(node).attr("name") || "").toLowerCase().trim();
              if (name === "description") {
                content = $(node).attr("content") || "";
                return false; // break
              }
            });
            if (content) return content;

            // Method 3: Open Graph fallback
            el = $('meta[property="og:description"]').first();
            if (el.length) return el.attr("content") || "";

            // Method 4: Twitter card fallback
            el = $('meta[name="twitter:description"]').first();
            if (el.length) return el.attr("content") || "";

            return "";
          })();

          const titleLength = $("title").first().text().trim().length;

          // If the page has no <title>, we almost certainly got a bot-detection
          // or redirect page — not the real site. Don't trust any SEO signals from it.
          if (titleLength === 0) {
            console.log("[SEO Check]", url, { htmlFetched: false, reason: "no <title> — likely bot-detection page" });
          } else {
            realSEO.htmlFetched   = true;
            realSEO.hasMetaDesc   = metaDesc.trim().length > 10;
            realSEO.titleLength   = titleLength;
            realSEO.h1Count       = $("h1").length;
            realSEO.imgWithoutAlt = $("img").filter((_, el) => $(el).attr("alt") === undefined).length;

            console.log("[SEO Check]", url, {
              htmlFetched: true,
              hasMetaDesc: realSEO.hasMetaDesc,
              titleLength: realSEO.titleLength,
              h1Count: realSEO.h1Count,
              imgWithoutAlt: realSEO.imgWithoutAlt,
            });
          }
        } catch {
          // HTML parse failed — htmlFetched stays false, no HTML-based issues shown
        }
      } else {
        console.log("[SEO Check]", url, { htmlFetched: false, reason: "fetch returned null" });
      }

      // Build response from real PageSpeed data
      if (psResponse) {
        const data = await psResponse.json();
        const lhr = data.lighthouseResult;
        const perfScore = Math.round(((lhr?.categories?.performance?.score) ?? 0) * 100);
        const audits: Record<string, {
          score: number | null;
          title?: string;
          description?: string;
          displayValue?: string;
          details?: { overallSavingsMs?: number; overallSavingsBytes?: number };
        }> = lhr?.audits ?? {};

        const realScores: AuditScores = {
          ...deterministicScores,
          speed: {
            value: perfScore,
            tone: toneFor(perfScore),
            label: "Site Speed",
            desc: perfScore < 50
              ? "The page loads too slowly on mobile — most visitors won't wait."
              : "Load times are acceptable, but improvements are available.",
          },
        };

        const speedIssues: Issue[] = [];
        OPPORTUNITY_AUDITS.forEach((id, idx) => {
          const audit = audits[id];
          if (!audit || audit.score === null || audit.score >= 0.9) return;
          const savingsMs    = audit.details?.overallSavingsMs;
          const savingsBytes = audit.details?.overallSavingsBytes;
          const impact = savingsMs
            ? `-${(savingsMs / 1000).toFixed(1)} s load time`
            : savingsBytes
            ? `-${Math.round(savingsBytes / 1024)} KB transferred`
            : "Faster load time";
          const speedContextMessages: Record<string, string> = {
            "uses-optimized-images":       "Large images are the #1 cause of slow mobile sites",
            "render-blocking-resources":   "Every second of delay costs 7% of conversions",
            "uses-text-compression":       "Uncompressed text adds unnecessary load time for every visitor",
            "unused-javascript":           "Unused code slows every visitor's first load",
            "unused-css-rules":            "Dead CSS is parsed on every page load — pure wasted time",
            "uses-long-cache-ttl":         "Without caching, repeat visitors re-download everything",
          };
          speedIssues.push({
            id: `ps-${idx}`,
            area: "speed",
            severity: audit.score < 0.5 ? "high" : "med",
            premium: idx >= 2,
            title: audit.title ?? id,
            why: audit.description ?? "This audit found an opportunity to improve page speed.",
            fix: "Address the flagged items in your site's source code or CMS.",
            impact,
            effort: "30-60 minutes",
            contextMessage: speedContextMessages[id],
          });
        });

        const fcp = audits["first-contentful-paint"]?.displayValue ?? null;
        const lcp = audits["largest-contentful-paint"]?.displayValue ?? null;

        const nonSpeedIssues = getDynamicIssues(realScores, url, realSEO).filter((i) => i.area !== "speed");
        const allIssues = speedIssues.length > 0
          ? [...speedIssues, ...nonSpeedIssues]
          : getDynamicIssues(realScores, url, realSEO);

        console.log("[PageSpeed] Source: pagespeed, score:", perfScore, "fcp:", fcp);
        return Response.json({
          scores: realScores,
          issues: allIssues,
          meta: { fcp, lcp, source: "pagespeed" },
        });
      }

      // Both PageSpeed attempts failed — use deterministic scores with whatever HTML data we got
      return Response.json({
        scores: deterministicScores,
        issues: getDynamicIssues(deterministicScores, url, realSEO),
        meta: { fcp: null, lcp: null, source: "deterministic" },
      });
    } catch {
      // fall through to deterministic
    }
  }

  return Response.json({
    scores: deterministicScores,
    issues: getDynamicIssues(deterministicScores, url, realSEO),
    meta: { fcp: null, lcp: null, source: "deterministic" },
  });
}
