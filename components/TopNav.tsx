"use client";
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

export default function TopNav({ onLogo, onAudit, brand = "Fixlytics" }: TopNavProps) {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid rgba(10,22,40,0.06)",
      }}
    >
      <div
        className="pc-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 72,
        }}
      >
        {/* Logo */}
        <button
          onClick={() => { onAudit ? onAudit() : window.scrollTo({ top: 0, behavior: "smooth" }); onLogo?.(); }}
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
          {/* Div fallback if logo.png is missing */}
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, var(--navy-700) 0%, var(--navy-800) 100%)",
            display: "none", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(10,22,40,0.15)",
          }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: "var(--green-400)" }} />
          </div>
        </button>

        {/* Nav items */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {/* Desktop-only links */}
          <div className="nav-links-desktop" style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <a href="#how" style={navLinkStyle}>How it works</a>
            <a href="#pricing" style={navLinkStyle}>Pricing</a>
            <a href="#faq" style={navLinkStyle}>FAQ</a>
            <div style={{ width: 12 }} />
            <Button
              kind="ghostLight"
              size="sm"
              onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })}
            >
              Sign in
            </Button>
          </div>

          {/* Always visible */}
          <Button
            kind="primary"
            size="sm"
            iconRight="arrow-right"
            onClick={() => onAudit ? onAudit() : window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span className="btn-text-full">Audit new site</span>
            <span className="btn-text-short" style={{ display: "none" }}>Audit</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
