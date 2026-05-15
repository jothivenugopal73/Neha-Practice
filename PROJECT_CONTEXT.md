# ExamGenius — Project Context
## Last Updated: 07-May-2026

---

## What We Built
A single-file HTML AI-powered exam prep tool. Started as Neha's AP Precalculus practice app, now being expanded into a multi-subject exam prep product.

**Live URL:** https://nehapractice.netlify.app  
**GitHub:** https://github.com/jothivenugopal73/Neha-Practice  
**Local folder:** C:\Claude CoWork\Projects\Neha_Subject_Guru  
**Deploy:** Double-click deploy.ps1 → auto-pushes to GitHub → Netlify live in 30s

---

## Current Stack
- Single HTML file (index.html) — no framework, no build step
- Anthropic Claude API (claude-sonnet-4-5-20250929) called directly from browser
- KaTeX (CDN) for math rendering
- Netlify for hosting
- GitHub for version control

---

## What's Working (Confirmed Live)
- ✅ AI question generation (10 questions, AP Precalc Units 6 & 7)
- ✅ Two-pass answer verification (second Claude call independently checks every answer)
- ✅ KaTeX math rendering (proper LaTeX notation)
- ✅ Manage Units panel (add/edit/delete syllabus topics, no code needed)
- ✅ Difficulty filter (Easy / Medium / Hard / Mixed)
- ✅ Question count selector (5 / 10 / 15 / 20)
- ✅ Live score tracking
- ✅ API key saved in localStorage (one-time setup)
- ✅ Deploy pipeline (deploy.ps1 → GitHub → Netlify)

---

## Architecture Decisions (Important)

### Two-Pass Verification
- Pass 1: Claude generates N questions as JSON
- Pass 2: Second Claude call solves every question from scratch WITHOUT being told the labeled answer
- Reconciliation: agree = show, disagree = auto-correct, can't resolve = drop
- This is a key differentiator — no other free tool does this

### Prompt Design
- Generation prompt: AP exam style, 7 question archetypes, distractor rules (named errors), LaTeX formatting
- Verification prompt: minimal/lean — just question + choices + labeled answer index
- max_tokens = count * 450 + 500 (scales with question count — critical fix)

### Data Model
Units stored in localStorage as:
```json
[
  {
    "id": "u6",
    "btnLabel": "Unit 6",
    "header": "AP Precalculus Unit 6 — Trigonometric and Polar Functions.",
    "topics": "6.1 Periodic Phenomena — period, f(x + period) = f(x)\n6.2 ..."
  }
]
```
The topics string feeds directly into the prompt preserving the exact AP syllabus format.

### Key Bugs Fixed (Don't Re-introduce)
1. max_tokens too low → JSON cut off mid-array → fixed to count * 450 + 500
2. Unescaped apostrophe in JS string → crashed entire script → use HTML entities
3. file:// security block → solved by hosting on Netlify (not opening locally)
4. Wrong model name → claude-sonnet-4-5-20250929 is correct
5. ans as string instead of int → sanitizeQuestion() coerces all fields
6. response_format: json_object not supported by Anthropic → excluded for Anthropic provider

---

## Product Vision (Next Phase)

### The Product: ExamGenius
A universal AI-powered exam prep tool — any subject, any exam format, verified answers.

### Phase 2 Features (Priority Order)
1. **Multi-subject support** — Subject selector (Math, English, Biology, History...)
2. **Custom exam patterns** — User specifies "AP style", "SAT style", "IB", "GCSE" etc.
3. **Per-subject system prompts** — Currently hardcoded for AP Precalc; needs to be data-driven
4. **Progress tracking** — Per-topic weak area detection (localStorage)
5. **Spaced repetition** — Wrong questions come back more often
6. **Exam simulation mode** — Timed, no feedback until end, full exam length
7. **Bookmark questions** — Save good/hard questions to a review deck
8. **Landing page** — Proper product page, not just the app
9. **Monetization** — Tutoring centers, parents, international students (SAT/IB/AP)

### Multi-Subject Architecture Plan
- Add Subject layer above Units
- Subject has: name, exam_type, system_prompt_template, units[]
- exam_type drives the question style instructions (AP vs SAT vs IB vs custom)
- User can create entirely custom subjects ("My Biology Exam", "Company Onboarding Quiz")
- All stored in localStorage, no server needed

---

## Files in Repo
```
C:\Claude CoWork\Projects\Neha_Subject_Guru\
├── index.html     ← entire app (single file)
├── README.md      ← project documentation
├── .gitignore
└── deploy.ps1     ← double-click to deploy
```

---

## Current AP Precalc Syllabus (in the app)

### Unit 6 — Trigonometric and Polar Functions
- 6.1 Periodic Phenomena — period, f(x + period) = f(x)
- 6.2 Sine, Cosine, Tangent — unit circle, quadrants, CAST rule
- 6.3 Radian Measure — arc length s=rθ, coterminal angles
- 6.4 Sine and Cosine Values — exact values at standard angles, reducing large angles
- 6.5 Graphs of Sine and Cosine — amplitude, midline, range
- 6.6 Sinusoidal Transformations — phase shift, period from b, vertical shift
- 6.7 Sinusoidal Context & Modeling — interpreting a, b, c, d in real-world context

### Unit 7 — Trigonometric Equations and Identities
- 7.1 The Tangent Function — period, asymptotes, slope of terminal ray
- 7.2 Inverse Trig Functions — arcsin, arccos, arctan ranges, solving equations
- 7.3–7.4 Trig Equations and Inequalities — solving in [0, 2π]
- 7.5 Sec, Csc, Cot — reciprocal identities
- 7.6–7.7 Trigonometric Identities — Pythagorean identities

---

## API Details
- Provider: Anthropic
- Model: claude-sonnet-4-5-20250929
- Endpoint: https://api.anthropic.com/v1/messages
- Header: anthropic-dangerous-direct-browser-access: true (required for browser calls)
- API key stored in: localStorage key 'nehaPrecalc_apiKey'

---

## Notes for Fresh Chat
- Start from index.html (the working file) as the base
- The two-pass verification and AP prompt quality are non-negotiable — keep them
- Multi-subject is the biggest architectural change — plan it carefully before coding
- The deploy pipeline is solid — any changes go through deploy.ps1
- Product name idea: ExamGenius (or brainstorm better)
