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

const DUR = 120;

/** A single micro-vignette card */
const Vignette: React.FC<{
  children: React.ReactNode;
  startFrame: number;
  holdFrames?: number;
}> = ({ children, startFrame, holdFrames = 20 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });
  const fadeOut = interpolate(
    frame,
    [startFrame + holdFrames, startFrame + holdFrames + 8],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const o = Math.min(slideIn, fadeOut);
  const tx = interpolate(slideIn, [0, 1], [60, 0]);

  if (frame < startFrame || o <= 0) return null;

  return (
    <div
      style={{
        opacity: o,
        transform: `translateX(${tx}px)`,
        backgroundColor: "#fff",
        borderRadius: 6,
        padding: "8px 12px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        border: `1px solid #e5e7eb`,
        width: 420,
      }}
    >
      {children}
    </div>
  );
};

export const S1_TheProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Tagline fades up after vignettes
  const taglineOpacity = interpolate(frame, [95, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineY = interpolate(frame, [95, 110], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Black bg fades in before tagline
  const blackBg = interpolate(frame, [82, 92], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cursor blink for slack message
  const cursorVisible = Math.floor(frame / 12) % 2 === 0;

  return (
    <SceneWrap durationInFrames={DUR}>
      <AbsoluteFill style={{ backgroundColor: C.paper }}>
        {/* Vignettes stacked vertically, centered */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            alignItems: "center",
          }}
        >
          {/* 1: Slack message */}
          <Vignette startFrame={5} holdFrames={18}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  backgroundColor: "#4A154B",
                  flexShrink: 0,
                }}
              />
              <div style={{ fontFamily: F.body, fontSize: 10, color: "#374151" }}>
                <span style={{ fontWeight: 600 }}>#design-feedback</span>
                <div style={{ marginTop: 2, color: "#6b7280" }}>
                  hey the thing on the dashboard where the…
                  {cursorVisible && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 1.5,
                        height: 11,
                        backgroundColor: "#374151",
                        marginLeft: 1,
                        verticalAlign: "text-bottom",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </Vignette>

          {/* 2: Loom thumbnail with red circle */}
          <Vignette startFrame={25} holdFrames={18}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 80,
                  height: 48,
                  backgroundColor: "#0f0f0f",
                  borderRadius: 4,
                  position: "relative",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    backgroundColor: "#7c3aed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: "6px solid white",
                      borderTop: "4px solid transparent",
                      borderBottom: "4px solid transparent",
                      marginLeft: 2,
                    }}
                  />
                </div>
                {/* Bad red circle */}
                <div
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 10,
                    width: 30,
                    height: 22,
                    border: "2px solid #ef4444",
                    borderRadius: "50%",
                    transform: "rotate(-8deg)",
                  }}
                />
              </div>
              <div style={{ fontFamily: F.body, fontSize: 9, color: "#6b7280" }}>
                "uh, this part, like, right here…"
              </div>
            </div>
          </Vignette>

          {/* 3: Linear ticket */}
          <Vignette startFrame={45} holdFrames={18}>
            <div style={{ fontFamily: F.body }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: "#f59e0b",
                  }}
                />
                <span style={{ fontSize: 10, fontWeight: 600, color: C.ink }}>
                  fix the card thing
                </span>
                <span
                  style={{
                    fontSize: 7,
                    fontFamily: F.mono,
                    color: "#9ca3af",
                    marginLeft: "auto",
                  }}
                >
                  APP-127
                </span>
              </div>
              <div style={{ fontSize: 8, color: "#9ca3af" }}>
                No description provided
              </div>
            </div>
          </Vignette>

          {/* 4: Google Doc with pasted screenshot */}
          <Vignette startFrame={65} holdFrames={18}>
            <div style={{ fontFamily: F.body }}>
              <div
                style={{
                  fontSize: 8,
                  color: "#9ca3af",
                  marginBottom: 4,
                  fontFamily: F.mono,
                }}
              >
                Untitled document
              </div>
              <div
                style={{
                  height: 36,
                  backgroundColor: "#f3f4f6",
                  borderRadius: 3,
                  position: "relative",
                }}
              >
                {/* Arrow pointing vaguely */}
                <svg
                  width="60"
                  height="36"
                  viewBox="0 0 60 36"
                  style={{ position: "absolute", top: 0, left: 30 }}
                >
                  <path
                    d="M5 30 Q 20 5, 50 12"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="48,8 52,14 46,13"
                    fill="#ef4444"
                  />
                </svg>
              </div>
            </div>
          </Vignette>
        </div>

        {/* Black overlay + tagline */}
        {blackBg > 0 && (
          <AbsoluteFill style={{ backgroundColor: C.ink, opacity: blackBg }}>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, calc(-50% + ${taglineY}px))`,
                opacity: taglineOpacity,
                fontFamily: F.display,
                fontSize: 20,
                fontStyle: "italic",
                color: C.gold,
                textAlign: "center",
                lineHeight: 1.4,
                maxWidth: 500,
                textShadow: `0 0 40px ${C.gold}30`,
              }}
            >
              There's a better way to say what's wrong.
            </div>
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    </SceneWrap>
  );
};
