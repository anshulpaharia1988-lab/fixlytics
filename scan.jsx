/* global React, Card, Icon, AUDIT_SITE */

const { useState: useScanState, useEffect: useScanEffect } = React;

const SCAN_STEPS = [
  { key: 'fetch',  label: 'Loading your homepage',         icon: 'globe',          ms: 1100 },
  { key: 'render', label: 'Rendering like a real visitor', icon: 'monitor',        ms: 1200 },
  { key: 'ux',     label: 'Reading your copy & buttons',   icon: 'mouse-pointer-2',ms: 1400 },
  { key: 'seo',    label: 'Checking how Google sees you',  icon: 'search',         ms: 1300 },
  { key: 'speed',  label: 'Timing load speed on mobile',   icon: 'gauge',          ms: 1400 },
  { key: 'fixes',  label: 'Writing your fixes',            icon: 'sparkles',       ms: 1400 },
];

function ScanScreen({ url, onDone, skipAnimation }) {
  const [stepIdx, setStepIdx] = useScanState(0);
  const [progress, setProgress] = useScanState(0);

  useScanEffect(() => {
    if (skipAnimation) {
      const t = setTimeout(onDone, 250);
      return () => clearTimeout(t);
    }
    let cancelled = false;
    let elapsed = 0;
    const totalMs = SCAN_STEPS.reduce((a, s) => a + s.ms, 0);
    let i = 0;
    function next() {
      if (cancelled) return;
      if (i >= SCAN_STEPS.length) {
        setProgress(100);
        setTimeout(onDone, 350);
        return;
      }
      setStepIdx(i);
      const step = SCAN_STEPS[i];
      const start = elapsed;
      const startMs = performance.now();
      function tick(now) {
        if (cancelled) return;
        const dt = now - startMs;
        const p = Math.min(100, ((start + Math.min(dt, step.ms)) / totalMs) * 100);
        setProgress(p);
        if (dt < step.ms) requestAnimationFrame(tick);
        else {
          elapsed = start + step.ms;
          i += 1;
          next();
        }
      }
      requestAnimationFrame(tick);
    }
    next();
    return () => { cancelled = true; };
  }, [skipAnimation, onDone]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--navy-800)',
      color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* ambient gradients */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(0,199,88,0.18), transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
        maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 0%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 0%, transparent 80%)',
      }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: 620, textAlign: 'center' }}>
        {/* URL chip */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: 999, padding: '8px 18px',
          fontSize: 14, color: 'rgba(255,255,255,0.9)',
          marginBottom: 32,
        }}>
          <span style={{ color: 'var(--green-400)' }}>●</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{url}</span>
        </div>

        {/* Animated radar / scanner */}
        <div style={{
          position: 'relative', width: 220, height: 220, margin: '0 auto 36px',
        }}>
          {/* outer rings pulsing */}
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              position: 'absolute', inset: 0,
              border: '1.5px solid rgba(0,199,88,0.4)',
              borderRadius: '50%',
              animation: `pc-pulse-ring 2.4s ${i * 0.8}s infinite`,
              opacity: 1 - i * 0.25,
            }} />
          ))}
          {/* inner gradient core */}
          <div style={{
            position: 'absolute', inset: 30,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,199,88,0.45), rgba(10,22,40,0))',
          }} />
          {/* rotating scan sweep */}
          <div style={{
            position: 'absolute', inset: 30,
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, rgba(0,199,88,0.7) 0deg, rgba(0,199,88,0) 90deg)',
            animation: 'pc-spin 2.4s linear infinite',
            maskImage: 'radial-gradient(circle, transparent 30%, #000 31%, #000 100%)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 30%, #000 31%, #000 100%)',
          }} />
          {/* center logo mark */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'var(--green-500)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 40px rgba(0,199,88,0.6)',
            }}>
              <Icon name="scan-line" size={32} color="#fff" />
            </div>
          </div>
        </div>

        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800,
          letterSpacing: '-0.02em', margin: 0,
        }}>
          Auditing your site{' '}
          <em style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
            color: 'var(--green-400)',
          }}>right now…</em>
        </h2>
        <p style={{
          fontSize: 16, color: 'rgba(255,255,255,0.65)',
          maxWidth: 480, margin: '14px auto 36px', lineHeight: 1.5,
        }}>
          We're going through your homepage step by step. This usually takes about 90 seconds.
        </p>

        {/* Step list */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 18, padding: 12,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          textAlign: 'left',
          marginBottom: 24,
        }}>
          {SCAN_STEPS.map((s, i) => {
            const state = i < stepIdx ? 'done' : i === stepIdx ? 'active' : 'pending';
            return (
              <div key={s.key} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 14px',
                borderBottom: i < SCAN_STEPS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : '0',
                opacity: state === 'pending' ? 0.45 : 1,
                transition: 'opacity 300ms var(--ease-out)',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: state === 'done'
                    ? 'var(--green-500)'
                    : state === 'active'
                    ? 'rgba(0,199,88,0.18)'
                    : 'rgba(255,255,255,0.06)',
                  color: state === 'done' ? '#fff' : 'var(--green-400)',
                  flexShrink: 0,
                  position: 'relative',
                }}>
                  {state === 'done' ? (
                    <Icon name="check" size={16} />
                  ) : state === 'active' ? (
                    <>
                      <Icon name={s.icon} size={15} />
                      <span style={{
                        position: 'absolute', inset: -3, borderRadius: 10,
                        border: '1.5px solid var(--green-400)',
                        animation: 'pc-pulse-ring 1.6s infinite',
                      }} />
                    </>
                  ) : (
                    <Icon name={s.icon} size={15} />
                  )}
                </div>
                <div style={{
                  flex: 1, fontSize: 15, fontWeight: state === 'active' ? 600 : 500,
                  color: state === 'pending' ? 'rgba(255,255,255,0.55)' : '#fff',
                }}>{s.label}</div>
                {state === 'active' && (
                  <div style={{ display: 'inline-flex', gap: 4 }}>
                    {[0,1,2].map((d) => (
                      <span key={d} style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: 'var(--green-400)',
                        animation: `pc-fade-in 600ms ${d * 0.2}s infinite alternate`,
                      }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div style={{
          background: 'rgba(255,255,255,0.08)', borderRadius: 999,
          height: 6, overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress}%`, height: '100%',
            background: 'linear-gradient(90deg, var(--green-500), var(--green-400))',
            transition: 'width 200ms var(--ease-out)',
            borderRadius: 999,
          }} />
        </div>
        <div style={{
          marginTop: 10, fontSize: 13, color: 'rgba(255,255,255,0.6)',
          fontFeatureSettings: '"tnum"',
        }}>
          {Math.round(progress)}% complete
        </div>
      </div>
    </div>
  );
}

window.ScanScreen = ScanScreen;
