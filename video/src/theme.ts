// Markup brand design tokens
export const C = {
  paper: "#F5F0E8",
  warmWhite: "#FAF8F3",
  ink: "#0D0D0D",
  gold: "#C9A84C",
  deepBlue: "#1A2744",
  slate: "#6B7A99",
  midBlue: "#2D4A8A",
  orange: "#FF8400",
  critical: "#B91C1C",
  high: "#C2410C",
  medium: "#2D4A8A",
  low: "#6B7A99",
} as const;

export const F = {
  body: "'DM Sans', sans-serif",
  mono: "'DM Mono', monospace",
  display: "'Playfair Display', serif",
} as const;

export const WIDTH = 1080;
export const HEIGHT = 700;
export const FPS = 30;

export const sec = (s: number) => Math.round(s * FPS);
