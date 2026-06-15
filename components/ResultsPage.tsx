"use client";
import { useState, useMemo, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import type { CSSProperties, ReactNode } from "react";
import Button from "./Button";
import Icon from "./Icon";
import TopNav from "./TopNav";
import type { Issue } from "@/lib/data";
import { getDeterministicScores, getDynamicIssues, type AuditScores, type AuditData } from "@/lib/scoring";
import {
  isPaid as checkIsPaid,
  markAsPaid,
  getDaysRemaining,
} from "@/lib/paymentStorage";
import { validateCoupon } from "@/lib/coupons";

// ── Metadata maps ─────────────────────────────────────────────────────────────
const AREA_META = {
  ux:    { label: "User Experience",   icon: "mouse-pointer-2", color: "#16335c", bg: "#eef2f9" },
  seo:   { label: "Search Visibility", icon: "search",          color: "#a86200", bg: "#fdf4e6" },
  speed: { label: "Site Speed",        icon: "gauge",           color: "#7e1d5c", bg: "#f9eef4" },
} as const;

const SEVERITY_META = {
  high: { label: "Critical", color: "var(--danger)",      bg: "var(--danger-bg)" },
  med:  { label: "Moderate", color: "#a86200",            bg: "rgba(249,156,0,0.12)" },
  low:  { label: "Minor",    color: "var(--green-700)",   bg: "var(--green-50)" },
} as const;

const TONE_META = {
  good: { label: "Good",       color: "#00a544", bg: "#dcfce7", shadow: "0 10px 30px -8px rgba(0,165,68,0.30)" },
  warn: { label: "Needs work", color: "#c2410c", bg: "#fff3e0", shadow: "0 10px 30px -8px rgba(249,156,0,0.35)" },
  bad:  { label: "Critical",   color: "#dc2626", bg: "#fee2e2", shadow: "0 10px 30px -8px rgba(220,38,38,0.30)" },
} as const;

// ── Eyebrow ───────────────────────────────────────────────────────────────────
function Eyebrow({ children, align = "center" }: { children: ReactNode; align?: "center" | "left" }) {
  return (
    <div style={{
      fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 12,
      letterSpacing: "0.08em", textTransform: "uppercase",
      color: "var(--green-600)", textAlign: align, marginBottom: 14,
    }}>
      {children}
    </div>
  );
}

// ── DataSourceBanner ──────────────────────────────────────────────────────────
function DataSourceBanner({ meta }: { meta: AuditData["meta"] }) {
  if (meta.source === "pagespeed") {
    const parts = ["Data powered by Google PageSpeed API · Mobile scan"];
    if (meta.fcp) parts.push(`FCP: ${meta.fcp}`);
    if (meta.lcp) parts.push(`LCP: ${meta.lcp}`);
    return (
      <div style={{
        background: "#f0fdf4", border: "1px solid #bbf7d0",
        borderRadius: 12, padding: "12px 16px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ color: "#16a34a", fontSize: 16, flexShrink: 0 }}>✓</span>
        <span style={{ fontSize: 13, color: "#15803d", fontWeight: 500 }}>
          {parts.join(" · ")}
        </span>
      </div>
    );
  }
  return (
    <div style={{
      background: "#fffbeb", border: "1px solid #fde68a",
      borderRadius: 12, padding: "12px 16px",
      display: "flex", alignItems: "flex-start", gap: 12,
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>⚡</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#92400e", marginBottom: 4 }}>
          Speed score is estimated
        </div>
        <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.5 }}>
          Google PageSpeed took too long to respond for this site.
          UX and SEO signals were checked from live HTML.
          Speed score is based on site characteristics.
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "none", border: "none",
              color: "#00c758", fontWeight: 600,
              cursor: "pointer", fontSize: 13,
              marginLeft: 8, fontFamily: "inherit",
              textDecoration: "underline", padding: 0,
            }}
          >
            Try again →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── VerdictStat ───────────────────────────────────────────────────────────────
function VerdictStat({ icon, color, value, label, sub }: {
  icon: string; color: string; value: string | number; label: string; sub: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: `color-mix(in oklab, ${color} 12%, white)`,
        color, flexShrink: 0,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        marginTop: 4,
      }}>
        <Icon name={icon} size={20} />
      </div>
      <div>
        <div style={{
          fontWeight: 800, fontSize: 32, letterSpacing: "-0.03em",
          color: "var(--navy-800)", lineHeight: 1, fontFeatureSettings: '"tnum"',
        }}>{value}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--navy-800)", marginTop: 6 }}>{label}</div>
        <div style={{ fontSize: 12.5, color: "var(--fg-3)", marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

// ── Grade helpers ─────────────────────────────────────────────────────────────
function gradeFor(score: number) {
  if (score >= 90) return { letter: "A", tone: "good" as const };
  if (score >= 80) return { letter: "B", tone: "good" as const };
  if (score >= 70) return { letter: "C", tone: "warn" as const };
  if (score >= 60) return { letter: "D", tone: "warn" as const };
  return { letter: "F", tone: "bad" as const };
}

function estimatedLift(score: number): number {
  if (score >= 85) return 8;
  if (score >= 75) return 15;
  if (score >= 65) return 24;
  if (score >= 55) return 32;
  return 40;
}

// ── VerdictCard ───────────────────────────────────────────────────────────────
function VerdictCard({ overallScore, criticalCount, freeCount, premiumCount }: {
  overallScore: number; criticalCount: number; freeCount: number; premiumCount: number;
}) {
  const grade = gradeFor(overallScore);
  const tone = TONE_META[grade.tone];
  const lift = estimatedLift(overallScore);
  return (
    <div className="summary-outer" style={{
      background: "#fff", borderRadius: 28,
      border: "1px solid rgba(10,22,40,0.06)",
      boxShadow: "0 32px 64px -24px rgba(10,22,40,0.24), 0 8px 16px -4px rgba(10,22,40,0.06)",
      overflow: "hidden",
    }}>
      <div className="summary-card" style={{
        display: "grid", gridTemplateColumns: "auto 1fr auto",
        gap: 0, alignItems: "stretch",
      }}>
        {/* Grade panel */}
        <div className="summary-left" style={{
          background: `linear-gradient(180deg, ${tone.bg} 0%, #fff 100%)`,
          padding: "32px 36px", borderRight: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 24, position: "relative",
        }}>
          <div style={{
            width: 88, height: 88, borderRadius: 22,
            background: `linear-gradient(180deg, ${tone.color} 0%, color-mix(in oklab, ${tone.color} 80%, black 20%) 100%)`,
            color: "#fff",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 56, letterSpacing: "-0.04em",
            boxShadow: `${tone.shadow}, 0 1px 0 rgba(255,255,255,0.3) inset`,
            flexShrink: 0,
          }}>{grade.letter}</div>
          <div>
            <div style={{
              fontSize: 11.5, color: tone.color, fontWeight: 700,
              letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 4,
            }}>Overall grade</div>
            <div style={{
              fontSize: 42, fontWeight: 800, letterSpacing: "-0.035em",
              color: "var(--navy-800)", lineHeight: 1, fontFeatureSettings: '"tnum"',
            }}>
              {overallScore}
              <span style={{ fontSize: 22, color: "var(--fg-3)", fontWeight: 600 }}> / 100</span>
            </div>
            <div style={{ fontSize: 14, color: "var(--fg-2)", marginTop: 8, fontWeight: 500 }}>
              {tone.label}  - and we know exactly how to fix it.
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div style={{
          padding: "32px 36px", display: "flex", alignItems: "center",
          gap: 36, flexWrap: "wrap",
        }}>
          <VerdictStat icon="alert-octagon" color="var(--danger)" value={criticalCount} label="Critical issues" sub="Fix these first" />
          <div style={{ width: 1, alignSelf: "stretch", background: "var(--border)" }} />
          <VerdictStat icon="wand-2" color="var(--green-600)" value={freeCount} label="Free fixes ready" sub="Copy-paste in minutes" />
          <div style={{ width: 1, alignSelf: "stretch", background: "var(--border)" }} />
          <VerdictStat icon="lock" color="var(--navy-700)" value={`+${premiumCount}`} label="Locked in premium" sub="Worth the upgrade" />
        </div>

        {/* Revenue callout */}
        <div className="summary-lift" style={{
          background: "linear-gradient(180deg, var(--navy-800) 0%, var(--navy-900) 100%)",
          color: "#fff", padding: "32px 36px",
          display: "flex", flexDirection: "column", justifyContent: "center",
          minWidth: 260, position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 60% 60% at 100% 50%, rgba(0,199,88,0.18), transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{ position: "relative" }}>
            <div style={{
              fontSize: 11.5, color: "var(--green-400)", fontWeight: 700,
              letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 6,
            }}>Estimated lift</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{
                fontWeight: 800, fontSize: 42, letterSpacing: "-0.035em",
                color: "#fff", fontFeatureSettings: '"tnum"', lineHeight: 1,
              }}>+{lift}%</span>
              <span style={{ fontSize: 16, color: "rgba(255,255,255,0.6)" }}>conversions</span>
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 10, lineHeight: 1.4 }}>
              if you ship the fixes below. Based on sites with similar scores.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ScoreCard ─────────────────────────────────────────────────────────────────
function ScoreCard({ area, score, tone: toneKey, label, desc, issueCount, delay }: {
  area: keyof typeof AREA_META; score: number;
  tone: keyof typeof TONE_META; label: string; desc: string;
  issueCount: number; delay: number;
}) {
  const tone = TONE_META[toneKey];
  const areaMeta = AREA_META[area];
  const [v, setV] = useState(0);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setV(score), 250 + delay);
    return () => clearTimeout(t);
  }, [score, delay]);

  const R = 38;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - v / 100);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#fff", borderRadius: 24,
        border: "1px solid var(--border)",
        boxShadow: hover
          ? "0 24px 48px -16px rgba(10,22,40,0.16), 0 4px 12px -4px rgba(10,22,40,0.06)"
          : "0 2px 8px rgba(10,22,40,0.05)",
        transform: hover ? "translateY(-3px)" : "none",
        transition: "all 250ms var(--ease-out)",
        overflow: "hidden", position: "relative",
      }}
    >
      <div style={{
        height: 5,
        background: `linear-gradient(90deg, ${tone.color} 0%, color-mix(in oklab, ${tone.color} 70%, white) 100%)`,
      }} />
      <div style={{ padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 22 }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 10px 5px 8px", borderRadius: 999,
              background: areaMeta.bg, color: areaMeta.color,
              fontSize: 12, fontWeight: 600, marginBottom: 12,
            }}>
              <Icon name={areaMeta.icon} size={13} />
              {areaMeta.label}
            </div>
            <div style={{
              fontSize: 22, fontWeight: 700, color: "var(--navy-800)",
              letterSpacing: "-0.02em", lineHeight: 1.15,
            }}>{label}</div>
          </div>
          <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
            <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="48" cy="48" r={R} fill="none" stroke="var(--gray-100)" strokeWidth="8" />
              <circle cx="48" cy="48" r={R} fill="none" stroke={tone.color} strokeWidth="8"
                strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 1.2s var(--ease-out)" }}
              />
            </svg>
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{
                fontSize: 28, fontWeight: 800, color: "var(--navy-800)",
                letterSpacing: "-0.04em", lineHeight: 1, fontFeatureSettings: '"tnum"',
              }}>{v}</div>
              <div style={{ fontSize: 10, color: "var(--fg-3)", marginTop: 2, fontWeight: 500 }}>/ 100</div>
            </div>
          </div>
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 12px", borderRadius: 999,
          background: tone.bg, color: tone.color,
          fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
          marginBottom: 16, textTransform: "uppercase",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: tone.color }} />
          {tone.label}
        </div>
        <p style={{ fontSize: 14.5, color: "var(--fg-2)", lineHeight: 1.55, margin: 0, textWrap: "pretty" } as CSSProperties}>
          {desc}
        </p>
        <div style={{
          marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="alert-circle" size={15} color={tone.color} />
            <span style={{ fontSize: 13.5, color: "var(--navy-800)", fontWeight: 600 }}>
              {issueCount} fixes ready
            </span>
          </div>
          <a href="#issues" style={{
            fontSize: 13, fontWeight: 600, color: tone.color,
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4,
          }}>
            See fixes <Icon name="arrow-right" size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}

// ── IssueCard ─────────────────────────────────────────────────────────────────
// showFix: first 2 issues (free preview) or paid → full content, no blur.
// Otherwise: entire main column blurred with an "Unlock" button overlay.
function IssueCard({ issue, index, showFix, onUnlock }: { issue: Issue; index: number; showFix: boolean; onUnlock: () => void }) {
  const [hover, setHover] = useState(false);
  const area = AREA_META[issue.area];
  const sev = SEVERITY_META[issue.severity];

  return (
    <div
      className="issue-card"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative", background: "#fff",
        borderRadius: 20, border: "1px solid var(--border)",
        boxShadow: hover
          ? "0 18px 40px -16px rgba(10,22,40,0.12), 0 4px 12px -4px rgba(10,22,40,0.06)"
          : "0 2px 6px rgba(10,22,40,0.04)",
        overflow: "hidden", transition: "all 200ms var(--ease-out)",
        transform: hover ? "translateY(-1px)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "stretch" }}>
        {/* Severity rail */}
        <div style={{
          width: 6, flexShrink: 0,
          background: `linear-gradient(180deg, ${sev.color} 0%, color-mix(in oklab, ${sev.color} 70%, white) 100%)`,
        }} />
        {/* Icon + number */}
        <div style={{
          width: 84, flexShrink: 0, background: "var(--bg-page)",
          borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "flex-start", padding: "26px 12px", gap: 14,
        }}>
          <div style={{
            fontWeight: 800, fontSize: 26, color: "var(--fg-muted)",
            letterSpacing: "-0.04em", fontFeatureSettings: '"tnum"',
          }}>{String(index).padStart(2, "0")}</div>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `linear-gradient(135deg, ${area.color} 0%, color-mix(in oklab, ${area.color} 75%, black) 100%)`,
            color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 12px -4px ${area.color}`,
          }}>
            <Icon name={area.icon} size={18} />
          </div>
        </div>

        {/* Main column  - blurred when locked */}
        <div style={{
          flex: 1, padding: 26, minWidth: 0,
          filter: showFix ? "none" : "blur(6px)",
          userSelect: showFix ? "auto" : "none",
          pointerEvents: showFix ? "auto" : "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 10px", borderRadius: 999,
              background: sev.bg, color: sev.color,
              fontSize: 11.5, fontWeight: 700,
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: sev.color }} />
              {sev.label}
            </span>
            <span style={{
              fontSize: 11.5, fontWeight: 600,
              padding: "4px 10px", borderRadius: 999,
              background: area.bg, color: area.color, letterSpacing: "0.04em",
            }}>{area.label}</span>
          </div>

          <div style={{
            fontSize: "clamp(19px, 1.9vw, 23px)", fontWeight: 700,
            color: "var(--navy-800)", letterSpacing: "-0.015em",
            lineHeight: 1.25, marginBottom: 12,
          }}>{issue.title}</div>
          <p style={{
            fontSize: 15.5, lineHeight: 1.6, color: "var(--fg-2)",
            margin: issue.contextMessage ? "0 0 10px" : "0 0 20px",
            textWrap: "pretty", maxWidth: 720,
          } as CSSProperties}>{issue.why}</p>

          {issue.contextMessage && (
            <div style={{
              fontSize: 13, fontStyle: "italic", color: "#92400e",
              background: "#fffbeb", border: "1px solid #fde68a",
              borderRadius: 8, padding: "8px 12px", marginBottom: 20,
              maxWidth: 720,
            }}>
              💡 {issue.contextMessage}
            </div>
          )}

          {/* Impact + effort */}
          <div style={{
            display: "flex", gap: 0, marginBottom: 16,
            background: "var(--bg-page)", border: "1px solid var(--border)",
            borderRadius: 12, overflow: "hidden",
          }}>
            <div style={{ flex: 1, padding: "12px 16px", borderRight: "1px solid var(--border)" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 11, fontWeight: 700, color: "var(--fg-3)",
                letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4,
              }}>
                <Icon name="trending-up" size={12} /> Expected impact
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--green-700)" }}>{issue.impact}</div>
            </div>
            <div style={{ flex: 1, padding: "12px 16px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 11, fontWeight: 700, color: "var(--fg-3)",
                letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4,
              }}>
                <Icon name="clock" size={12} /> Time to fix
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--navy-800)" }}>{issue.effort}</div>
            </div>
          </div>

          {/* Fix box */}
          <div style={{
            background: "linear-gradient(135deg, var(--green-50) 0%, #fff 100%)",
            border: "1px solid var(--green-200)",
            borderRadius: 14, padding: "16px 18px",
            display: "flex", gap: 14, alignItems: "flex-start",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(135deg, var(--green-500), var(--green-600))",
              color: "#fff", display: "inline-flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0, marginTop: 1,
              boxShadow: "0 4px 12px -2px rgba(0,199,88,0.36)",
            }}>
              <Icon name="wand-2" size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: "var(--green-700)",
                letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 4,
              }}>The Fix</div>
              <div style={{ fontSize: 15.5, color: "var(--navy-800)", lineHeight: 1.55, fontWeight: 500 }}>
                {issue.fix}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lock overlay  - hidden in print so all issues appear clean in the PDF */}
      {!showFix && (
        <div className="no-print" style={{
          position: "absolute", inset: 0, left: 90,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.96) 70%)",
        }}>
          <button
            onClick={onUnlock}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "linear-gradient(180deg, #fff 0%, #fafbfc 100%)",
              border: "1px solid var(--border)", borderRadius: 999,
              padding: "12px 22px", cursor: "pointer",
              fontFamily: "inherit", fontSize: 14, fontWeight: 600,
              color: "var(--navy-800)",
              boxShadow: "0 12px 28px -8px rgba(10,22,40,0.18), 0 2px 4px rgba(10,22,40,0.06)",
            }}
          >
            <Icon name="lock" size={15} color="var(--green-600)" />
            Unlock to see the fix
            <Icon name="arrow-right" size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── LockedPremiumPanel ────────────────────────────────────────────────────────
function LockedPremiumPanel({ currency, price, lockedCount, onUnlock, couponCode, couponMessage, couponDiscount, onCouponChange, onCouponApply }: {
  currency: string; price: number; lockedCount: number; onUnlock: () => void;
  couponCode: string; couponMessage: string; couponDiscount: number;
  onCouponChange: (code: string) => void; onCouponApply: () => void;
}) {
  const effectivePrice = couponDiscount > 0 ? price * (1 - couponDiscount / 100) : price;
  return (
    <div style={{
      position: "relative",
      background: "linear-gradient(135deg, #050d1a 0%, #0a1628 40%, #0f2744 100%)",
      color: "#fff", borderRadius: 32, overflow: "hidden",
      boxShadow: "0 40px 80px -24px rgba(10,22,40,0.40), 0 8px 16px -4px rgba(10,22,40,0.08)",
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `
          radial-gradient(ellipse 40% 60% at 90% 50%, rgba(0,199,88,0.24), transparent 60%),
          radial-gradient(ellipse 30% 40% at 0% 100%, rgba(0,199,88,0.10), transparent 60%)
        `,
      }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
        maskImage: "linear-gradient(135deg, #000 0%, transparent 70%)",
        WebkitMaskImage: "linear-gradient(135deg, #000 0%, transparent 70%)",
      }} />

      <div className="paywall-grid" style={{
        position: "relative",
        display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 400px)",
        gap: 40, padding: "clamp(32px, 5vw, 56px)",
        alignItems: "center",
      }}>
        {/* LEFT  - pitch */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg, var(--green-500), var(--green-600))",
              color: "#fff", padding: "7px 14px", borderRadius: 999,
              fontSize: 12.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
              boxShadow: "0 8px 20px -4px rgba(0,199,88,0.45)",
            }}>
              <Icon name="crown" size={13} /> Premium
            </span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.9)", padding: "7px 12px", borderRadius: 999,
              fontSize: 12, fontWeight: 600,
            }}>
              <Icon name="lock" size={12} /> Locked
            </span>
          </div>

          <h3 style={{
            fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 800,
            letterSpacing: "-0.03em", lineHeight: 1.05, margin: "0 0 16px", color: "#fff",
          }}>
            Unlock your full{" "}
            <em style={{
              fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 500,
              background: "linear-gradient(135deg, var(--green-300), var(--green-500))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>fix report</em>
          </h3>
          <p style={{
            fontSize: 17, color: "rgba(255,255,255,0.78)", lineHeight: 1.55,
            margin: "0 0 28px", maxWidth: 540, textWrap: "pretty",
          } as CSSProperties}>
            2 fixes shown free. Unlock {lockedCount} more fix{lockedCount === 1 ? "" : "es"}  - each with a copy-paste solution you can ship today.
          </p>

          {/* Feature table */}
          <div style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 18, padding: "6px",
            backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", marginBottom: 24,
          }}>
            {[
              { feat: "All issues unlocked with full details",  free: false, prem: true },
              { feat: "Copy-paste fixes for each issue",        free: false, prem: true },
              { feat: "Export full report as PDF",              free: false, prem: true },
              { feat: "30 days access",                         free: false, prem: true },
              { feat: "7-day money back guarantee",             free: false, prem: true },
            ].map((row, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1fr auto auto",
                gap: 16, alignItems: "center",
                padding: "12px 14px",
                borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.06)" : "0",
                fontSize: 14,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "rgba(255,255,255,0.88)", fontWeight: 500 }}>{row.feat}</span>
                </div>
                <div style={{ width: 44, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.40)", fontWeight: 600 }}>
                  {row.free ? <Icon name="check" size={14} color="rgba(255,255,255,0.40)" /> : " -"}
                </div>
                <div style={{ width: 44, textAlign: "center" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 20, height: 20, borderRadius: 6,
                    background: "rgba(0,199,88,0.20)", color: "var(--green-400)",
                  }}>
                    <Icon name="check" size={13} strokeWidth={3} />
                  </span>
                </div>
              </div>
            ))}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr auto auto",
              gap: 16, padding: "10px 14px 4px",
              fontSize: 10.5, fontWeight: 700,
              letterSpacing: "0.10em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.40)",
            }}>
              <div />
              <div style={{ width: 44, textAlign: "center" }}>Free</div>
              <div style={{ width: 44, textAlign: "center", color: "var(--green-400)" }}>Premium</div>
            </div>
          </div>

        </div>

        {/* RIGHT  - pricing card */}
        <div style={{
          position: "relative",
          background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
          border: "1px solid rgba(255,255,255,0.16)", borderRadius: 24, padding: 30,
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 20px 40px -12px rgba(0,0,0,0.30), 0 0 0 1px rgba(255,255,255,0.04) inset",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.62)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Full Fix Report
            </div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
              One-time · No subscription
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 22 }}>
            {couponDiscount > 0 && (
              <span style={{
                fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em",
                color: "rgba(255,255,255,0.35)", textDecoration: "line-through", lineHeight: 0.95,
              }}>{currency}{price.toLocaleString("en-IN")}</span>
            )}
            <span style={{
              fontSize: 56, fontWeight: 800, letterSpacing: "-0.04em",
              color: "#fff", fontFeatureSettings: '"tnum"', lineHeight: 0.95,
            }}>
              {couponDiscount === 100 ? "FREE" : couponDiscount > 0 ? `${currency}${effectivePrice.toFixed(2)}` : `${currency}${price.toLocaleString("en-IN")}`}
            </span>
          </div>

          {/* Coupon code */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>
              Have a coupon code?
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => onCouponChange(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && onCouponApply()}
                placeholder="Try BETA100 for free access"
                style={{
                  flex: 1, padding: "10px 12px", fontSize: 13,
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)",
                  borderRadius: 10, color: "#fff", fontFamily: "inherit",
                  outline: "none",
                }}
              />
              <button
                onClick={onCouponApply}
                style={{
                  padding: "10px 16px", borderRadius: 10,
                  background: "rgba(0,199,88,0.20)", border: "1px solid rgba(0,199,88,0.30)",
                  color: "var(--green-400)", fontFamily: "inherit",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                Apply
              </button>
            </div>
            {couponMessage && (
              <div style={{
                fontSize: 12.5, marginTop: 6, fontWeight: 600,
                color: couponDiscount > 0 ? "var(--green-400)" : "#ef4444",
              }}>
                {couponMessage}
              </div>
            )}
          </div>

          <Button kind="primary" size="lg" full iconRight="arrow-right" onClick={onUnlock}>
            {couponDiscount === 100 ? "Unlock Free - Coupon Applied!" : "Unlock Full Report"}
          </Button>

          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.72)" }}>
            {[
              { icon: "zap",          text: "Instant access  - view in browser" },
              { icon: "shield-check", text: "7-day money-back guarantee" },
            ].map((item) => (
              <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: "rgba(0,199,88,0.18)", color: "var(--green-400)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon name={item.icon} size={12} />
                </span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Razorpay script loader ────────────────────────────────────────────────────
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as { Razorpay?: unknown }).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ── Main ResultsPage ──────────────────────────────────────────────────────────
interface ResultsPageProps {
  url: string;
  currency?: string;
  price?: number;
  onLogo?: () => void;
  onRerun?: () => void;
  onAudit?: () => void;
  onUnlock?: () => void;
  initialData?: AuditData;
  initialPaid?: boolean;
}

export default function ResultsPage({
  url,
  currency = "$",
  price = 29,
  onLogo,
  onRerun,
  onAudit,
  onUnlock = () => {},
  initialData,
  initialPaid = false,
}: ResultsPageProps) {
  const [activeArea, setActiveArea] = useState<"all" | "ux" | "seo" | "speed">("all");
  const [scores, setScores] = useState<AuditScores>(
    () => initialData?.scores ?? getDeterministicScores(url)
  );
  const [issues, setIssues] = useState<Issue[]>(
    () => initialData?.issues ?? getDynamicIssues(getDeterministicScores(url), url)
  );
  const [meta, setMeta] = useState<AuditData["meta"]>(
    () => initialData?.meta ?? { fcp: null, lcp: null, source: "deterministic" }
  );
  const [isPaid, setIsPaid] = useState(initialPaid);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState("");
  const [recoverStatus, setRecoverStatus] = useState<"idle" | "checking" | "found" | "found-need-login" | "not-found">("idle");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  // session must be declared before any useEffect that references it
  const { data: session } = useSession();

  // On mount: check localStorage first
  useEffect(() => {
    if (!isPaid && url && checkIsPaid(url)) {
      setIsPaid(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // When session is available: check Redis for payment status + authoritative expiresAt
  useEffect(() => {
    if (!session?.user?.email || !url) return;
    fetch(`/api/payment/status?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.paid) {
          setIsPaid(true);
          // Compute days remaining from Redis expiresAt - never from localStorage
          if (data.expiresAt) {
            const left = Math.ceil(
              (data.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)
            );
            setDaysRemaining(Math.max(0, left));
          }
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email, url]);

  // When session is cleared (sign-out), revoke localStorage-based paid state
  useEffect(() => {
    if (session === null && isPaid) {
      setIsPaid(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  function handleRerun() {
    if (onRerun) onRerun();
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that deny clipboard without interaction
      window.prompt("Copy this link:", window.location.href);
    }
  }

  function handleExportPdf() {
    if (!session) {
      signIn(undefined, { callbackUrl: `/?url=${encodeURIComponent(url)}&view=results` });
      return;
    }
    if (!isPaid) {
      document.getElementById("paywall-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    window.print();
  }

  function applyCoupon() {
    if (!couponCode.trim()) return;
    const result = validateCoupon(couponCode);
    setCouponMessage(result.message);
    if (result.valid) {
      setCouponDiscount(result.discount);
      setCouponApplied(true);
    } else {
      setCouponDiscount(0);
      setCouponApplied(false);
    }
  }

  async function handleFreeCouponUnlock(email: string) {
    setCouponMessage("Access unlocked! Loading your full report...");
    markAsPaid(url);
    setIsPaid(true);
    try {
      await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupon: true, email, auditUrl: url }),
      });
    } catch {
      // Non-fatal: access already unlocked locally
    }
  }

  // Actual Razorpay checkout  - only called after email is confirmed
  async function runPayment() {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert("Could not load payment gateway. Please try again.");
      return;
    }
    const orderRes = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coupon: couponApplied ? couponCode : null }),
    });
    if (!orderRes.ok) {
      alert("Could not create order. Please try again.");
      return;
    }
    const orderData = await orderRes.json();
    if (orderData.free) {
      markAsPaid(url);
      setIsPaid(true);
      return;
    }
    const { orderId, amount, currency: orderCurrency, keyId } = orderData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rzp = new (window as any).Razorpay({
      key: keyId,
      amount,
      currency: orderCurrency,
      name: "Fixlytics",
      description: "Full Website Audit Report",
      order_id: orderId,
      theme: { color: "#00c758" },
      "_payment_button_logo": false,
      prefill: { email: userEmail },
      config: {
        display: {
          blocks: {
            utib0: {
              name: "Pay via Card",
              instruments: [{ method: "card" }],
            },
          },
          sequence: ["block.utib0"],
          preferences: { show_default_blocks: true },
        },
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        const verifyRes = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...response, email: userEmail, auditUrl: url }),
        });
        const { success } = await verifyRes.json();
        if (success) {
          markAsPaid(url);
          setIsPaid(true);
        }
      },
    });
    rzp.open();
  }

  // All unlock actions require a signed-in session.
  // If not authenticated, redirect to /login then return to this page.
  function handleUnlock() {
    const sessionEmail = session?.user?.email;
    if (!sessionEmail) {
      signIn(undefined, { callbackUrl: `/?url=${encodeURIComponent(url)}&view=results` });
      return;
    }
    setUserEmail(sessionEmail);
    if (couponDiscount === 100) {
      handleFreeCouponUnlock(sessionEmail);
    } else {
      runPayment();
    }
  }

  async function handleRecoverAccess() {
    if (!recoverEmail.trim()) return;
    setRecoverStatus("checking");
    try {
      const res = await fetch(
        `/api/payment/check?email=${encodeURIComponent(recoverEmail)}&url=${encodeURIComponent(url)}`
      );
      const data = await res.json();
      if (data.paid) {
        if (session?.user?.email) {
          // Logged in - restore immediately
          setRecoverStatus("found");
          markAsPaid(url);
          setUserEmail(recoverEmail);
          setTimeout(() => {
            setIsPaid(true);
            setShowRecoverModal(false);
            setRecoverStatus("idle");
          }, 1200);
        } else {
          // Payment found but not logged in - prompt sign in
          setRecoverStatus("found-need-login");
        }
      } else {
        setRecoverStatus("not-found");
      }
    } catch {
      setRecoverStatus("not-found");
    }
  }

  useEffect(() => {
    if (initialData || !url) return;
    fetch(`/api/audit?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((data: AuditData) => {
        setScores(data.scores);
        setIssues(data.issues);
        setMeta(data.meta);
      })
      .catch(() => {});
  }, [url, initialData]);

  const visibleIssues = useMemo(
    () => issues.filter((i) => activeArea === "all" || i.area === activeArea),
    [activeArea, issues]
  );

  const criticalCount = issues.filter((i) => i.severity === "high").length;
  const overallScore  = Math.round((scores.ux.value + scores.seo.value + scores.speed.value) / 3);
  // Free preview = first 2 issues; everything else is locked until paid.
  const freeShown   = isPaid ? issues.length : Math.min(2, issues.length);
  const lockedCount = isPaid ? 0 : Math.max(0, issues.length - 2);

  return (
    <div className="results-container" style={{ background: "var(--bg-page)", minHeight: "100vh", overflowX: "hidden" }}>
      {/* PDF-only header  - hidden on screen, shown via @media print */}
      <div className="pdf-header" style={{ display: "none", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <img
          src="/logo.png"
          alt="Fixlytics"
          width={260}
          style={{ height: "auto", display: "block", marginBottom: 12 }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
        <div style={{ fontSize: 13, color: "#666" }}>
          Full Audit Report &ndash; {url} &ndash; {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Beta banner */}
      <div style={{
        background: 'var(--navy-800)',
        color: '#fff',
        padding: '10px 16px',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 500,
      }}>
        🎉 Beta access is free! Use code{' '}
        <strong style={{
          background: 'var(--green-glow)',
          color: 'var(--green-700)',
          padding: '2px 8px',
          borderRadius: 6,
          marginLeft: 4,
          marginRight: 4,
        }}>
          BETA100
        </strong>
        {' '}to unlock your full report at no cost.
      </div>

      <TopNav onLogo={onLogo} onAudit={onAudit} />

      {/* Header */}
      <section style={{
        background: "linear-gradient(180deg, var(--navy-900) 0%, var(--navy-800) 100%)",
        color: "#fff", padding: "40px 0 140px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 50% 60% at 80% 0%, rgba(0,199,88,0.20), transparent 70%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 60% 60% at 50% 20%, #000 0%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 20%, #000 0%, transparent 80%)",
        }} />
        <div className="pc-container" style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ flex: "1 1 360px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontSize: 12.5, color: "var(--green-400)", fontWeight: 700,
                letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 14,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%", background: "var(--green-400)",
                  boxShadow: "0 0 0 4px rgba(0,199,88,0.20)",
                }} />
                Audit complete · {meta.source === "pagespeed" ? "real data" : "estimated data"}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                <h1 style={{
                  fontSize: "clamp(28px, 3.6vw, 42px)", fontWeight: 800,
                  letterSpacing: "-0.03em", margin: 0, color: "#fff", lineHeight: 1,
                }}>Results for</h1>
                <span className="results-url" style={{
                  fontFamily: "var(--font-mono)", fontSize: "clamp(15px, 1.8vw, 20px)",
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)",
                  borderRadius: 10, padding: "6px 14px", color: "#fff", fontWeight: 500,
                }}>{url}</span>
              </div>
              {isPaid && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  marginTop: 12, fontSize: 13, fontWeight: 600,
                  color: "var(--green-400)",
                }}>
                  <Icon name="check-circle" size={14} />
                  Full report unlocked · {daysRemaining ?? getDaysRemaining(url)} days remaining
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              {copied && (
                <span style={{
                  fontSize: 12.5, fontWeight: 600, color: "var(--green-400)",
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}>
                  <Icon name="check" size={13} /> Link copied!
                </span>
              )}
              <Button kind="ghostDark" size="md" icon="rotate-cw" onClick={handleRerun}>
                <span className="btn-text-desktop">Re-run</span>
              </Button>
              <Button kind="ghostDark" size="md" icon="share-2" onClick={handleShare}>
                <span className="btn-text-desktop">Share</span>
              </Button>
              <span className="no-print">
                <Button kind="primary" size="md" icon="download" onClick={handleExportPdf}>
                  <span className="btn-text-desktop">Export PDF</span>
                </Button>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Verdict card overlapping header */}
      <section style={{ marginTop: -100, paddingBottom: 24, position: "relative", zIndex: 2 }}>
        <div className="pc-container">
          <VerdictCard
            overallScore={overallScore}
            criticalCount={criticalCount}
            freeCount={freeShown}
            premiumCount={lockedCount}
          />
        </div>
      </section>

      {/* Three score cards */}
      <section style={{ padding: "24px 0 32px" }}>
        <div className="pc-container">
          <div className="score-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            <ScoreCard area="ux"    score={scores.ux.value}    tone={scores.ux.tone}    label={scores.ux.label}    desc={scores.ux.desc}    issueCount={issues.filter((i) => i.area === "ux").length}    delay={0} />
            <ScoreCard area="seo"   score={scores.seo.value}   tone={scores.seo.tone}   label={scores.seo.label}   desc={scores.seo.desc}   issueCount={issues.filter((i) => i.area === "seo").length}   delay={150} />
            <ScoreCard area="speed" score={scores.speed.value} tone={scores.speed.tone} label={scores.speed.label} desc={scores.speed.desc} issueCount={issues.filter((i) => i.area === "speed").length} delay={300} />
          </div>
        </div>
      </section>

      {/* Data source / performance metrics strip */}
      <section className="data-banner no-print" style={{ padding: "0 0 48px" }}>
        <div className="pc-container">
          <DataSourceBanner meta={meta} />
        </div>
      </section>

      {/* Issue list */}
      <section id="issues" style={{ padding: "32px 0 48px" }}>
        <div className="pc-container">
          <div style={{
            display: "flex", alignItems: "flex-end", justifyContent: "space-between",
            flexWrap: "wrap", gap: 16, marginBottom: 28,
          }}>
            <div>
              <Eyebrow align="left">Your Fixes</Eyebrow>
              <h2 style={{
                fontSize: "clamp(28px, 3.4vw, 40px)", fontWeight: 800,
                letterSpacing: "-0.025em", margin: "8px 0 12px", color: "var(--navy-800)",
              }}>
                The fixes,{" "}
                <em style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 500 }}>
                  ranked by impact
                </em>
              </h2>
              <div style={{ fontSize: 15, color: "var(--fg-2)", maxWidth: 540 }}>
                Start with critical issues  - these are the ones costing you visitors right now.
              </div>
            </div>
            <div className="filter-tabs no-print" style={{
              display: "inline-flex", background: "#fff", borderRadius: 14,
              padding: 4, border: "1px solid var(--border)",
              boxShadow: "0 1px 2px rgba(10,22,40,0.04)",
            }}>
              {([
                { id: "all",   label: "All",   count: issues.length },
                { id: "ux",    label: "UX",    count: issues.filter((i) => i.area === "ux").length },
                { id: "seo",   label: "SEO",   count: issues.filter((i) => i.area === "seo").length },
                { id: "speed", label: "Speed", count: issues.filter((i) => i.area === "speed").length },
              ] as const).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveArea(t.id)}
                  style={{
                    background: activeArea === t.id ? "var(--navy-800)" : "transparent",
                    color: activeArea === t.id ? "#fff" : "var(--fg-2)",
                    border: 0, padding: "9px 16px", borderRadius: 10,
                    cursor: "pointer", fontSize: 14, fontWeight: 600,
                    transition: "all 150ms var(--ease-out)",
                    fontFamily: "inherit",
                    display: "inline-flex", alignItems: "center", gap: 8,
                  }}
                >
                  {t.label}
                  <span style={{
                    fontSize: 11.5, fontWeight: 700, padding: "1px 7px", borderRadius: 999,
                    background: activeArea === t.id ? "rgba(255,255,255,0.16)" : "var(--bg-page)",
                    color: activeArea === t.id ? "#fff" : "var(--fg-3)",
                    fontFeatureSettings: '"tnum"',
                  }}>{t.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            {visibleIssues.map((issue, i) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                index={i + 1}
                showFix={isPaid || i < 2}
                onUnlock={handleUnlock}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Locked premium */}
      {!isPaid && (
        <section id="paywall-section" className="paywall-section no-print" style={{ padding: "24px 0 48px" }}>
          <div className="pc-container">
            <LockedPremiumPanel
              currency={currency}
              price={price}
              lockedCount={lockedCount}
              onUnlock={handleUnlock}
              couponCode={couponCode}
              couponMessage={couponMessage}
              couponDiscount={couponDiscount}
              onCouponChange={(code) => { setCouponCode(code); setCouponMessage(""); }}
              onCouponApply={applyCoupon}
            />
            {/* Already paid recovery link */}
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button
                onClick={() => { setShowRecoverModal(true); setRecoverStatus("idle"); setRecoverEmail(""); }}
                style={{
                  background: "none", border: 0, cursor: "pointer",
                  fontSize: 14, color: "var(--fg-3)", fontFamily: "inherit",
                  textDecoration: "underline", textDecorationStyle: "dotted",
                }}
              >
                Already paid? Restore your access →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Already paid? recovery modal */}
      {showRecoverModal && (
        <div
          onClick={() => setShowRecoverModal(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1001,
            background: "rgba(5,13,26,0.78)",
            backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 28, padding: "44px 40px 36px",
              maxWidth: 420, width: "100%", position: "relative",
              boxShadow: "0 40px 80px -16px rgba(10,22,40,0.36)",
              textAlign: "center",
            }}
          >
            <button
              onClick={() => setShowRecoverModal(false)}
              style={{
                position: "absolute", top: 16, right: 16,
                background: "var(--bg-page)", border: "1px solid var(--border)",
                borderRadius: 8, width: 32, height: 32, cursor: "pointer",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                color: "var(--fg-3)", fontFamily: "inherit",
              }}
            >
              <Icon name="x" size={16} />
            </button>

            <div style={{
              width: 64, height: 64, borderRadius: 20, margin: "0 auto 20px",
              background: "var(--green-glow)", border: "1.5px solid var(--green-200)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="key" size={28} color="var(--green-600)" />
            </div>

            <h3 style={{
              fontSize: 24, fontWeight: 800, letterSpacing: "-0.025em",
              color: "var(--navy-800)", margin: "0 0 10px",
            }}>Restore your access</h3>
            <p style={{ fontSize: 15, color: "var(--fg-2)", margin: "0 0 24px", lineHeight: 1.6 }}>
              Enter the email you used when you paid. We&apos;ll restore your full report access.
            </p>

            <input
              type="email"
              value={recoverEmail}
              onChange={(e) => { setRecoverEmail(e.target.value); setRecoverStatus("idle"); }}
              onKeyDown={(e) => e.key === "Enter" && handleRecoverAccess()}
              placeholder="your@email.com"
              autoFocus
              style={{
                width: "100%", padding: "14px 16px", fontSize: 16,
                border: "1.5px solid var(--border)", borderRadius: 12,
                outline: "none", fontFamily: "inherit", boxSizing: "border-box",
                marginBottom: 12, color: "var(--navy-800)", background: "#fff",
                textAlign: "center",
              }}
            />

            {recoverStatus === "not-found" && (
              <p style={{ fontSize: 13, color: "var(--danger)", marginBottom: 10 }}>
                No payment found for this email + site.{" "}
                <a href="mailto:support@fixlytics.app" style={{ color: "var(--green-600)" }}>Contact support</a>
              </p>
            )}
            {recoverStatus === "found" && (
              <p style={{ fontSize: 13, color: "var(--green-600)", fontWeight: 600, marginBottom: 10 }}>
                ✓ Access restored! Loading your full report…
              </p>
            )}
            {recoverStatus === "found-need-login" && (
              <div style={{
                background: "var(--green-glow)", border: "1px solid var(--green-200)",
                borderRadius: 12, padding: "14px 16px", marginBottom: 12, textAlign: "left",
              }}>
                <p style={{ fontSize: 13.5, color: "var(--navy-800)", margin: "0 0 10px", fontWeight: 600 }}>
                  ✓ Payment found! Sign in to restore your access.
                </p>
                <button
                  onClick={() => {
                    setShowRecoverModal(false);
                    signIn(undefined, { callbackUrl: `/?url=${encodeURIComponent(url)}&view=results` });
                  }}
                  style={{
                    width: "100%", padding: "11px 16px", borderRadius: 10,
                    background: "linear-gradient(135deg, #00d467, #00a851)",
                    color: "#fff", border: 0, fontFamily: "inherit",
                    fontSize: 14, fontWeight: 700, cursor: "pointer",
                    boxShadow: "0 4px 12px -2px rgba(0,199,88,0.36)",
                  }}
                >
                  Sign in to restore access →
                </button>
              </div>
            )}

            <button
              onClick={handleRecoverAccess}
              disabled={!recoverEmail.trim() || recoverStatus === "checking" || recoverStatus === "found"}
              style={{
                width: "100%", padding: "14px 24px",
                background: recoverEmail.trim() ? "linear-gradient(135deg, #00d467, #00a851)" : "var(--bg-page)",
                color: recoverEmail.trim() ? "#fff" : "var(--fg-3)",
                border: recoverEmail.trim() ? "none" : "1.5px solid var(--border)",
                borderRadius: 14, cursor: recoverEmail.trim() ? "pointer" : "default",
                fontFamily: "inherit", fontSize: 15, fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              {recoverStatus === "checking" ? "Checking…" : "Restore access"}
            </button>
          </div>
        </div>
      )}


      {/* PDF upsell modal  - shown when unpaid user clicks Export PDF */}
      {showPdfModal && (
        <div
          onClick={() => setShowPdfModal(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(5,13,26,0.78)",
            backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 28, padding: "44px 40px 36px",
              maxWidth: 460, width: "100%", position: "relative",
              boxShadow: "0 40px 80px -16px rgba(10,22,40,0.36), 0 0 0 1px rgba(10,22,40,0.04)",
              textAlign: "center",
            }}
          >
            {/* Close */}
            <button
              onClick={() => setShowPdfModal(false)}
              style={{
                position: "absolute", top: 16, right: 16,
                background: "var(--bg-page)", border: "1px solid var(--border)",
                borderRadius: 8, width: 32, height: 32, cursor: "pointer",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                color: "var(--fg-3)", fontFamily: "inherit",
              }}
            >
              <Icon name="x" size={16} />
            </button>

            {/* Lock icon */}
            <div style={{
              width: 72, height: 72, borderRadius: 22, margin: "0 auto 24px",
              background: "linear-gradient(135deg, var(--green-50), #fff)",
              border: "1.5px solid var(--green-200)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px -4px rgba(0,199,88,0.18)",
            }}>
              <Icon name="lock" size={30} color="var(--green-600)" />
            </div>

            <h3 style={{
              fontSize: 26, fontWeight: 800, letterSpacing: "-0.025em",
              color: "var(--navy-800)", margin: "0 0 12px", lineHeight: 1.1,
            }}>Unlock to Export PDF</h3>

            <p style={{
              fontSize: 15.5, lineHeight: 1.6, color: "var(--fg-2)",
              margin: "0 0 28px", maxWidth: 360, marginLeft: "auto", marginRight: "auto",
            }}>
              Get your full audit report as a clean PDF &mdash; includes all {issues.length} issues,
              copy-paste fixes, and action checklist.
            </p>

            <button
              onClick={() => { setShowPdfModal(false); handleUnlock(); }}
              style={{
                width: "100%", padding: "16px 24px",
                background: "linear-gradient(135deg, #00d467 0%, #00a851 100%)",
                color: "#fff", border: 0, borderRadius: 14, cursor: "pointer",
                fontFamily: "inherit", fontSize: 16, fontWeight: 700,
                boxShadow: "0 8px 24px -4px rgba(0,199,88,0.40)",
                letterSpacing: "-0.01em", marginBottom: 12,
              }}
            >
              Unlock Full Report &mdash; {currency}{price.toLocaleString("en-IN")}
            </button>

            <p style={{ fontSize: 13, color: "var(--fg-3)", margin: 0 }}>
              One-time payment &middot; 30 days access &middot; 7-day money-back guarantee
            </p>
          </div>
        </div>
      )}

      <footer className="no-print" style={{
        padding: "32px 0",
        background: "var(--navy-900)",
        color: "rgba(255,255,255,0.5)",
        fontSize: 13.5,
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div className="pc-container" style={{
          display: "flex", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
        }}>
          <span>© 2026 Fixlytics. All rights reserved.</span>
          <span style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <a href="/privacy" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Privacy</a>
            <a href="/terms"   style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Terms</a>
            <a href="/contact" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Contact</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
