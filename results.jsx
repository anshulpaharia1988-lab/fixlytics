/* global React, Button, Chip, Card, Heading, Eyebrow, Icon, Avatar, ScoreRing, TopNav, MockBrowserChrome, MockBakerySite, AUDIT_SITE, SCORES, ISSUES, HOTSPOTS */

const { useState: useResultsState, useMemo: useResultsMemo, useEffect: useResultsEffect, useRef: useResultsRef } = React;

const AREA_META = {
  ux:    { label: 'User Experience',    icon: 'mouse-pointer-2', color: '#16335c', bg: '#eef2f9' },
  seo:   { label: 'Search Visibility',  icon: 'search',          color: '#a86200', bg: '#fdf4e6' },
  speed: { label: 'Site Speed',         icon: 'gauge',           color: '#7e1d5c', bg: '#f9eef4' },
};

const SEVERITY_META = {
  high: { label: 'Critical', tone: 'red',   color: 'var(--danger)', bg: 'var(--danger-bg)' },
  med:  { label: 'Moderate', tone: 'amber', color: '#a86200',       bg: 'rgba(249,156,0,0.12)' },
  low:  { label: 'Minor',    tone: 'green', color: 'var(--green-700)', bg: 'var(--green-50)' },
};

const TONE_META = {
  good: { label: 'Good',        color: '#00a544', bg: '#dcfce7',          border: '#86efac', shadow: '0 10px 30px -8px rgba(0,165,68,0.30)' },
  warn: { label: 'Needs work',  color: '#c2410c', bg: '#fff3e0',          border: '#fdba74', shadow: '0 10px 30px -8px rgba(249,156,0,0.35)' },
  bad:  { label: 'Critical',    color: '#dc2626', bg: '#fee2e2',          border: '#fca5a5', shadow: '0 10px 30px -8px rgba(220,38,38,0.30)' },
};

