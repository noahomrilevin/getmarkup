import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  random,
} from "remotion";
import { C, F } from "../theme";
import { SceneWrap } from "../components/SceneWrap";
import { Browser } from "../components/Browser";
import { Dashboard } from "../components/Dashboard";
import { Sidebar, NoteCard } from "../components/Sidebar";
import { Cursor } from "../components/Cursor";

const DUR = 160;

// Golden hover/selection ring
const Ring: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  dashed: boolean;
  locked?: boolean;
}> = ({ x, y, w, h, dashed, locked }) => (
  <div
    style={{
      position: "absolute",
      left: x - 2,
      top: y - 2,
      width: w + 4,
      height: h + 4,
      border: `2px ${dashed ? "dashed" : "solid"} ${C.gold}`,
      borderRadius: 3,
      boxShadow: locked ? `0 0 8px ${C.gold}40` : `0 0 4px ${C.gold}20`,
      pointerEvents: "none",
    }}
  />
);

// Floating voice input on the page
const FloatingInput: React.FC<{ text: string; waveActive: boolean }> = ({
  text,
  waveActive,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 460,
        top: 310,
        width: 280,
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: "8px 10px",
        boxShadow: `0 2px 16px rgba(0,0,0,0.1), 0 0 0 1.5px ${C.gold}40`,
        fontFamily: F.body,
        zIndex: 10,
      }}
    >
      {/* Waveform */}
      <div style={{ display: "flex", alignItems: "center", gap: 1.5, height: 14, marginBottom: 4 }}>
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            backgroundColor: waveActive ? "#ef4444" : "#9ca3af",
            marginRight: 3,
            boxShadow: waveActive ? "0 0 4px #ef4444" : "none",
          }}
        />
        {Array.from({ length: 24 }).map((_, i) => {
          const h = waveActive
            ? 2 + Math.abs(Math.sin((frame * 0.15 + i * 0.6) * Math.PI)) * 10 * random(`w-${i}`)
            : 2;
          return (
            <div
              key={i}
              style={{
                width: 1.5,
                height: h,
                backgroundColor: waveActive ? C.gold : "#d1d5db",
                borderRadius: 1,
              }}
            />
          );
        })}
      </div>
      {/* Text */}
      <div style={{ fontSize: 9, color: C.ink, lineHeight: 1.4 }}>
        {text}
        <span
          style={{
            display: "inline-block",
            width: 1.5,
            height: 10,
            backgroundColor: C.gold,
            marginLeft: 1,
            verticalAlign: "text-bottom",
            opacity: Math.floor(frame / 10) % 2 === 0 ? 1 : 0.3,
          }}
        />
      </div>
    </div>
  );
};

export const S3_SelectAnnotate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Element positions in dashboard (relative to page content area)
  const elems = [
    { x: 152, y: 72, w: 160, h: 55, label: "Revenue Card" },  // stat card
    { x: 590, y: 195, w: 40, h: 18, label: "button.view-btn" }, // misaligned View button
    { x: 152, y: 45, w: 300, h: 18, label: "h1.dashboard-title" }, // heading
  ];

  // Hover sequence: card(0-30), heading(30-55), button(55-80), then click button
  const hoverIdx =
    frame < 30 ? 0 : frame < 55 ? 2 : frame >= 55 ? 1 : -1;
  const clicked = frame >= 80;

  // Cursor path
  const cursorX = interpolate(
    frame,
    [0, 25, 50, 75, 80],
    [350, 230, 300, 610, 610],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const cursorY = interpolate(
    frame,
    [0, 25, 50, 75, 80],
    [250, 100, 55, 205, 205],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const cursorOpacity = interpolate(
    frame, [0, 10, 90, 100], [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Voice input appears after click
  const showVoice = frame >= 85;
  const fullText =
    "This button needs to be right-aligned with the card edge. No hover state — should match primary buttons on settings page.";
  const words = fullText.split(" ");
  const wordsVisible = Math.floor(
    interpolate(frame, [90, 140], [0, words.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const visibleText = words.slice(0, wordsVisible).join(" ");
  const waveActive = frame >= 88 && frame < 142;

  // Note card appears after voice done
  const showNote = frame >= 145;

  // Element info in sidebar after click
  const showInfo = frame >= 82;

  return (
    <SceneWrap durationInFrames={DUR}>
      <AbsoluteFill>
        <Browser url="app.example.com/dashboard" showMarkupIcon>
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <div style={{ width: "calc(100% - 260px)", height: "100%", overflow: "hidden" }}>
              <Dashboard />
            </div>

            {/* Hover ring */}
            {hoverIdx >= 0 && !clicked && (
              <Ring
                x={elems[hoverIdx].x}
                y={elems[hoverIdx].y}
                w={elems[hoverIdx].w}
                h={elems[hoverIdx].h}
                dashed
              />
            )}

            {/* Locked ring on button */}
            {clicked && (
              <Ring
                x={elems[1].x}
                y={elems[1].y}
                w={elems[1].w}
                h={elems[1].h}
                dashed={false}
                locked
              />
            )}

            {/* Floating voice input */}
            {showVoice && (
              <FloatingInput text={visibleText} waveActive={waveActive} />
            )}

            {/* Sidebar */}
            <Sidebar noteCount={showNote ? 1 : 0} mode="DEV MODE">
              {showInfo && !showNote && (
                <div
                  style={{
                    opacity: interpolate(frame, [82, 92], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 5,
                      padding: 8,
                      border: `1px solid ${C.gold}20`,
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ fontSize: 8, fontFamily: F.mono, color: C.slate, marginBottom: 2 }}>
                      SELECTED ELEMENT
                    </div>
                    <div style={{ fontSize: 10, fontFamily: F.body, fontWeight: 600, color: C.ink, marginBottom: 2 }}>
                      View button
                    </div>
                    <div style={{ fontSize: 8, fontFamily: F.mono, color: C.midBlue }}>
                      button.view-btn
                    </div>
                    <div style={{ fontSize: 7, fontFamily: F.mono, color: C.slate, marginTop: 2 }}>
                      role: button
                    </div>
                  </div>
                </div>
              )}
              {showNote && (
                <NoteCard
                  type="Design"
                  severity="Medium"
                  text={fullText}
                  label="button.view-btn"
                  delay={145}
                />
              )}
            </Sidebar>

            {/* Cursor */}
            {cursorOpacity > 0 && (
              <Cursor x={cursorX} y={cursorY} opacity={cursorOpacity} />
            )}
          </div>
        </Browser>
      </AbsoluteFill>
    </SceneWrap>
  );
};
