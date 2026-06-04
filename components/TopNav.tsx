"use client";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Button from "./Button";

interface TopNavProps {
  onLogo?: () => void;
  onAudit?: () => void;
  brand?: string;
}

const navLinkStyle: React.CSSProperties = {
  fontSize: 14,
  color: "var(--fg-2)",
  textDecoration: "none",
  fontWeight: 500,
  padding: "8px 14px",
  borderRadius: 8,
};

function handleSignOut() {
  try { localStorage.removeItem("fixlytics_paid_reports"); } catch { /* ignore */ }
  handleSignOut();
}

export default function TopNav({ onLogo, onAudit }: TopNavProps) {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function close() { setMobileMenuOpen(false); }

  function handleLogoClick() {
    close();
    onAudit ? onAudit() : window.scrollTo({ top: 0, behavior: "smooth" });
    onLogo?.();
  }

  function handleAuditClick() {
    close();
    onAudit ? onAudit() : window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(10,22,40,0.06)",
        }}
      >
        <div
          className="pc-container"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}
        >
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            suppressHydrationWarning
            style={{ background: "none", border: 0, cursor: "pointer", padding: 0 }}
            aria-label="Fixlytics home"
          >
            <img
              src="/logo.png"
              alt="Fixlytics"
              width={160}
              style={{ height: "auto", display: "block" }}
              onError={(e) => {
                const img = e.currentTarget;
                img.style.display = "none";
                const fallback = img.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "inline-flex";
              }}
            />
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg, var(--navy-700) 0%, var(--navy-800) 100%)",
              display: "none", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(10,22,40,0.15)",
            }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: "var(--green-400)" }} />
            </div>
          </button>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {/* Desktop nav links + auth */}
            <div className="nav-links-desktop" style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <a href="#how" style={navLinkStyle}>How it works</a>
              <a href="#pricing" style={navLinkStyle}>Pricing</a>
              <a href="#faq" style={navLinkStyle}>FAQ</a>
              <div style={{ width: 12 }} />
              {session?.user?.email ? (
                <>
                  <span style={{
                    fontSize: 13.5, color: "var(--fg-2)", fontWeight: 500,
                    padding: "8px 12px", maxWidth: 180,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {session.user.email}
                  </span>
                  <Button kind="ghostLight" size="sm" onClick={() => handleSignOut()}>
                    Sign out
                  </Button>
                </>
              ) : (
                <Button kind="ghostLight" size="sm" onClick={() => window.location.href = "/login"}>
                  Sign in
                </Button>
              )}
            </div>

            {/* Audit button  - always visible on desktop */}
            <span className="nav-audit-desktop">
              <Button kind="primary" size="sm" iconRight="arrow-right" onClick={handleAuditClick}>
                Audit new site
              </Button>
            </span>

            {/* Hamburger  - mobile only */}
            <button
              className="nav-hamburger"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              style={{
                display: "none", /* shown via CSS on mobile */
                background: "none", border: 0, cursor: "pointer",
                padding: "8px", borderRadius: 8, flexDirection: "column",
                gap: 5, alignItems: "center", justifyContent: "center",
              }}
            >
              {mobileMenuOpen ? (
                /* X icon */
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 4L16 16M16 4L4 16" stroke="var(--navy-800)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                /* ☰ icon */
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 5h14M3 10h14M3 15h14" stroke="var(--navy-800)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div
          className="nav-mobile-menu"
          style={{
            position: "fixed", top: 72, left: 0, right: 0, zIndex: 49,
            background: "#fff",
            borderBottom: "1px solid var(--border)",
            boxShadow: "0 8px 24px -4px rgba(10,22,40,0.12)",
            display: "none", /* shown via CSS on mobile */
            flexDirection: "column",
            padding: "8px 0 16px",
          }}
        >
          {[
            { label: "How it works", href: "#how" },
            { label: "Pricing",       href: "#pricing" },
            { label: "FAQ",            href: "#faq" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={close}
              style={{
                display: "block", padding: "14px 20px",
                fontSize: 16, fontWeight: 500,
                color: "var(--navy-800)", textDecoration: "none",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {label}
            </a>
          ))}

          <div style={{ padding: "12px 20px 0" }}>
            {session?.user?.email ? (
              <>
                <div style={{
                  fontSize: 13, color: "var(--fg-3)", marginBottom: 10,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  Signed in as <strong style={{ color: "var(--navy-800)" }}>{session.user.email}</strong>
                </div>
                <button
                  onClick={() => { close(); handleSignOut(); }}
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: 10,
                    background: "var(--bg-page)", border: "1px solid var(--border)",
                    fontSize: 15, fontWeight: 600, color: "var(--navy-800)",
                    cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                    marginBottom: 10,
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => { close(); window.location.href = "/login"; }}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 10,
                  background: "var(--bg-page)", border: "1px solid var(--border)",
                  fontSize: 15, fontWeight: 600, color: "var(--navy-800)",
                  cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  marginBottom: 10,
                }}
              >
                Sign in
              </button>
            )}
            <button
              onClick={handleAuditClick}
              style={{
                width: "100%", padding: "13px 16px", borderRadius: 10,
                background: "linear-gradient(135deg, #00d467, #00a851)",
                color: "#fff", border: 0,
                fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 4px 16px -4px rgba(0,199,88,0.40)",
              }}
            >
              Audit new site →
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close menu when clicking outside */}
      {mobileMenuOpen && (
        <div
          onClick={close}
          style={{
            position: "fixed", inset: 0, zIndex: 48,
            display: "none", /* shown via CSS on mobile */
          }}
          className="nav-mobile-overlay"
        />
      )}
    </>
  );
}
