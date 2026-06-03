"use client";
import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import Icon from "./Icon";

interface ButtonProps {
  children?: ReactNode;
  kind?: "primary" | "secondary" | "ghostDark" | "ghostLight" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  icon?: string | null;
  iconRight?: string | null;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  style?: CSSProperties;
  disabled?: boolean;
  full?: boolean;
}

const sizes = {
  sm: { fontSize: 14, padding: "10px 16px", borderRadius: 12, gap: 6 },
  md: { fontSize: 15, padding: "13px 22px", borderRadius: 14, gap: 8 },
  lg: { fontSize: 17, padding: "17px 28px", borderRadius: 16, gap: 10 },
  xl: { fontSize: 18, padding: "22px 36px", borderRadius: 18, gap: 12 },
};

export default function Button({
  children,
  kind = "primary",
  size = "md",
  icon,
  iconRight,
  onClick,
  type = "button",
  style,
  disabled,
  full,
}: ButtonProps) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);

  const accent = "var(--accent)";

  const kindStyles: Record<string, CSSProperties> = {
    primary: {
      background: `linear-gradient(180deg, color-mix(in oklab, ${accent} 100%, white 8%) 0%, ${accent} 60%, color-mix(in oklab, ${accent} 90%, black 6%) 100%)`,
      color: "#fff",
      boxShadow:
        hover && !press
          ? `0 1px 0 rgba(255,255,255,0.25) inset, 0 0 0 1px rgba(0,0,0,0.06), 0 14px 36px -8px ${accent}, 0 8px 18px -6px rgba(0,199,88,0.4)`
          : `0 1px 0 rgba(255,255,255,0.22) inset, 0 0 0 1px rgba(0,0,0,0.06), 0 10px 28px -8px ${accent}, 0 4px 12px -4px rgba(0,199,88,0.32)`,
      transform: hover && !press ? "translateY(-1px)" : "none",
      filter: press ? "brightness(0.94)" : "none",
      letterSpacing: "-0.005em",
    },
    secondary: {
      background: hover ? "var(--bg-muted)" : "#fff",
      color: "var(--navy-800)",
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-xs)",
    },
    ghostDark: {
      background: hover ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.10)",
      color: "#fff",
      border: "1px solid rgba(255,255,255,0.24)",
    },
    ghostLight: {
      background: hover ? "rgba(10,22,40,0.08)" : "transparent",
      color: "var(--navy-800)",
    },
    danger: {
      background: "var(--danger)",
      color: "#fff",
      boxShadow: "0 8px 24px rgba(251,44,54,0.28)",
    },
  };

  const s = sizes[size];

  return (
    <button
      type={type}
      suppressHydrationWarning
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPress(false);
      }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        border: 0,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 200ms var(--ease-out)",
        opacity: disabled ? 0.5 : 1,
        width: full ? "100%" : "auto",
        whiteSpace: "nowrap",
        fontSize: s.fontSize,
        padding: s.padding,
        borderRadius: s.borderRadius,
        gap: s.gap,
        ...kindStyles[kind],
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={s.fontSize + 1} />}
      {children}
      {iconRight && <Icon name={iconRight} size={s.fontSize + 1} />}
    </button>
  );
}
