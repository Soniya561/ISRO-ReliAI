import { useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Cell,
} from 'recharts';
import { PageProps } from '../types';
import { MODULE_A_SCATTER, MODULE_B_SCATTER, DATASET_SUMMARY } from '../data';

export default function AIAnalysis({ onNavigate, addToast, zThreshold }: PageProps) {
  const aScatter = useMemo(() => ({
    normal: MODULE_A_SCATTER.filter(d => d.classification !== 'MODULE_A'),
    flagged: MODULE_A_SCATTER.filter(d => d.classification === 'MODULE_A'),
  }), []);

  const bScatter = useMemo(() => ({
    normal: MODULE_B_SCATTER.filter(d => !d.exceedsSlope),
    flagged: MODULE_B_SCATTER.filter(d => d.exceedsSlope),
  }), []);

  // Feature importance (real GB feature importances approximated)
  const featureImportances = [
    { feature: 'Value_24h', importance: 0.68, color: '#0F1F3D' },
    { feature: 'Value_0h', importance: 0.32, color: '#3A70A8' },
  ];

  return (
    <div className="p-6 max-w-screen-xl">
      <div className="mb-6">
        <div className="text-[10px] font-mono text-navy-400 uppercase tracking-widest mb-1">Dual-Model AI Pipeline</div>
        <h1 className="text-3xl font-display font-bold text-navy-900 tracking-tight">AI Analysis Engine</h1>
        <p className="text-navy-400 mt-1 text-sm">Two independent models — each flags components the other might miss.</p>
      </div>

      {/* Model headers */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <div className="bg-saffron-50 border border-saffron-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-saffron-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <div>
            <div className="text-[10px] font-mono text-saffron-600 uppercase tracking-widest mb-0.5">Module A</div>
            <div className="font-display font-bold text-navy-900">Dynamic Outlier Detection</div>
            <div className="text-xs text-navy-600 mt-0.5">Method: <span className="font-mono font-semibold">Robust Z-Score (Median + MAD)</span></div>
            <div className="text-xs text-navy-500 mt-1">Flags components whose 0h reading is statistically abnormal relative to their own lot — not a fixed global limit.</div>
          </div>
        </div>
        <div className="bg-navy-50 border border-navy-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-navy-700 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">B</span>
          </div>
          <div>
            <div className="text-[10px] font-mono text-navy-400 uppercase tracking-widest mb-0.5">Module B</div>
            <div className="font-display font-bold text-navy-900">Time-Series Drift Predictor</div>
            <div className="text-xs text-navy-600 mt-0.5">Method: <span className="font-mono font-semibold">Gradient Boosting Regressor</span></div>
            <div className="text-xs text-navy-500 mt-1">Inputs: Value_0h + Value_24h → Predicts Value_168h. Catches latent defects that look normal at 0h.</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Module A: z-score scatter */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-display font-semibold text-navy-900">Module A — Lot Scatter</h2>
              <p className="text-xs text-navy-400 mt-0.5">Value_0h vs modified z-score · threshold {zThreshold}</p>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-navy-400">Flagged</div>
              <div className="text-2xl font-mono font-bold text-saffron-600">{aScatter.flagged.length}</div>
            </div>
          </div>

          <div className="p-3 bg-saffron-50 rounded-xl border border-saffron-100 mb-4">
            <div className="text-[10px] font-mono text-saffron-700 font-bold uppercase tracking-wide mb-1">Threshold formula</div>
            <p className="text-xs font-mono text-navy-700">
              M<sub>i</sub> = 0.6745 × (x<sub>i</sub> − lot_median) / lot_MAD<br />
              Flag if |M<sub>i</sub>| &gt; {zThreshold}
            </p>
          </div>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EFF8" />
                <XAxis dataKey="v0" type="number" name="Value_0h (µA)"
                  tick={{ fontSize: 9, fill: '#90B8E0', fontFamily: 'JetBrains Mono' }}
                  label={{ value: 'Value_0h (µA)', position: 'insideBottom', offset: -8, fontSize: 9, fill: '#90B8E0', fontFamily: 'JetBrains Mono' }}
                  axisLine={false} tickLine={false} />
                <YAxis dataKey="zScore" name="Modified Z-Score"
                  tick={{ fontSize: 9, fill: '#90B8E0', fontFamily: 'JetBrains Mono' }}
                  axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', borderRadius: '10px', border: '1px solid #D2E2F2' }}
                  formatter={(v) => [Number(v).toFixed(2), '']}
                />
                <ReferenceLine y={zThreshold} stroke="#F58822" strokeWidth={1.5} strokeDasharray="5 3"
                  label={{ value: `z = ${zThreshold}`, fill: '#F58822', fontSize: 9, fontFamily: 'JetBrains Mono', position: 'right' }} />
                <Scatter name="Normal" data={aScatter.normal} fill="#10A695" fillOpacity={0.6} r={4} />
                <Scatter name="Module A Flag" data={aScatter.flagged} fill="#F58822" fillOpacity={1} r={6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2 text-xs font-mono">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-500 opacity-60" /> Normal ({aScatter.normal.length})</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-saffron-400" /> Module A ({aScatter.flagged.length})</span>
          </div>
        </div>

        {/* Module B: predicted vs safety slope */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-display font-semibold text-navy-900">Module B — Drift Risk</h2>
              <p className="text-xs text-navy-400 mt-0.5">Value_0h vs predicted Value_168h · safety slope threshold</p>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-navy-400">Flagged</div>
              <div className="text-2xl font-mono font-bold text-navy-700">{bScatter.flagged.length}</div>
            </div>
          </div>

          <div className="p-3 bg-navy-50 rounded-xl border border-navy-100 mb-4">
            <div className="text-[10px] font-mono text-navy-700 font-bold uppercase tracking-wide mb-1">Gradient Boosting</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Input 1', value: 'Value_0h' },
                { label: 'Input 2', value: 'Value_24h' },
                { label: 'Output', value: 'Pred. 168h' },
              ].map(f => (
                <div key={f.label} className="text-center">
                  <div className="text-[9px] font-mono text-navy-400">{f.label}</div>
                  <div className="text-xs font-mono font-bold text-navy-800">{f.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[['MAE', `${DATASET_SUMMARY.gbMAE} µA`], ['Baseline MAE', `${DATASET_SUMMARY.gbBaselineMAE} µA`], ['Improvement', `${(DATASET_SUMMARY.gbBaselineMAE / DATASET_SUMMARY.gbMAE).toFixed(1)}×`]].map(([l, v]) => (
                <div key={l} className="text-center">
                  <div className="text-[9px] font-mono text-navy-400">{l}</div>
                  <div className="text-xs font-mono font-bold text-navy-800">{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EFF8" />
                <XAxis dataKey="v0" type="number" name="Value_0h (µA)"
                  tick={{ fontSize: 9, fill: '#90B8E0', fontFamily: 'JetBrains Mono' }}
                  label={{ value: 'Value_0h (µA)', position: 'insideBottom', offset: -8, fontSize: 9, fill: '#90B8E0', fontFamily: 'JetBrains Mono' }}
                  axisLine={false} tickLine={false} />
                <YAxis dataKey="predicted168" name="Predicted 168h (µA)"
                  tick={{ fontSize: 9, fill: '#90B8E0', fontFamily: 'JetBrains Mono' }}
                  axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', borderRadius: '10px', border: '1px solid #D2E2F2' }}
                  formatter={(v) => [Number(v).toFixed(2), '']}
                />
                {/* Safety slope reference (approximate — different per lot, show representatively) */}
                <ReferenceLine y={45} stroke="#163054" strokeWidth={1.5} strokeDasharray="5 3"
                  label={{ value: 'safety slope ≈45', fill: '#163054', fontSize: 9, fontFamily: 'JetBrains Mono', position: 'right' }} />
                <ReferenceLine y={50} stroke="#D42626" strokeWidth={1} strokeDasharray="3 2"
                  label={{ value: '50µA limit', fill: '#D42626', fontSize: 9, fontFamily: 'JetBrains Mono', position: 'right' }} />
                <Scatter name="Normal" data={bScatter.normal} fill="#10A695" fillOpacity={0.6} r={4} />
                <Scatter name="Module B Flag" data={bScatter.flagged} fill="#163054" fillOpacity={0.9} r={6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Feature importances */}
          <div className="mt-3 pt-3 border-t border-border-light">
            <div className="text-[10px] font-mono text-navy-400 uppercase tracking-wide mb-2">Feature Importances (Gradient Boosting)</div>
            {featureImportances.map(fi => (
              <div key={fi.feature} className="flex items-center gap-3 mb-1.5">
                <span className="text-xs font-mono text-navy-700 w-20 flex-shrink-0">{fi.feature}</span>
                <div className="flex-1 bg-navy-50 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: `${fi.importance * 100}%`, backgroundColor: fi.color }} />
                </div>
                <span className="text-xs font-mono font-bold text-navy-900 w-10 text-right">{(fi.importance * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button onClick={() => onNavigate('drift-prediction')}
          className="px-5 py-2.5 bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold rounded-xl transition-colors">
          View Drift Forecast →
        </button>
        <button onClick={() => onNavigate('comparison')}
          className="px-5 py-2.5 border border-border hover:bg-ice-100 text-navy-700 text-sm font-semibold rounded-xl transition-colors">
          Compare to Static Screening
        </button>
      </div>
    </div>
  );
}
