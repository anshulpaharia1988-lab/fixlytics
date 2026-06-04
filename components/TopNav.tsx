"use client";
import { useState, useRef, useEffect } from "react";
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

function doSignOut() {
  try { localStorage.removeItem("fixlytics_paid_reports"); } catch { /* ignore */ }
  signOut({ callbackUrl: "/" });
}

export default function TopNav({ onLogo, onAudit }: TopNavProps) {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function handleNavClick(sectionId: string) {
    close();
    if (onAudit) {
      // SPA: go to landing first, then scroll after React re-renders
      onAudit();
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      }, 350);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function close() { setMobileMenuOpen(false); }

  function handleLogoClick() {
    close(); setDropdownOpen(false);
    onAudit ? onAudit() : window.scrollTo({ top: 0, behavior: "smooth" });
    onLogo?.();
  }

  function handleAuditClick() {
    close(); setDropdownOpen(false);
    onAudit ? onAudit() : window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid rgba(10,22,40,0.06)",
      }}>
        <div className="pc-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>

          {/* Logo */}
          <button
            onClick={handleLogoClick}
            suppressHydrationWarning
            style={{ background: "none", border: 0, cursor: "pointer", padding: 0 }}
            aria-label="Fixlytics home"
          >
            <img src="/logo.png" alt="Fixlytics" width={160}
              style={{ height: "auto", display: "block", background: "#fff", borderRadius: 6, padding: 2 }}
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

            {/* Desktop nav links */}
            <div className="nav-links-desktop" style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <a onClick={() => handleNavClick("how")} style={{ ...navLinkStyle, cursor: "pointer" }}>How it works</a>
              <a onClick={() => handleNavClick("pricing")} style={{ ...navLinkStyle, cursor: "pointer" }}>Pricing</a>
              <a onClick={() => handleNavClick("faq")} style={{ ...navLinkStyle, cursor: "pointer" }}>FAQ</a>
              <div style={{ width: 12 }} />

              {session?.user?.email ? (
                /* Logged in — avatar + email button opens dropdown */
                <div ref={dropdownRef} style={{ position: "relative" }}>
                  <button
                    onClick={() => setDropdownOpen((o) => !o)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                      fontSize: 14, color: "var(--fg-2)", fontFamily: "inherit",
                      padding: "6px 10px", borderRadius: 8,
                    }}
                  >
                    <span style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: "var(--green-100)", color: "var(--green-700)",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>
                      {session.user.email?.[0].toUpperCase()}
                    </span>
                    <span style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {session.user.email}
                    </span>
                    <span style={{
                      fontSize: 10, color: "var(--fg-3)",
                      transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 200ms",
                      display: "inline-block",
                    }}>▼</span>
                  </button>

                  {dropdownOpen && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 8px)", right: 0,
                      background: "#fff", border: "1px solid var(--border)",
                      borderRadius: 12, padding: 6, minWidth: 180,
                      boxShadow: "0 16px 40px -8px rgba(10,22,40,0.18)",
                      zIndex: 100,
                    }}>
                      <a
                        href="/my-reports"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 14px", borderRadius: 8,
                          color: "var(--navy-800)", textDecoration: "none",
                          fontSize: 14, fontWeight: 500,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-page)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        My Reports
                      </a>
                      <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
                      <button
                        onClick={() => { setDropdownOpen(false); doSignOut(); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          width: "100%", padding: "10px 14px", borderRadius: 8,
                          background: "none", border: 0, cursor: "pointer",
                          color: "var(--danger)", fontFamily: "inherit", fontSize: 14, fontWeight: 500,
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--danger-bg)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button kind="ghostLight" size="sm" onClick={() => window.location.href = "/login"}>
                  Sign in
                </Button>
              )}
            </div>

            {/* Audit button - desktop */}
            <span className="nav-audit-desktop">
              <Button kind="primary" size="sm" iconRight="arrow-right" onClick={handleAuditClick}>
                <span className="btn-text-full">Audit new site</span>
                <span className="btn-text-short" style={{ display: "none" }}>Audit</span>
              </Button>
            </span>

            {/* Hamburger - mobile only */}
            <button
              className="nav-hamburger"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              style={{
                display: "none",
                background: "none", border: 0, cursor: "pointer",
                padding: "8px", borderRadius: 8, flexDirection: "column",
                gap: 5, alignItems: "center", justifyContent: "center",
              }}
            >
              {mobileMenuOpen ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 4L16 16M16 4L4 16" stroke="var(--navy-800)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
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
        <div className="nav-mobile-menu" style={{
          position: "fixed", top: 72, left: 0, right: 0, zIndex: 49,
          background: "#fff", borderBottom: "1px solid var(--border)",
          boxShadow: "0 8px 24px -4px rgba(10,22,40,0.12)",
          display: "none", flexDirection: "column", padding: "8px 0 16px",
        }}>
          {[
            { label: "How it works", id: "how" },
            { label: "Pricing",      id: "pricing" },
            { label: "FAQ",          id: "faq" },
          ].map(({ label, id }) => (
            <a key={label} onClick={() => handleNavClick(id)} style={{
              display: "block", padding: "14px 20px",
              fontSize: 16, fontWeight: 500, cursor: "pointer",
              color: "var(--navy-800)", textDecoration: "none",
              borderBottom: "1px solid var(--border)",
            }}>{label}</a>
          ))}

          {session?.user?.email && (
            <a href="/my-reports" onClick={close} style={{
              display: "block", padding: "14px 20px",
              fontSize: 16, fontWeight: 500,
              color: "var(--navy-800)", textDecoration: "none",
              borderBottom: "1px solid var(--border)",
            }}>
              📊 My Reports
            </a>
          )}

          <div style={{ padding: "12px 20px 0" }}>
            {session?.user?.email ? (
              <>
                <div style={{ fontSize: 13, color: "var(--fg-3)", marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  Signed in as <strong style={{ color: "var(--navy-800)" }}>{session.user.email}</strong>
                </div>
                <button onClick={() => { close(); doSignOut(); }} style={{
                  width: "100%", padding: "12px 16px", borderRadius: 10,
                  background: "var(--bg-page)", border: "1px solid var(--border)",
                  fontSize: 15, fontWeight: 600, color: "var(--danger)",
                  cursor: "pointer", fontFamily: "inherit", textAlign: "left", marginBottom: 10,
                }}>Sign out</button>
              </>
            ) : (
              <button onClick={() => { close(); window.location.href = "/login"; }} style={{
                width: "100%", padding: "12px 16px", borderRadius: 10,
                background: "var(--bg-page)", border: "1px solid var(--border)",
                fontSize: 15, fontWeight: 600, color: "var(--navy-800)",
                cursor: "pointer", fontFamily: "inherit", textAlign: "left", marginBottom: 10,
              }}>Sign in</button>
            )}
            <button onClick={handleAuditClick} style={{
              width: "100%", padding: "13px 16px", borderRadius: 10,
              background: "linear-gradient(135deg, #00d467, #00a851)",
              color: "#fff", border: 0, fontSize: 15, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 4px 16px -4px rgba(0,199,88,0.40)",
            }}>
              Audit new site →
            </button>
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <div onClick={close} className="nav-mobile-overlay" style={{
          position: "fixed", inset: 0, zIndex: 48, display: "none",
        }} />
      )}
    </>
  );
}
