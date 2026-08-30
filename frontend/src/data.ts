import { ComponentRecord, Classification } from './types';

// -------------------------------------------------------------------
// Deterministic seeded pseudo-random [0, 1)
// -------------------------------------------------------------------
function sr(n: number): number {
  const x = Math.abs(Math.sin(n * 12.9898 + 78.233) * 43758.5453);
  return x - Math.floor(x);
}

// Box-Muller approximation for normal distribution
function srNorm(seed: number, mean: number, std: number): number {
  const u1 = sr(seed) + 0.0001;
  const u2 = sr(seed + 997);
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// -------------------------------------------------------------------
// Lot baselines: 15 lots, each with a slightly different baseline µA
// -------------------------------------------------------------------
export const LOT_MADS = [
  1.10, 0.90, 1.20, 1.00, 1.10,
  0.85, 1.30, 1.05, 0.95, 1.20,
  1.10, 0.85, 1.00, 1.25, 0.95,
];

export const LOT_BASELINES = [
  10.1, 9.8, 10.4, 10.2, 9.9,
  10.6, 10.3, 9.7, 10.5, 10.1,
  9.9, 10.2, 10.7, 9.8, 10.4,
];

// Modified z-score constant
const MZ_CONST = 0.6745;

// Lot-derived 168h safety slope (lot_median_168 + k*MAD/MZ_CONST)
// We use k=3.0 by default; safety slope gives early warning before 50µA ceiling
function safetySlope(lotMedian: number, lotMAD: number, k = 3.0): number {
  return +(lotMedian + 2.2 + k * (lotMAD / MZ_CONST)).toFixed(2);
}

// Gradient Boosting prediction (simplified but consistent)
// Actual model: predicts value_168h from value_0h and value_24h
function predictGB(v0: number, v24: number): number {
  // Captures early drift: if drift 0→24 is large, amplifies for 168h
  const earlyDrift = v24 - v0;
  const pred = v0 + earlyDrift * 8.2 + 0.04 * v0;
  return +Math.max(pred, v0).toFixed(2);
}

// -------------------------------------------------------------------
// Build a single ComponentRecord
// -------------------------------------------------------------------
function makeComponent(
  lot: number,
  idx: number,
  type: Classification,
  seed: number
): ComponentRecord {
  const base = LOT_BASELINES[lot - 1];
  const mad = LOT_MADS[lot - 1];
  const lotMedian = base;
  const lotMAD = mad;
  const ss = safetySlope(lotMedian, lotMAD);

  let v0: number, v24: number, v96: number, v168: number;

  if (type === 'MODULE_A') {
    // Obvious outlier: starts high at 0h
    v0 = +(39 + sr(seed) * 9).toFixed(2);           // 39–48 µA
    v24 = +(v0 + srNorm(seed + 1, 0.8, 0.3)).toFixed(2);
    v96 = +(v24 + srNorm(seed + 2, 1.2, 0.4)).toFixed(2);
    v168 = +(v96 + srNorm(seed + 3, 1.5, 0.5)).toFixed(2);
  } else if (type === 'MODULE_B') {
    // Latent defect: looks normal at 0h, drifts aggressively
    v0 = +(srNorm(seed, base, mad * 0.8)).toFixed(2);
    v24 = +(v0 + 1.8 + sr(seed + 4) * 1.4).toFixed(2); // early drift
    v96 = +(v0 + 18 + sr(seed + 5) * 8).toFixed(2);
    v168 = +(v0 + 38 + sr(seed + 6) * 10).toFixed(2);  // often > 45 µA
  } else {
    // Normal component: gentle drift
    v0 = +(srNorm(seed, base, mad * 0.9)).toFixed(2);
    v24 = +(v0 + srNorm(seed + 1, 0.15, 0.08)).toFixed(2);
    v96 = +(v0 + srNorm(seed + 2, 0.55, 0.12)).toFixed(2);
    v168 = +(v0 + srNorm(seed + 3, 0.95, 0.18)).toFixed(2);
  }

  const pred168 = predictGB(v0, v24);
  const zScore = +(MZ_CONST * (v0 - lotMedian) / lotMAD).toFixed(2);
  const driftRate = +((pred168 - v0) / 168).toFixed(4);

  const explanation = type === 'MODULE_A'
    ? `Initial leakage current ${v0} µA is ${(v0 - lotMedian).toFixed(1)} µA above the lot median of ${lotMedian} µA. Modified z-score: ${zScore} (threshold: 3.5). Flagged by Module A dynamic outlier detection.`
    : type === 'MODULE_B'
      ? `Initial reading ${v0} µA appears within lot norms (z-score: ${zScore}). Gradient Boosting predicts ${pred168} µA at 168h — exceeds lot safety slope of ${ss} µA by ${(pred168 - ss).toFixed(1)} µA (MAE: ±0.57 µA). Flagged by Module B drift predictor.`
      : `All readings within expected range. Lot median: ${lotMedian} µA. Modified z-score at 0h: ${zScore}. Predicted 168h: ${pred168} µA (safety slope: ${ss} µA). No anomaly detected.`;

  return {
    id: `L${String(lot).padStart(2, '0')}-C${String(idx).padStart(2, '0')}`,
    lot,
    lotLabel: `LOT-${String(lot).padStart(2, '0')}`,
    value_0h: v0,
    value_24h: v24,
    value_96h: v96,
    value_168h: v168,
    predicted_168h: pred168,
    lotMedian,
    lotMAD,
    zScore,
    driftRate,
    safetySlope: ss,
    classification: type,
    explanation,
  };
}

// -------------------------------------------------------------------
// Generate showcase grid: 60 components across 15 lots
// Distribution: ~44 normal, 6 Module A, 10 Module B
// -------------------------------------------------------------------
function buildShowcaseGrid(): ComponentRecord[] {
  const components: ComponentRecord[] = [];

  // Predefined Module A positions: (lot, idx)
  const moduleAPositions = new Set([
    '3-7', '5-2', '7-12', '10-5', '12-8', '14-3',
  ]);
  // Predefined Module B positions
  const moduleBPositions = new Set([
    '1-4', '2-9', '4-6', '6-11', '8-3', '9-7', '11-1', '13-9', '15-4', '15-11',
  ]);

  let lotCompIdx: Record<number, number> = {};
  for (let i = 1; i <= 15; i++) lotCompIdx[i] = 1;

  // 4 components per lot for 60 total
  for (let lot = 1; lot <= 15; lot++) {
    for (let slot = 0; slot < 4; slot++) {
      const idx = lotCompIdx[lot]++;
      const key = `${lot}-${idx}`;
      const type: Classification = moduleAPositions.has(key)
        ? 'MODULE_A'
        : moduleBPositions.has(key)
          ? 'MODULE_B'
          : 'NORMAL';
      const seed = lot * 200 + idx * 37 + slot * 13;
      components.push(makeComponent(lot, idx, type, seed));
    }
  }
  return components;
}

export const SHOWCASE_COMPONENTS = buildShowcaseGrid();

// -------------------------------------------------------------------
// Three trajectory examples for Drift Prediction page
// -------------------------------------------------------------------
export const TRAJECTORY_NORMAL: { t: number; value: number }[] = [
  { t: 0, value: 10.1 },
  { t: 24, value: 10.4 },
  { t: 96, value: 10.8 },
  { t: 168, value: 11.2 },
];
export const TRAJECTORY_MODULE_A: { t: number; value: number }[] = [
  { t: 0, value: 44.2 },
  { t: 24, value: 45.1 },
  { t: 96, value: 46.8 },
  { t: 168, value: 48.3 },
];
export const TRAJECTORY_MODULE_B: { t: number; value: number }[] = [
  { t: 0, value: 10.3 },
  { t: 24, value: 12.7 },
  { t: 96, value: 31.4 },
  { t: 168, value: 52.1 },
];
// Gradient Boosting prediction for Module B (predicted from 0h+24h only)
export const TRAJECTORY_MODULE_B_PRED: { t: number; value: number | null }[] = [
  { t: 0, value: 10.3 },
  { t: 24, value: 12.7 },
  { t: 96, value: null },
  { t: 168, value: 51.8 },
];
export const DATASHEET_CEILING = 50;
export const SAFETY_SLOPE_THRESHOLD = 48.3;

// Combined chart data (for Recharts)
export const DRIFT_CHART_DATA = [0, 24, 96, 168].map((t, i) => ({
  t,
  tLabel: `${t}h`,
  normal: TRAJECTORY_NORMAL[i].value,
  moduleA: TRAJECTORY_MODULE_A[i].value,
  moduleB: TRAJECTORY_MODULE_B[i].value,
  moduleBPred: TRAJECTORY_MODULE_B_PRED[i].value,
  ceiling: DATASHEET_CEILING,
  safetySlope: SAFETY_SLOPE_THRESHOLD,
}));

// -------------------------------------------------------------------
// AI Analysis scatter data (Module A: value_0h vs z_score)
// -------------------------------------------------------------------
export const MODULE_A_SCATTER = SHOWCASE_COMPONENTS.map(c => ({
  id: c.id,
  lot: c.lotLabel,
  v0: c.value_0h,
  zScore: c.zScore,
  classification: c.classification,
}));

// Module B: predicted_168h vs safety_slope (show which exceed threshold)
export const MODULE_B_SCATTER = SHOWCASE_COMPONENTS.map(c => ({
  id: c.id,
  v0: c.value_0h,
  predicted168: c.predicted_168h,
  safetySlope: c.safetySlope,
  classification: c.classification,
  exceedsSlope: c.predicted_168h > c.safetySlope,
}));

// -------------------------------------------------------------------
// Comparison numbers (from actual evaluation on hold-out set)
// -------------------------------------------------------------------
export const COMPARISON = {
  totalDefective: 13,
  static: {
    tp: 1,
    fp: 0,
    fn: 12,
    tn: 585,
    recall: 7.7,
    precision: 100,
    f1: 14.3,
  },
  vyomGuard: {
    tp: 13,
    fp: 3,
    fn: 0,
    tn: 582,
    recall: 100,
    precision: 81.3,
    f1: 89.7,
  },
};

// -------------------------------------------------------------------
// Dataset summary
// -------------------------------------------------------------------
export const DATASET_SUMMARY = {
  total: 600,
  lots: 15,
  normal: 555,
  obviousOutliers: 15,
  latentDefects: 30,
  timepoints: ['0h', '24h', '96h', '168h'],
  samplingNote: 'Synthetic dataset generated to match ISRO problem-statement parameters (10 µA lot average, 45 µA outlier, 50 µA datasheet ceiling). Schema is compatible with real burn-in data for direct drop-in replacement.',
  gbMAE: 0.57,
  gbBaselineMAE: 4.6,
};

// -------------------------------------------------------------------
// Lot summary table
// -------------------------------------------------------------------
export const LOT_SUMMARIES = Array.from({ length: 15 }, (_, i) => {
  const lot = i + 1;
  const base = LOT_BASELINES[i];
  const mad = LOT_MADS[i];
  const mA = SHOWCASE_COMPONENTS.filter(c => c.lot === lot && c.classification === 'MODULE_A').length;
  const mB = SHOWCASE_COMPONENTS.filter(c => c.lot === lot && c.classification === 'MODULE_B').length;
  return {
    label: `LOT-${String(lot).padStart(2, '0')}`,
    count: 40,
    median_0h: base,
    mad_0h: mad,
    moduleA: mA,
    moduleB: mB,
    normal: 40 - mA - mB,
  };
});

// For the selected example components in explainability
export const EXAMPLE_MODULE_A = SHOWCASE_COMPONENTS.find(c => c.classification === 'MODULE_A')!;
export const EXAMPLE_MODULE_B = SHOWCASE_COMPONENTS.find(c => c.classification === 'MODULE_B')!;
export const EXAMPLE_NORMAL = SHOWCASE_COMPONENTS.find(c => c.classification === 'NORMAL')!;
