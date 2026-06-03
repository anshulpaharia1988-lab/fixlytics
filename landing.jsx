/* global React, Button, Chip, Card, Heading, Eyebrow, Icon, Avatar, TopNav, Marquee, ScoreRing, STAT_STRIP, TESTIMONIALS, PRESS, AUDIT_SITE */

const { useState: useLandingState } = React;

function Landing({ onAudit }) {
  const [url, setUrl] = useLandingState('');
  const [focused, setFocused] = useLandingState(false);
  const [error, setError] = useLandingState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!url.trim()) {
      setError("Add a website link so we know what to scan.");
      return;
    }
    setError('');
    onAudit(url.trim());
  }

  function tryDemo() {
    setUrl(AUDIT_SITE.url);
    setError('');
    setTimeout(() => onAudit(AUDIT_SITE.url), 250);
  }

  return (
    <div>
      <TopNav onLogo={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

      {/* ─────────────── HERO ─────────────── */}
      <section style={{
        position: 'relative',
        padding: 'clamp(72px, 10vw, 128px) 0 clamp(56px, 7vw, 88px)',
        overflow: 'hidden',
        background: `
          radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,199,88,0.12), transparent 60%),
          radial-gradient(ellipse 40% 30% at 90% 30%, rgba(10,22,40,0.05), transparent 70%),
          linear-gradient(180deg, #fdfefb 0%, var(--off-white) 100%)
        `,
      }}>
        {/* dotted grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(10,22,40,0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 50% 40% at 50% 30%, #000 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 50% 40% at 50% 30%, #000 0%, transparent 80%)',
          opacity: 0.6,
        }} />

        <div className="pc-container" style={{ position: 'relative', textAlign: 'center', maxWidth: 940 }}>
          {/* Announcement pill */}
          <a href="#" onClick={(e) => e.preventDefault()} style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 999, padding: '6px 8px 6px 14px',
            fontSize: 13, fontWeight: 500,
            color: 'var(--fg-2)',
            boxShadow: '0 4px 16px rgba(10,22,40,0.06), 0 0 0 4px rgba(255,255,255,0.6)',
            textDecoration: 'none', marginBottom: 36,
          }}>
            <span style={{
              background: 'var(--green-glow)', color: 'var(--green-700)',
              padding: '2px 8px', borderRadius: 999,
              fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
            }}>NEW</span>
            <span>AI fixes you can copy-paste straight into your site</span>
            <Icon name="arrow-right" size={14} color="var(--fg-3)" />
          </a>

          <h1 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(48px, 7.5vw, 88px)',
            fontWeight: 800,
            lineHeight: 0.98,
            letterSpacing: '-0.035em',
            color: 'var(--navy-800)',
            margin: '0 0 24px',
            textWrap: 'balance',
          }}>
            Fix your website{' '}
            <em style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontWeight: 500, color: 'var(--navy-800)',
              background: 'linear-gradient(135deg, var(--green-600) 20%, var(--green-500) 60%, var(--green-400) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>in minutes</em>{' '}
            with AI.
          </h1>

          <p style={{
            fontSize: 'clamp(18px, 1.7vw, 22px)',
            lineHeight: 1.5,
            color: 'var(--fg-2)',
            maxWidth: 640,
            margin: '0 auto 40px',
            textWrap: 'pretty',
            fontWeight: 400,
          }}>
            Paste your link. We'll find the UX, SEO and speed issues holding you back —
            and write the fixes for you. <strong style={{ color: 'var(--navy-800)', fontWeight: 600 }}>No code. No jargon.</strong>
          </p>

          {/* URL input + CTA */}
          <form onSubmit={handleSubmit} style={{ maxWidth: 620, margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'stretch',
              background: '#fff',
              borderRadius: 20,
              border: `1.5px solid ${error ? 'var(--danger)' : (focused ? 'var(--accent)' : 'var(--border)')}`,
              boxShadow: focused
                ? '0 0 0 5px var(--green-glow-2), 0 24px 48px -16px rgba(10,22,40,0.18), 0 8px 20px -8px rgba(0,199,88,0.18)'
                : '0 16px 40px -16px rgba(10,22,40,0.20), 0 4px 12px -4px rgba(10,22,40,0.08)',
              padding: 8,
              transition: 'all 220ms var(--ease-out)',
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                paddingLeft: 16, paddingRight: 4, color: 'var(--fg-muted)',
              }}>
                <Icon name="link-2" size={20} />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); if (error) setError(''); }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="yourwebsite.com"
                style={{
                  flex: 1,
                  border: 0, outline: 'none',
                  background: 'transparent',
                  fontSize: 18, padding: '14px 12px',
                  color: 'var(--fg-1)',
                  minWidth: 0,
                  fontWeight: 500,
                  letterSpacing: '-0.005em',
                }}
              />
              <Button kind="primary" size="lg" type="submit" icon={null} iconRight="arrow-right">
                Get free audit
              </Button>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              flexWrap: 'wrap', gap: 24,
              marginTop: 22, fontSize: 13.5, color: 'var(--fg-3)',
            }}>
              {error ? (
                <span style={{ color: 'var(--danger)' }}>{error}</span>
              ) : (
                <>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="check" size={14} color="var(--green-600)" /> Free
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="check" size={14} color="var(--green-600)" /> No signup
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="check" size={14} color="var(--green-600)" /> 90 seconds
                  </span>
                  <button type="button" onClick={tryDemo} style={{
                    background: 'transparent', border: 0, cursor: 'pointer',
                    fontSize: 13.5, color: 'var(--green-700)', fontWeight: 600,
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontFamily: 'inherit',
                  }}>
                    Try a demo audit
                    <Icon name="arrow-right" size={13} />
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* ─── Product preview mockup (the Stripe move) ─── */}
        <div style={{
          position: 'relative',
          maxWidth: 1080, margin: '72px auto 0',
          padding: '0 var(--container-pad)',
        }}>
          {/* Glow behind */}
          <div style={{
            position: 'absolute', inset: '-40px -20px 40px',
            background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(0,199,88,0.18), transparent 70%)',
            filter: 'blur(20px)',
            pointerEvents: 'none',
          }} />
          <ProductPreview />
        </div>
      </section>

      {/* ─────────────── LOGO ROW ─────────────── */}
      <section style={{ padding: '56px 0 24px', background: 'var(--off-white)' }}>
        <div className="pc-container" style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 13, color: 'var(--fg-3)', fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 28,
          }}>
            Trusted by 11,400+ small teams and indie creators
          </div>
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            alignItems: 'center', gap: 'clamp(28px, 5vw, 56px)',
            opacity: 0.7,
          }}>
            {[
              'Loomweave', 'Northside', 'Glasshouse', 'Stratum', 'Halcyon', 'Westwind', 'Mosaic',
            ].map((name) => (
              <FakeLogo key={name} name={name} />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── BIG STATS ─────────────── */}
      <section style={{ padding: 'clamp(72px, 10vw, 120px) 0', background: 'var(--off-white)' }}>
        <div className="pc-container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 999,
              background: 'var(--green-glow)', color: 'var(--green-700)',
              fontSize: 12.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green-600)' }} />
              The numbers
            </div>
            <Heading level={2} before="Built to" accent="ship results." style={{ fontSize: 'clamp(36px, 5vw, 56px)' }} />
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 0,
            background: '#fff',
            borderRadius: 28, padding: '8px',
            border: '1px solid var(--border)',
            boxShadow: '0 24px 48px -24px rgba(10,22,40,0.10), 0 2px 4px rgba(10,22,40,0.04)',
          }}>
            {STAT_STRIP.map((s, i) => (
              <div key={i} style={{
                textAlign: 'center', padding: '36px 24px',
                borderRight: i < STAT_STRIP.length - 1 ? '1px solid var(--border)' : '0',
              }}>
                <div style={{
                  fontWeight: 800, fontSize: 'clamp(42px, 5vw, 64px)',
                  letterSpacing: '-0.035em',
                  background: 'linear-gradient(180deg, var(--navy-800) 0%, var(--navy-700) 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 0.95, fontFeatureSettings: '"tnum"',
                }}>{s.value}</div>
                <div style={{ fontSize: 14, color: 'var(--fg-3)', marginTop: 12, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── HOW IT WORKS ─────────────── */}
      <section id="how" style={{ padding: 'clamp(80px, 11vw, 144px) 0', background: '#fff' }}>
        <div className="pc-container">
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <Eyebrow>How it works</Eyebrow>
            <Heading level={2} before="Paste, scan," accent="ship the fix." style={{ fontSize: 'clamp(36px, 5vw, 56px)' }} />
            <p style={{
              fontSize: 'clamp(17px, 1.4vw, 19px)', lineHeight: 1.55,
              color: 'var(--fg-2)', maxWidth: 580,
              margin: '20px auto 0', textAlign: 'center', textWrap: 'pretty',
            }}>
              No installs, no developers, no jargon. Just three steps between you and a
              website that actually converts.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {[
              { n: '01', title: 'Paste your link', body: 'Drop in any URL. We crawl your homepage and read it just like a real visitor would — no setup, no plugins.', icon: 'link-2' },
              { n: '02', title: 'We find the friction', body: 'Our AI grades 60+ patterns across UX, SEO and speed. Each issue comes with a plain-English explanation.', icon: 'sparkles' },
              { n: '03', title: 'You ship the fix', body: 'Copy-paste the rewrites into your site builder. Most fixes take 2–10 minutes. Re-run anytime to track your score.', icon: 'rocket' },
            ].map((step) => (
              <StepCard key={step.n} {...step} />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── TESTIMONIALS ─────────────── */}
      <section style={{
        padding: 'clamp(80px, 11vw, 144px) 0',
        background: 'var(--off-white)',
        position: 'relative',
      }}>
        <div className="pc-container">
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <Eyebrow>Customers</Eyebrow>
            <Heading level={2} before="Loved by people who" accent="don't speak code." style={{ fontSize: 'clamp(36px, 5vw, 56px)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={i} t={t} featured={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── FINAL CTA ─────────────── */}
      <section id="pricing" style={{
        padding: 'clamp(80px, 11vw, 144px) 0',
        background: 'var(--navy-900)',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `
            radial-gradient(ellipse 50% 50% at 50% 0%, rgba(0,199,88,0.22), transparent 70%),
            radial-gradient(ellipse 40% 60% at 0% 100%, rgba(0,199,88,0.10), transparent 70%)
          `,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 50% 60% at 50% 50%, #000 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 50% 60% at 50% 50%, #000 0%, transparent 80%)',
        }} />
        <div className="pc-container" style={{ position: 'relative', textAlign: 'center', maxWidth: 760 }}>
          <Eyebrow light>Start free</Eyebrow>
          <Heading
            level={2} light
            before="See what's holding"
            accent="your site back."
            style={{ fontSize: 'clamp(38px, 5.4vw, 64px)' }}
          />
          <p style={{
            fontSize: 'clamp(17px, 1.5vw, 20px)', lineHeight: 1.55,
            color: 'rgba(255,255,255,0.74)',
            maxWidth: 560, margin: '22px auto 40px', textWrap: 'pretty',
          }}>
            Free preview audit. Full fix-report from <strong style={{ color: '#fff', fontWeight: 600 }}>₹999 one-time</strong> —
            no subscription, no monthly fees.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Button kind="primary" size="xl" iconRight="arrow-right" onClick={tryDemo}>
              Run free audit
            </Button>
            <Button kind="ghostDark" size="xl" icon="play" iconRight={null}>
              Watch 60-sec demo
            </Button>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
            gap: 28, marginTop: 32,
            fontSize: 13.5, color: 'rgba(255,255,255,0.5)',
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="shield-check" size={14} color="rgba(255,255,255,0.6)" /> 7-day money back
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="zap" size={14} color="rgba(255,255,255,0.6)" /> Instant access
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="lock" size={14} color="rgba(255,255,255,0.6)" /> No spam, ever
            </span>
          </div>
        </div>
      </section>

      {/* ─────────────── FOOTER ─────────────── */}
      <footer style={{
        padding: '36px 0',
        background: 'var(--navy-900)',
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13.5,
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="pc-container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span>© 2026 Pagecheck. Built for small teams.</span>
          <span style={{ display: 'flex', gap: 20 }}>
            <span>Privacy</span><span>Terms</span><span>Status</span><span>Contact</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

// ── Step card ───────────────────────────────────────────────────────────────

function StepCard({ n, title, body, icon }) {
  const [hover, setHover] = useLandingState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 24,
        padding: 32,
        boxShadow: hover
          ? '0 24px 48px -16px rgba(10,22,40,0.12), 0 4px 12px -4px rgba(10,22,40,0.06)'
          : '0 2px 8px rgba(10,22,40,0.04)',
        transform: hover ? 'translateY(-3px)' : 'none',
        transition: 'all 250ms var(--ease-out)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* number watermark */}
      <div style={{
        position: 'absolute', right: -10, top: -16,
        fontWeight: 800, fontSize: 120,
        letterSpacing: '-0.05em',
        color: 'var(--green-50)',
        lineHeight: 1, fontFeatureSettings: '"tnum"',
        pointerEvents: 'none',
      }}>{n}</div>

      <div style={{
        position: 'relative',
        width: 48, height: 48, borderRadius: 12,
        background: 'linear-gradient(135deg, var(--green-50) 0%, var(--green-100) 100%)',
        border: '1px solid var(--green-200)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--green-700)',
        marginBottom: 20,
      }}>
        <Icon name={icon} size={22} />
      </div>
      <div style={{
        position: 'relative',
        fontWeight: 700, fontSize: 22, lineHeight: 1.2,
        letterSpacing: '-0.015em',
        color: 'var(--navy-800)', marginBottom: 10,
      }}>{title}</div>
      <div style={{
        position: 'relative',
        fontSize: 15.5, lineHeight: 1.55,
        color: 'var(--fg-2)',
        textWrap: 'pretty',
      }}>{body}</div>
    </div>
  );
}

// ── Testimonial card ────────────────────────────────────────────────────────

function TestimonialCard({ t, featured }) {
  const [hover, setHover] = useLandingState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: featured
          ? 'linear-gradient(180deg, var(--navy-800) 0%, var(--navy-700) 100%)'
          : '#fff',
        color: featured ? '#fff' : 'var(--navy-800)',
        border: featured ? '1px solid var(--navy-600)' : '1px solid var(--border)',
        borderRadius: 24, padding: 32,
        boxShadow: hover
          ? '0 24px 48px -16px rgba(10,22,40,0.16), 0 4px 12px -4px rgba(10,22,40,0.06)'
          : '0 2px 8px rgba(10,22,40,0.04)',
        transform: hover ? 'translateY(-3px)' : 'none',
        transition: 'all 250ms var(--ease-out)',
        display: 'flex', flexDirection: 'column', gap: 22,
        position: 'relative', overflow: 'hidden',
      }}
    >
      {featured && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 70% at 100% 0%, rgba(0,199,88,0.18), transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: 'var(--sun-yellow)', letterSpacing: 2, fontSize: 16 }}>★★★★★</div>
        <Icon name="quote" size={28} color={featured ? 'rgba(255,255,255,0.2)' : 'var(--gray-200)'} />
      </div>
      <p style={{
        position: 'relative',
        fontSize: featured ? 19 : 17,
        lineHeight: 1.55,
        color: featured ? '#fff' : 'var(--fg-1)',
        margin: 0,
        textWrap: 'pretty',
        fontWeight: featured ? 500 : 400,
        letterSpacing: '-0.005em',
      }}>"{t.quote}"</p>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14, marginTop: 'auto' }}>
        <Avatar initials={t.initials} color={featured ? 'rgba(255,255,255,0.16)' : t.color} size={44} />
        <div>
          <div style={{
            fontWeight: 600, fontSize: 15,
            color: featured ? '#fff' : 'var(--navy-800)',
          }}>{t.name}</div>
          <div style={{
            fontSize: 13.5, marginTop: 2,
            color: featured ? 'rgba(255,255,255,0.6)' : 'var(--fg-3)',
          }}>{t.role}</div>
        </div>
      </div>
    </div>
  );
}

// ── Fake logo wordmarks for the trust strip ─────────────────────────────────

function FakeLogo({ name }) {
  // Each "logo" is just a stylized wordmark with a tiny mark on the left.
  const marks = ['◆', '●', '▲', '◐', '✦', '◇', '■'];
  const mark = marks[name.length % marks.length];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      color: 'var(--fg-1)',
      fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em',
    }}>
      <span style={{ color: 'var(--fg-3)', fontSize: 16 }}>{mark}</span>
      {name}
    </div>
  );
}

