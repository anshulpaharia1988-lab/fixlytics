/* global React, ReactDOM, Landing, ScanScreen, ResultsScreen, FullReport, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakToggle, TweakText, AUDIT_SITE */

const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#00C758",
  "currency": "₹",
  "price": 999,
  "scanAnim": true,
  "brand": "Pagecheck"
}/*EDITMODE-END*/;

const ACCENT_OPTIONS = ['#00C758', '#2A6FDB', '#7A5AE0', '#F59E0B'];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = useState('landing'); // landing | scan | results | report
  const [auditUrl, setAuditUrl] = useState('');

  // Apply accent live
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', t.accent);
    // hover/press auto-shaded
    root.style.setProperty('--accent-hover', t.accent);
    root.style.setProperty('--accent-press', t.accent);
    // also override --green-500 for the shared components that use it directly
    root.style.setProperty('--green-500', t.accent);
  }, [t.accent]);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [view]);

  function startAudit(url) {
    setAuditUrl(url);
    setView('scan');
  }
  function goHome() { setView('landing'); }
  function unlock() { setView('report'); }
  function backToResults() { setView('results'); }

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }}>
      {view === 'landing' && (
        <Landing onAudit={startAudit} />
      )}
      {view === 'scan' && (
        <ScanScreen
          url={auditUrl || AUDIT_SITE.url}
          skipAnimation={!t.scanAnim}
          onDone={() => setView('results')}
        />
      )}
      {view === 'results' && (
        <ResultsScreen
          url={auditUrl || AUDIT_SITE.url}
          currency={t.currency}
          price={t.price}
          onLogo={goHome}
          onUnlock={unlock}
        />
      )}
      {view === 'report' && (
        <FullReport
          url={auditUrl || AUDIT_SITE.url}
          onLogo={goHome}
          onBack={backToResults}
        />
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Navigation" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, padding: '6px 0' }}>
          {[
            { id: 'landing', label: 'Landing' },
            { id: 'scan',    label: 'Scan' },
            { id: 'results', label: 'Results' },
            { id: 'report',  label: 'Report' },
          ].map((v) => (
            <button key={v.id} onClick={() => setView(v.id)} style={{
              background: view === v.id ? 'var(--navy-800)' : 'transparent',
              color: view === v.id ? '#fff' : 'var(--navy-800)',
              border: `1px solid ${view === v.id ? 'var(--navy-800)' : 'var(--border)'}`,
              borderRadius: 8, padding: '7px 6px',
              cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 11, fontWeight: 600,
            }}>{v.label}</button>
          ))}
        </div>

        <TweakSection label="Style" />
        <TweakColor label="Accent color" value={t.accent}
          options={ACCENT_OPTIONS}
          onChange={(v) => setTweak('accent', v)} />

        <TweakSection label="Behavior" />
        <TweakToggle label="Show scan animation" value={t.scanAnim}
          onChange={(v) => setTweak('scanAnim', v)} />

        <TweakSection label="Pricing" />
        <TweakRadio label="Currency" value={t.currency}
          options={['₹', '$', '€', '£']}
          onChange={(v) => setTweak('currency', v)} />
      </TweaksPanel>
    </div>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
