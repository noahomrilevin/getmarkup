import React from "react";
import { AbsoluteFill, Sequence, Audio, staticFile, interpolate, useCurrentFrame } from "remotion";
import { S1_TheProblem } from "./scenes/S1_TheProblem";
import { S2_ExtensionActivate } from "./scenes/S2_ExtensionActivate";
import { S3_SelectAnnotate } from "./scenes/S3_SelectAnnotate";
import { S4_TheFlow } from "./scenes/S4_TheFlow";
import { S5_GenerateBrief } from "./scenes/S5_GenerateBrief";
import { S6_TheHandoff } from "./scenes/S6_TheHandoff";
import { S7_Differentiator } from "./scenes/S7_Differentiator";
import { S8_CTA } from "./scenes/S8_CTA";

/**
 * MARKUP PROMO — 1080x700, 30fps, ~37s (1120 frames)
 *
 * Scene durations:
 *   S1 The Problem        120 frames   4.0s
 *   S2 Extension Activate 150 frames   5.0s
 *   S3 Select & Annotate  160 frames   5.3s
 *   S4 The Flow           130 frames   4.3s
 *   S5 Generate Brief     140 frames   4.7s
 *   S6 The Handoff        120 frames   4.0s
 *   S7 Differentiator     180 frames   6.0s
 *   S8 CTA                120 frames   4.0s
 *   ─────────────────────────────────────
 *   Total                1120 frames  37.3s
 */

const scenes = [
  { C: S1_TheProblem, dur: 120 },
  { C: S2_ExtensionActivate, dur: 150 },
  { C: S3_SelectAnnotate, dur: 160 },
  { C: S4_TheFlow, dur: 130 },
  { C: S5_GenerateBrief, dur: 140 },
  { C: S6_TheHandoff, dur: 120 },
  { C: S7_Differentiator, dur: 180 },
  { C: S8_CTA, dur: 120 },
];

export const TOTAL_FRAMES = scenes.reduce((acc, s) => acc + s.dur, 0); // 1120

export const MarkupPromo: React.FC = () => {
  const frame = useCurrentFrame();

  // Audio volume envelope: 1s fade-in, 2s fade-out, 35% max
  const audioVolume = interpolate(
    frame,
    [0, 30, TOTAL_FRAMES - 60, TOTAL_FRAMES],
    [0, 0.35, 0.35, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  let offset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0D0D0D" }}>
      {scenes.map(({ C: Scene, dur }, i) => {
        const from = offset;
        offset += dur;
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <Scene />
          </Sequence>
        );
      })}

      {/* Background music — drop an ambient piano mp3 at public/music.mp3 */}
      {/* Uncomment when audio file is available:
      <Audio
        src={staticFile("music.mp3")}
        volume={audioVolume}
        startFrom={0}
      />
      */}
    </AbsoluteFill>
  );
};
