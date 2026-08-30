# VYOM-Guard — Corrected Front-End Design Prompt
**AI-Powered Component Burn-In & Screening Intelligence**
**Tagline: "Detect. Predict. Protect."**

> This version is aligned to the ACTUAL working prototype (robust-statistics outlier detection + Gradient Boosting drift prediction on real synthetic burn-in data). Every number, model name, and capability below is something the team can actually demonstrate and defend under panel questioning. Do not add capabilities beyond this spec without checking they're actually built.

---

## VISUAL DIRECTION (unchanged — this part was strong)

Premium **light** aerospace theme. White primary background, ice-blue sections, deep navy text, saffron/orange as a subtle Indian aerospace accent, teal/green for healthy states, amber for warnings, red only for high-risk states. Inspired by mission operations and scientific instrumentation — not a generic SaaS dashboard, not cyberpunk, no neon, no cartoon rockets.

Typography: modern sans-serif, large confident headings, a distinct monospace/data font for numbers (e.g. IBM Plex Mono or similar).

Cards: large rounded corners, subtle shadows, thin borders, generous whitespace.

Charts: clean engineering-style line charts, thin lines, clear axes, threshold lines, actual-vs-predicted overlays, anomaly markers — this maps directly to the real drift trajectory chart already built.

---

## GLOBAL NAVIGATION

Left nav rail. Logo: **VYOM-Guard** / subtitle: **Component Reliability Intelligence**

Navigation (trimmed to real functionality):
- 🏠 Mission Control
- 🧪 Screening Dataset
- 🧩 Component Grid
- 🤖 AI Analysis
- 📈 Drift Prediction
- ⚠ Risk & Explainability
- 📊 Static vs AI Comparison
- 📑 Report Export
- ⚙ Settings

Top bar: search, system status ("DEMO MODE — SYNTHETIC DATA"), notifications, profile.

**Important: the status badge must say "DEMO MODE — SYNTHETIC DATA," not "SYSTEM ONLINE" / "LIVE."** This is honest labeling, not a weakness — it pre-empts the "is this real data" question before a judge even asks it.

---

## PAGE 1 — MISSION CONTROL (hero dashboard)

Title: **Mission Control**
Subtitle: "Statistical and ML-driven screening intelligence for component burn-in testing."

**Headline comparison block (lead with this — your strongest evidence):**
- Static-limit screening: **7.7% recall** — misses 8/8 latent defects in test set
- VYOM-Guard combined system: **100% recall** — 0 false negatives
- Side-by-side bar visualization, exactly as already built in the dashboard

**Live metrics (use REAL numbers):**
- Components screened: **600**
- Lots monitored: **15**
- Combined recall (catch-rate): **100%**
- Precision: **81.3%**
- Drift prediction MAE: **0.57 µA**

**Component Risk Map:** grid of ~60 sampled components, colored by real classification:
- 🟢 Normal (pass)
- 🟠 Module A flag (lot-relative outlier at 0h)
- 🔵 Module B flag (predicted drift exceeds safety slope)

Clicking a cell shows its real reasoning (0h/24h/168h values, lot median, z-score or predicted rate vs safety slope) — this already exists, just needs the visual polish.

**AI Insight card:**
"Component [X] shows a statistically abnormal deviation from its lot baseline / a predicted drift trajectory exceeding the safety threshold." — Confidence expressed as the actual z-score or drift-rate margin, NOT an invented percentage like "93%" unless it's a real model output.

---

## PAGE 2 — SCREENING DATASET

Title: **Screening Dataset**

Real numbers only:
- Total records: **600 components**
- Lots: **15**
- Normal: **555** | Obvious outliers: **15** | Latent defects: **30**
- Timepoints: 0h, 24h, 96h, 168h
- Note clearly: **"Synthetic dataset generated to match ISRO's problem-statement example (10µA lot average, 45µA outlier, 50µA datasheet ceiling). Schema is compatible with real burn-in data for direct drop-in replacement."**

Do NOT include a generic "data quality score" or "missing values" panel unless you actually compute and display real numbers for those — an invented "96%" is exactly the kind of unverifiable claim that invites hard follow-up questions.

---

## PAGE 3 — COMPONENT GRID (this is your existing dashboard's chamber view)

