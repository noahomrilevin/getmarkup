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
import { Cursor } from "../components/Cursor";

const DUR = 120;

/** Floating gold particle */
const Particle: React.FC<{ id: number }> = ({ id }) => {
  const frame = useCurrentFrame();
  const seed = `p-${id}`;

  const x = 100 + random(seed + "x") * 880;
  const startY = 650 + random(seed + "sy") * 100;
  const speed = 0.3 + random(seed + "sp") * 0.6;
  const size = 1.5 + random(seed + "sz") * 2.5;
  const delay = random(seed + "d") * 40;

  const y = startY - (frame - delay) * speed;
  const opacity = interpolate(
    frame,
    [delay, delay + 15, DUR - 20, DUR],
    [0, 0.6, 0.6, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  if (frame < delay) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: C.gold,
        opacity,
        boxShadow: `0 0 ${size * 2}px ${C.gold}80`,
      }}
    />
  );
};

export const S8_CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logotype fade in
  const logoO = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline
  const tagO = interpolate(frame, [25, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tagY = interpolate(frame, [25, 42], [8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // URL
  const urlO = interpolate(frame, [38, 52], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Chrome Web Store badge — spring scale
  const badgeScale = spring({
    frame: frame - 48,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  // Cursor appears, moves to logotype, clicks
  const cursorX = interpolate(frame, [60, 78], [800, 520], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorY = interpolate(frame, [60, 78], [550, 265], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorO = interpolate(
    frame,
    [60, 68, 88, 95],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Heartbeat pulse on logo at frame 82
  const heartbeat = frame >= 82 && frame <= 97;
  const pulseScale = heartbeat
    ? interpolate(frame, [82, 87, 92, 97], [1, 1.05, 1.02, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  // Final fade to black
  const finalFade = interpolate(frame, [DUR - 15, DUR], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneWrap durationInFrames={DUR}>
      <AbsoluteFill style={{ backgroundColor: C.paper }}>
        {/* Floating particles */}
        {Array.from({ length: 30 }).map((_, i) => (
          <Particle key={i} id={i} />
        ))}

        {/* Center content */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* Logotype */}
          <div
            style={{
              fontFamily: F.display,
              fontSize: 42,
              fontWeight: 700,
              color: C.gold,
              opacity: logoO,
              transform: `scale(${pulseScale})`,
              letterSpacing: "-0.02em",
              textShadow: `0 0 30px ${C.gold}25`,
            }}
          >
            Markup
          </div>

          {/* Tagline */}
          <div
            style={{
              fontFamily: F.body,
              fontSize: 15,
              color: C.ink,
              opacity: tagO,
              transform: `translateY(${tagY}px)`,
              textAlign: "center",
              maxWidth: 440,
              lineHeight: 1.4,
            }}
          >
            Your eyes are the best QA tool you have.
          </div>

          {/* URL */}
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 12,
              color: C.slate,
              opacity: urlO,
              letterSpacing: "0.03em",
            }}
          >
            getmarkup.dev
          </div>

          {/* Chrome Web Store badge */}
          <div
            style={{
              marginTop: 8,
              transform: `scale(${badgeScale})`,
              opacity: badgeScale,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 16px",
                backgroundColor: "#fff",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              {/* Chrome icon placeholder */}
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "conic-gradient(#ea4335 0deg 90deg, #fbbc05 90deg 180deg, #34a853 180deg 270deg, #4285f4 270deg 360deg)",
                }}
              />
              <div>
                <div style={{ fontFamily: F.body, fontSize: 8, fontWeight: 600, color: C.ink }}>
                  Available on the
                </div>
                <div style={{ fontFamily: F.body, fontSize: 10, fontWeight: 700, color: C.ink }}>
                  Chrome Web Store
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cursor */}
        {cursorO > 0 && (
          <Cursor x={cursorX} y={cursorY} opacity={cursorO} color={C.gold} />
        )}

        {/* Final fade to black */}
        {finalFade > 0 && (
          <AbsoluteFill style={{ backgroundColor: C.ink, opacity: finalFade }} />
        )}
      </AbsoluteFill>
    </SceneWrap>
  );
};
