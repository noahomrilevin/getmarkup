import React from "react";
import { Composition } from "remotion";
import { MarkupPromo, TOTAL_FRAMES } from "./MarkupPromo";
import { S1_TheProblem } from "./scenes/S1_TheProblem";
import { S2_ExtensionActivate } from "./scenes/S2_ExtensionActivate";
import { S3_SelectAnnotate } from "./scenes/S3_SelectAnnotate";
import { S4_TheFlow } from "./scenes/S4_TheFlow";
import { S5_GenerateBrief } from "./scenes/S5_GenerateBrief";
import { S6_TheHandoff } from "./scenes/S6_TheHandoff";
import { S7_Differentiator } from "./scenes/S7_Differentiator";
import { S8_CTA } from "./scenes/S8_CTA";
import { WIDTH, HEIGHT, FPS } from "./theme";

const shared = { width: WIDTH, height: HEIGHT, fps: FPS };

export const RemotionRoot: React.FC = () => (
  <>
    {/* Full video */}
    <Composition
      id="MarkupPromo"
      component={MarkupPromo}
      durationInFrames={TOTAL_FRAMES}
      {...shared}
    />

    {/* Individual scenes for preview */}
    <Composition id="S1-TheProblem" component={S1_TheProblem} durationInFrames={120} {...shared} />
    <Composition id="S2-ExtensionActivate" component={S2_ExtensionActivate} durationInFrames={150} {...shared} />
    <Composition id="S3-SelectAnnotate" component={S3_SelectAnnotate} durationInFrames={160} {...shared} />
    <Composition id="S4-TheFlow" component={S4_TheFlow} durationInFrames={130} {...shared} />
    <Composition id="S5-GenerateBrief" component={S5_GenerateBrief} durationInFrames={140} {...shared} />
    <Composition id="S6-TheHandoff" component={S6_TheHandoff} durationInFrames={120} {...shared} />
    <Composition id="S7-Differentiator" component={S7_Differentiator} durationInFrames={180} {...shared} />
    <Composition id="S8-CTA" component={S8_CTA} durationInFrames={120} {...shared} />
  </>
);
