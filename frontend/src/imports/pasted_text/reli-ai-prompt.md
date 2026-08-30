ISRO RELI-AI — Front-End Design Prompt (v2)
AI-Powered Component Burn-In & Screening Intelligence Tagline: "Detect. Predict. Protect."
Rebrand of VYOM-Guard. All model names, numbers, and pages stay aligned to the actual working prototype — nothing here should be built unless the team can demonstrate it on request.
VISUAL DIRECTION (unchanged)
Premium light aerospace theme. White primary background, ice-blue sections, deep navy text, saffron/orange as a subtle Indian aerospace accent, teal/green for healthy, amber for warning, red only for high-risk. Mission-operations/scientific-instrumentation feel — not a generic SaaS dashboard, no neon, no cyberpunk, no cartoon rockets.
Typography: modern sans-serif headings, distinct monospace/data font for numbers (e.g. IBM Plex Mono). Cards: large rounded corners, subtle shadows, thin borders, generous whitespace. Charts: clean engineering-style lines, clear axes, threshold lines, actual-vs-predicted overlays.
PAGE 0 — LOGIN (new)
Title/Logo: ISRO RELI-AI Subtitle: Component Reliability Intelligence
Centered card on the light aerospace background:
Username field
Password field
Sign In button
Small caption below the form: "Demo access — prototype authentication for presentation purposes" (keep this honest; this is a front-end mock login, not a real auth backend, and that's fine for a hackathon demo — just don't imply it's a production security system if asked)
On submit → routes straight to Mission Control with a brief loading transition ("Authenticating..." → "Access granted")
Suggested demo credentials to hardcode for the panel round: something simple and memorable, e.g. username: isro_demo / password: reliai2026 — write it on your presenter's note card so you don't fumble it live.
GLOBAL NAVIGATION
Left nav rail. Logo: ISRO RELI-AI / subtitle: Component Reliability Intelligence
🏠 Mission Control
🧪 Screening Dataset
🧩 Component Grid
🤖 AI Analysis
📈 Drift Prediction
⚠ Risk & Explainability
📊 Static vs AI Comparison
📑 Report Export
⚙ Settings
Top bar: search, status badge, notifications, profile (shows logged-in username from Page 0).
Status badge: "DEMO MODE — SYNTHETIC DATA." Keep this always visible. It preempts the "is this real data" question and reads as engineering maturity, not weakness.
PAGE 1 — MISSION CONTROL
Title: Mission Control Subtitle: "Statistical and ML-driven screening intelligence for component burn-in testing."
Headline comparison block — lead with this:
Static-limit screening: 7.7% recall — misses 8/8 latent defects in test set
ISRO RELI-AI combined system: 100% recall — 0 false negatives
Side-by-side bar visualization (already built — port the styling)
Real metrics only:
Components screened: 600 | Lots: 15
Combined recall: 100% | Precision: 81.3%
Drift prediction MAE: 0.57 µA
Component Risk Map: ~60 sampled components, colored by real classification (Normal / Module A flag / Module B flag). Clicking a cell shows its real reasoning.
"Live Preview" toggle (the honest version of "live"): when switched on, the risk map cells animate/update in sequence — replaying your pre-computed classification results with a scanning/sweep effect, as if telemetry is arriving — clearly still under the "DEMO MODE — SYNTHETIC DATA" badge. This gives you the feeling of liveness for the demo without claiming a real sensor connection.
PAGE 2 — SCREENING DATASET
Title: Screening Dataset
Table columns — use these EXACT names, matching your real CSV schema (do not rename to friendlier labels, this is what a judge may ask to see in your actual data file):
lot_id
part_id
part_type
is_anomaly
value_0h
value_24h
value_96h
value_168h
Summary panel above the table:
Total records: 600 components across 15 lots
part_type breakdown: normal: 555 | obvious_outlier: 15 | latent_defect: 30
Note: "Synthetic dataset generated to match ISRO's problem-statement example (10µA lot average, 45µA outlier, 50µA datasheet ceiling). Schema is compatible with real burn-in data for direct drop-in replacement."
No invented "data quality score" or "missing values %" — only show what you can actually compute.
PAGE 3 — COMPONENT GRID
Port your existing clickable chamber-grid dashboard into this visual theme, columns/labels matching the real schema above. Keep the click-to-explain interaction — it's your strongest live-demo moment.
PAGE 4 — AI ANALYSIS
Title: AI Analysis Engine
Module A — Dynamic Outlier Detection Method: Robust Z-Score (Median + MAD)
One-line explanation: flags components relative to their own lot's statistics, not a fixed global limit
Threshold: modified z-score > 3.5
Visualization: scatter of lot values with flagged points highlighted
Module B — Time-Series Drift Predictor Method: Gradient Boosting Regressor
Input: value_0h, value_24h → Output: predicted value_168h
Real MAE: 0.57 µA vs. 4.6 µA naive baseline extrapolation (show this comparison)
Flag logic: predicted drift rate vs. lot-derived safety slope
PAGE 5 — DRIFT PREDICTION
Title: Drift Forecast
Real drift trajectory chart: three example components (normal / obvious outlier / latent defect) across 0h→24h→96h→168h, 50µA datasheet ceiling as a reference line.
No "hours to threshold" countdown — the model predicts a fixed 168h endpoint, not continuous time-to-failure. State that plainly on this page.
PAGE 6 — RISK & EXPLAINABILITY
Title: Risk & Explainability
For a selected component:
Classification: Normal / Module A Flag / Module B Flag
Real numbers: observed value, lot median, z-score OR predicted rate vs safety slope
Plain-language explanation — use your actual explain_flag() output text verbatim, don't reword into vaguer marketing language
Optional honest upgrade: pull real feature importances from the Gradient Boosting model for a genuine (not invented) contributor breakdown, if time allows.
PAGE 7 — STATIC VS AI COMPARISON
Title: Why This Matters
Your single best evidence page:
Static screening: 1 TP / 12 FN / recall 7.7%
ISRO RELI-AI: 13 TP / 0 FN / recall 100%
Headline: "Static datasheet-limit screening misses 8/8 latent-defect parts (100% escape rate). ISRO RELI-AI misses 0/8."
PAGE 8 — REPORT EXPORT
Title: Engineering Report Sections: Component Info, Test Readings (using real column names), Module A/B Results, Explanation, Recommendation. Buttons: Generate Report, Export PDF, Export CSV.
PAGE 9 — SETTINGS
Real, adjustable parameters only:
Robust z-score threshold (default 3.5)
Safety-slope sensitivity k-factor (default 3.0)
Datasheet absolute limit (default 50µA)
RULES FOR WHOEVER BUILDS THIS
Every number, chart, and model name on screen must trace back to a real value from your actual output files.
"Live" means dynamic/animated replay of real pre-computed results, clearly under a visible "DEMO MODE — SYNTHETIC DATA" badge — never implies a live hardware sensor feed.
The login is a front-end demo gate, not a real authentication system — fine for a hackathon prototype, just don't overstate it if asked.
Column names on the dataset page must match your real CSV headers exactly: lot_id, part_id, part_type, is_anomaly, value_0h, value_24h, value_96h, value_168h.
DEMO FLOW
Login → Mission Control (headline comparison) → Component Grid (click a flagged part) → AI Analysis (real method names) → Drift Prediction (trajectory chart) → Static vs AI Comparison (close here). Under 8 clicks total.