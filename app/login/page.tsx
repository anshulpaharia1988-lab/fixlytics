"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setError("");
    await signIn("email", { email, callbackUrl, redirect: true });
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg-page)", padding: 24,
    }}>
      <div style={{
        background: "#fff", borderRadius: 28, padding: "48px 40px",
        maxWidth: 420, width: "100%",
        boxShadow: "0 32px 64px -24px rgba(10,22,40,0.18), 0 2px 4px rgba(10,22,40,0.04)",
        textAlign: "center",
      }}>
        {/* Logo */}
        <a href="/" style={{ display: "inline-block", marginBottom: 28 }}>
          <img src="/logo.png" alt="Fixlytics" style={{ height: 36 }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        </a>

        <h1 style={{
          fontSize: 26, fontWeight: 800, letterSpacing: "-0.025em",
          color: "var(--navy-800)", margin: "0 0 10px",
        }}>Sign in to Fixlytics</h1>
        <p style={{ fontSize: 15, color: "var(--fg-2)", margin: "0 0 32px", lineHeight: 1.6 }}>
          Enter your email and we&apos;ll send you a magic link.
          No password needed.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="your@email.com"
            autoFocus
            required
            style={{
              width: "100%", padding: "14px 16px", fontSize: 16,
              border: `1.5px solid ${error ? "var(--danger)" : "var(--border)"}`,
              borderRadius: 12, outline: "none", fontFamily: "inherit",
              boxSizing: "border-box", marginBottom: error ? 8 : 16,
              color: "var(--navy-800)", textAlign: "center",
            }}
          />
          {error && (
            <p style={{ fontSize: 13, color: "var(--danger)", margin: "0 0 12px" }}>{error}</p>
          )}
          <p style={{ fontSize: 13, color: "var(--fg-3)", margin: "0 0 16px", lineHeight: 1.6 }}>
            We&apos;ll send a magic link to your email.<br />
            Open the link on the device you want to use.
          </p>
          <button
            type="submit"
            disabled={loading || !email.trim()}
            style={{
              width: "100%", padding: "15px 24px",
              background: email.trim() && !loading
                ? "linear-gradient(135deg, #00d467, #00a851)"
                : "var(--bg-page)",
              color: email.trim() && !loading ? "#fff" : "var(--fg-3)",
              border: email.trim() && !loading ? "none" : "1.5px solid var(--border)",
              borderRadius: 14, cursor: loading ? "wait" : "pointer",
              fontFamily: "inherit", fontSize: 16, fontWeight: 700,
              boxShadow: email.trim() && !loading ? "0 8px 24px -4px rgba(0,199,88,0.40)" : "none",
              transition: "all 150ms",
            }}
          >
            {loading ? "Sending magic link…" : "Send magic link →"}
          </button>
        </form>

        <p style={{ fontSize: 13, color: "var(--fg-3)", marginTop: 20 }}>
          <a href="/" style={{ color: "var(--green-600)" }}>← Back to home</a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
