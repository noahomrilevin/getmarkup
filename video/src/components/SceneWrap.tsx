import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Wraps a scene with spring-based fade+scale in/out transitions.
 * In:  scale 0.95→1, opacity 0→1 over first 15 frames
 * Out: scale 1→0.95, opacity 1→0 over last 15 frames
 */
export const SceneWrap: React.FC<{
  children: React.ReactNode;
  durationInFrames: number;
}> = ({ children, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = spring({ frame, fps, config: { damping: 20, stiffness: 120 } });
  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const o = Math.min(fadeIn, fadeOut);
  const s = interpolate(o, [0, 1], [0.95, 1]);

  return (
    <AbsoluteFill
      style={{
        opacity: o,
        transform: `scale(${s})`,
        transformOrigin: "center",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
