"use client";
import type { ReactNode } from "react";
import TopNav from "./TopNav";

export default function PageLayout({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-page)" }}>
      <TopNav onAudit={() => { window.location.href = "/"; }} />

      <main style={{ flex: 1, padding: "80px 0 60px" }}>
        <div className="pc-container" style={{ maxWidth: 760 }}>
          {title && (
            <>
              <h1 style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 800,
                fontSize: "clamp(28px, 4vw, 42px)",
                letterSpacing: "-0.02em",
                color: "var(--navy-800)",
                margin: "0 0 8px",
              }}>{title}</h1>
              <p style={{ fontSize: 13.5, color: "var(--fg-3)", marginBottom: 40 }}>
                Last updated: June 2026
              </p>
            </>
          )}
          {children}
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
          <span>© 2026 Fixlytics. Built for small teams.</span>
          <span style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <a href="/privacy" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Privacy</a>
            <a href="/terms" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Terms</a>
            <a href="/contact" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Contact</a>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00c758", display: "inline-block" }} />
              All systems operational
            </span>
          </span>
        </div>
      </footer>
    </div>
  );
}
