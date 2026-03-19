import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, F } from "../theme";
import { SceneWrap } from "../components/SceneWrap";

const DUR = 120;

/** Animated export card */
const ExportCard: React.FC<{
  icon: string;
  title: string;
  children: React.ReactNode;
  delay: number;
  x: number;
  y: number;
}> = ({ icon, title, children, delay, x, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 100 } });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 210,
        opacity: a,
        transform: `scale(${interpolate(a, [0, 1], [0.85, 1])})`,
      }}
    >
      <div
        style={{
          backgroundColor: "#1a1a1a",
          borderRadius: 8,
          padding: 12,
          border: `1px solid #333`,
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 14 }}>{icon}</span>
          <span style={{ fontFamily: F.mono, fontSize: 8, color: C.gold, letterSpacing: "0.06em" }}>
            {title}
          </span>
        </div>
        {children}
      </div>
    </div>
  );
};

export const S6_TheHandoff: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Tagline
  const tagO = interpolate(frame, [85, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gold connecting lines between cards
  const lineO = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneWrap durationInFrames={DUR}>
      <AbsoluteFill style={{ backgroundColor: C.ink }}>
        {/* Card 1: Copy to Clipboard → AI chat */}
        <ExportCard icon="📋" title="COPY TO CLIPBOARD" delay={5} x={50} y={60}>
          <div style={{ backgroundColor: "#111", borderRadius: 4, padding: 6, fontSize: 7, fontFamily: F.body, color: "#9ca3af", lineHeight: 1.5 }}>
            <div style={{ color: "#e8eaed", marginBottom: 2, fontWeight: 600, fontSize: 8 }}>Claude</div>
            <span style={{ color: "#6b7280" }}>Pasted: </span>5 issues sorted by severity…<br />
            <span style={{ color: "#d97706" }}>→ </span>"Add margin-left: auto to .view-btn…"
          </div>
        </ExportCard>

        {/* Card 2: PDF */}
        <ExportCard icon="📄" title="DOWNLOAD PDF" delay={20} x={300} y={60}>
          <div style={{ backgroundColor: "#fff", borderRadius: 4, padding: 6 }}>
            <div style={{ fontFamily: F.display, fontSize: 10, fontWeight: 700, color: C.ink, marginBottom: 2 }}>Markup</div>
            <div style={{ fontSize: 6, color: C.slate, marginBottom: 4 }}>Dashboard Review · 5 issues</div>
            {[C.high, C.medium, C.medium].map((c, i) => (
              <div key={i} style={{ height: 8, backgroundColor: `${c}10`, borderLeft: `2px solid ${c}`, borderRadius: 2, marginBottom: 2 }} />
            ))}
            <div style={{ height: 20, backgroundColor: "#f0f0f0", borderRadius: 2, marginTop: 4 }}>
              <div style={{ fontSize: 5, color: "#9ca3af", padding: 3 }}>[ screenshot ]</div>
            </div>
          </div>
        </ExportCard>

        {/* Card 3: ZIP */}
        <ExportCard icon="📦" title="DOWNLOAD ZIP" delay={35} x={550} y={60}>
          <div style={{ fontFamily: F.mono, fontSize: 8, color: "#9ca3af", lineHeight: 1.8 }}>
            <div style={{ color: C.gold }}>review.zip/</div>
            <div style={{ paddingLeft: 10 }}>brief.md</div>
            <div style={{ paddingLeft: 10, color: C.slate }}>images/</div>
            <div style={{ paddingLeft: 18 }}>screenshot-1.png</div>
            <div style={{ paddingLeft: 18 }}>screenshot-2.png</div>
          </div>
        </ExportCard>

        {/* Card 4: JSON/CSV */}
        <ExportCard icon="{ }" title="EXPORT JSON / CSV" delay={50} x={800} y={60}>
          <div style={{ fontFamily: F.mono, fontSize: 7, color: "#9ca3af", lineHeight: 1.6, backgroundColor: "#111", borderRadius: 4, padding: 6 }}>
            <span style={{ color: "#7c3aed" }}>{'{'}</span><br />
            <span style={{ color: C.gold, paddingLeft: 6 }}>"type"</span>: <span style={{ color: "#34d399" }}>"Bug"</span>,<br />
            <span style={{ color: C.gold, paddingLeft: 6 }}>"severity"</span>: <span style={{ color: "#34d399" }}>"High"</span>,<br />
            <span style={{ color: C.gold, paddingLeft: 6 }}>"selector"</span>: <span style={{ color: "#34d399" }}>"div.stats"</span><br />
            <span style={{ color: "#7c3aed" }}>{'}'}</span>
          </div>
        </ExportCard>

        {/* Gold connecting lines */}
        {lineO > 0 && (
          <svg
            width="1080"
            height="700"
            style={{ position: "absolute", top: 0, left: 0, opacity: lineO * 0.3 }}
          >
            <line x1="260" y1="130" x2="300" y2="130" stroke={C.gold} strokeWidth="1" />
            <line x1="510" y1="130" x2="550" y2="130" stroke={C.gold} strokeWidth="1" />
            <line x1="760" y1="130" x2="800" y2="130" stroke={C.gold} strokeWidth="1" />
          </svg>
        )}

        {/* Tagline */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: "50%",
            transform: "translateX(-50%)",
            opacity: tagO,
            fontFamily: F.body,
            fontSize: 14,
            color: C.warmWhite,
            letterSpacing: "0.02em",
            textAlign: "center",
          }}
        >
          From your eyes to any tool in seconds.
        </div>
      </AbsoluteFill>
    </SceneWrap>
  );
};
