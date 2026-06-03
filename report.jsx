/* global React, Button, Chip, Card, Heading, Eyebrow, Icon, TopNav, MockBrowserChrome, MockBakerySite, MockBakerySiteFixed, AUDIT_SITE, BEFORE_AFTER */

const { useState: useReportState } = React;

function FullReport({ url, onLogo, onBack }) {
  const [tab, setTab] = useReportState('rewrites'); // rewrites | mockup | checklist

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <TopNav onLogo={onLogo} />

      {/* Header */}
      <section style={{
        background: 'linear-gradient(135deg, var(--navy-800) 0%, var(--navy-700) 100%)',
        color: '#fff', padding: '40px 0 32px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 60% at 90% 20%, rgba(0,199,88,0.20), transparent 70%)',
        }} />
        <div className="pc-container" style={{ position: 'relative' }}>
          <button onClick={onBack} style={{
            background: 'rgba(255,255,255,0.10)', color: '#fff',
            border: '1px solid rgba(255,255,255,0.20)',
            borderRadius: 10, padding: '7px 14px',
            cursor: 'pointer', fontSize: 13, fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: 'inherit', marginBottom: 18,
          }}>
            <Icon name="arrow-left" size={14} /> Back to summary
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <Chip kind="greenSolid" icon="crown" style={{ marginBottom: 14 }}>Premium · Unlocked</Chip>
              <h1 style={{
                fontSize: 'clamp(28px, 3.6vw, 40px)', fontWeight: 800,
                letterSpacing: '-0.025em', margin: '0 0 10px', lineHeight: 1.05,
                color: '#fff',
              }}>
                Your full fix-report for{' '}
                <em style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, color: 'var(--green-400)' }}>{AUDIT_SITE.brand}</em>
              </h1>
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)' }}>
                Ready-to-use copy, before-and-after mockups, and a step-by-step checklist.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button kind="ghostDark" size="md" icon="download" iconRight={null}>Download PDF</Button>
              <Button kind="primary"  size="md" icon="mail"     iconRight={null}>Email me</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tab bar */}
      <section style={{
        background: '#fff',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 64, zIndex: 10,
        boxShadow: '0 1px 0 var(--border), 0 4px 12px rgba(10,22,40,0.03)',
      }}>
        <div className="pc-container" style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
          {[
            { id: 'rewrites',  label: 'Copy-paste rewrites', icon: 'copy' },
            { id: 'mockup',    label: 'Before & after',      icon: 'split-square-horizontal' },
            { id: 'checklist', label: 'Action checklist',    icon: 'list-checks' },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: 'transparent', border: 0, cursor: 'pointer',
              padding: '18px 16px', fontSize: 14, fontWeight: 600,
              color: tab === t.id ? 'var(--navy-800)' : 'var(--fg-3)',
              borderBottom: `2px solid ${tab === t.id ? 'var(--green-500)' : 'transparent'}`,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: 'inherit', whiteSpace: 'nowrap',
              transition: 'all 150ms var(--ease-out)',
            }}>
              <Icon name={t.icon} size={15} />
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section style={{ padding: '40px 0 80px' }}>
        <div className="pc-container">
          {tab === 'rewrites' && <RewritesTab />}
          {tab === 'mockup' && <MockupTab />}
          {tab === 'checklist' && <ChecklistTab />}
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function RewritesTab() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Eyebrow align="left">Copy-Paste Rewrites</Eyebrow>
        <Heading level={2} before="Just swap these in." accent="That's it." align="left" style={{ fontSize: 'clamp(26px, 3vw, 36px)' }} />
        <p className="lead" style={{ maxWidth: 580, marginTop: 12 }}>
          Each block is ready to paste. Click the copy button — the new text is on your clipboard.
        </p>
      </div>
      <div style={{ display: 'grid', gap: 18 }}>
        {BEFORE_AFTER.map((item) => (
          <RewriteCard key={item.kind} item={item} />
        ))}
      </div>
    </div>
  );
}

