"use client";
import * as LucideIcons from "lucide-react";
import type { CSSProperties } from "react";

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}

function toPascal(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

export default function Icon({
  name,
  size = 16,
  color,
  strokeWidth = 2,
  style,
}: IconProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as any)[toPascal(name)] as React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;

  if (!IconComponent) {
    return (
      <span
        style={{ display: "inline-flex", width: size, height: size, ...style }}
      />
    );
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        color: color || "currentColor",
        flexShrink: 0,
        ...style,
      }}
    >
      <IconComponent
        size={size}
        color={color || "currentColor"}
        strokeWidth={strokeWidth}
      />
    </span>
  );
}