function ResultsScreen({ url, currency, price, onLogo, onUnlock }) {
  const [activeHotspot, setActiveHotspot] = useResultsState(null);
  const [activeArea, setActiveArea] = useResultsState('all');

  const visibleIssues = useResultsMemo(
    () => ISSUES.filter((i) => activeArea === 'all' || i.area === activeArea),
    [activeArea]
  );

  const freeCount = ISSUES.filter((i) => !i.premium).length;
  const premiumCount = ISSUES.filter((i) => i.premium).length;
  const criticalCount = ISSUES.filter((i) => i.severity === 'high').length;

  // Overall grade = average of three scores
  const overallScore = Math.round((SCORES.ux.value + SCORES.seo.value + SCORES.speed.value) / 3);

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <TopNav onLogo={onLogo} />

      {/* ─── Header — URL + actions ─── */}
      <section style={{
        background: 'linear-gradient(180deg, var(--navy-900) 0%, var(--navy-800) 100%)',
        color: '#fff',
        padding: '40px 0 140px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 50% 60% at 80% 0%, rgba(0,199,88,0.20), transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 20%, #000 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 20%, #000 0%, transparent 80%)',
        }} />
        <div className="pc-container" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ flex: '1 1 360px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 12.5, color: 'var(--green-400)', fontWeight: 700,
                letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 14,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', background: 'var(--green-400)',
                  boxShadow: '0 0 0 4px rgba(0,199,88,0.20)',
                }} />
                Audit complete · 90 seconds
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
                <h1 style={{
                  fontSize: 'clamp(28px, 3.6vw, 42px)', fontWeight: 800,
                  letterSpacing: '-0.03em', margin: 0, color: '#fff', lineHeight: 1,
                }}>Results for</h1>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 'clamp(15px, 1.8vw, 20px)',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  borderRadius: 10, padding: '6px 14px',
                  color: '#fff', fontWeight: 500,
                }}>{url}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Button kind="ghostDark" size="md" icon="rotate-cw" iconRight={null}>Re-run</Button>
              <Button kind="ghostDark" size="md" icon="share-2" iconRight={null}>Share</Button>
              <Button kind="primary" size="md" icon="download" iconRight={null}>Export PDF</Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Verdict card (overlapping header) ─── */}
      <section style={{ marginTop: -100, paddingBottom: 24, position: 'relative', zIndex: 2 }}>
        <div className="pc-container">
          <VerdictCard
            overallScore={overallScore}
            criticalCount={criticalCount}
            freeCount={freeCount}
            premiumCount={premiumCount}
          />
        </div>
      </section>

      {/* ─── Three score cards ─── */}
      <section style={{ padding: '24px 0 48px' }}>
        <div className="pc-container">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            <ScoreCard
              area="ux"
              score={SCORES.ux.value}
              tone={SCORES.ux.tone}
              label={SCORES.ux.label}
              desc={SCORES.ux.desc}
              issueCount={ISSUES.filter((i) => i.area === 'ux').length}
              delay={0}
            />
            <ScoreCard
              area="seo"
              score={SCORES.seo.value}
              tone={SCORES.seo.tone}
              label={SCORES.seo.label}
              desc={SCORES.seo.desc}
              issueCount={ISSUES.filter((i) => i.area === 'seo').length}
              delay={150}
            />
            <ScoreCard
              area="speed"
              score={SCORES.speed.value}
              tone={SCORES.speed.tone}
              label={SCORES.speed.label}
              desc={SCORES.speed.desc}
              issueCount={ISSUES.filter((i) => i.area === 'speed').length}
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* ─── Annotated screenshot ─── */}
      <section style={{ padding: '24px 0 56px' }}>
        <div className="pc-container">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            <div>
              <Eyebrow align="left">What we saw</Eyebrow>
              <h2 style={{
                fontSize: 'clamp(28px, 3.4vw, 40px)', fontWeight: 800,
                letterSpacing: '-0.025em', margin: '8px 0 0', color: 'var(--navy-800)',
              }}>
                Your homepage, <em style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
                }}>annotated</em>
              </h2>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 13, color: 'var(--fg-3)',
              background: '#fff', padding: '8px 14px', borderRadius: 999,
              border: '1px solid var(--border)',
            }}>
              <Icon name="mouse-pointer-click" size={14} />
              Click any number to see the fix
            </div>
          </div>
          <div style={{ position: 'relative', maxWidth: 1000, margin: '0 auto' }}>
            <MockBrowserChrome url={AUDIT_SITE.url}>
              <div style={{ position: 'relative' }}>
                <MockBakerySite />
                {HOTSPOTS.map((h) => {
                  const issue = ISSUES.find((i) => i.id === h.issueId);
                  const active = activeHotspot === h.id;
                  return (
                    <button
                      key={h.id}
                      onClick={() => setActiveHotspot(active ? null : h.id)}
                      style={{
                        position: 'absolute',
                        left: `${h.x}%`, top: `${h.y}%`,
                        transform: 'translate(-50%, -50%)',
                        width: 36, height: 36, borderRadius: '50%',
                        background: active ? 'var(--danger)' : 'rgba(251,44,54,0.94)',
                        color: '#fff',
                        border: '3px solid #fff',
                        boxShadow: active
                          ? '0 8px 24px rgba(251,44,54,0.50), 0 0 0 8px rgba(251,44,54,0.16)'
                          : '0 4px 14px rgba(251,44,54,0.40)',
                        cursor: 'pointer',
                        fontWeight: 800, fontSize: 15,
                        fontFamily: 'var(--font-sans)',
                        zIndex: active ? 3 : 2,
                        transition: 'all 200ms var(--ease-out)',
                        animation: active ? 'none' : 'pc-pop-in 400ms var(--ease-out) both',
                        animationDelay: `${h.id * 80}ms`,
                      }}
                    >
                      {h.id}
                      {active && (
                        <div style={{
                          position: 'absolute', top: '120%', left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#fff', color: 'var(--navy-800)',
                          borderRadius: 14, padding: '14px 16px',
                          width: 260, textAlign: 'left',
                          boxShadow: '0 20px 48px -8px rgba(10,22,40,0.20)',
                          border: '1px solid var(--border)',
                          fontSize: 13, fontWeight: 500,
                          zIndex: 10,
                        }}>
                          <div style={{
                            display: 'inline-flex', gap: 6, marginBottom: 8,
                          }}>
                            <span style={{
                              fontSize: 10, color: '#fff',
                              background: SEVERITY_META[issue.severity].color,
                              padding: '3px 8px', borderRadius: 999,
                              fontWeight: 700, letterSpacing: '0.06em',
                            }}>{SEVERITY_META[issue.severity].label.toUpperCase()}</span>
                            <span style={{
                              fontSize: 10, color: AREA_META[issue.area].color,
                              background: AREA_META[issue.area].bg,
                              padding: '3px 8px', borderRadius: 999,
                              fontWeight: 700, letterSpacing: '0.06em',
                            }}>{AREA_META[issue.area].label.toUpperCase()}</span>
                          </div>
                          <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--navy-800)', lineHeight: 1.3, marginBottom: 6 }}>{issue.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--green-700)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Icon name="trending-up" size={12} /> {issue.impact}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </MockBrowserChrome>
          </div>
        </div>
      </section>

      {/* ─── Issue list ─── */}
      <section id="issues" style={{ padding: '32px 0 48px' }}>
        <div className="pc-container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
            <div>
              <Eyebrow align="left">Your Fixes</Eyebrow>
              <h2 style={{
                fontSize: 'clamp(28px, 3.4vw, 40px)', fontWeight: 800,
                letterSpacing: '-0.025em', margin: '8px 0 12px', color: 'var(--navy-800)',
              }}>
                The fixes, <em style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
                }}>ranked by impact</em>
              </h2>
              <div style={{ fontSize: 15, color: 'var(--fg-2)', maxWidth: 540 }}>
                Start with critical issues — these are the ones costing you visitors right now.
              </div>
            </div>
            <div style={{ display: 'inline-flex', background: '#fff', borderRadius: 14, padding: 4, border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(10,22,40,0.04)' }}>
              {[
                { id: 'all',   label: 'All',     count: ISSUES.length },
                { id: 'ux',    label: 'UX',      count: ISSUES.filter((i) => i.area === 'ux').length },
                { id: 'seo',   label: 'SEO',     count: ISSUES.filter((i) => i.area === 'seo').length },
                { id: 'speed', label: 'Speed',   count: ISSUES.filter((i) => i.area === 'speed').length },
              ].map((t) => (
                <button key={t.id} onClick={() => setActiveArea(t.id)} style={{
                  background: activeArea === t.id ? 'var(--navy-800)' : 'transparent',
                  color: activeArea === t.id ? '#fff' : 'var(--fg-2)',
                  border: 0, padding: '9px 16px',
                  borderRadius: 10, cursor: 'pointer',
                  fontSize: 14, fontWeight: 600,
                  transition: 'all 150ms var(--ease-out)',
                  fontFamily: 'inherit',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}>
                  {t.label}
                  <span style={{
                    fontSize: 11.5, fontWeight: 700,
                    padding: '1px 7px', borderRadius: 999,
                    background: activeArea === t.id ? 'rgba(255,255,255,0.16)' : 'var(--bg-page)',
                    color: activeArea === t.id ? '#fff' : 'var(--fg-3)',
                    fontFeatureSettings: '"tnum"',
                  }}>{t.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            {visibleIssues.map((issue, i) => (
              <IssueCard key={issue.id} issue={issue} index={i + 1} onUnlock={onUnlock} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Locked premium ─── */}
      <section style={{ padding: '24px 0 80px' }}>
        <div className="pc-container">
          <LockedPremiumPanel
            currency={currency}
            price={price}
            premiumCount={premiumCount}
            onUnlock={onUnlock}
          />
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Verdict card — sits below header with overall grade + summary
// ─────────────────────────────────────────────────────────────────────────────

function gradeFor(score) {
  if (score >= 90) return { letter: 'A', tone: 'good' };
  if (score >= 80) return { letter: 'B', tone: 'good' };
  if (score >= 70) return { letter: 'C', tone: 'warn' };
  if (score >= 55) return { letter: 'D', tone: 'warn' };
  return { letter: 'F', tone: 'bad' };
}

function VerdictCard({ overallScore, criticalCount, freeCount, premiumCount }) {
  const grade = gradeFor(overallScore);
  const tone = TONE_META[grade.tone];
  return (
    <div style={{
      background: '#fff',
      borderRadius: 28,
      border: '1px solid rgba(10,22,40,0.06)',
      boxShadow: '0 32px 64px -24px rgba(10,22,40,0.24), 0 8px 16px -4px rgba(10,22,40,0.06)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 0,
        alignItems: 'stretch',
      }}>
        {/* Grade panel */}
        <div style={{
          background: `linear-gradient(180deg, ${tone.bg} 0%, #fff 100%)`,
          padding: '32px 36px',
          borderRight: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 24,
          position: 'relative',
        }}>
          <div style={{
            width: 88, height: 88, borderRadius: 22,
            background: `linear-gradient(180deg, ${tone.color} 0%, color-mix(in oklab, ${tone.color} 80%, black 20%) 100%)`,
            color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 56, letterSpacing: '-0.04em',
            boxShadow: `${tone.shadow}, 0 1px 0 rgba(255,255,255,0.3) inset`,
            flexShrink: 0,
          }}>{grade.letter}</div>
          <div>
            <div style={{
              fontSize: 11.5, color: tone.color, fontWeight: 700,
              letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 4,
            }}>Overall grade</div>
            <div style={{
              fontSize: 42, fontWeight: 800, letterSpacing: '-0.035em',
              color: 'var(--navy-800)', lineHeight: 1,
              fontFeatureSettings: '"tnum"',
            }}>{overallScore}<span style={{ fontSize: 22, color: 'var(--fg-3)', fontWeight: 600 }}> / 100</span></div>
            <div style={{ fontSize: 14, color: 'var(--fg-2)', marginTop: 8, fontWeight: 500 }}>
              {tone.label} — and we know exactly how to fix it.
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div style={{
          padding: '32px 36px',
          display: 'flex', alignItems: 'center', gap: 36,
          flexWrap: 'wrap',
        }}>
          <VerdictStat
            icon="alert-octagon"
            color="var(--danger)"
            value={criticalCount}
            label="Critical issues"
            sub="Fix these first"
          />
          <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)' }} />
          <VerdictStat
            icon="wand-2"
            color="var(--green-600)"
            value={freeCount}
            label="Free fixes ready"
            sub="Copy-paste in minutes"
          />
          <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)' }} />
          <VerdictStat
            icon="lock"
            color="var(--navy-700)"
            value={`+${premiumCount}`}
            label="Locked in premium"
            sub="Worth the upgrade"
          />
        </div>

        {/* Lost-revenue callout */}
        <div style={{
          background: 'linear-gradient(180deg, var(--navy-800) 0%, var(--navy-900) 100%)',
          color: '#fff',
          padding: '32px 36px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          minWidth: 260,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 60% 60% at 100% 50%, rgba(0,199,88,0.18), transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative' }}>
            <div style={{
              fontSize: 11.5, color: 'var(--green-400)', fontWeight: 700,
              letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 6,
            }}>Estimated lift</div>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 6,
            }}>
              <span style={{
                fontWeight: 800, fontSize: 42, letterSpacing: '-0.035em',
                color: '#fff', fontFeatureSettings: '"tnum"', lineHeight: 1,
              }}>+34%</span>
              <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }}>conversions</span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 10, lineHeight: 1.4 }}>
              if you ship the fixes below. Based on sites like yours.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VerdictStat({ icon, color, value, label, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: `color-mix(in oklab, ${color} 12%, white)`,
        color, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 4,
      }}>
        <Icon name={icon} size={20} />
      </div>
      <div>
        <div style={{
          fontWeight: 800, fontSize: 32, letterSpacing: '-0.03em',
          color: 'var(--navy-800)', lineHeight: 1,
          fontFeatureSettings: '"tnum"',
        }}>{value}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy-800)', marginTop: 6 }}>{label}</div>
        <div style={{ fontSize: 12.5, color: 'var(--fg-3)', marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Score card — premium per-area card with animated ring + bar
// ─────────────────────────────────────────────────────────────────────────────

function ScoreCard({ area, score, tone: toneKey, label, desc, issueCount, delay }) {
  const tone = TONE_META[toneKey];
  const areaMeta = AREA_META[area];
  const [v, setV] = useResultsState(0);
  useResultsEffect(() => {
    const t = setTimeout(() => setV(score), 250 + delay);
    return () => clearTimeout(t);
  }, [score, delay]);
  const [hover, setHover] = useResultsState(false);

  const R = 38;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - v / 100);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff',
        borderRadius: 24,
        border: '1px solid var(--border)',
        boxShadow: hover
          ? '0 24px 48px -16px rgba(10,22,40,0.16), 0 4px 12px -4px rgba(10,22,40,0.06)'
          : '0 2px 8px rgba(10,22,40,0.05)',
        transform: hover ? 'translateY(-3px)' : 'none',
        transition: 'all 250ms var(--ease-out)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Tone bar at top */}
      <div style={{
        height: 5,
        background: `linear-gradient(90deg, ${tone.color} 0%, color-mix(in oklab, ${tone.color} 70%, white) 100%)`,
      }} />

      <div style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 22 }}>
          {/* Area badge + label */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 10px 5px 8px', borderRadius: 999,
              background: areaMeta.bg, color: areaMeta.color,
              fontSize: 12, fontWeight: 600,
              marginBottom: 12,
            }}>
              <Icon name={areaMeta.icon} size={13} />
              {areaMeta.label}
            </div>
            <div style={{
              fontSize: 22, fontWeight: 700, color: 'var(--navy-800)',
              letterSpacing: '-0.02em', lineHeight: 1.15,
            }}>{label}</div>
          </div>

          {/* Score ring */}
          <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
            <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="48" cy="48" r={R} fill="none" stroke="var(--gray-100)" strokeWidth="8" />
              <circle cx="48" cy="48" r={R} fill="none" stroke={tone.color} strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1.2s var(--ease-out)' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                fontSize: 28, fontWeight: 800, color: 'var(--navy-800)',
                letterSpacing: '-0.04em', lineHeight: 1,
                fontFeatureSettings: '"tnum"',
              }}>{v}</div>
              <div style={{ fontSize: 10, color: 'var(--fg-3)', marginTop: 2, fontWeight: 500 }}>/ 100</div>
            </div>
          </div>
        </div>

        {/* Status chip */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 999,
          background: tone.bg, color: tone.color,
          fontSize: 12, fontWeight: 700,
          letterSpacing: '0.04em',
          marginBottom: 16,
          textTransform: 'uppercase',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: tone.color }} />
          {tone.label}
        </div>

        <p style={{
          fontSize: 14.5, color: 'var(--fg-2)', lineHeight: 1.55, margin: 0,
          textWrap: 'pretty',
        }}>{desc}</p>

        {/* Bottom: progress bar + issue count */}
        <div style={{
          marginTop: 22, paddingTop: 18,
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="alert-circle" size={15} color={tone.color} />
            <span style={{ fontSize: 13.5, color: 'var(--navy-800)', fontWeight: 600 }}>
              {issueCount} fixes ready
            </span>
          </div>
          <a href="#issues" style={{
            fontSize: 13, fontWeight: 600, color: tone.color,
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            See fixes <Icon name="arrow-right" size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Issue card — color-rail, severity-coded, big fix block
// ─────────────────────────────────────────────────────────────────────────────

function IssueCard({ issue, index, onUnlock }) {
  const [hover, setHover] = useResultsState(false);
  const area = AREA_META[issue.area];
  const sev = SEVERITY_META[issue.severity];
  const isLocked = issue.premium;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        background: '#fff',
        borderRadius: 20,
        border: '1px solid var(--border)',
        boxShadow: hover
          ? '0 18px 40px -16px rgba(10,22,40,0.12), 0 4px 12px -4px rgba(10,22,40,0.06)'
          : '0 2px 6px rgba(10,22,40,0.04)',
        overflow: 'hidden',
        transition: 'all 200ms var(--ease-out)',
        transform: hover ? 'translateY(-1px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        {/* Color severity rail */}
        <div style={{
          width: 6,
          background: `linear-gradient(180deg, ${sev.color} 0%, color-mix(in oklab, ${sev.color} 70%, white) 100%)`,
          flexShrink: 0,
        }} />

        {/* Icon + number rail */}
        <div style={{
          width: 84, flexShrink: 0,
          background: 'var(--bg-page)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-start',
          padding: '26px 12px',
          gap: 14,
        }}>
          <div style={{
            fontWeight: 800, fontSize: 26, color: 'var(--fg-muted)',
            letterSpacing: '-0.04em', fontFeatureSettings: '"tnum"',
          }}>{String(index).padStart(2, '0')}</div>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `linear-gradient(135deg, ${area.color} 0%, color-mix(in oklab, ${area.color} 75%, black) 100%)`,
            color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 12px -4px ${area.color}`,
          }}>
            <Icon name={area.icon} size={18} />
          </div>
        </div>

        {/* Main column */}
        <div style={{
          flex: 1, padding: 26, minWidth: 0,
          filter: isLocked ? 'blur(6px)' : 'none',
          userSelect: isLocked ? 'none' : 'auto',
          pointerEvents: isLocked ? 'none' : 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 999,
              background: sev.bg, color: sev.color,
              fontSize: 11.5, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: sev.color }} />
              {sev.label}
            </span>
            <span style={{
              fontSize: 11.5, fontWeight: 600,
              padding: '4px 10px', borderRadius: 999,
              background: area.bg, color: area.color,
              letterSpacing: '0.04em',
            }}>{area.label}</span>
          </div>

          <div style={{
            fontSize: 'clamp(19px, 1.9vw, 23px)', fontWeight: 700,
            color: 'var(--navy-800)', letterSpacing: '-0.015em',
            lineHeight: 1.25, marginBottom: 12,
          }}>
            {issue.title}
          </div>
          <p style={{
            fontSize: 15.5, lineHeight: 1.6, color: 'var(--fg-2)',
            margin: '0 0 20px', textWrap: 'pretty', maxWidth: 720,
          }}>{issue.why}</p>

          {/* Impact + effort metrics row */}
          <div style={{
            display: 'flex', gap: 0, marginBottom: 16,
            background: 'var(--bg-page)',
            border: '1px solid var(--border)',
            borderRadius: 12, overflow: 'hidden',
          }}>
            <div style={{
              flex: 1, padding: '12px 16px',
              borderRight: '1px solid var(--border)',
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 700, color: 'var(--fg-3)',
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4,
              }}>
                <Icon name="trending-up" size={12} /> Expected impact
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--green-700)' }}>
                {issue.impact}
              </div>
            </div>
            <div style={{ flex: 1, padding: '12px 16px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 700, color: 'var(--fg-3)',
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4,
              }}>
                <Icon name="clock" size={12} /> Time to fix
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--navy-800)' }}>
                {issue.effort}
              </div>
            </div>
          </div>

          {/* Fix box */}
          <div style={{
            background: 'linear-gradient(135deg, var(--green-50) 0%, #fff 100%)',
            border: '1px solid var(--green-200)',
            borderRadius: 14, padding: '16px 18px',
            display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--green-500), var(--green-600))',
              color: '#fff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: 1,
              boxShadow: '0 4px 12px -2px rgba(0,199,88,0.36)',
            }}>
              <Icon name="wand-2" size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: 'var(--green-700)',
                letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 4,
              }}>The Fix</div>
              <div style={{ fontSize: 15.5, color: 'var(--navy-800)', lineHeight: 1.55, fontWeight: 500 }}>
                {issue.fix}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lock overlay */}
      {isLocked && (
        <div style={{
          position: 'absolute', inset: 0, left: 90,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.96) 70%)',
        }}>
          <button onClick={onUnlock} style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(180deg, #fff 0%, #fafbfc 100%)',
            border: '1px solid var(--border)',
            borderRadius: 999, padding: '12px 22px',
            cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 14, fontWeight: 600, color: 'var(--navy-800)',
            boxShadow: '0 12px 28px -8px rgba(10,22,40,0.18), 0 2px 4px rgba(10,22,40,0.06)',
          }}>
            <Icon name="lock" size={15} color="var(--green-600)" />
            Unlock this fix
            <Icon name="arrow-right" size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Locked premium panel — the "buy now" surface
// ─────────────────────────────────────────────────────────────────────────────

function LockedPremiumPanel({ currency, price, premiumCount, onUnlock }) {
  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(135deg, #050d1a 0%, #0a1628 40%, #0f2744 100%)',
      color: '#fff',
      borderRadius: 32,
      overflow: 'hidden',
      boxShadow: '0 40px 80px -24px rgba(10,22,40,0.40), 0 8px 16px -4px rgba(10,22,40,0.08)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Glow effects */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 40% 60% at 90% 50%, rgba(0,199,88,0.24), transparent 60%),
          radial-gradient(ellipse 30% 40% at 0% 100%, rgba(0,199,88,0.10), transparent 60%)
        `,
      }} />
      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
        maskImage: 'linear-gradient(135deg, #000 0%, transparent 70%)',
        WebkitMaskImage: 'linear-gradient(135deg, #000 0%, transparent 70%)',
      }} />

      <div style={{
        position: 'relative',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 400px)',
        gap: 40, padding: 'clamp(32px, 5vw, 56px)',
        alignItems: 'center',
      }}>
        {/* LEFT — pitch */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, var(--green-500), var(--green-600))',
              color: '#fff',
              padding: '7px 14px', borderRadius: 999,
              fontSize: 12.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              boxShadow: '0 8px 20px -4px rgba(0,199,88,0.45)',
            }}>
              <Icon name="crown" size={13} /> Premium
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.9)',
              padding: '7px 12px', borderRadius: 999,
              fontSize: 12, fontWeight: 600,
            }}>
              <Icon name="lock" size={12} /> Locked
            </span>
          </div>

          <h3 style={{
            fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800,
            letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 16px',
            color: '#fff',
          }}>
            Unlock your full{' '}
            <em style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
              background: 'linear-gradient(135deg, var(--green-300), var(--green-500))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>fix report</em>
          </h3>
          <p style={{
            fontSize: 17, color: 'rgba(255,255,255,0.78)', lineHeight: 1.55,
            margin: '0 0 28px', maxWidth: 540, textWrap: 'pretty',
          }}>
            Get {premiumCount} more critical fixes, copy-paste rewrites for every page,
            before-and-after mockups, and a step-by-step action checklist.
          </p>

          {/* Feature comparison */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 18, padding: '6px',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            marginBottom: 24,
          }}>
            {[
              { feat: `${premiumCount} additional critical fixes`, free: false, prem: true, important: true },
              { feat: 'Copy-paste rewrites for every page', free: false, prem: true },
              { feat: 'Before / after mockup comparisons', free: false, prem: true },
              { feat: 'Action checklist with progress tracker', free: false, prem: true },
              { feat: 'Downloadable PDF report', free: false, prem: true },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto',
                gap: 16, alignItems: 'center',
                padding: '12px 14px',
                borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.06)' : '0',
                fontSize: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {row.important && (
                    <span style={{
                      fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em',
                      background: 'var(--accent)', color: '#fff',
                      padding: '2px 6px', borderRadius: 4,
                    }}>NEW</span>
                  )}
                  <span style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>{row.feat}</span>
                </div>
                <div style={{
                  width: 44, textAlign: 'center', fontSize: 11,
                  color: 'rgba(255,255,255,0.40)', fontWeight: 600,
                }}>
                  {row.free ? <Icon name="check" size={14} color="rgba(255,255,255,0.40)" /> : '—'}
                </div>
                <div style={{
                  width: 44, textAlign: 'center',
                }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 20, height: 20, borderRadius: 6,
                    background: 'rgba(0,199,88,0.20)', color: 'var(--green-400)',
                  }}>
                    <Icon name="check" size={13} strokeWidth={3} />
                  </span>
                </div>
              </div>
            ))}
            {/* Headers (sit at bottom for visual balance) */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto auto',
              gap: 16, padding: '10px 14px 4px',
              fontSize: 10.5, fontWeight: 700,
              letterSpacing: '0.10em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.40)',
            }}>
              <div></div>
              <div style={{ width: 44, textAlign: 'center' }}>Free</div>
              <div style={{ width: 44, textAlign: 'center', color: 'var(--green-400)' }}>Premium</div>
            </div>
          </div>

          {/* Social proof row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
            fontSize: 13.5, color: 'rgba(255,255,255,0.70)',
          }}>
            <div style={{ display: 'flex' }}>
              {['#016630', '#a86200', '#7e1d5c', '#16335c'].map((c, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: c, border: '2px solid var(--navy-800)',
                  marginLeft: i ? -10 : 0,
                  color: '#fff', fontSize: 10, fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>{['PM','DC','AO','RT'][i]}</div>
              ))}
            </div>
            <span><strong style={{ color: '#fff', fontWeight: 600 }}>2,847 creators</strong> upgraded this month</span>
            <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.16)' }} />
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--sun-yellow)', letterSpacing: 1, fontSize: 14 }}>★★★★★</span>
              <span><strong style={{ color: '#fff', fontWeight: 600 }}>4.8</strong>/5 from 2,300 reviews</span>
            </div>
          </div>
        </div>

        {/* RIGHT — pricing card */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
          border: '1px solid rgba(255,255,255,0.16)',
          borderRadius: 24,
          padding: 30,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 20px 40px -12px rgba(0,0,0,0.30), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}>
          {/* Limited-time ribbon */}
          <div style={{
            position: 'absolute', top: -14, right: 20,
            background: 'linear-gradient(135deg, var(--amber-400), var(--amber-500))',
            color: '#fff',
            padding: '6px 14px', borderRadius: 999,
            fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            boxShadow: '0 8px 20px -4px rgba(249,156,0,0.40)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <Icon name="flame" size={12} /> Launch offer
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 14,
          }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.62)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Full Fix Report
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
              One-time · No subscription
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
            <span style={{
              fontSize: 56, fontWeight: 800, letterSpacing: '-0.04em',
              color: '#fff', fontFeatureSettings: '"tnum"', lineHeight: 0.95,
            }}>{currency}{price}</span>
            <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.45)', textDecoration: 'line-through' }}>
              {currency}{Math.round(price * 2)}
            </span>
          </div>
          <div style={{
            fontSize: 13, color: 'var(--green-400)', fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 22,
          }}>
            <Icon name="tag" size={12} /> 50% off — ends in 2 days
          </div>

          <Button kind="primary" size="lg" full iconRight="arrow-right" onClick={onUnlock}>
            Unlock Full Report
          </Button>

          <div style={{
            marginTop: 18,
            display: 'flex', flexDirection: 'column', gap: 8,
            fontSize: 13, color: 'rgba(255,255,255,0.72)',
          }}>
            {[
              { icon: 'zap', text: 'Instant access — view in browser' },
              { icon: 'shield-check', text: '7-day money-back guarantee' },
              { icon: 'mail', text: 'PDF emailed to you in 60 seconds' },
            ].map((item) => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: 'rgba(0,199,88,0.18)', color: 'var(--green-400)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon name={item.icon} size={12} />
                </span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.ResultsScreen = ResultsScreen;
