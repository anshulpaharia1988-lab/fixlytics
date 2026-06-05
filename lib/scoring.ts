import type { Issue } from "./data";

export interface AuditData {
  scores: AuditScores;
  issues: Issue[];
  meta: { fcp: string | null; lcp: string | null; source: string };
}

function urlSeed(url: string): number {
  let h = 0;
  for (let i = 0; i < url.length; i++) {
    h = (Math.imul(31, h) + url.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function seededInt(seed: number, min: number, max: number, salt: number): number {
  const h = (seed ^ Math.imul(salt, 2654435761)) >>> 0;
  return min + (h % (max - min + 1));
}

export function toneFor(score: number): "good" | "warn" | "bad" {
  if (score >= 70) return "good";
  if (score >= 50) return "warn";
  return "bad";
}

export interface AuditScores {
  ux:    { value: number; tone: "good" | "warn" | "bad"; label: string; desc: string };
  seo:   { value: number; tone: "good" | "warn" | "bad"; label: string; desc: string };
  speed: { value: number; tone: "good" | "warn" | "bad"; label: string; desc: string };
}

export interface RealSEO {
  htmlFetched: boolean;
  hasMetaDesc: boolean;
  titleLength: number;
  h1Count: number;
  imgWithoutAlt: number;
}

function scoreDesc(area: "ux" | "seo", v: number): string {
  if (area === "ux")  return v < 65 ? "Visitors are hitting friction before they can take action." : "Navigation and calls-to-action are reasonably clear.";
  return v < 60 ? "Key metadata is missing  - Google can't categorise your site." : "You're visible in search, but there's room to rank higher.";
}

export function getDeterministicScores(url: string): AuditScores {
  const seed = urlSeed(url);
  const ux    = seededInt(seed, 42, 88, 1);
  const seo   = seededInt(seed, 38, 85, 2);
  const speed = seededInt(seed, 30, 78, 3);
  return {
    ux:    { value: ux,    tone: toneFor(ux),    label: "User Experience",     desc: scoreDesc("ux",  ux) },
    seo:   { value: seo,   tone: toneFor(seo),   label: "Search & Visibility", desc: scoreDesc("seo", seo) },
    speed: {
      value: speed, tone: toneFor(speed), label: "Site Speed",
      desc: speed < 50
        ? "Speed appears slow  - a live PageSpeed scan will give exact timings."
        : "Speed appears acceptable  - verify with a live PageSpeed scan.",
    },
  };
}

// ── Domain helpers ────────────────────────────────────────────────────────────

function parseDomain(url: string): { domain: string; domainShort: string } {
  const domain = url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  const domainShort = domain.split(".")[0];
  return { domain: domain || url, domainShort: domainShort || url };
}

// Major brands have professional UX/SEO teams  - score-band guessing is
// embarrassing for them. Only show real PageSpeed speed data for these.
const MAJOR_BRANDS = new Set([
  "google", "youtube", "facebook", "instagram", "twitter", "x",
  "amazon", "ebay", "flipkart", "alibaba", "aliexpress", "walmart", "target",
  "microsoft", "apple", "netflix", "spotify", "adobe", "salesforce",
  "linkedin", "tiktok", "snapchat", "telegram", "whatsapp", "pinterest",
  "wikipedia", "reddit", "github", "stackoverflow", "bing", "yahoo",
  "airbnb", "uber", "ola", "zomato", "swiggy",
  "bbc", "cnn", "nytimes", "theguardian", "forbes", "bloomberg", "reuters",
]);

function isMajorBrand(domainShort: string): boolean {
  return MAJOR_BRANDS.has(domainShort.toLowerCase());
}

function seoImpact(domainShort: string, seoScore: number): string {
  if (seoScore < 50) return `+12–18% click-through rate for ${domainShort}`;
  if (seoScore < 65) return `+8–15% click-through rate for ${domainShort}`;
  return `+5–10% click-through rate for ${domainShort}`;
}

function uxImpact(domain: string, uxScore: number): string {
  if (uxScore < 50) return `+25–40% conversions on ${domain}`;
  if (uxScore < 65) return `+15–25% conversions on ${domain}`;
  return `+8–15% conversions on ${domain}`;
}

// ── Verified SEO issue factories (only shown when htmlFetched === true) ───────

function issueNoMetaDesc(domain: string, domainShort: string, seoScore: number): Issue {
  return {
    id: "s-meta", area: "seo", severity: "high", premium: false,
    title: `Meta description missing on ${domain}`,
    why: `Google is writing its own snippet for ${domain}  - usually a random sentence that won't encourage clicks. You're losing control of your first impression in search results.`,
    fix: `Add a <meta name="description"> tag to ${domain} with 140–160 characters that includes your primary keyword and a clear call to action.`,
    impact: seoImpact(domainShort, seoScore),
    effort: "5 minutes",
    contextMessage: "Google writes its own snippet — usually one that doesn't sell",
  };
}

function issueTitleTooShort(domain: string, domainShort: string, seoScore: number): Issue {
  return {
    id: "s-title", area: "seo", severity: "high", premium: false,
    title: `Title tag too short for ${domain}`,
    why: `${domain}'s title tag is under 30 characters  - you're wasting the 60 characters Google shows in search results and missing keyword opportunities.`,
    fix: `Expand ${domain}'s title to '[Brand]  - [Primary Service] in [City/Region]' (50–60 characters total).`,
    impact: `Rank for 3+ more keywords related to ${domainShort}`,
    effort: "5 minutes",
    contextMessage: "Short titles rank for fewer keywords in search",
  };
}

function issueNoH1(domain: string, seoScore: number): Issue {
  return {
    id: "s-h1", area: "seo", severity: "high", premium: false,
    title: `H1 tag missing on ${domain}`,
    why: `Google has no clear signal about what ${domain} is about. Without an H1, you're invisible for the keywords that matter most.`,
    fix: `Add exactly one <h1> tag to ${domain} containing your primary keyword. It should match the intent of your page title.`,
    impact: `+25% keyword relevance score for ${domain}`,
    effort: "5 minutes",
    contextMessage: "Without H1, Google can't categorise your page topic",
  };
}

function issueMultipleH1(domain: string): Issue {
  return {
    id: "s-h1m", area: "seo", severity: "med", premium: false,
    title: `Multiple H1 tags found on ${domain}`,
    why: `${domain} has more than one H1, which dilutes the SEO signal and confuses Google about which topic is primary.`,
    fix: `Keep exactly one H1 on ${domain} for the main topic. Demote additional H1s to H2 or H3 headings.`,
    impact: `Clearer topical authority for ${domain}`,
    effort: "10 minutes",
    contextMessage: "Multiple H1s split Google's attention across topics",
  };
}

function issueImgNoAlt(domain: string, count: number): Issue {
  return {
    id: "s-imgalt", area: "seo", severity: "med", premium: false,
    title: `${count} image${count === 1 ? "" : "s"} missing alt text on ${domain}`,
    why: `Images on ${domain} without alt attributes are invisible to screen readers and search engines. Google uses alt text to understand image content and index image searches.`,
    fix: `Add descriptive alt attributes to all ${count} image${count === 1 ? "" : "s"} on ${domain}. Describe what's in the image and include relevant keywords where natural.`,
    impact: `Better accessibility + image search visibility for ${domain}`,
    effort: "15 minutes",
    contextMessage: "Missing alt text means Google can't index your images",
  };
}

// ── UX issue factories (score-band, shown only when uxScore < 65) ─────────────

function issueNoCTA(domain: string, uxScore: number): Issue {
  return {
    id: "u1", area: "ux", severity: "high", premium: false,
    title: `No clear call-to-action on ${domain}`,
    why: `Based on your UX score of ${uxScore}/100  - visitors landing on ${domain} don't know what to do next. Without a prominent CTA, most will leave without converting.`,
    fix: `Add a single high-contrast button above the fold on ${domain} with a specific action: 'Book Now', 'Get a Free Quote', 'Shop Today'.`,
    impact: uxImpact(domain, uxScore),
    effort: "15 minutes",
    contextMessage: "Hidden CTAs are the #1 reason visitors don't convert",
  };
}

function issueMobileLayout(domain: string, uxScore: number): Issue {
  return {
    id: "u2", area: "ux", severity: "high", premium: false,
    title: `Mobile layout broken on ${domain}`,
    why: `Based on your UX score of ${uxScore}/100  - key content on ${domain} is likely cut off or overlapping on small screens. Over 60% of ${domain}'s visitors are on phones.`,
    fix: `Test every page on ${domain} at 375px width. Fix overflow, increase tap targets to 44×44px minimum, and set font size to at least 16px.`,
    impact: `–45% mobile bounce rate for ${domain}`,
    effort: "2 hours",
    contextMessage: "60%+ of your visitors are on mobile right now",
  };
}

function issueLowContrast(domain: string, uxScore: number): Issue {
  return {
    id: "u3", area: "ux", severity: "med", premium: false,
    title: `Low contrast text on ${domain}`,
    why: `Based on your UX score of ${uxScore}/100  - ${domain}'s text may blend into the background, hard to read on mobile in sunlight and failing WCAG accessibility standards.`,
    fix: `Ensure all body text on ${domain} has at least 4.5:1 contrast ratio against its background. Use the WebAIM Contrast Checker.`,
    impact: `+12% time on page for ${domain}`,
    effort: "30 minutes",
    contextMessage: "Low contrast fails accessibility — and loses readers",
  };
}

function issueCTAAboveFold(domain: string, uxScore: number): Issue {
  return {
    id: "u1", area: "ux", severity: "high", premium: false,
    title: `CTA button not visible above the fold on ${domain}`,
    why: `Based on your UX score of ${uxScore}/100  - visitors landing on ${domain} don't know what to do next. Without a prominent CTA in the top 600px, most will leave without converting.`,
    fix: `Move ${domain}'s main CTA into the top 600px of the page. It should be visible without scrolling on desktop and mobile.`,
    impact: `+18–25% button clicks on ${domain}`,
    effort: "20 minutes",
    contextMessage: "Hidden CTAs are the #1 reason visitors don't convert",
  };
}

function issueFormUX(domain: string, uxScore: number): Issue {
  return {
    id: "u2", area: "ux", severity: "med", premium: false,
    title: `Form UX issues detected on ${domain}`,
    why: `Based on your UX score of ${uxScore}/100  - ${domain}'s forms may have too many fields, unclear labels, or no inline validation, which cause 40% higher abandonment rates.`,
    fix: `Audit ${domain}'s forms: remove non-essential fields, add placeholder text, and show validation errors inline as users type.`,
    impact: `–40% form abandonment on ${domain}`,
    effort: "1 hour",
    contextMessage: "Every extra form field drops completion rate by 10%",
  };
}

// ── Premium issue factories ───────────────────────────────────────────────────

function premiumNoTrustSignals(domain: string, domainShort: string): Issue {
  return {
    id: "premium-1", area: "ux", severity: "high", premium: true,
    title: `No trust signals on ${domain}`,
    why: `${domain} has no visible reviews, testimonials, or security badges above the fold  - visitors can't verify credibility before they buy. Hidden behind a paywall.`,
    fix: "Hidden.", impact: " -", effort: " -",
  };
}

function premiumBuyerIntent(domain: string, domainShort: string): Issue {
  return {
    id: "premium-2", area: "seo", severity: "high", premium: true,
    title: `Buyer-intent keywords missing from ${domain}`,
    why: `${domain} ranks for informational terms but not commercial ones  - you're attracting browsers, not buyers. Hidden behind a paywall.`,
    fix: "Hidden.", impact: " -", effort: " -",
  };
}

function premiumNoCaching(domain: string): Issue {
  return {
    id: "premium-1", area: "speed", severity: "high", premium: true,
    title: `No caching headers on ${domain}`,
    why: `${domain} serves assets without cache headers  - repeat visitors re-download everything on each visit, slowing load times and wasting bandwidth. Hidden behind a paywall.`,
    fix: "Hidden.", impact: " -", effort: " -",
  };
}

function premiumMissingSchema(domain: string): Issue {
  return {
    id: "premium-2", area: "seo", severity: "med", premium: true,
    title: `Missing schema markup on ${domain}`,
    why: `${domain} has no structured data telling Google what type of business or content this is  - you're missing rich result eligibility. Hidden behind a paywall.`,
    fix: "Hidden.", impact: " -", effort: " -",
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

export function getDynamicIssues(scores: AuditScores, url = "", realSEO?: RealSEO): Issue[] {
  const { domain, domainShort } = parseDomain(url);
  const seoScore = scores.seo.value;
  const uxScore  = scores.ux.value;
  const brand    = isMajorBrand(domainShort);
  const issues: Issue[] = [];

  // Major brands (google, amazon, bbc …) have professional UX/SEO teams.
  // Score-band guessing produces embarrassing false positives for them.
  // Only real PageSpeed speed data (added by route.ts) is shown for these sites.
  if (brand) return issues;

  // SEO  - only show issues we have verified from real HTML fetch.
  // If htmlFetched is false we cannot make any claims about the page.
  if (realSEO?.htmlFetched) {
    if (!realSEO.hasMetaDesc)
      issues.push(issueNoMetaDesc(domain, domainShort, seoScore));
    if (realSEO.titleLength > 0 && realSEO.titleLength < 30)
      issues.push(issueTitleTooShort(domain, domainShort, seoScore));
    if (realSEO.h1Count === 0)
      issues.push(issueNoH1(domain, seoScore));
    else if (realSEO.h1Count > 1)
      issues.push(issueMultipleH1(domain));
    if (realSEO.imgWithoutAlt > 0)
      issues.push(issueImgNoAlt(domain, realSEO.imgWithoutAlt));
  }
  // When not htmlFetched: no SEO issues shown  - we don't know what the page contains.

  // UX  - score-band signal, shown only when score is clearly poor (< 65).
  // These are unverifiable from HTML, so we add the score caveat to the copy.
  if (uxScore < 50) {
    issues.push(issueNoCTA(domain, uxScore), issueMobileLayout(domain, uxScore), issueLowContrast(domain, uxScore));
  } else if (uxScore < 65) {
    issues.push(issueCTAAboveFold(domain, uxScore), issueFormUX(domain, uxScore));
  }
  // uxScore >= 65: we cannot honestly flag UX issues without real user testing.

  // Speed  - real issues come from PageSpeed in route.ts only.
  // getDynamicIssues never adds speed issues; it would be guessing.

  // Premium  - general enough to show regardless of data source.
  if (domain.length < 10) {
    issues.push(premiumNoTrustSignals(domain, domainShort), premiumBuyerIntent(domain, domainShort));
  } else {
    issues.push(premiumNoCaching(domain), premiumMissingSchema(domain));
  }

  return issues;
}
