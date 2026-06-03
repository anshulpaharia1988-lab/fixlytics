/* global React, lucide */
// Shared atoms for Pagecheck.
// Style objects are uniquely named (pcStyles) to avoid global collisions.

const { useState, useEffect, useRef } = React;

// Lucide icon helper — renders into the React tree and re-runs createIcons
// after mount/update.
function Icon({ name, size = 16, color, strokeWidth = 2, style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.lucide && ref.current) {
      // Force re-render of just this node
      ref.current.innerHTML = `<i data-lucide="${name}" style="display:inline-flex"></i>`;
      window.lucide.createIcons({
        attrs: { width: size, height: size, "stroke-width": strokeWidth },
        nameAttr: 'data-lucide',
      });
    }
  }, [name, size, strokeWidth]);
  return (
    <span
      ref={ref}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        color: color || 'currentColor',
        ...style,
      }}
    />
  );
}

// Primary / secondary / ghost button
function Button({ children, kind = 'primary', size = 'md', icon, iconRight, onClick, type = 'button', style, disabled, full }) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const sizes = {
    sm: { fontSize: 14, padding: '10px 16px', borderRadius: 12, gap: 6 },
    md: { fontSize: 15, padding: '13px 22px', borderRadius: 14, gap: 8 },
    lg: { fontSize: 17, padding: '17px 28px', borderRadius: 16, gap: 10 },
    xl: { fontSize: 18, padding: '22px 36px', borderRadius: 18, gap: 12 },
  };
  const accent = 'var(--accent)';
  const kinds = {
    primary: {
      background: `linear-gradient(180deg, color-mix(in oklab, ${accent} 100%, white 8%) 0%, ${accent} 60%, color-mix(in oklab, ${accent} 90%, black 6%) 100%)`,
      color: '#fff',
      boxShadow: hover && !press
        ? `0 1px 0 rgba(255,255,255,0.25) inset, 0 0 0 1px rgba(0,0,0,0.06), 0 14px 36px -8px ${accent}, 0 8px 18px -6px rgba(0,199,88,0.4)`
        : `0 1px 0 rgba(255,255,255,0.22) inset, 0 0 0 1px rgba(0,0,0,0.06), 0 10px 28px -8px ${accent}, 0 4px 12px -4px rgba(0,199,88,0.32)`,
      transform: hover && !press ? 'translateY(-1px)' : 'none',
      filter: press ? 'brightness(0.94)' : 'none',
      letterSpacing: '-0.005em',
    },
    secondary: {
      background: hover ? 'var(--bg-muted)' : '#fff',
      color: 'var(--navy-800)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-xs)',
    },
    ghostDark: {
      background: hover ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.10)',
      color: '#fff', border: '1px solid rgba(255,255,255,0.24)',
    },
    ghostLight: {
      background: hover ? 'rgba(10,22,40,0.08)' : 'transparent',
      color: 'var(--navy-800)',
    },
    danger: {
      background: 'var(--danger)', color: '#fff',
      boxShadow: '0 8px 24px rgba(251,44,54,0.28)',
    },
  };
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 600, border: 0, cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 200ms var(--ease-out)',
        opacity: disabled ? 0.5 : 1,
        width: full ? '100%' : 'auto',
        whiteSpace: 'nowrap',
        ...sizes[size],
        ...kinds[kind],
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={sizes[size].fontSize + 1} />}
      {children}
      {iconRight && <Icon name={iconRight} size={sizes[size].fontSize + 1} />}
    </button>
  );
}

// Pill / chip
function Chip({ children, kind = 'green', icon, style, dot }) {
  const kinds = {
    green:     { background: 'var(--green-glow)', color: 'var(--green-700)' },
    greenSolid:{ background: 'var(--green-500)', color: '#fff' },
    white:     { background: '#fff', color: 'var(--navy-800)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xs)' },
    ghostDark: { background: 'rgba(255,255,255,0.10)', color: '#fff', border: '1px solid rgba(255,255,255,0.20)' },
    amber:     { background: 'rgba(249,156,0,0.14)', color: '#a86200' },
    red:       { background: 'var(--danger-bg)',     color: 'var(--danger)' },
    navy:      { background: 'var(--navy-800)', color: '#fff' },
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 12px', borderRadius: 9999,
      fontSize: 13, fontWeight: 500,
      ...kinds[kind], ...style,
    }}>
      {dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor' }} />}
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}

// Card
function Card({ children, style, hover }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={hover ? () => setH(true) : undefined}
      onMouseLeave={hover ? () => setH(false) : undefined}
      style={{
        background: '#fff',
        borderRadius: 24,
        padding: 28,
        border: '1px solid var(--border)',
        boxShadow: h ? 'var(--shadow-lg)' : 'var(--shadow-md)',
        transform: h ? 'translateY(-2px)' : 'none',
        transition: 'all 200ms var(--ease-out)',
        ...style,
      }}
    >{children}</div>
  );
}

