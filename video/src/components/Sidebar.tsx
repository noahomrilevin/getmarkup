import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";

/** Markup side panel */
export const Sidebar: React.FC<{
  slideIn?: boolean;
  slideDelay?: number;
  width?: number;
  noteCount?: number;
  mode?: string;
  children?: React.ReactNode;
}> = ({
  slideIn = false,
  slideDelay = 0,
  width = 260,
  noteCount = 0,
  mode = "SIMPLE MODE",
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const prog = slideIn
    ? spring({ frame: frame - slideDelay, fps, config: { damping: 14, stiffness: 80, overshootClamping: false } })
    : 1;

  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        width,
        height: "100%",
        backgroundColor: C.paper,
        transform: `translateX(${interpolate(prog, [0, 1], [width, 0])}px)`,
        display: "flex",
        flexDirection: "column",
        borderLeft: `1px solid ${C.gold}30`,
        boxShadow: "-2px 0 16px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 36,
          padding: "0 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${C.gold}20`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontFamily: F.display,
              fontSize: 14,
              fontWeight: 700,
              color: C.ink,
              letterSpacing: "-0.01em",
            }}
          >
            Markup
          </span>
          <span style={{ fontFamily: F.body, fontSize: 9, color: C.slate }}>
            {noteCount} {noteCount === 1 ? "note" : "notes"}
          </span>
          <div
            style={{
              fontSize: 7,
              fontFamily: F.mono,
              color: C.midBlue,
              backgroundColor: `${C.midBlue}15`,
              padding: "1px 5px",
              borderRadius: 3,
              fontWeight: 500,
              letterSpacing: "0.04em",
            }}
          >
            {mode}
          </div>
        </div>
        {/* gear icon placeholder */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke={C.slate}
          strokeWidth="2"
          style={{ opacity: 0.4 }}
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "8px 10px", overflowY: "auto" }}>
        {children || (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <span style={{ fontFamily: F.body, fontSize: 11, color: C.slate, textAlign: "center", lineHeight: 1.5 }}>
              Select an element or add a general note.
            </span>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          height: 34,
          padding: "0 8px",
          display: "flex",
          alignItems: "center",
          gap: 5,
          borderTop: `1px solid ${C.gold}20`,
        }}
      >
        {[
          { label: "SELECT ELEMENT", bg: C.deepBlue },
          { label: "SCREENSHOT", bg: C.midBlue },
          { label: "GENERATE BRIEF", bg: C.gold },
        ].map((b) => (
          <div
            key={b.label}
            style={{
              fontFamily: F.body,
              fontSize: 7,
              fontWeight: 600,
              color: "#fff",
              backgroundColor: b.bg,
              borderRadius: 4,
              padding: "4px 8px",
              whiteSpace: "nowrap",
            }}
          >
            {b.label}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Single note card */
export const NoteCard: React.FC<{
  type: string;
  severity: string;
  text: string;
  label?: string;
  delay?: number;
  thumb?: boolean;
}> = ({ type, severity, text, label, delay = 0, thumb = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const a = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const typeColor: Record<string, string> = {
    Bug: C.critical,
    Design: C.midBlue,
    Copy: "#7C3AED",
    Question: C.high,
    General: C.slate,
  };
  const sevColor: Record<string, string> = {
    Critical: C.critical,
    High: C.high,
    Medium: C.medium,
    Low: C.low,
  };

  return (
    <div
      style={{
        opacity: a,
        transform: `translateY(${interpolate(a, [0, 1], [8, 0])}px)`,
        backgroundColor: "#fff",
        borderRadius: 5,
        padding: "7px 8px",
        marginBottom: 5,
        border: `1px solid ${C.gold}20`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
        <span
          style={{
            fontSize: 7,
            fontFamily: F.mono,
            fontWeight: 500,
            color: typeColor[type] || C.slate,
            backgroundColor: `${typeColor[type] || C.slate}15`,
            padding: "1px 4px",
            borderRadius: 2,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {type}
        </span>
        <span
          style={{
            fontSize: 7,
            fontFamily: F.mono,
            fontWeight: 500,
            color: sevColor[severity] || C.slate,
            backgroundColor: `${sevColor[severity] || C.slate}15`,
            padding: "1px 4px",
            borderRadius: 2,
            letterSpacing: "0.04em",
          }}
        >
          {severity}
        </span>
        {label && (
          <span style={{ fontSize: 7, fontFamily: F.mono, color: C.slate, marginLeft: "auto" }}>
            {label}
          </span>
        )}
      </div>
      <div style={{ fontSize: 9, fontFamily: F.body, color: C.ink, lineHeight: 1.4 }}>
        {text}
      </div>
      {thumb && (
        <div
          style={{
            marginTop: 4,
            height: 32,
            backgroundColor: "#f0f0f0",
            borderRadius: 3,
            border: `1px solid ${C.gold}10`,
          }}
        />
      )}
    </div>
  );
};
