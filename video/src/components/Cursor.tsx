import React from "react";

export const Cursor: React.FC<{
  x: number;
  y: number;
  opacity?: number;
  color?: string;
}> = ({ x, y, opacity = 1, color = "#FFFFFF" }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      opacity,
      pointerEvents: "none",
      zIndex: 100,
    }}
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35z"
        fill={color}
        stroke="#000"
        strokeWidth="1"
      />
    </svg>
  </div>
);
