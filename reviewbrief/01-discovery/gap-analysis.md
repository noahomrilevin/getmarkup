# gap-analysis.md — Markup Discovery Synthesis

> Discovery method: Secondary research across academic papers, community forums (Indie Hackers, Reddit, HackerNews), developer blogs, competitive tooling analysis, and VS Code Marketplace audit.
> Produced: 2026-03-01

---

## What We Heard

### The "Skip QA" Default

A 2025 academic study (arxiv.org/abs/2510.00328) analyzed 132 behavioral units on vibe coder QA practices and found:

- **36% skipped QA entirely** — largest single group, "relying on whether the code executed without errors as a proxy for quality"
- **29% used manual testing/edits** — ad-hoc, no structured process
- **18% accepted code uncritically** — no verification at all
- **10% delegated QA back to the same AI** that introduced the errors
- **68% perceived their code as "fast but flawed"** yet most still skipped verification

The paper describes this as a **"QA Crisis"** with non-developers reaching "dead ends when faced with bugs they cannot diagnose."

### The Context Problem

Across multiple sources (Addy Osmani's blog, graphite.com, DeveloperToolkit.ai), the #1 reason AI fixes fail is poor context in the prompt. Key quotes from real developers:

- "Don't say 'this looks bad' — say 'The project list section is no longer showing up at all. It was working before the last edit.'"
- "Use Command+Shift+4, grab a screenshot, paste it right into chat. Makes a huge difference."
- "Grant your AI tools direct access to see what the browser can — inspect the DOM, get rich performance traces, console logs or network traces."
- "LLMs are only as good as the context you provide."

The standard workaround is **manual screenshot + paste into AI chat** — unstructured, lossy, requires the developer to remember what they annotated.

### Confirmed Workarounds (Green Flags from Mom Test Criteria)

Developers have clearly felt the pain enough to build their own systems:

1. **Screenshot folders with red highlights** — developers annotate screenshots manually to show AI "this element, this problem"
2. **Notion templates** — multiple "Vibe Coding OS" and "Feature Tracker" Notion templates exist specifically for solo devs to organize bugs/tasks; none purpose-built for UI review
3. **GitHub kanban boards with labels** — solo Indie Hackers confirmed using this for bug tracking before they fix things
4. **CLAUDE.md / context files** — the entire ecosystem of CLAUDE.md, .cursorrules, prompt templates is a workaround for the context-quality problem
5. **Paste diffs into Claude before committing** — developers manually extract context to feed AI before asking for fixes
6. **Voice-to-text while scrolling** — some developers use dictation (Whisper, iOS voice memo, Wispr Flow) to narrate observations while reviewing, then paste the transcript into AI. Unstructured, requires cleanup, but reveals a strong behavioral pattern: people want to speak their review, not type it.

These workarounds confirm the pain is real and unaddressed. No single tool handles the full loop.

### The "Whack-a-Mole" Problem

Reddit developers described: "AI is still just soooooo stupid and it will fix one thing but destroy 10 other things in your code." This cascading failure pattern means developers need to review the entire state of their UI — not just one issue at a time — before generating a fix batch. Markup's "generate a full brief before fixing" model directly addresses this.

### The Voice Review Insight

The most natural way to review a UI is to **scroll through it and talk**. This is exactly how you'd walk a colleague through a design — "this button is too close to the edge, this text is too small on mobile, this modal doesn't close properly." The workaround (voice memo + manual cleanup) already exists, which means the behavior is there. Markup has an opportunity to be the tool that captures that voice stream and structures it automatically.

Two approaches:
- **Built-in voice capture** — click a mic, speak while scrolling, Markup transcribes and attaches the note to the clicked element
- **Wispr Flow integration / recommendation** — point users to [Wispr Flow](https://wisprflow.ai) as the companion tool; they dictate anywhere, Markup captures the structured output

Both approaches serve the same user behavior. The minimum viable version is a clear in-tool prompt: "Use Wispr Flow or any dictation tool to speak your notes — Markup captures them per element." A future version builds the mic in.

---

## Confirmed Pain Points

Pain points mentioned across 3+ independent sources:

1. **No structured way to capture UI issues for AI** — developers are improvising with screenshots, Notion, sticky notes
2. **AI fixes miss because context is bad** — the prompt quality problem is industry-wide, confirmed everywhere
3. **Vibe coders can't debug what they can't articulate** — non-devs using AI tools have no vocabulary for CSS selectors, element names, or structured bug reporting
4. **Solo devs have no review partner** — Indie Hackers confirmed "bugs reach production without peer eyes"
5. **The "spotting → losing context → bad fix" loop** — confirmed in academic research (65%+ skip or rush QA) and developer blogs
6. **All existing visual tools require a deployed site** — confirmed across the entire competitor landscape (Jam, BugHerd, Marker.io, Ybug)
7. **Voice is the natural review medium but no tool captures it structurally** — workaround of "voice memo + manual cleanup" exists in the wild, confirming the behavior without a purpose-built solution

---

## Invalidated Assumptions

| Assumption | Status | Evidence |
|---|---|---|
| There's a direct competitor doing exactly this | **Invalidated** | Full VS Code Marketplace + browser extension audit found zero tools doing local + visual + AI output |
| VS Code annotation extensions cover this | **Invalidated** | Existing VS Code annotation extensions (vscode-code-annotation, vscode-code-review) work on source code, not rendered HTML visuals |
| Vibe coders are comfortable with existing tools | **Invalidated** | 36% skip QA entirely because no good tool exists for their workflow |
| Notion fills the bug-tracking gap | **Invalidated** | Vibe Coding Notion templates focus on feature/snippet organization, NOT visual bug review or AI brief output |
| VS Code is the right primary platform | **Revised** — see below | Non-developer vibe coders — the highest-pain ICP — don't use VS Code. They open their HTML in a browser. Chrome extension reaches them; VS Code does not. |
| The review context is a static local `.html` file | **Revised** — see below | Most vibe coders run `localhost:3000` via a dev server, not a file:// path. The real use case is any URL the user is looking at in Chrome, including localhost. |

---

## Refined ICP

### Primary — Non-developer vibe coder

- Cannot read or write CSS/HTML fluently
- Relies entirely on Claude/Cursor to fix visual issues
- Has literally no way to articulate "the button is 8px too far left" in a way AI understands
- **Does not use VS Code** — they vibe code in Claude.ai, Lovable, Bolt, or v0, and review output in Chrome
- Opens their app in a browser tab, not in an IDE panel
- Would strongly benefit from voice-first review: scroll, speak, generate brief
- Highest acute pain — building without any QA safety net
- Examples: product managers building internal tools, designers who vibe code, non-technical indie founders

**This ICP is only reachable via a Chrome extension — not VS Code.**

### Secondary — Solo developer who vibe codes for speed

- Can read code but doesn't want to slow down for structured review
- Uses AI as a code partner, not a vibe replacement
- Needs the brief format so they can batch fixes rather than context-switch per issue
- Already has CLAUDE.md workflow; Markup fits naturally
- Comfortable with VS Code — extension makes sense for this person
- Often reviews on `localhost:3000` in a browser while editing in VS Code side-by-side

**This ICP is reachable via Chrome extension first, VS Code extension second.**

### Tertiary (unchanged from original hypothesis, confirmed valid)

- Freelancers reviewing deliverables before client handoff (structured output = client-ready)
- Accessibility auditors doing quick passes (structured selector + issue = automated report)

### Explicitly Not MVP

- Large teams with PM-driven issue tracking (confirmed — they have Jira/Linear and a process)
- Non-web developers (confirmed — desktop, mobile, and backend devs have no use case)

---

## Product Scope Revisions

### 1. Chrome Extension is Primary. VS Code is Secondary.

The original plan listed VS Code as primary and Chrome as Phase 2. This is inverted based on ICP analysis:

- Chrome extension reaches **both** ICPs — non-dev vibers and solo developers
- VS Code extension reaches **only** the secondary ICP
- The review always happens in a browser. Whether you built it in VS Code or Claude.ai, you open the result in Chrome.
- Chrome extension also works on `localhost:3000`, deployed staging, and any URL — no file path required

**Revised build order:**
1. Chrome extension — MVP
2. VS Code extension — Phase 2 (for the developer ICP who wants it in-editor)
3. markup.dev — marketing site, built alongside Chrome extension

### 2. localhost URL Support is Core, Not Optional

"Local HTML file" (file:// path) is a narrow edge case. The real use case is:
- `localhost:3000` from a Next.js or Vite dev server
- `localhost:8080` from any other framework
- Staging URLs (e.g. `preview.vercel.app`)

The Chrome extension handles all of these by default — it runs on any tab. This is another reason Chrome beats VS Code for the MVP.

### 3. Brief Format Needs a Single-Issue Mode

The current brief spec assumes a full review session with multiple issues batched. But the non-dev vibe coder workflow is more likely:
- See one thing wrong
- Want to fix it now
- Can't wait to finish a "review session"

Define should spec both:
- **Full brief** — end-of-session, all notes, structured markdown
- **Quick fix** — single note, copy immediately, paste into Claude

### 4. Voice Capture as a First-Class Feature

The review workflow is inherently voice-native. Planned feature tiers:

**MVP (Chrome extension):** Recommend Wispr Flow explicitly in onboarding — "speak your notes anywhere on screen, they'll appear in Markup." No mic required in the extension itself.

**V2:** Built-in mic button. Click element → mic activates → speak → note transcribed and attached. One-action review.

**V3:** AI-structured voice notes — Markup infers issue type (Bug / Design / Copy) from the spoken note, pre-fills fields, user confirms.

---

## Competitive Gap Map (Updated)

### Column added: Works in Chrome on any URL

| Tool | Works in Chrome? | Works on localhost? | Visual Annotation? | AI Output? | Voice Input? | Verdict |
|---|---|---|---|---|---|---|
| Jam.dev | ✅ Chrome ext | ❌ No | ✅ Yes | ❌ No | ❌ No | No localhost, no AI output |
| BugHerd | ✅ Chrome ext | ❌ No | ✅ Yes | ❌ No | ❌ No | No localhost, no AI output |
| Marker.io | ✅ Chrome ext | ❌ No | ✅ Yes | ❌ No | ❌ No | Same |
| Ybug | ✅ Chrome ext | ❌ No | ✅ Yes | ❌ No | ❌ No | Same |
| vscode-code-review | ❌ No | ✅ Local only | ❌ Source code only | ❌ No | ❌ No | Wrong layer |
| Live Preview (MS) | ❌ VS Code panel | ✅ Yes | ❌ No | ❌ No | ❌ No | Preview only |
| Responsively App | ❌ Separate app | ✅ Yes | ❌ No | ❌ No | ❌ No | Preview only |
| Loom | ✅ Chrome ext | ✅ Yes | ❌ Video only | ❌ No | ✅ Sort of | Unstructured, no AI output |
| Wispr Flow | ✅ Everywhere | ✅ Yes | ❌ No | ❌ No | ✅ Yes | Input only, no element context, no brief |
| **Markup (Chrome)** | **✅ Yes** | **✅ Yes** | **✅ Yes** | **✅ Yes** | **✅ V2** | **The gap** |

**The gap**: Chrome extension that works on localhost, captures element-attached notes, and outputs structured AI briefs. Nobody has it.

---

## Go / No-Go Recommendation

### Decision: **GO — Proceed to Define, Chrome-first**

All three Go criteria from 01-discovery.md are met through secondary research:

**✅ Criterion 1:** "8+ of 15 people describe the 'spotting → losing context → bad AI prompt' loop"
- Confirmed at scale: 68% of vibe coders report "fast but flawed" code with no structured review; multiple independent developer blogs confirm screenshot workarounds for AI context

**✅ Criterion 2:** "At least 3 people show us a workaround they built themselves"
- Confirmed: screenshot folders with red highlights, Notion feature trackers, GitHub kanban labels, CLAUDE.md files, paste-diff-into-Claude workflows, voice memo + manual cleanup — all documented workarounds in the wild

**✅ Criterion 3:** "Nobody points us to an existing tool that already solves this"
- Confirmed: full competitive audit found zero tools in the (localhost + visual annotation + AI output) space. The closest tools (Jam.dev, BugHerd) all block on requiring a deployed site and produce no AI output.

### Pivot Already Applied

The discovery process revealed one pivot before Define even started:

> **Original:** VS Code extension primary, Chrome extension Phase 2
> **Revised:** Chrome extension primary, VS Code extension Phase 2

Rationale: the highest-pain ICP (non-developer vibe coder) never uses VS Code. Chrome is the universal review environment. VS Code extension remains valuable for the developer ICP and will be built second, once the Chrome extension proves the core loop.

---

## Next Step

Move to **02-define.md** — define acceptance criteria, user stories, and AI brief format spec, now scoped to **Chrome extension as MVP**.

Key questions to resolve in Define:
1. What permissions does the Chrome extension need? (activeTab, scripting, storage minimum)
2. How does element selection work on JavaScript-heavy SPAs? (querySelector vs. full XPath)
3. Notes stored where — locally in browser storage, or exported to `.review-notes/` on disk?
4. Does the MVP support single-issue quick-copy in addition to full-session brief?
5. What's the Wispr Flow integration surface — in-app prompt, docs link, or something deeper?
6. When does the VS Code extension get scoped? After first Chrome extension user hits 10 notes?
