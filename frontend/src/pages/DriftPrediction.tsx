import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { PageProps } from '../types';
import { DRIFT_CHART_DATA, DATASHEET_CEILING, SAFETY_SLOPE_THRESHOLD, DATASET_SUMMARY } from '../data';

const TIMEPOINTS = [0, 24, 96, 168];

function TrajectoryCard({
  label, cls, values, predicted168, safetySlope, note
}: {
  label: string; cls: string; values: number[];
  predicted168: number; safetySlope: number; note: string;
}) {
  const exceedsCeiling = values[3] > DATASHEET_CEILING;
  const exceedsSlope = predicted168 > safetySlope;
  const isNormal = !exceedsCeiling && !exceedsSlope;

  const statusColor = isNormal ? 'border-teal-200 bg-teal-50 text-teal-700'
    : exceedsCeiling ? 'border-red-200 bg-red-50 text-red-700'
    : 'border-navy-200 bg-navy-50 text-navy-700';

  return (
    <div className={`rounded-2xl border-2 p-4 ${isNormal ? 'border-teal-200' : exceedsCeiling ? 'border-red-200' : 'border-navy-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className={`text-[10px] font-mono font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border w-fit mb-1 ${statusColor}`}>{cls}</div>
          <div className="font-display font-bold text-navy-900 text-sm">{label}</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {values.map((v, i) => (
          <div key={i} className={`rounded-lg p-2 text-center border ${v > DATASHEET_CEILING ? 'bg-red-50 border-red-200' : v > 40 ? 'bg-saffron-50 border-saffron-100' : 'bg-ice-50 border-border-light'}`}>
            <div className="text-[9px] font-mono text-navy-400">{TIMEPOINTS[i]}h</div>
            <div className={`text-sm font-mono font-bold ${v > DATASHEET_CEILING ? 'text-red-600' : v > 40 ? 'text-saffron-600' : 'text-navy-900'}`}>{v}</div>
          </div>
        ))}
      </div>
      <div className="text-[10px] text-navy-500 leading-relaxed">{note}</div>
    </div>
  );
}

export default function DriftPrediction({ onNavigate, addToast, absoluteLimit }: PageProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-border rounded-xl p-3 shadow-lg">
        <div className="font-mono font-bold text-navy-800 mb-2 text-xs">{label}h</div>
        {payload.map((p: any) => p.value != null && (
          <div key={p.dataKey} className="flex items-center gap-2 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-navy-600">{p.name}:</span>
            <span className="font-bold text-navy-900">{p.value} µA</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-screen-xl">
      <div className="mb-6">
        <div className="text-[10px] font-mono text-navy-400 uppercase tracking-widest mb-1">Gradient Boosting Regressor</div>
        <h1 className="text-3xl font-display font-bold text-navy-900 tracking-tight">Drift Forecast</h1>
        <p className="text-navy-400 mt-1 text-sm">
          Model inputs: Value_0h + Value_24h → predicts Value_168h.
          Three representative trajectories across {TIMEPOINTS.join('h → ')}h.
        </p>
      </div>

      {/* Model accuracy box */}
      <div className="bg-white rounded-2xl border border-border p-5 mb-5">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'GB Prediction MAE', value: `${DATASET_SUMMARY.gbMAE} µA`, color: 'text-teal-700', note: 'on hold-out set' },
            { label: 'Naive Baseline MAE', value: `${DATASET_SUMMARY.gbBaselineMAE} µA`, color: 'text-red-600', note: 'linear extrapolation' },
            { label: 'Improvement', value: `${(DATASET_SUMMARY.gbBaselineMAE / DATASET_SUMMARY.gbMAE).toFixed(1)}×`, color: 'text-saffron-600', note: 'vs naive baseline' },
            { label: 'Datasheet Ceiling', value: `${absoluteLimit} µA`, color: 'text-navy-800', note: 'absolute disqualification' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-[10px] font-mono text-navy-400 uppercase tracking-widest">{s.label}</div>
              <div className={`text-2xl font-mono font-bold mt-1 ${s.color}`}>{s.value}</div>
              <div className="text-xs text-navy-400 mt-0.5">{s.note}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-ice-50 rounded-xl border border-border-light">
          <p className="text-xs text-navy-600 leading-relaxed">
            <span className="font-semibold">What the model predicts:</span> A fixed endpoint value at 168h (not a continuous time-to-failure curve).
            The Gradient Boosting regressor uses early drift (0h → 24h) as its primary signal —
            feature importance shows Value_24h accounts for 68% of prediction weight.
            Components are flagged if their predicted 168h value exceeds the lot-derived safety slope.
          </p>
        </div>
      </div>

      {/* Trajectory chart */}
      <div className="bg-white rounded-2xl border border-border p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-semibold text-navy-900">Three-Component Trajectory</h2>
            <p className="text-xs text-navy-400">Leakage current (µA) across burn-in timepoints — dashed line = GB prediction for Module B</p>
          </div>
          <div className="flex gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-teal-500 inline-block rounded" /> Normal</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-saffron-400 inline-block rounded" /> Module A</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-navy-500 inline-block rounded" /> Module B (actual)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 border-t-2 border-dashed border-navy-300 inline-block" /> Predicted</span>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DRIFT_CHART_DATA} margin={{ top: 10, right: 30, left: -5, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6EFF8" vertical={false} />
              <XAxis dataKey="tLabel"
                tick={{ fontSize: 10, fill: '#90B8E0', fontFamily: 'JetBrains Mono' }}
                axisLine={false} tickLine={false} />
              <YAxis domain={[0, 58]}
                tick={{ fontSize: 10, fill: '#90B8E0', fontFamily: 'JetBrains Mono' }}
                axisLine={false} tickLine={false}
                label={{ value: 'µA', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#90B8E0', fontFamily: 'JetBrains Mono' }} />
              <Tooltip content={<CustomTooltip />} />
              {/* Reference lines */}
              <ReferenceLine y={DATASHEET_CEILING} stroke="#D42626" strokeWidth={1.5} strokeDasharray="6 3"
                label={{ value: `${DATASHEET_CEILING} µA datasheet ceiling`, fill: '#D42626', fontSize: 9, fontFamily: 'JetBrains Mono', position: 'right' }} />
              <ReferenceLine y={SAFETY_SLOPE_THRESHOLD} stroke="#163054" strokeWidth={1} strokeDasharray="4 2"
                label={{ value: `${SAFETY_SLOPE_THRESHOLD} µA safety slope`, fill: '#163054', fontSize: 9, fontFamily: 'JetBrains Mono', position: 'right' }} />
              {/* Data lines */}
              <Line type="monotone" dataKey="normal" name="Normal" stroke="#10A695" strokeWidth={2} dot={{ r: 4, fill: '#10A695' }} connectNulls />
              <Line type="monotone" dataKey="moduleA" name="Module A" stroke="#F58822" strokeWidth={2} dot={{ r: 4, fill: '#F58822' }} connectNulls />
              <Line type="monotone" dataKey="moduleB" name="Module B (actual)" stroke="#163054" strokeWidth={2} dot={{ r: 4, fill: '#163054' }} connectNulls />
              <Line type="monotone" dataKey="moduleBPred" name="Module B (predicted)" stroke="#163054" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4, fill: '#fff', stroke: '#163054', strokeWidth: 2 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 p-3 bg-navy-50 rounded-xl border border-navy-100">
          <p className="text-xs text-navy-600 leading-relaxed">
            <span className="font-semibold">Module B (latent defect):</span> The component begins at 10.3 µA — indistinguishable from normal at 0h. By 24h, early drift (12.7 µA) provides the signal. Gradient Boosting predicts 51.8 µA at 168h. Actual measured: 52.1 µA. Model error: 0.3 µA (within ±0.57 µA MAE). Static datasheet-limit screening misses this component entirely.
          </p>
        </div>
      </div>

      {/* Three trajectory cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <TrajectoryCard
          label="L02-C01 — Normal"
          cls="NORMAL"
          values={[10.1, 10.4, 10.8, 11.2]}
          predicted168={11.1}
          safetySlope={SAFETY_SLOPE_THRESHOLD}
          note="Gentle drift within lot norms. Predicted 168h (11.1 µA) is well below safety slope. Qualifies for deployment."
        />
        <TrajectoryCard
          label="L03-C07 — Obvious Outlier"
          cls="MODULE A"
          values={[44.2, 45.1, 46.8, 48.3]}
          predicted168={48.3}
          safetySlope={SAFETY_SLOPE_THRESHOLD}
          note="Flagged at 0h by Module A (z-score: 20.4). Already near the 50 µA ceiling. Static screening also catches this one."
        />
        <TrajectoryCard
          label="L15-C04 — Latent Defect"
          cls="MODULE B"
          values={[10.3, 12.7, 31.4, 52.1]}
          predicted168={51.8}
          safetySlope={SAFETY_SLOPE_THRESHOLD}
          note="Missed by static screening at 0h. Gradient Boosting predicts 51.8 µA at 168h from the 0h→24h drift signal alone. Exceeds safety slope and datasheet ceiling."
        />
      </div>

      <div className="flex gap-3">
        <button onClick={() => onNavigate('risk-explainability')}
          className="px-5 py-2.5 bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold rounded-xl transition-colors">
          View Explainability →
        </button>
        <button onClick={() => onNavigate('comparison')}
          className="px-5 py-2.5 border border-border hover:bg-ice-100 text-navy-700 text-sm font-semibold rounded-xl transition-colors">
          Static vs AI Comparison
        </button>
      </div>
    </div>
  );
}
