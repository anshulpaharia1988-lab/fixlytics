"use client";
import type { CSSProperties, ReactNode } from "react";
import Icon from "./Icon";

interface ChipProps {
  children: ReactNode;
  kind?: "green" | "greenSolid" | "white" | "ghostDark" | "amber" | "red" | "navy";
  icon?: string;
  style?: CSSProperties;
  dot?: boolean;
}

const kinds: Record<string, CSSProperties> = {
  green: { background: "var(--green-glow)", color: "var(--green-700)" },
  greenSolid: { background: "var(--green-500)", color: "#fff" },
  white: {
    background: "#fff",
    color: "var(--navy-800)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-xs)",
  },
  ghostDark: {
    background: "rgba(255,255,255,0.10)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.20)",
  },
  amber: { background: "rgba(249,156,0,0.14)", color: "#a86200" },
  red: { background: "var(--danger-bg)", color: "var(--danger)" },
  navy: { background: "var(--navy-800)", color: "#fff" },
};

export default function Chip({
  children,
  kind = "green",
  icon,
  style,
  dot,
}: ChipProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderRadius: 9999,
        fontSize: 13,
        fontWeight: 500,
        ...kinds[kind],
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "currentColor",
          }}
        />
      )}
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}
