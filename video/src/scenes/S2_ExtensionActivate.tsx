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
import { Sidebar } from "../components/Sidebar";
import { Cursor } from "../components/Cursor";

const DUR = 150;

export const S2_ExtensionActivate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Icon pulse at frame 20 (heartbeat)
  const pulsePhase = (frame % 30) / 30;
  const iconPulse =
    frame < 40 ? 1 + Math.sin(pulsePhase * Math.PI * 2) * 0.1 : 1;
  const iconGlow =
    frame < 40
      ? 0.3 + Math.sin(pulsePhase * Math.PI * 2) * 0.4
      : 0;

  // Cursor moves to icon area and clicks at frame 50
  const cursorX = interpolate(frame, [15, 45], [400, 1038], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorY = interpolate(frame, [15, 45], [350, 47], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorOpacity = interpolate(
    frame,
    [15, 25, 65, 80],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Sidebar opens after click at frame 55
  const sidebarOpen = frame >= 55;

  // Dashboard content width shifts
  const contentShift = sidebarOpen
    ? spring({ frame: frame - 55, fps, config: { damping: 14, stiffness: 80 } })
    : 0;

  // Staggered sidebar content fade-in
  const panelBgOpacity = interpolate(frame, [55, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoOpacity = interpolate(frame, [70, 85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const chipOpacity = interpolate(frame, [85, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const emptyOpacity = interpolate(frame, [100, 115], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneWrap durationInFrames={DUR}>
      <AbsoluteFill>
        <Browser url="app.example.com/dashboard" showMarkupIcon>
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {/* Dashboard */}
            <div
              style={{
                width: sidebarOpen ? `calc(100% - ${260 * contentShift}px)` : "100%",
                height: "100%",
                overflow: "hidden",
              }}
            >
              <Dashboard />
            </div>

            {/* Sidebar */}
            {sidebarOpen && (
              <Sidebar slideIn slideDelay={0} noteCount={0} mode="SIMPLE MODE">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    gap: 6,
                  }}
                >
                  {/* Logotype */}
                  <div
                    style={{
                      fontFamily: F.display,
                      fontSize: 18,
                      fontWeight: 700,
                      color: C.ink,
                      opacity: logoOpacity,
                    }}
                  >
                    Markup
                  </div>
                  {/* Mode chip */}
                  <div
                    style={{
                      fontSize: 8,
                      fontFamily: F.mono,
                      color: C.midBlue,
                      backgroundColor: `${C.midBlue}15`,
                      padding: "2px 8px",
                      borderRadius: 4,
                      opacity: chipOpacity,
                    }}
                  >
                    SIMPLE MODE
                  </div>
                  {/* Empty state */}
                  <div
                    style={{
                      fontFamily: F.body,
                      fontSize: 10,
                      color: C.slate,
                      textAlign: "center",
                      lineHeight: 1.5,
                      opacity: emptyOpacity,
                      marginTop: 8,
                      maxWidth: 180,
                    }}
                  >
                    Select an element or add a general note.
                  </div>
                </div>
              </Sidebar>
            )}
          </div>
        </Browser>

        {/* Icon glow overlay (positioned over Markup icon) */}
        {frame < 55 && iconGlow > 0 && (
          <div
            style={{
              position: "absolute",
              right: 14,
              top: 37,
              width: 24,
              height: 24,
              borderRadius: 5,
              boxShadow: `0 0 ${8 + iconGlow * 12}px ${C.gold}${Math.round(iconGlow * 200)
                .toString(16)
                .padStart(2, "0")}`,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Cursor */}
        {cursorOpacity > 0 && (
          <Cursor x={cursorX} y={cursorY} opacity={cursorOpacity} />
        )}
      </AbsoluteFill>
    </SceneWrap>
  );
};
