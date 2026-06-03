"use client";
import { useState } from "react";
import PageLayout from "@/components/PageLayout";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const mailtoLink = `mailto:support@fixlytics.app?subject=Fixlytics%20Support&body=Name%3A%20${encodeURIComponent(name)}%0AEmail%3A%20${encodeURIComponent(email)}%0A%0A${encodeURIComponent(message)}`;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    fontSize: 15,
    border: "1.5px solid var(--border)",
    borderRadius: 10,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    marginBottom: 16,
    color: "var(--navy-800)",
    background: "#fff",
  };

  return (
    <PageLayout title="Contact Us">
      <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--fg-2)", marginBottom: 4 }}>
        Email us at{" "}
        <a href="mailto:support@fixlytics.app" style={{ color: "var(--green-600)", fontWeight: 600 }}>
          support@fixlytics.app
        </a>
      </p>
      <p style={{ fontSize: 14, color: "var(--fg-3)", marginBottom: 36 }}>
        We respond within 24 hours, Monday to Friday.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          window.location.href = mailtoLink;
        }}
        style={{ maxWidth: 560 }}
      >
        <label style={{ fontSize: 14, fontWeight: 600, color: "var(--navy-800)", display: "block", marginBottom: 6 }}>
          Your name
        </label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" style={inputStyle} />

        <label style={{ fontSize: 14, fontWeight: 600, color: "var(--navy-800)", display: "block", marginBottom: 6 }}>
          Email address
        </label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" style={inputStyle} />

        <label style={{ fontSize: 14, fontWeight: 600, color: "var(--navy-800)", display: "block", marginBottom: 6 }}>
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what you need help with..."
          rows={5}
          style={{ ...inputStyle, resize: "vertical" }}
        />

        <button
          type="submit"
          style={{
            background: "linear-gradient(135deg, #00d467, #00a851)",
            color: "#fff", border: 0, borderRadius: 12,
            padding: "14px 28px", fontSize: 15, fontWeight: 700,
            cursor: "pointer", width: "100%",
            boxShadow: "0 8px 24px -4px rgba(0,199,88,0.32)",
          }}
        >
          Send message
        </button>
      </form>
    </PageLayout>
  );
}
