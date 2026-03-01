# 06 — Learn

> Framework: HEART Metrics (Google) · Agile Retrospective · North Star Metric · OKRs  
> Goal: Know if it's working, and what to build next

---

## North Star Metric

**Weekly Active Annotators**

A user who opens ReviewBrief and saves at least one note in a given week.  
This is the metric that matters — not installs, not page views, not stars.

> Installs measure curiosity. Annotations measure adoption.

---

## HEART Metrics (Google Framework)

| Metric | Signal | How to Measure |
|---|---|---|
| **Happiness** | Do users feel the tool helps them? | NPS survey (in-extension prompt after 7 days) |
| **Engagement** | Are they using it regularly? | Weekly Active Annotators (North Star) |
| **Adoption** | Are new users getting started? | % of installs who create first note within 48hrs |
| **Retention** | Do they keep coming back? | % of Week 1 users still active in Week 4 |
| **Task Success** | Can they complete the core loop? | % of sessions that end with a generated brief |

### Targets — V1 (first 90 days)

| Metric | Target |
|---|---|
| Installs | 250 |
| Weekly Active Annotators | 30 |
| Activation (note within 48h) | 40% |
| Retention (W1 → W4) | 25% |
| Task Success (brief generated) | 50% of sessions |
| NPS | > 30 |

---

## OKRs — Quarter 1 Post-Launch

### Objective: Prove ReviewBrief solves a real problem for vibe coders

**KR1:** Reach 250 VS Code Marketplace installs  
**KR2:** Achieve 30 Weekly Active Annotators  
**KR3:** Collect 10 qualitative testimonials from users  
**KR4:** Ship Chrome Extension beta to first 20 testers  

---

### Objective: Establish Noah Levin as the builder behind the tool

**KR1:** Publish 8 build-in-public posts (Twitter + LinkedIn combined)  
**KR2:** reviewbrief.dev reaches 1,000 unique visitors  
**KR3:** GitHub repo reaches 50 stars  
**KR4:** One mention in a newsletter or podcast about vibe coding tools  

---

## Retrospective Template

> Run at the end of every sprint and after the launch month.

```markdown
# Retrospective — [Sprint N / Launch Month]
**Date:** 
**What we shipped:**

## What went well?
(Things to keep doing)
-
-

## What didn't go well?
(Things to stop or fix)
-
-

## What did we learn?
(New understanding about users, the product, or the build process)
-
-

## What will we do differently next sprint?
(Concrete changes, not vague intentions)
-
-

## Backlog updates
(What gets added, reprioritized, or removed based on this retro)
-
-
```

---

## V2 Backlog (Hypotheses, Not Commitments)

Things that might go in V2 depending on what we learn:

| Idea | Hypothesis | Validate by |
|---|---|---|
| Screenshot attached to note | Users want visual proof alongside text | Ask: "Do you screenshot bugs before noting them?" |
| Localhost URL support | Devs with local servers need this | Measure: how many try to enter a URL vs. file path |
| Chrome Extension | Non-VS Code users want same workflow | Measure: interest on Product Hunt / Twitter |
| Brief format customization | Different AI tools want different formats | Ask: "What AI do you paste into and does the format work?" |
| Note priority levels | Users want to separate P1 from nice-to-haves | Measure: do users prefix notes with "urgent" or similar |
| Session history | Users want to review past sessions | Measure: do users re-open the tool to reference old notes |

---

## Listening Posts

Where to watch for signal after launch:

| Source | What to watch for |
|---|---|
| GitHub Issues | Bug patterns, feature requests, user language |
| VS Code Marketplace Reviews | Net sentiment, specific friction |
| Twitter mentions | Organic word-of-mouth, complaints |
| Product Hunt comments | First impressions, comparison to competitors |
| Reddit (r/webdev, r/SideProject) | Honest, unfiltered feedback |
| Direct DMs | Power users with detailed feedback |

---

## The Build-In-Public Content Loop

Every Learn phase feeds the personal brand content:

```
Sprint ends
  → Retro reveals what worked / didn't
    → Post: "Here's what I learned building ReviewBrief this week"
      → Engagement shows what resonates with the audience
        → That insight informs next sprint priorities
          → Repeat
```

Topics that always perform for build-in-public:
- Honest failures ("This sprint didn't ship what I planned, here's why")
- User quotes ("Someone said this and it changed how I think about the product")
- Numbers ("Week 1: 0 installs. Week 4: 87. Here's what changed")
- Process ("How I plan a sprint with one hand using voice and Claude")

That last one — your specific constraint — is a story nobody else can tell.  
It's not a disadvantage. It's the most compelling part of the brand.
