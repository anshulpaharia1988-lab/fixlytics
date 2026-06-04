"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import type { PaymentRecord } from "@/lib/paymentDB";

interface EnrichedReport extends PaymentRecord {
  daysRemaining: number;
}

export default function MyReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<EnrichedReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/my-reports");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/reports/list")
      .then((r) => r.json())
      .then((data) => setReports(data.reports ?? []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 16, color: "var(--fg-3)" }}>Loading…</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-page)" }}>
      <TopNav onAudit={() => { window.location.href = "/"; }} />

      <main style={{ flex: 1, padding: "60px 0 80px" }}>
        <div className="pc-container" style={{ maxWidth: 760 }}>

          {/* Page heading */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontSize: "clamp(26px, 3.6vw, 38px)", fontWeight: 800,
              letterSpacing: "-0.025em", color: "var(--navy-800)", margin: "0 0 6px",
            }}>My Reports</h1>
            <p style={{ fontSize: 14, color: "var(--fg-3)", margin: 0 }}>
              {session?.user?.email}
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--fg-3)", fontSize: 16 }}>
              Loading your reports…
            </div>
          ) : reports.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 24px" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <h2 style={{
                fontSize: 24, fontWeight: 700, color: "var(--navy-800)",
                margin: "0 0 12px", letterSpacing: "-0.02em",
              }}>No reports yet</h2>
              <p style={{ fontSize: 16, color: "var(--fg-2)", margin: "0 0 28px" }}>
                Run your first audit to get started.
              </p>
              <a href="/" style={{
                display: "inline-block", padding: "13px 28px",
                background: "linear-gradient(135deg, #00d467, #00a851)",
                color: "#fff", borderRadius: 12, textDecoration: "none",
                fontWeight: 700, fontSize: 15,
                boxShadow: "0 8px 20px -4px rgba(0,199,88,0.36)",
              }}>
                Audit new site →
              </a>
            </div>
          ) : (
            <>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12,
              }}>
                <p style={{ fontSize: 15, color: "var(--fg-2)", margin: 0 }}>
                  {reports.length} paid report{reports.length !== 1 ? "s" : ""}
                </p>
                <a href="/" style={{
                  padding: "10px 20px",
                  background: "linear-gradient(135deg, #00d467, #00a851)",
                  color: "#fff", borderRadius: 10, textDecoration: "none",
                  fontWeight: 600, fontSize: 14,
                }}>
                  Audit new site →
                </a>
              </div>

              <div style={{ display: "grid", gap: 16 }}>
                {reports.map((r) => (
                  <div key={r.url} style={{
                    background: "#fff", borderRadius: 20,
                    border: "1px solid var(--border)",
                    padding: "20px 24px",
                    boxShadow: "0 2px 6px rgba(10,22,40,0.04)",
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", flexWrap: "wrap", gap: 14,
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        fontWeight: 700, fontSize: 16, color: "var(--navy-800)",
                        letterSpacing: "-0.01em", marginBottom: 4,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {r.url}
                      </div>
                      <div style={{
                        fontSize: 13, color: "var(--fg-3)", display: "flex",
                        alignItems: "center", gap: 12, flexWrap: "wrap",
                      }}>
                        <span>Paid {new Date(r.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span style={{
                          fontWeight: 600,
                          color: r.daysRemaining > 7 ? "var(--green-700)" : "var(--danger)",
                        }}>
                          {r.daysRemaining} day{r.daysRemaining !== 1 ? "s" : ""} remaining
                        </span>
                      </div>
                    </div>
                    <a
                      href={`/?url=${encodeURIComponent(r.url)}&view=results`}
                      style={{
                        padding: "10px 20px",
                        background: "var(--bg-page)",
                        border: "1px solid var(--border)",
                        borderRadius: 10, textDecoration: "none",
                        fontWeight: 600, fontSize: 14, color: "var(--navy-800)",
                        whiteSpace: "nowrap", flexShrink: 0,
                      }}
                    >
                      View Report →
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <footer style={{
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
          <span style={{ display: "flex", gap: 20 }}>
            <a href="/privacy" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Privacy</a>
            <a href="/terms"   style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Terms</a>
            <a href="/contact" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Contact</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
