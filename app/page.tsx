"use client";
import { useState, useEffect } from "react";
import LandingPage from "@/components/LandingPage";
import ScanScreen from "@/components/ScanScreen";
import ResultsPage from "@/components/ResultsPage";
import type { AuditData } from "@/lib/scoring";
import { isPaid } from "@/lib/paymentStorage";

const KEY_URL  = "fixlytics_last_url";
const KEY_DATA = "fixlytics_last_data";
const KEY_VIEW = "fixlytics_last_view";

type View = "landing" | "scan" | "results";

function saveSession(url: string, data: AuditData | null) {
  try {
    sessionStorage.setItem(KEY_URL, url);
    sessionStorage.setItem(KEY_VIEW, "results");
    if (data) sessionStorage.setItem(KEY_DATA, JSON.stringify(data));
    else sessionStorage.removeItem(KEY_DATA);
  } catch { /* private browsing */ }
}

function clearSession() {
  try {
    sessionStorage.removeItem(KEY_URL);
    sessionStorage.removeItem(KEY_DATA);
    sessionStorage.removeItem(KEY_VIEW);
  } catch { /* ignore */ }
}

export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [url, setUrl] = useState("");
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [urlIsPaid, setUrlIsPaid] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Priority 1: URL params — set after magic-link login callback
    // /?url=https://site.com&view=results → go straight to results
    try {
      const params = new URLSearchParams(window.location.search);
      const urlParam  = params.get("url");
      const viewParam = params.get("view");
      if (urlParam && viewParam === "results" && mounted) {
        setUrl(urlParam);
        setUrlIsPaid(isPaid(urlParam));
        setView("results");
        // Persist so a refresh stays on results
        saveSession(urlParam, null);
        // Clean up the query string without a full navigation
        window.history.replaceState({}, "", "/");
        return () => { mounted = false; };
      }
    } catch { /* ignore */ }

    // Priority 2: sessionStorage — refresh while on results page
    try {
      const savedUrl  = sessionStorage.getItem(KEY_URL);
      const savedView = sessionStorage.getItem(KEY_VIEW);
      if (savedUrl && savedView === "results" && mounted) {
        const raw    = sessionStorage.getItem(KEY_DATA);
        const cached: AuditData | null = raw ? JSON.parse(raw) : null;
        setUrl(savedUrl);
        setUrlIsPaid(isPaid(savedUrl));
        setAuditData(cached);
        setView("results");
        return () => { mounted = false; };
      }
    } catch { /* sessionStorage unavailable */ }

    return () => { mounted = false; };
  }, []);

  function handleAudit(targetUrl: string) {
    clearSession();
    setUrl(targetUrl);
    setAuditData(null);
    setUrlIsPaid(isPaid(targetUrl));
    setView("scan");
  }

  function handleRerun() {
    clearSession();
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
        currency="$"
        price={29}
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
