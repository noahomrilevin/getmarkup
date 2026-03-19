import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  random,
} from "remotion";
import { C, F } from "../theme";
import { SceneWrap } from "../components/SceneWrap";

const DUR = 180;

/** Comparison grid */
const ComparisonGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tools = [
    { name: "Jam.dev", localhost: false, visual: true, ai: false },
    { name: "BugHerd", localhost: false, visual: true, ai: false },
    { name: "Loom", localhost: true, visual: false, ai: false },
    { name: "Markup", localhost: true, visual: true, ai: true, highlight: true },
  ];
  const cols = ["Works on localhost?", "Visual annotation?", "AI-ready output?"];

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <div style={{ fontFamily: F.body }}>
        {/* Header row */}
        <div style={{ display: "flex", marginBottom: 6 }}>
          <div style={{ width: 100 }} />
          {cols.map((c, ci) => {
            const a = spring({ frame: frame - ci * 6, fps, config: { damping: 14, stiffness: 100 } });
            return (
              <div
                key={c}
                style={{
                  width: 130,
                  fontSize: 8,
                  fontWeight: 600,
                  color: C.slate,
                  textAlign: "center",
                  opacity: a,
                  fontFamily: F.mono,
                  letterSpacing: "0.02em",
                }}
              >
                {c}
              </div>
            );
          })}
        </div>

        {/* Rows */}
        {tools.map((tool, ri) => (
          <div
            key={tool.name}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 4,
              backgroundColor: tool.highlight ? `${C.gold}12` : "#fff",
              borderRadius: 5,
              padding: "6px 0",
              border: tool.highlight ? `1px solid ${C.gold}40` : "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                width: 100,
                paddingLeft: 10,
                fontSize: 10,
                fontWeight: tool.highlight ? 700 : 400,
                color: tool.highlight ? C.ink : "#374151",
                fontFamily: tool.highlight ? F.display : F.body,
              }}
            >
              {tool.name}
            </div>
            {[tool.localhost, tool.visual, tool.ai].map((val, ci) => {
              const cellDelay = ri * 8 + ci * 4 + 10;
              const a = spring({ frame: frame - cellDelay, fps, config: { damping: 12, stiffness: 120 } });
              return (
                <div
                  key={ci}
                  style={{
                    width: 130,
                    textAlign: "center",
                    fontSize: 14,
                    opacity: a,
                    transform: `scale(${interpolate(a, [0, 1], [0.5, 1])})`,
                  }}
                >
                  {val ? (
                    <span style={{ color: tool.highlight ? C.gold : "#22c55e" }}>✓</span>
                  ) : (
                    <span style={{ color: "#d1d5db" }}>✗</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Lifestyle vignette — atmospheric frame */
const LifeVignette: React.FC<{
  label: string;
  detail: string;
  gradient: string;
}> = ({ label, detail, gradient }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div
        style={{
          width: "100%",
          height: "100%",
          background: gradient,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {/* Laptop silhouette with sidebar glow */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: 240,
              height: 150,
              borderRadius: "5px 5px 0 0",
              backgroundColor: "#1a1a1a",
              border: "1.5px solid #2a2a2a",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", height: "100%" }}>
              <div style={{ flex: 2, backgroundColor: "#111827", opacity: 0.5 }} />
              <div
                style={{
                  flex: 1,
                  backgroundColor: C.paper,
                  opacity: 0.4,
                  borderLeft: `1px solid ${C.gold}30`,
                }}
              >
                <div style={{ padding: 4 }}>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        height: 8,
                        backgroundColor: "#fff",
                        borderRadius: 2,
                        marginBottom: 3,
                        opacity: 0.3,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              width: 260,
              height: 6,
              backgroundColor: "#1a1a1a",
              borderRadius: "0 0 3px 3px",
              marginLeft: -10,
              border: "1px solid #2a2a2a",
              borderTop: "none",
            }}
          />
        </div>

        <div style={{ fontFamily: F.body, fontSize: 11, color: "#ffffff80", textAlign: "center" }}>
          {label}
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 8, color: "#ffffff40" }}>
          {detail}
        </div>

        {/* Film grain + vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse, transparent 30%, rgba(0,0,0,0.5) 100%)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/** Feature pills */
const FeaturePills: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pills = [
    "Voice Notes",
    "Element Selection",
    "Severity Sorting",
    "Screenshot Capture",
    "PDF Export",
    "Works on localhost",
    "Simple + Dev Mode",
  ];

  // Final positions — clustered center
  const positions = [
    { x: 200, y: 260 },
    { x: 380, y: 220 },
    { x: 580, y: 250 },
    { x: 160, y: 340 },
    { x: 420, y: 320 },
    { x: 650, y: 310 },
    { x: 830, y: 270 },
  ];

  // Start positions — from edges
  const starts = [
    { x: -100, y: 260 },
    { x: 380, y: -40 },
    { x: 1180, y: 250 },
    { x: -100, y: 340 },
    { x: 420, y: 740 },
    { x: 1180, y: 310 },
    { x: 830, y: -40 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      {pills.map((pill, i) => {
        const delay = i * 6;
        const a = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 60 } });
        const x = interpolate(a, [0, 1], [starts[i].x, positions[i].x]);
        const y = interpolate(a, [0, 1], [starts[i].y, positions[i].y]);

        return (
          <div
            key={pill}
            style={{
              position: "absolute",
              left: x,
              top: y,
              fontFamily: F.body,
              fontSize: 10,
              fontWeight: 500,
              color: C.ink,
              padding: "5px 14px",
              borderRadius: 20,
              border: `1.5px solid ${C.gold}`,
              backgroundColor: "#fff",
              boxShadow: `0 2px 8px ${C.gold}15`,
              whiteSpace: "nowrap",
              opacity: a,
            }}
          >
            {pill}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const S7_Differentiator: React.FC = () => {
  return (
    <SceneWrap durationInFrames={DUR}>
      <AbsoluteFill style={{ backgroundColor: C.paper }}>
        {/* (a) Comparison grid — 0-70 */}
        <Sequence from={0} durationInFrames={70}>
          <ComparisonGrid />
        </Sequence>

        {/* (b) Lifestyle vignettes — 70-130, ~20 frames each */}
        <Sequence from={70} durationInFrames={20}>
          <LifeVignette
            label="Building in flow"
            detail="Morning light. One hand on trackpad."
            gradient="radial-gradient(ellipse at 30% 40%, #3d2e1e 0%, #0d0a07 100%)"
          />
        </Sequence>
        <Sequence from={90} durationInFrames={20}>
          <LifeVignette
            label="Annotating anywhere"
            detail="Portfolio review. The tool just works."
            gradient="radial-gradient(ellipse at 60% 50%, #2a2520 0%, #0a0908 100%)"
          />
        </Sequence>
        <Sequence from={110} durationInFrames={20}>
          <LifeVignette
            label="Reviewing your own craft"
            detail="127.0.0.1 · Late night. Attention to detail."
            gradient="radial-gradient(ellipse at 50% 40%, #0f1729 0%, #050508 100%)"
          />
        </Sequence>

        {/* (c) Feature pills — 130-180 */}
        <Sequence from={130} durationInFrames={50}>
          <FeaturePills />
        </Sequence>
      </AbsoluteFill>
    </SceneWrap>
  );
};