// Section heading w/ Playfair italic accent on last word(s)
function Heading({ before, accent, after = '', level = 2, align = 'center', light = false, style }) {
  const Tag = `h${level}`;
  const sizes = {
    1: 'clamp(40px, 5.6vw, 68px)',
    2: 'clamp(30px, 3.6vw, 44px)',
    3: 'clamp(22px, 2vw, 26px)',
  };
  return (
    <Tag style={{
      fontFamily: 'var(--font-sans)',
      fontWeight: level === 1 ? 800 : 700,
      fontSize: sizes[level],
      lineHeight: level === 1 ? 1.04 : 1.1,
      letterSpacing: '-0.02em',
      color: light ? 'var(--white)' : 'var(--navy-800)',
      margin: 0,
      textAlign: align,
      textWrap: 'balance',
      ...style,
    }}>
      {before}{accent && ' '}
      {accent && (
        <em style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 500,
          color: light ? 'var(--green-400)' : 'inherit',
        }}>{accent}</em>
      )}
      {after && ' '}{after}
    </Tag>
  );
}

function Eyebrow({ children, light = false, align = 'center' }) {
  return (
    <div style={{
      fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      color: light ? 'var(--green-400)' : 'var(--green-600)',
      textAlign: align, marginBottom: 14,
    }}>{children}</div>
  );
}

// Score ring — animated radial gauge for /100 scores
function ScoreRing({ value, label, desc, tone = 'good', delay = 0 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setV(value), 200 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  const toneColor = {
    good:  '#00c758',
    warn:  '#f99c00',
    bad:   '#fb2c36',
  }[tone];
  const toneBg = {
    good: 'var(--green-glow)',
    warn: 'rgba(249,156,0,0.16)',
    bad:  'var(--danger-bg)',
  }[tone];
  const toneLabel = { good: 'Good', warn: 'Needs work', bad: 'Critical' }[tone];

  const R = 52;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - v / 100);

  return (
    <Card style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative', width: 140, height: 140 }}>
        <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r={R} fill="none" stroke="var(--gray-100)" strokeWidth="12" />
          <circle cx="70" cy="70" r={R} fill="none" stroke={toneColor} strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s var(--ease-out)' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em',
            color: 'var(--navy-800)', lineHeight: 1, fontFeatureSettings: '"tnum"',
          }}>{v}</div>
          <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 4, fontWeight: 500 }}>/ 100</div>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Chip kind="white" style={{ background: toneBg, color: toneColor, border: 0 }} dot>
          {toneLabel}
        </Chip>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy-800)', marginTop: 10, letterSpacing: '-0.01em' }}>{label}</div>
        <div style={{ fontSize: 14, color: 'var(--fg-2)', marginTop: 4, maxWidth: 220, lineHeight: 1.45 }}>{desc}</div>
      </div>
    </Card>
  );
}

// Top nav bar (sticky)
function TopNav({ onLogo, brand = "Pagecheck" }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.78)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: '1px solid rgba(10,22,40,0.06)',
    }}>
      <div className="pc-container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 72,
      }}>
        <button onClick={onLogo} style={{
          background: 'transparent', border: 0, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 11,
          padding: 0,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, var(--navy-700) 0%, var(--navy-800) 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 4px 12px rgba(10,22,40,0.15), 0 0 0 1px rgba(255,255,255,0.06) inset',
          }}>
            <div style={{
              width: 14, height: 14, borderRadius: 3,
              background: 'linear-gradient(135deg, var(--green-300), var(--green-500))',
              boxShadow: '0 0 12px rgba(0,199,88,0.55)',
            }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16.5, letterSpacing: '-0.02em', color: 'var(--navy-800)' }}>{brand}</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <a href="#how" style={navLinkStyle}>How it works</a>
          <a href="#pricing" style={navLinkStyle}>Pricing</a>
          <a href="#faq" style={navLinkStyle}>FAQ</a>
          <div style={{ width: 12 }} />
          <Button kind="ghostLight" size="sm" icon={null}>Sign in</Button>
          <Button kind="primary" size="sm" icon={null} iconRight="arrow-right">Run free audit</Button>
        </div>
      </div>
    </nav>
  );
}
const navLinkStyle = {
  fontSize: 14, color: 'var(--fg-2)', textDecoration: 'none',
  fontWeight: 500, padding: '8px 14px', borderRadius: 8,
};

// Marquee of social-proof text
function Marquee({ items }) {
  const text = items.join('  ·  ');
  return (
    <div style={{ background: 'var(--navy-800)', color: '#fff', padding: '12px 0', overflow: 'hidden' }}>
      <div style={{
        display: 'inline-flex', whiteSpace: 'nowrap',
        animation: 'pc-marquee 36s linear infinite',
        fontSize: 13, letterSpacing: '0.04em', fontWeight: 500,
        color: 'rgba(255,255,255,0.84)',
      }}>
        <span style={{ paddingRight: 48 }}>{text}  ·  </span>
        <span style={{ paddingRight: 48 }}>{text}  ·  </span>
        <span style={{ paddingRight: 48 }}>{text}  ·  </span>
      </div>
    </div>
  );
}

// Avatar circle
function Avatar({ initials, color = 'var(--navy-800)', size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.36, letterSpacing: '-0.02em',
      flexShrink: 0,
    }}>{initials}</div>
  );
}

Object.assign(window, {
  Icon, Button, Chip, Card, Heading, Eyebrow,
  ScoreRing, TopNav, Marquee, Avatar,
});