// ── Product preview — fake dashboard mockup ─────────────────────────────────

function ProductPreview() {
  return (
    <div style={{
      position: 'relative',
      background: '#fff',
      borderRadius: 20,
      border: '1px solid rgba(10,22,40,0.08)',
      boxShadow: `
        0 1px 0 rgba(255,255,255,0.8) inset,
        0 0 0 1px rgba(10,22,40,0.04),
        0 40px 80px -24px rgba(10,22,40,0.25),
        0 16px 40px -8px rgba(10,22,40,0.10)
      `,
      overflow: 'hidden',
    }}>
      {/* Browser chrome */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px',
        background: '#f7f8fa',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ffbd2e' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c941' }} />
        </div>
        <div style={{
          flex: 1, margin: '0 16px', maxWidth: 360,
          background: '#fff', border: '1px solid var(--border)',
          borderRadius: 8, padding: '5px 12px',
          fontSize: 12, color: 'var(--fg-3)',
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          <Icon name="lock" size={11} color="var(--green-600)" />
          <span>pagecheck.ai / report / {AUDIT_SITE.url}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: '#fff', border: '1px solid var(--border)' }} />
        </div>
      </div>

      {/* App body */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        minHeight: 460,
      }}>
        {/* Sidebar */}
        <div style={{
          background: '#fafbfc',
          borderRight: '1px solid var(--border)',
          padding: 16,
          fontSize: 13,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 10px', marginBottom: 14,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: 'var(--navy-800)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--green-400)' }} />
            </div>
            <div style={{ fontWeight: 700, color: 'var(--navy-800)', fontSize: 14 }}>Pagecheck</div>
          </div>
          {[
            { name: 'Dashboard', icon: 'layout-dashboard', active: false },
            { name: 'Audits',    icon: 'scan-line', active: true },
            { name: 'Fixes',     icon: 'wand-2', active: false, badge: 9 },
            { name: 'History',   icon: 'history', active: false },
            { name: 'Settings',  icon: 'settings', active: false },
          ].map((item) => (
            <div key={item.name} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 8,
              background: item.active ? '#fff' : 'transparent',
              color: item.active ? 'var(--navy-800)' : 'var(--fg-2)',
              fontWeight: item.active ? 600 : 500,
              border: item.active ? '1px solid var(--border)' : '1px solid transparent',
              boxShadow: item.active ? '0 1px 2px rgba(10,22,40,0.04)' : 'none',
              marginBottom: 2,
            }}>
              <Icon name={item.icon} size={14} color={item.active ? 'var(--green-600)' : 'var(--fg-3)'} />
              <span style={{ flex: 1 }}>{item.name}</span>
              {item.badge && (
                <span style={{
                  background: 'var(--accent)', color: '#fff',
                  borderRadius: 999, padding: '1px 7px',
                  fontSize: 11, fontWeight: 700,
                }}>{item.badge}</span>
              )}
            </div>
          ))}
          <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />
          <div style={{ fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, padding: '4px 10px', marginBottom: 6 }}>Recent sites</div>
          {['sproutbakery.com.au', 'loomweave.co', 'glasshouse.studio'].map((s, i) => (
            <div key={s} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px', fontSize: 12.5,
              color: 'var(--fg-2)', borderRadius: 6,
              marginBottom: 1,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: ['var(--amber-400)','var(--green-500)','var(--danger)'][i] }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s}</span>
            </div>
          ))}
        </div>

        {/* Main */}
        <div style={{ padding: 24, background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--fg-3)', fontWeight: 500, marginBottom: 4 }}>Audit report</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy-800)', letterSpacing: '-0.02em' }}>
                {AUDIT_SITE.url}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{
                fontSize: 12, fontWeight: 600,
                padding: '6px 12px', borderRadius: 8,
                background: '#fff', border: '1px solid var(--border)',
                color: 'var(--fg-2)',
              }}>Export</div>
              <div style={{
                fontSize: 12, fontWeight: 600,
                padding: '6px 12px', borderRadius: 8,
                background: 'var(--accent)', color: '#fff',
                boxShadow: '0 4px 12px -2px rgba(0,199,88,0.32)',
              }}>Run again</div>
            </div>
          </div>

          {/* Three mini score cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'UX',    value: 65, tone: '#f99c00' },
              { label: 'SEO',   value: 70, tone: '#f99c00' },
              { label: 'Speed', value: 48, tone: '#fb2c36' },
            ].map((s) => (
              <div key={s.label} style={{
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: 14, padding: 14,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  position: 'relative', width: 44, height: 44, flexShrink: 0,
                }}>
                  <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="22" cy="22" r="18" fill="none" stroke="var(--gray-100)" strokeWidth="4" />
                    <circle cx="22" cy="22" r="18" fill="none" stroke={s.tone} strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 18}
                      strokeDashoffset={2 * Math.PI * 18 * (1 - s.value / 100)}
                    />
                  </svg>
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: 'var(--navy-800)',
                    fontFeatureSettings: '"tnum"',
                  }}>{s.value}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)', fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontSize: 13, color: s.tone, fontWeight: 600 }}>
                    {s.value < 50 ? 'Critical' : 'Needs work'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Issue rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { sev: 'high', area: 'UX',    title: "Your main button doesn't say what happens next", impact: '+18% clicks' },
              { sev: 'high', area: 'SEO',   title: "Google doesn't know you're a bakery", impact: 'Top-10 ranking' },
              { sev: 'high', area: 'SPEED', title: "Your homepage photo is 3.2 MB", impact: '-3.1s load' },
              { sev: 'med',  area: 'UX',    title: "Your phone number is hidden in the footer", impact: '+25 calls/wk' },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', background: '#fff',
                border: '1px solid var(--border)', borderRadius: 10,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: row.sev === 'high' ? 'var(--danger)' : 'var(--amber-500)',
                  boxShadow: `0 0 0 3px ${row.sev === 'high' ? 'rgba(251,44,54,0.12)' : 'rgba(249,156,0,0.14)'}`,
                  flexShrink: 0,
                }} />
                <div style={{
                  fontSize: 10, fontWeight: 700, color: 'var(--fg-3)',
                  letterSpacing: '0.08em',
                  width: 44, flexShrink: 0,
                }}>{row.area}</div>
                <div style={{
                  flex: 1, fontSize: 13.5, fontWeight: 500, color: 'var(--navy-800)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{row.title}</div>
                <div style={{
                  fontSize: 12, fontWeight: 600,
                  color: 'var(--green-700)',
                  background: 'var(--green-glow)',
                  padding: '3px 9px', borderRadius: 999,
                  flexShrink: 0,
                }}>{row.impact}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.Landing = Landing;
