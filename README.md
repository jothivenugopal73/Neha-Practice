# Neha's AP Precalculus Practice

An AI-powered AP Precalculus exam prep app. Generates fresh, verified multiple-choice questions on demand using the Anthropic Claude API. Built as a single HTML file — no framework, no build step, no server required.

---

## Features

- **Fresh questions every session** — never repeats
- **Two-pass AI verification** — a second independent Claude call checks every answer before you see it
- **AP exam authentic** — College Board phrasing, real distractor traps, 7 question archetypes
- **KaTeX math rendering** — proper LaTeX notation just like the real exam paper
- **Manage Units panel** — add, edit, or delete syllabus topics without touching code
- **Difficulty filter** — Easy / Medium / Hard / Mixed
- **Question count** — 5, 10, 15, or 20 per session
- **Live score tracking** — updates after each answer
- **Single HTML file** — deploy anywhere instantly

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/neha-ap-precalc.git
cd neha-ap-precalc
```

### 2. Get an Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up / log in
3. Navigate to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)

### 3. Deploy to Netlify

#### Option A — Netlify Drop (fastest)
1. Go to [netlify.com/drop](https://netlify.com/drop)
2. Drag `index.html` onto the page
3. Get your live URL instantly

#### Option B — Netlify + GitHub (recommended for updates)
1. Push this repo to GitHub
2. Log in to [netlify.com](https://netlify.com)
3. Click **Add new site** → **Import from Git**
4. Select your repo
5. Build settings:
   - Build command: *(leave empty)*
   - Publish directory: `.`
6. Click **Deploy site**

Every `git push` to `main` auto-deploys.

#### Option C — Run locally
```bash
python -m http.server 8080
```
Then open `http://localhost:8080` in your browser.

> ⚠️ Do not open `index.html` directly from the filesystem (`file://`). Browsers block API calls from local files. Use one of the three options above.

### 4. Enter your API key in the app

On first load, paste your Anthropic API key into the banner and click **Save**. It's stored only in your browser's localStorage — never sent anywhere else.

---

## Syllabus Coverage

### Unit 6 — Trigonometric and Polar Functions
| Topic | Content |
|-------|---------|
| 6.1 | Periodic Phenomena — period, f(x + period) = f(x) |
| 6.2 | Sine, Cosine, Tangent — unit circle, quadrants |
| 6.3 | Radian Measure — arc length s=rθ, coterminal angles |
| 6.4 | Sine and Cosine Values — exact values at standard angles |
| 6.5 | Graphs of Sine and Cosine — amplitude, midline, range |
| 6.6 | Sinusoidal Transformations — phase shift, period, vertical shift |
| 6.7 | Sinusoidal Modeling — real-world context, interpreting a, b, c, d |

### Unit 7 — Trigonometric Equations and Identities
| Topic | Content |
|-------|---------|
| 7.1 | The Tangent Function — period, asymptotes |
| 7.2 | Inverse Trig Functions — arcsin, arccos, arctan ranges |
| 7.3–7.4 | Trig Equations and Inequalities — solving in [0, 2π] |
| 7.5 | Sec, Csc, Cot — reciprocal identities |
| 7.6–7.7 | Trigonometric Identities — Pythagorean identities |

---

## How the Two-Pass Verification Works

1. **Pass 1 — Generate:** Claude writes N questions in JSON format following strict AP exam guidelines
2. **Pass 2 — Verify:** A second independent Claude call solves every question from scratch without being told the labeled answer
3. **Reconcile:** Questions where both passes agree are shown. If the verifier finds a different answer, it auto-corrects. If it can't resolve, the question is dropped.

This means Neha only ever sees questions where the answer has been independently confirmed.

---

## Manage Units

Click **Manage Units & Topics** below the controls to:
- **Edit** any unit's header or topic list
- **Add** a new unit with custom topics
- **Delete** units you don't need
- **Reset** to the original Unit 6 & 7 defaults

All changes persist in localStorage and immediately update the unit selector buttons.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | Vanilla HTML + CSS + JS — no framework |
| Math rendering | [KaTeX](https://katex.org) via CDN |
| AI | [Anthropic Claude API](https://docs.anthropic.com) — `claude-sonnet-4-5` |
| Fonts | Lora (serif) + DM Sans via Google Fonts |
| Hosting | Netlify (recommended) |

---

## Project Structure

```
neha-ap-precalc/
├── index.html    ← entire app lives here
└── README.md
```

---

## Roadmap

- [ ] Progress tracking — per-topic weak area detection
- [ ] Spaced repetition — wrong questions come back more often
- [ ] Exam simulation mode — timed, no feedback until end
- [ ] Bookmark questions — save for later review
- [ ] Free response (FRQ) practice mode

---

## License

MIT — free to use, modify, and share.
