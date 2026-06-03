/* global React, AUDIT_SITE */
// A deliberately imperfect mock of the audited site.
// Rendered as a "browser screenshot" with annotation hotspots overlaid.

function MockBrowserChrome({ url, children }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      border: '1px solid var(--border)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-lg)',
    }}>
      {/* fake chrome */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px',
        background: '#f4f5f7',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ffbd2e' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c941' }} />
        </div>
        <div style={{
          flex: 1, margin: '0 12px',
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 8, padding: '5px 12px',
          fontSize: 12, color: 'var(--fg-3)',
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: 'var(--green-600)' }}>🔒</span> {url}
        </div>
      </div>
      {children}
    </div>
  );
}

function MockBakerySite() {
  return (
    <div style={{
      background: '#fdfaf3',
      color: '#3a2e1f',
      fontFamily: 'Georgia, serif',
      position: 'relative',
      minHeight: 460,
    }}>
      {/* Header — phone hidden in tiny text at top right (issue #3) */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 28px', borderBottom: '1px solid #e7dfce',
      }}>
        <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '0.04em' }}>SPROUT &amp; SOURDOUGH</div>
        <div style={{ display: 'flex', gap: 22, fontSize: 12, color: '#6b5d44' }}>
          <span>Home</span><span>About</span><span>Menu</span><span>Contact</span>
        </div>
        {/* hidden phone in the corner — tiny */}
        <div style={{ fontSize: 9, color: '#a89978' }}>02 9000 1234</div>
      </div>

      {/* "Hero" — vague headline (issue #2), bad CTA (issue #1) */}
      <div style={{
        padding: '60px 28px 50px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #fdfaf3 0%, #f5ead4 100%)',
      }}>
        <div style={{
          fontStyle: 'italic',
          fontSize: 32,
          lineHeight: 1.2,
          fontWeight: 400,
          maxWidth: 600,
          margin: '0 auto 14px',
        }}>
          Welcome to Sprout &amp; Sourdough
        </div>
        <div style={{ fontSize: 14, color: '#6b5d44', maxWidth: 460, margin: '0 auto 28px' }}>
          A passionate journey through artisanal traditions, lovingly crafted with care since 2018.
        </div>
        {/* Vague "Learn More" button — issue #1 */}
        <button style={{
          background: 'transparent',
          color: '#3a2e1f',
          border: '1px solid #3a2e1f',
          padding: '11px 26px',
          fontSize: 13,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontFamily: 'Georgia, serif',
          cursor: 'pointer',
        }}>
          Learn More
        </button>
      </div>

      {/* Image strip — three "loaves" with no labels (issue #5) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, padding: '0 28px 28px' }}>
        {[
          ['#c79a6b', '#a87a4a'],
          ['#d6b78a', '#b58a5e'],
          ['#a87a4a', '#7e5530'],
        ].map((c, i) => (
          <div key={i} style={{
            aspectRatio: '4/3',
            background: `radial-gradient(circle at 50% 45%, ${c[0]} 0%, ${c[1]} 70%, #5a3e22 100%)`,
            borderRadius: 4,
            margin: 4,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* faint scoring lines — fake bread texture */}
            <div style={{
              position: 'absolute', inset: '20% 15%',
              background: `repeating-linear-gradient(90deg, transparent 0 18px, rgba(0,0,0,0.08) 18px 19px)`,
              borderRadius: '50%',
              filter: 'blur(0.5px)',
            }} />
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div style={{
        textAlign: 'center', padding: '18px 28px',
        fontSize: 11, color: '#a89978',
        borderTop: '1px solid #e7dfce',
      }}>
        © Sprout &amp; Sourdough · Newtown, Sydney
      </div>
    </div>
  );
}

// "After" version — same layout but with the fixes applied.
function MockBakerySiteFixed() {
  return (
    <div style={{
      background: '#fdfaf3', color: '#3a2e1f',
      fontFamily: 'Georgia, serif', position: 'relative', minHeight: 460,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 28px', borderBottom: '1px solid #e7dfce',
      }}>
        <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '0.04em' }}>SPROUT &amp; SOURDOUGH</div>
        <div style={{ display: 'flex', gap: 22, fontSize: 12, color: '#6b5d44' }}>
          <span>Home</span><span>Menu</span><span>Order Online</span><span>Visit</span>
        </div>
        {/* prominent phone button (fix #3) */}
        <a style={{
          background: 'var(--green-500)', color: '#fff',
          padding: '7px 14px', borderRadius: 999,
          fontSize: 12, fontWeight: 700,
          textDecoration: 'none', letterSpacing: '0.02em',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--font-sans)',
        }}>
          📞 02 9000 1234
        </a>
      </div>
      <div style={{
        padding: '60px 28px 50px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #fdfaf3 0%, #f5ead4 100%)',
      }}>
        {/* Fixed headline (#2) */}
        <div style={{
          fontSize: 32, lineHeight: 1.15, fontWeight: 700,
          maxWidth: 640, margin: '0 auto 14px', letterSpacing: '-0.01em',
        }}>
          Hand-made sourdough,
          <br />baked daily in Newtown.
        </div>
        <div style={{ fontSize: 14, color: '#6b5d44', maxWidth: 460, margin: '0 auto 28px' }}>
          80 loaves a day, by hand, from flour milled an hour away. Order by 4pm, pick up tomorrow.
        </div>
        {/* Clear CTA (#1) */}
        <button style={{
          background: 'var(--green-500)', color: '#fff',
          border: 0, padding: '14px 28px',
          fontSize: 15, fontWeight: 700,
          fontFamily: 'var(--font-sans)',
          borderRadius: 12, cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0,199,88,0.28)',
        }}>
          Order Fresh Sourdough →
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, padding: '0 28px 28px' }}>
        {[
          { c: ['#c79a6b', '#a87a4a'], label: 'Country Loaf' },
          { c: ['#d6b78a', '#b58a5e'], label: 'Seeded Spelt'  },
          { c: ['#a87a4a', '#7e5530'], label: 'Olive & Rosemary' },
        ].map((b, i) => (
          <div key={i} style={{ margin: 4, position: 'relative' }}>
            <div style={{
              aspectRatio: '4/3',
              background: `radial-gradient(circle at 50% 45%, ${b.c[0]} 0%, ${b.c[1]} 70%, #5a3e22 100%)`,
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', inset: '20% 15%',
                background: `repeating-linear-gradient(90deg, transparent 0 18px, rgba(0,0,0,0.08) 18px 19px)`,
                borderRadius: '50%', filter: 'blur(0.5px)',
              }} />
            </div>
            <div style={{ fontSize: 11, marginTop: 6, textAlign: 'center', color: '#6b5d44', fontWeight: 600 }}>{b.label}</div>
          </div>
        ))}
      </div>
      <div style={{
        textAlign: 'center', padding: '18px 28px',
        fontSize: 11, color: '#a89978', borderTop: '1px solid #e7dfce',
      }}>
        © Sprout &amp; Sourdough · Sourdough Bakery in Newtown, Sydney
      </div>
    </div>
  );
}

Object.assign(window, { MockBrowserChrome, MockBakerySite, MockBakerySiteFixed });
