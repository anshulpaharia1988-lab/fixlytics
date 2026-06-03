"use client";
import { useState, useEffect } from "react";
import LandingPage from "@/components/LandingPage";
import ScanScreen from "@/components/ScanScreen";
import ResultsPage from "@/components/ResultsPage";
import type { AuditData } from "@/lib/scoring";
import { isPaid } from "@/lib/paymentStorage";

const KEY_URL  = "fixlytics_last_url";
const KEY_DATA = "fixlytics_last_data";

type View = "landing" | "scan" | "results";

function saveSession(url: string, data: AuditData | null) {
  try {
    sessionStorage.setItem(KEY_URL, url);
    if (data) sessionStorage.setItem(KEY_DATA, JSON.stringify(data));
    else sessionStorage.removeItem(KEY_DATA);
  } catch { /* private browsing */ }
}

function clearSession() {
  try {
    sessionStorage.removeItem(KEY_URL);
    sessionStorage.removeItem(KEY_DATA);
  } catch { /* ignore */ }
}

export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [url, setUrl] = useState("");
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [urlIsPaid, setUrlIsPaid] = useState(false);

  // On mount: restore last session from sessionStorage.
  // mounted guard prevents state updates from racing with HMR unmount/remount.
  useEffect(() => {
    let mounted = true;
    try {
      const savedUrl = sessionStorage.getItem(KEY_URL);
      if (!savedUrl || !mounted) return;

      const paid = isPaid(savedUrl);
      if (!mounted) return;

      setUrl(savedUrl);
      setUrlIsPaid(paid);

      if (paid) {
        const raw = sessionStorage.getItem(KEY_DATA);
        const cached: AuditData | null = raw ? JSON.parse(raw) : null;
        if (mounted) { setAuditData(cached); setView("results"); }
      } else {
        if (mounted) setView("scan");
      }
    } catch { /* sessionStorage unavailable */ }
    return () => { mounted = false; };
  }, []);

  function handleAudit(targetUrl: string) {
    setUrl(targetUrl);
    setAuditData(null);
    setUrlIsPaid(isPaid(targetUrl));
    setView("scan");
  }

  function handleRerun() {
    setAuditData(null);
    setUrlIsPaid(isPaid(url));
    setView("scan");
  }

  function handleScanDone(data: AuditData | null) {
    setAuditData(data);
    setView("results");
    saveSession(url, data);
  }

  function handleLogo() {
    clearSession();
    setView("landing");
    setUrl("");
    setAuditData(null);
    setUrlIsPaid(false);
  }

  if (view === "scan") {
    return <ScanScreen url={url} onDone={handleScanDone} />;
  }
  if (view === "results") {
    return (
      <ResultsPage
        url={url}
        currency="₹"
        price={2400}
        onLogo={handleLogo}
        onRerun={handleRerun}
        onAudit={handleLogo}
        onUnlock={() => {}}
        initialData={auditData ?? undefined}
        initialPaid={urlIsPaid}
      />
    );
  }
  return <LandingPage onAudit={handleAudit} />;
}
