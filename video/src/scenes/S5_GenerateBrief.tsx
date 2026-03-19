import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, F } from "../theme";
import { SceneWrap } from "../components/SceneWrap";
import { Browser } from "../components/Browser";
import { Dashboard } from "../components/Dashboard";
import { Cursor } from "../components/Cursor";

const DUR = 140;

/** Brief line with staggered appearance */
const BLine: React.FC<{
  delay: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 100 } });
  return (
    <div style={{ opacity: a, transform: `translateY(${interpolate(a, [0, 1], [4, 0])}px)`, ...style }}>
      {children}
    </div>
  );
};

export const S5_GenerateBrief: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cursor clicks "Generate Brief" at frame 15
  const cursorX = interpolate(frame, [0, 12], [500, 940], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorY = interpolate(frame, [0, 12], [300, 600], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorO = interpolate(frame, [0, 5, 25, 35], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const briefVisible = frame >= 20;

  // Slow zoom into brief content
  const zoom = interpolate(frame, [40, DUR], [1, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bf = frame - 25; // base frame for brief content stagger

  return (
    <SceneWrap durationInFrames={DUR}>
      <AbsoluteFill>
        <Browser url="app.example.com/dashboard" showMarkupIcon>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              transform: `scale(${zoom})`,
              transformOrigin: "75% 40%",
            }}
          >
            <div style={{ width: "calc(100% - 260px)", height: "100%", overflow: "hidden" }}>
              <Dashboard />
            </div>

            {/* Brief panel (replaces sidebar) */}
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: 260,
                height: "100%",
                backgroundColor: C.paper,
                borderLeft: `1px solid ${C.gold}30`,
                boxShadow: "-2px 0 16px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
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
                  borderBottom: `1px solid ${C.gold}20`,
                }}
              >
                <span style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: C.ink }}>
                  Markup
                </span>
                <span style={{ fontFamily: F.body, fontSize: 9, color: C.slate, marginLeft: 6 }}>
                  5 notes
                </span>
              </div>

              {/* Brief content */}
              {briefVisible && (
                <div style={{ flex: 1, padding: 10, overflowY: "auto", fontSize: 9, fontFamily: F.body }}>
                  <BLine delay={25}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, fontFamily: F.display, marginBottom: 2 }}>
                      Brief
                    </div>
                    <div style={{ fontSize: 7, color: C.slate, marginBottom: 8 }}>
                      app.example.com · 5 issues
                    </div>
                  </BLine>

                  {/* Severity summary */}
                  <BLine delay={35}>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        marginBottom: 10,
                        padding: "5px 8px",
                        backgroundColor: "#fff",
                        borderRadius: 4,
                        border: `1px solid ${C.gold}15`,
                      }}
                    >
                      {[
                        { l: "High", c: 2, cl: C.high },
                        { l: "Medium", c: 3, cl: C.medium },
                        { l: "Low", c: 1, cl: C.low },
                      ].map((s) => (
                        <div key={s.l} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: s.cl }} />
                          <span style={{ fontSize: 7, color: C.slate }}>
                            {s.c} {s.l}
                          </span>
                        </div>
                      ))}
                    </div>
                  </BLine>

                  {/* HIGH */}
                  <BLine delay={50}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: C.high, fontFamily: F.mono, letterSpacing: "0.04em", marginBottom: 4 }}>
                      HIGH
                    </div>
                  </BLine>
                  <BLine delay={60}>
                    <div style={{ backgroundColor: `${C.high}08`, borderRadius: 4, padding: "5px 7px", marginBottom: 4, borderLeft: `2px solid ${C.high}` }}>
                      <div style={{ fontWeight: 600, color: C.ink, fontSize: 8, marginBottom: 1 }}>Button misaligned, no hover state</div>
                      <div style={{ fontSize: 7, fontFamily: F.mono, color: C.slate }}>button.view-btn · Design</div>
                    </div>
                  </BLine>
                  <BLine delay={70}>
                    <div style={{ backgroundColor: `${C.high}08`, borderRadius: 4, padding: "5px 7px", marginBottom: 8, borderLeft: `2px solid ${C.high}` }}>
                      <div style={{ fontWeight: 600, color: C.ink, fontSize: 8, marginBottom: 1 }}>Padding too tight on mobile</div>
                      <div style={{ fontSize: 7, fontFamily: F.mono, color: C.slate }}>div.stats-row · Bug</div>
                    </div>
                  </BLine>

                  {/* MEDIUM */}
                  <BLine delay={85}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: C.medium, fontFamily: F.mono, letterSpacing: "0.04em", marginBottom: 4 }}>
                      MEDIUM
                    </div>
                  </BLine>
                  <BLine delay={92}>
                    <div style={{ backgroundColor: `${C.medium}08`, borderRadius: 4, padding: "5px 7px", marginBottom: 4, borderLeft: `2px solid ${C.medium}` }}>
                      <div style={{ fontWeight: 600, color: C.ink, fontSize: 8 }}>CTA: "Click here" → "View report"</div>
                      <div style={{ fontSize: 7, fontFamily: F.mono, color: C.slate }}>a.cta-link · Copy</div>
                    </div>
                  </BLine>
                  <BLine delay={100}>
                    <div style={{ backgroundColor: `${C.medium}08`, borderRadius: 4, padding: "5px 7px", marginBottom: 4, borderLeft: `2px solid ${C.medium}` }}>
                      <div style={{ fontWeight: 600, color: C.ink, fontSize: 8 }}>Page hierarchy is flat</div>
                      <div style={{ fontSize: 7, fontFamily: F.mono, color: C.slate }}>General · Design</div>
                    </div>
                  </BLine>
                  <BLine delay={108}>
                    <div style={{ backgroundColor: `${C.medium}08`, borderRadius: 4, padding: "5px 7px", marginBottom: 8, borderLeft: `2px solid ${C.medium}` }}>
                      <div style={{ fontWeight: 600, color: C.ink, fontSize: 8 }}>Stats section layout</div>
                      <div style={{ fontSize: 7, fontFamily: F.mono, color: C.slate }}>div.chart-area · Design</div>
                    </div>
                  </BLine>

                  {/* Footer */}
                  <BLine delay={118}>
                    <div style={{ fontSize: 7, color: C.slate, borderTop: `1px solid ${C.gold}15`, paddingTop: 6, marginTop: 4 }}>
                      app.example.com · {new Date().toLocaleDateString()}<br />
                      Generated by Markup
                    </div>
                  </BLine>
                </div>
              )}

              {/* Bottom bar */}
              <div
                style={{
                  height: 34,
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderTop: `1px solid ${C.gold}20`,
                }}
              >
                <div
                  style={{
                    fontFamily: F.body,
                    fontSize: 8,
                    fontWeight: 600,
                    color: C.ink,
                    backgroundColor: C.gold,
                    borderRadius: 4,
                    padding: "4px 12px",
                  }}
                >
                  GENERATE BRIEF
                </div>
              </div>
            </div>
          </div>
        </Browser>

        {/* Cursor */}
        {cursorO > 0 && <Cursor x={cursorX} y={cursorY} opacity={cursorO} />}
      </AbsoluteFill>
    </SceneWrap>
  );
};