function RewriteCard({ item }) {
  const [copied, setCopied] = useReportState(false);
  function copy() {
    navigator.clipboard?.writeText(item.after).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)', borderRadius: 20,
      boxShadow: 'var(--shadow-xs)', overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-page)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'var(--navy-800)', color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="text" size={15} />
          </div>
          <div style={{ fontWeight: 700, color: 'var(--navy-800)', fontSize: 16 }}>{item.label}</div>
        </div>
        <button onClick={copy} style={{
          background: copied ? 'var(--green-500)' : '#fff',
          color: copied ? '#fff' : 'var(--navy-800)',
          border: copied ? '1px solid var(--green-500)' : '1px solid var(--border)',
          borderRadius: 10, padding: '8px 14px',
          cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 13, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          transition: 'all 150ms var(--ease-out)',
        }}>
          <Icon name={copied ? 'check' : 'copy'} size={14} />
          {copied ? 'Copied!' : 'Copy fix'}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        <div style={{ padding: 22, borderRight: '1px solid var(--border)' }}>
          <Chip kind="red" style={{ fontSize: 11, marginBottom: 12 }}>Before · what's on your site</Chip>
          <div style={{
            fontSize: 15, color: 'var(--fg-2)',
            background: 'var(--danger-bg)', padding: '12px 14px', borderRadius: 12,
            border: '1px dashed rgba(251,44,54,0.3)',
            lineHeight: 1.55, fontFamily: 'Georgia, serif',
          }}>
            "{item.before}"
          </div>
        </div>
        <div style={{ padding: 22 }}>
          <Chip kind="green" style={{ fontSize: 11, marginBottom: 12 }}>After · paste this in</Chip>
          <div style={{
            fontSize: 15, color: 'var(--navy-800)',
            background: 'var(--green-50)', padding: '12px 14px', borderRadius: 12,
            border: '1px solid var(--green-200)',
            lineHeight: 1.55, fontWeight: 600, fontFamily: 'Georgia, serif',
          }}>
            "{item.after}"
          </div>
        </div>
      </div>
      <div style={{
        padding: '14px 20px', background: '#fcfcfd',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 13, color: 'var(--fg-2)',
      }}>
        <Icon name="lightbulb" size={14} color="var(--amber-500)" />
        <span><strong style={{ color: 'var(--navy-800)' }}>Why this works:</strong> {item.note}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function MockupTab() {
  const [side, setSide] = useReportState(50);
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Eyebrow align="left">Before / After</Eyebrow>
        <Heading level={2} before="See your homepage" accent="after the fixes" align="left" style={{ fontSize: 'clamp(26px, 3vw, 36px)' }} />
        <p className="lead" style={{ maxWidth: 580, marginTop: 12 }}>
          Drag the slider to compare. This is exactly what your site can look like in a couple of hours.
        </p>
      </div>

      <MockBrowserChrome url={AUDIT_SITE.url}>
        <div style={{ position: 'relative', userSelect: 'none' }}>
          {/* After (full) */}
          <MockBakerySiteFixed />
          {/* Before, clipped to left of slider */}
          <div style={{
            position: 'absolute', inset: 0,
            clipPath: `polygon(0 0, ${side}% 0, ${side}% 100%, 0 100%)`,
            WebkitClipPath: `polygon(0 0, ${side}% 0, ${side}% 100%, 0 100%)`,
          }}>
            <MockBakerySite />
          </div>

          {/* Slider handle */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${side}%`, width: 2,
            background: '#fff',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: `${side}%`,
            transform: 'translate(-50%, -50%)',
            width: 44, height: 44, borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25), 0 0 0 1px var(--border)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--navy-800)',
            pointerEvents: 'none',
          }}>
            <Icon name="chevrons-left-right" size={20} />
          </div>

          {/* Labels */}
          <div style={{
            position: 'absolute', top: 16, left: 16,
            background: 'rgba(10,22,40,0.85)', color: '#fff',
            padding: '6px 12px', borderRadius: 999,
            fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
            pointerEvents: 'none',
          }}>BEFORE</div>
          <div style={{
            position: 'absolute', top: 16, right: 16,
            background: 'var(--green-500)', color: '#fff',
            padding: '6px 12px', borderRadius: 999,
            fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
            pointerEvents: 'none',
          }}>AFTER</div>

          {/* invisible drag layer */}
          <input
            type="range" min="0" max="100" value={side}
            onChange={(e) => setSide(Number(e.target.value))}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              opacity: 0, cursor: 'ew-resize', margin: 0,
            }}
          />
        </div>
      </MockBrowserChrome>

      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--fg-3)' }}>
        ← Drag the handle to reveal →
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const CHECKLIST = [
  { phase: 'Today (30 min)', items: [
    { title: "Change 'Learn More' to 'Order Fresh Sourdough'", note: 'Hero button. Use #00C758 for the background.' },
    { title: "Update page title in your site builder's SEO panel", note: "Title: 'Sprout & Sourdough — Sourdough Bakery in Newtown, Sydney'" },
    { title: "Shrink the hero photo with Squoosh.app", note: "Target: under 300 KB. Same dimensions — Squoosh keeps the quality." },
  ]},
  { phase: 'This week (2 hours)', items: [
    { title: "Rewrite the hero headline and About paragraph", note: 'Use the copy from the Rewrites tab.' },
    { title: "Add a tap-to-call button to your mobile header", note: 'Most site builders have a "phone" element you can drop in.' },
    { title: "Add alt text to every photo on the homepage", note: 'In your site builder, look for an "Image description" or "Alt text" field.' },
    { title: "Set up Google Business Profile", note: '15 minutes, 100% free. Adds you to Google Maps.' },
  ]},
  { phase: 'When you can (later this month)', items: [
    { title: "Reduce custom fonts to two families", note: "Pick a heading font + a body font. Delete the rest." },
    { title: "Lazy-load the chat widget", note: "Have your developer load it on click instead of on page open." },
    { title: "Re-run Pagecheck to track your score", note: "Most customers gain 25–30 points in the first month." },
  ]},
];

function ChecklistTab() {
  const [done, setDone] = useReportState({});
  const totalItems = CHECKLIST.reduce((n, p) => n + p.items.length, 0);
  const doneCount = Object.values(done).filter(Boolean).length;

  function toggle(id) {
    setDone((d) => ({ ...d, [id]: !d[id] }));
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <Eyebrow align="left">Action Plan</Eyebrow>
          <Heading level={2} before="A simple checklist" accent="from quickest first" align="left" style={{ fontSize: 'clamp(26px, 3vw, 36px)' }} />
          <p className="lead" style={{ maxWidth: 580, marginTop: 12 }}>
            Tick them off as you go. You can come back to this page anytime.
          </p>
        </div>
        <div style={{
          background: '#fff', border: '1px solid var(--border)',
          borderRadius: 16, padding: '16px 22px',
          boxShadow: 'var(--shadow-xs)',
          minWidth: 220,
        }}>
          <div style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 8 }}>Progress</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--navy-800)', fontFeatureSettings: '"tnum"' }}>{doneCount}</span>
            <span style={{ fontSize: 18, color: 'var(--fg-3)' }}>/ {totalItems}</span>
          </div>
          <div style={{ height: 6, background: 'var(--gray-100)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${(doneCount / totalItems) * 100}%`,
              background: 'linear-gradient(90deg, var(--green-500), var(--green-400))',
              borderRadius: 999, transition: 'width 300ms var(--ease-out)',
            }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        {CHECKLIST.map((phase, pi) => (
          <div key={pi} style={{
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: 20, boxShadow: 'var(--shadow-xs)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 22px', borderBottom: '1px solid var(--border)',
              background: 'var(--bg-page)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <Chip kind="navy" style={{ fontSize: 12 }}>{String(pi + 1).padStart(2, '0')}</Chip>
              <div style={{ fontWeight: 700, color: 'var(--navy-800)', fontSize: 17 }}>{phase.phase}</div>
            </div>
            <div>
              {phase.items.map((item, ii) => {
                const id = `${pi}-${ii}`;
                const isDone = !!done[id];
                return (
                  <label key={id} style={{
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                    padding: '16px 22px',
                    borderBottom: ii < phase.items.length - 1 ? '1px solid var(--border)' : '0',
                    cursor: 'pointer',
                    transition: 'background 120ms var(--ease-out)',
                  }}>
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggle(id)}
                      style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                    />
                    <div style={{
                      width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                      border: `2px solid ${isDone ? 'var(--green-500)' : 'var(--border-strong)'}`,
                      background: isDone ? 'var(--green-500)' : '#fff',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff',
                      marginTop: 2,
                      transition: 'all 150ms var(--ease-out)',
                    }}>
                      {isDone && <Icon name="check" size={14} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 15, fontWeight: 600, color: 'var(--navy-800)',
                        textDecoration: isDone ? 'line-through' : 'none',
                        opacity: isDone ? 0.55 : 1,
                        lineHeight: 1.4,
                      }}>{item.title}</div>
                      <div style={{
                        fontSize: 14, color: 'var(--fg-3)', marginTop: 4,
                        lineHeight: 1.5,
                        opacity: isDone ? 0.55 : 1,
                      }}>{item.note}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.FullReport = FullReport;