Same interactive grid already built — port it into this visual theme. Keep the click-to-explain interaction; it's your strongest live-demo moment.

---

## PAGE 4 — AI ANALYSIS

Title: **AI Analysis Engine**

### Module A — Dynamic Outlier Detection
**Method: Robust Z-Score (Median + MAD)** — not Isolation Forest, unless you actually add it as a second model.
- Explain in one line: flags components relative to their own lot's statistics, not a fixed global limit
- Show the real threshold: modified z-score > 3.5
- Visualize: scatter of lot values with flagged points highlighted

### Module B — Time-Series Drift Predictor
**Method: Gradient Boosting Regressor** — not LSTM, unless actually retrained as one.
- Input: Value_0h, Value_24h → Output: predicted Value_168h
- Real MAE: **0.57 µA** (vs. 4.6 µA for a naive baseline extrapolation — show this comparison, it's a genuinely good story)
- Flag logic: predicted drift rate vs. lot-derived safety slope

---

## PAGE 5 — DRIFT PREDICTION

Title: **Drift Forecast**

Use the real drift trajectory chart already built: three example components (normal, obvious outlier, latent defect) plotted across 0h→24h→96h→168h, with the 50µA datasheet ceiling as a reference line.

Do NOT include an "hours to threshold" countdown unless the model actually predicts a continuous time-to-failure — right now it predicts a fixed 168h value, which is a different (and equally valid) forecasting target. State what it actually does.

---

## PAGE 6 — RISK & EXPLAINABILITY

Title: **Risk & Explainability**

For a selected component, show:
- Classification: Normal / Module A Flag / Module B Flag
- The real contributing numbers: observed value, lot median, z-score OR predicted rate vs safety slope
- Plain-language explanation (already generated by your `explain_flag()` function) — this is your actual explainability output, use it verbatim, don't reword it into vaguer marketing language

Skip invented percentage breakdowns ("Temperature 40%, Electrical instability 30%...") unless you can compute real per-feature contributions (e.g., via feature importances from the Gradient Boosting model, which you CAN actually pull and would strengthen this section honestly).

---

## PAGE 7 — STATIC VS AI COMPARISON

Title: **Why This Matters**

This is your single best evidence page — dedicate a full page to it:
- Static screening: 1 TP / 12 FN / recall 7.7%
- VYOM-Guard: 13 TP / 0 FN / recall 100%
- Headline statement, exactly as already computed: *"Static datasheet-limit screening misses 8/8 latent-defect parts (100% escape rate). VYOM-Guard misses 0/8."*

---

## PAGE 8 — REPORT EXPORT

Title: **Engineering Report**

Sections: Component Info, Test Readings, Module A/B Results, Explanation, Recommendation.
Buttons: Generate Report, Export PDF, Export CSV — genuinely useful and buildable (your data is already in CSV/JSON).

---

## PAGE 9 — SETTINGS

Real, adjustable parameters only:
- Robust z-score threshold (default 3.5)
- Safety-slope sensitivity (k-factor, default 3.0)
- Datasheet absolute limit (default 50µA)

---

## WHAT TO CUT ENTIRELY FROM THE ORIGINAL SPEC

- Live telemetry / real-time sensor streaming pages — you have no live sensor feed
- "LSTM," "Isolation Forest" branding — rename to your real models
- Mission Timeline / Help pages with invented workflow diagrams not reflecting your actual pipeline — fine to keep as a simple **"How It Works"** page (Collect → Detect → Predict → Explain), just don't invent extra steps
- Any invented confidence percentages, data-quality scores, or precision/recall numbers not actually computed
- "SYSTEM ONLINE" — replace with "DEMO MODE — SYNTHETIC DATA"

## CRITICAL RULE FOR WHOEVER BUILDS THIS

**Every number, chart, and model name on screen must trace back to a real value you can produce on request.** If a judge asks "show me that number's source," you should be able to point to an actual JSON file or script output. This is what makes the explainability story (your strongest asset) credible instead of decorative.

---

## SUGGESTED DEMO FLOW (for the live click-through)

Mission Control (headline comparison) → Component Grid (click a flagged part) → AI Analysis (show the real method names) → Drift Prediction (show the trajectory chart) → Static vs AI Comparison (close on this page)

Keep it under 8 clicks. A long demo invites more time for questions to wander off-script.
