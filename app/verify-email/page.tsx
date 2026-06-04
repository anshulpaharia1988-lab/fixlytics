export default function VerifyEmailPage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg-page)", padding: 24,
    }}>
      <div style={{
        background: "#fff", borderRadius: 28, padding: "48px 40px",
        maxWidth: 420, width: "100%",
        boxShadow: "0 32px 64px -24px rgba(10,22,40,0.18)",
        textAlign: "center",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 22, margin: "0 auto 24px",
          background: "var(--green-glow)", border: "1.5px solid var(--green-200)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32,
        }}>
          ✉️
        </div>

        <h1 style={{
          fontSize: 26, fontWeight: 800, letterSpacing: "-0.025em",
          color: "var(--navy-800)", margin: "0 0 12px",
        }}>Check your email!</h1>

        <p style={{ fontSize: 16, color: "var(--fg-2)", lineHeight: 1.6, margin: "0 0 8px" }}>
          We sent a magic link to your inbox.
        </p>
        <p style={{ fontSize: 15, color: "var(--fg-3)", lineHeight: 1.6, margin: "0 0 32px" }}>
          Click the link in the email to sign in instantly — no password needed.
        </p>

        <div style={{
          background: "var(--bg-page)", borderRadius: 14, padding: "16px 20px",
          fontSize: 13.5, color: "var(--fg-2)", lineHeight: 1.6,
          border: "1px solid var(--border)",
        }}>
          Didn&apos;t get it? Check your spam folder, or{" "}
          <a href="/login" style={{ color: "var(--green-600)", fontWeight: 600 }}>
            try again
          </a>.
        </div>

        <p style={{ fontSize: 13, color: "var(--fg-3)", marginTop: 24 }}>
          <a href="/" style={{ color: "var(--green-600)" }}>← Back to home</a>
        </p>
      </div>
    </div>
  );
}
