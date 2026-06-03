/* global window */
// Audit data — the "sprout & sourdough" demo bakery audit.
// All issues are written in plain language, no jargon.

const AUDIT_SITE = {
  url: "sproutbakery.com.au",
  brand: "Sprout & Sourdough",
  tagline: "Fresh sourdough, every morning.",
};

const SCORES = {
  ux:    { value: 65, label: "User Experience", tone: "warn",  desc: "Some friction stopping visitors from buying." },
  seo:   { value: 70, label: "Search & Visibility", tone: "warn",  desc: "You're showing up, but not for the right things." },
  speed: { value: 48, label: "Site Speed",       tone: "bad",   desc: "Your homepage takes too long to load on phones." },
};

// Each issue: { id, area, severity, title, why, fix, effort, impact, premium }
const ISSUES = [
  // ---- UX (visible in free) ----
  { id: "u1", area: "ux", severity: "high", premium: false,
    title: "Your main button doesn't say what happens next",
    why:   "Right now your big button says 'Learn More'. Visitors don't know if that means order, book, or read about you — so most don't click.",
    fix:   "Change 'Learn More' to 'Order Fresh Sourdough' (or 'Order Now'). Action words convert ~2× better.",
    impact: "+18% clicks expected", effort: "2 minutes" },

  { id: "u2", area: "ux", severity: "high", premium: false,
    title: "It's not obvious what you actually sell",
    why:   "The headline says 'Welcome to Sprout & Sourdough'. A first-time visitor has to scroll to find out you're a bakery.",
    fix:   "Try: 'Hand-made sourdough, baked daily in Newtown.' Tell people what you sell, where, and when, in one line.",
    impact: "+12% time on page", effort: "5 minutes" },

  { id: "u3", area: "ux", severity: "med", premium: false,
    title: "Your phone number is hidden in the footer",
    why:   "65% of bakery customers want to call before they order. Hiding the number at the bottom of the page loses orders.",
    fix:   "Pin a tap-to-call button to the top-right of every page on mobile.",
    impact: "+25 calls / week", effort: "10 minutes" },

  // ---- SEO ----
  { id: "s1", area: "seo", severity: "high", premium: false,
    title: "Google doesn't know you're a bakery",
    why:   "Your page title is just 'Sprout & Sourdough'. Google needs to see what you do AND where you are to show you in 'bakery near me' searches.",
    fix:   "Set your title to: 'Sprout & Sourdough — Sourdough Bakery in Newtown, Sydney'.",
    impact: "Top-10 for 'newtown bakery'", effort: "3 minutes" },

  { id: "s2", area: "seo", severity: "med", premium: false,
    title: "Your photos aren't helping you get found",
    why:   "Photos of your bread don't have captions Google can read. So your beautiful loaves never show up in image search.",
    fix:   "Add a short label to every photo (e.g. 'fresh-baked country loaf'). Most site builders have a field called 'alt text'.",
    impact: "+200 image-search clicks/mo", effort: "20 minutes" },

  { id: "s3", area: "seo", severity: "med", premium: true,
    title: "You're missing a Google Business listing",
    why:   "Hidden behind a paywall.",
    fix:   "Hidden.",
    impact: "—", effort: "—" },

  // ---- Speed ----
  { id: "p1", area: "speed", severity: "high", premium: false,
    title: "Your homepage photo is huge — 3.2 MB",
    why:   "On a phone with average internet, your hero photo takes 5 seconds to load. Half your visitors leave before they see it.",
    fix:   "Shrink the file size to under 300 KB. Free tools like Squoosh do this without losing quality.",
    impact: "-3.1s load time", effort: "5 minutes" },

  { id: "p2", area: "speed", severity: "high", premium: true,
    title: "You're loading 6 different fonts",
    why:   "Hidden behind a paywall.",
    fix:   "Hidden.",
    impact: "—", effort: "—" },

  { id: "p3", area: "speed", severity: "med", premium: true,
    title: "A chat widget is blocking your page",
    why:   "Hidden.",
    fix:   "Hidden.",
    impact: "—", effort: "—" },
];

// Hotspots on the screenshot — { id, x%, y%, issueId, label }
const HOTSPOTS = [
  { id: 1, x: 50, y: 72, issueId: "u1", label: "Unclear button" },
  { id: 2, x: 30, y: 22, issueId: "u2", label: "Vague headline" },
  { id: 3, x: 92, y: 8,  issueId: "u3", label: "Hidden phone" },
  { id: 4, x: 50, y: 8,  issueId: "s1", label: "Weak page title" },
  { id: 5, x: 16, y: 44, issueId: "s2", label: "Photos missing labels" },
  { id: 6, x: 50, y: 44, issueId: "p1", label: "3.2 MB hero photo" },
];

// Premium "before / after" rewrites
const BEFORE_AFTER = [
  {
    kind: "headline",
    label: "Homepage headline",
    before: "Welcome to Sprout & Sourdough",
    after:  "Hand-made sourdough, baked daily in Newtown.",
    note: "Tells people what, where, and when — in one line.",
  },
  {
    kind: "cta",
    label: "Hero button",
    before: "Learn More",
    after:  "Order Fresh Sourdough →",
    note: "Action verb + the thing they get. ~2× click rate.",
  },
  {
    kind: "title",
    label: "Page title (browser tab)",
    before: "Sprout & Sourdough",
    after:  "Sprout & Sourdough — Sourdough Bakery in Newtown, Sydney",
    note: "Adds keywords + location so Google can rank you.",
  },
  {
    kind: "about",
    label: "About paragraph",
    before: "We are passionate about bread and have been baking since 2018 with locally sourced ingredients.",
    after:  "We're a tiny Newtown bakery making 80 loaves a day, by hand, from organic flour milled an hour away. Order online by 4pm, pick up next morning.",
    note: "Specific numbers and a clear order path build trust.",
  },
];

// Trust strip — fake but plausible
const STAT_STRIP = [
  { value: "11,400+",  label: "Sites Audited" },
  { value: "82,000+",  label: "Fixes Shipped" },
  { value: "4.8 / 5",  label: "Average Rating" },
  { value: "97%",      label: "Would Recommend" },
];

const TESTIMONIALS = [
  {
    quote: "Followed the fixes on a Tuesday morning. By Friday my Etsy traffic was up 40%. I'm not technical at all — the instructions just made sense.",
    name: "Priya Mehta",
    role: "Owner, Loomweave Studio",
    initials: "PM",
    color: "#0a1628",
  },
  {
    quote: "I'd been quoted ₹35,000 to 'fix my SEO'. This report told me exactly what to change, in plain English. Two hours of work, done.",
    name: "Daniel Cho",
    role: "Founder, Northside Films",
    initials: "DC",
    color: "#016630",
  },
  {
    quote: "Best ₹999 I've spent on the business. The before/after rewrites alone were worth it — I just copy-pasted them in.",
    name: "Aisha Okafor",
    role: "Studio Manager, Glasshouse Ceramics",
    initials: "AO",
    color: "#16335c",
  },
];

// Press / "as seen on" — fake outlets, in plain wordmark style.
const PRESS = ["TechCrunch", "Product Hunt", "Indie Hackers", "SmallBiz Weekly", "The Hustle"];

Object.assign(window, {
  AUDIT_SITE, SCORES, ISSUES, HOTSPOTS, BEFORE_AFTER, STAT_STRIP, TESTIMONIALS, PRESS,
});
