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
import { Sidebar, NoteCard } from "../components/Sidebar";

const DUR = 130;

const notes = [
  { type: "Bug", severity: "High", text: "Padding too tight on mobile", label: "div.stats-row" },
  { type: "Copy", severity: "Medium", text: "Copy says 'Click here' — should say 'View report'", label: "a.cta-link" },
  { type: "Design", severity: "Medium", text: "Screenshot: stats section layout", label: "div.chart-area", thumb: true },
  { type: "Design", severity: "Medium", text: "Page hierarchy is flat. Primary action gets lost.", label: undefined },
];

// Ring that flashes in/out during each beat
const QuickRing: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  beatStart: number;
}> = ({ x, y, w, h, beatStart }) => {
  const frame = useCurrentFrame();
  const o = interpolate(
    frame,
    [beatStart, beatStart + 5, beatStart + 25, beatStart + 30],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 2,
        top: y - 2,
        width: w + 4,
        height: h + 4,
        border: `2px solid ${C.gold}`,
        borderRadius: 3,
        boxShadow: `0 0 6px ${C.gold}40`,
        opacity: o,
        pointerEvents: "none",
      }}
    />
  );
};

export const S4_TheFlow: React.FC = () => {
  const frame = useCurrentFrame();

  // 4 beats, ~30 frames each
  const beat = Math.min(Math.floor(frame / 30), 3);
  const visibleNotes = notes.slice(0, beat + 1);

  // Ring positions for each beat
  const rings = [
    { x: 152, y: 72, w: 540, h: 55 },    // stats row
    { x: 320, y: 290, w: 200, h: 18 },    // CTA link area
    { x: 152, y: 130, w: 360, h: 180 },   // chart area (screenshot)
    null,                                    // general note, no ring
  ];

  // Screenshot drag rectangle for beat 2
  const showScreenDrag = beat === 2;
  const dragProg = interpolate(
    frame,
    [60, 80],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <SceneWrap durationInFrames={DUR}>
      <AbsoluteFill>
        <Browser url="app.example.com/dashboard" showMarkupIcon>
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <div style={{ width: "calc(100% - 260px)", height: "100%", overflow: "hidden" }}>
              <Dashboard />
            </div>

            {/* Quick rings */}
            {rings.map(
              (r, i) =>
                r && (
                  <QuickRing
                    key={i}
                    x={r.x}
                    y={r.y}
                    w={r.w}
                    h={r.h}
                    beatStart={i * 30}
                  />
                )
            )}

            {/* Screenshot drag rectangle */}
            {showScreenDrag && dragProg > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: 152,
                  top: 130,
                  width: interpolate(dragProg, [0, 1], [0, 360]),
                  height: interpolate(dragProg, [0, 1], [0, 180]),
                  border: `1.5px dashed ${C.gold}`,
                  backgroundColor: `${C.gold}08`,
                  borderRadius: 3,
                }}
              />
            )}

            {/* Sidebar with stacking notes */}
            <Sidebar noteCount={visibleNotes.length} mode="DEV MODE">
              {visibleNotes.map((n, i) => (
                <NoteCard
                  key={i}
                  type={n.type}
                  severity={n.severity}
                  text={n.text}
                  label={n.label}
                  delay={i * 30 + 15}
                  thumb={n.thumb}
                />
              ))}
            </Sidebar>
          </div>
        </Browser>
      </AbsoluteFill>
    </SceneWrap>
  );
};
