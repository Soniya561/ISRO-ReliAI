import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { PageProps } from '../types';
import { COMPARISON } from '../data';

const METRICS = [
  { key: 'recall', label: 'Recall (Catch-Rate)', static: COMPARISON.static.recall, vyom: COMPARISON.vyomGuard.recall, higherBetter: true },
  { key: 'precision', label: 'Precision', static: COMPARISON.static.precision, vyom: COMPARISON.vyomGuard.precision, higherBetter: true },
  { key: 'f1', label: 'F1 Score', static: COMPARISON.static.f1, vyom: COMPARISON.vyomGuard.f1, higherBetter: true },
];

const CONFUSION_ROWS = [
  { metric: 'True Positives (TP)', static: COMPARISON.static.tp, vyom: COMPARISON.vyomGuard.tp, better: 'high' },
  { metric: 'False Positives (FP)', static: COMPARISON.static.fp, vyom: COMPARISON.vyomGuard.fp, better: 'low' },
  { metric: 'False Negatives (FN)', static: COMPARISON.static.fn, vyom: COMPARISON.vyomGuard.fn, better: 'low' },
  { metric: 'True Negatives (TN)', static: COMPARISON.static.tn, vyom: COMPARISON.vyomGuard.tn, better: 'high' },
  { metric: 'Recall', static: `${COMPARISON.static.recall}%`, vyom: `${COMPARISON.vyomGuard.recall}%`, better: 'high' },
  { metric: 'Precision', static: `${COMPARISON.static.precision}%`, vyom: `${COMPARISON.vyomGuard.precision}%`, better: 'high' },
  { metric: 'F1 Score', static: `${COMPARISON.static.f1}%`, vyom: `${COMPARISON.vyomGuard.f1}%`, better: 'high' },
];

const CHART_DATA = [
  { name: 'Recall', static: 7.7, vyom: 100 },
  { name: 'Precision', static: 100, vyom: 81.3 },
  { name: 'F1 Score', static: 14.3, vyom: 89.7 },
];

export default function Comparison({ onNavigate, addToast }: PageProps) {
  return (
    <div className="p-6 max-w-screen-xl">
      <div className="mb-6">
        <div className="text-[10px] font-mono text-navy-400 uppercase tracking-widest mb-1">Evidence Page</div>
        <h1 className="text-3xl font-display font-bold text-navy-900 tracking-tight">Why This Matters</h1>
        <p className="text-navy-400 mt-1 text-sm">Head-to-head evaluation on the same hold-out set (n = 600 components, 13 true positives).</p>
      </div>

      {/* HERO statement */}
      <div className="bg-navy-900 text-white rounded-2xl p-6 mb-5">
        <div className="text-[10px] font-mono text-navy-300 uppercase tracking-widest mb-3">Key Finding</div>
        <blockquote className="text-xl font-display font-bold leading-relaxed text-white mb-2">
          "Static datasheet-limit screening misses 8/8 latent-defect parts (100% escape rate). ISRO RELI-AI misses 0/8."
        </blockquote>
        <div className="text-sm text-navy-300">
          Static approach: checks only if initial reading (0h) exceeds the 50 µA datasheet limit.
          Latent defects start within limits — they only fail later. A static check cannot see them.
        </div>
      </div>

      {/* Side-by-side recall bars */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-5">
        <h2 className="font-display font-semibold text-navy-900 mb-5">Recall — the critical metric for safety-critical screening</h2>
        <div className="space-y-4 mb-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <span className="text-sm font-display font-semibold text-red-700">Static Limit Screening</span>
                <span className="ml-2 text-xs font-mono text-navy-400">flag if value_0h ≥ 50 µA</span>
              </div>
              <span className="font-mono font-bold text-red-700 text-2xl">7.7%</span>
            </div>
            <div className="w-full h-10 bg-red-50 border border-red-100 rounded-xl overflow-hidden relative">
              <div className="h-full bg-red-500 rounded-xl flex items-center justify-end pr-3 transition-all duration-1000"
                style={{ width: '7.7%', minWidth: '3px' }} />
              <div className="absolute inset-0 flex items-center pl-4">
                <span className="text-xs font-mono text-red-700 font-semibold">1 TP · 12 FN · misses every latent defect</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <span className="text-sm font-display font-semibold text-teal-700">ISRO RELI-AI</span>
                <span className="ml-2 text-xs font-mono text-navy-400">Robust Z-Score + Gradient Boosting</span>
              </div>
              <span className="font-mono font-bold text-teal-700 text-2xl">100%</span>
            </div>
            <div className="w-full h-10 bg-teal-50 border border-teal-200 rounded-xl overflow-hidden">
              <div className="h-full w-full bg-teal-500 rounded-xl flex items-center justify-end pr-4 transition-all duration-1000">
                <span className="text-xs font-mono text-white font-bold">13 TP · 3 FP · 0 FN · precision 81.3%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
          <p className="text-xs text-teal-800 leading-relaxed">
            <span className="font-semibold">On the trade-off:</span> ISRO RELI-AI produces 3 false positives (normal components flagged for review). In safety-critical aerospace screening, a false negative (escaped defect) is far more costly than a false positive (unnecessary re-test). The 3 FPs add minor review overhead; the 12 FNs of static screening represent 12 potentially defective components reaching the qualification pipeline undetected.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Metric comparison chart */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-display font-semibold text-navy-900 mb-4">All Metrics</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EFF8" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#3A70A8', fontFamily: 'JetBrains Mono' }}
                  axisLine={false} tickLine={false} />
                <YAxis domain={[0, 110]} tick={{ fontSize: 9, fill: '#90B8E0', fontFamily: 'JetBrains Mono' }}
                  axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', borderRadius: '10px', border: '1px solid #D2E2F2' }}
                  formatter={(v) => [`${v}%`, '']} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
                <Bar dataKey="static" name="Static" fill="#D42626" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
                <Bar dataKey="vyom" name="ISRO RELI-AI" fill="#10A695" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion matrix table */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-display font-semibold text-navy-900 mb-4">Confusion Matrix Summary</h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 font-mono text-navy-500 uppercase text-[10px] tracking-wide">Metric</th>
                <th className="text-center py-2 font-mono text-red-600 uppercase text-[10px] tracking-wide">Static</th>
                <th className="text-center py-2 font-mono text-teal-600 uppercase text-[10px] tracking-wide">ISRO RELI-AI</th>
              </tr>
            </thead>
            <tbody>
              {CONFUSION_ROWS.map((row, i) => {
                const staticIsNum = typeof row.static === 'number';
                const better = staticIsNum
                  ? (row.better === 'high' ? row.vyom > row.static : row.vyom < row.static)
                  : (row.better === 'high'
                      ? parseFloat(String(row.vyom)) > parseFloat(String(row.static))
                      : parseFloat(String(row.vyom)) < parseFloat(String(row.static)));
                return (
                  <tr key={i} className="border-b border-border-light hover:bg-ice-50">
                    <td className="py-2 text-navy-700 font-sans">{row.metric}</td>
                    <td className="py-2 text-center font-mono font-bold text-red-600">{row.static}</td>
                    <td className="py-2 text-center">
                      <span className={`font-mono font-bold px-2 py-0.5 rounded-lg ${better ? 'text-teal-700 bg-teal-50' : 'text-amber-700 bg-amber-50'}`}>
                        {row.vyom}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Why static fails */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="font-display font-semibold text-navy-900 mb-4">Why Static Screening Fails on Latent Defects</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              step: '01', title: 'Looks Normal at 0h',
              body: 'Latent defects read 10–12 µA at initial screening — within the lot average. Static threshold (50 µA) is not triggered.',
              color: 'bg-teal-50 border-teal-200',
            },
            {
              step: '02', title: 'Early Drift Goes Unnoticed',
              body: 'By 24h, subtle drift (2–3 µA above baseline) is visible. Static screening has already cleared this component. ISRO RELI-AI captures this signal.',
              color: 'bg-amber-50 border-amber-200',
            },
            {
              step: '03', title: 'Failure at 168h',
              body: 'Leakage reaches 48–52 µA — at or above the datasheet ceiling. Component has escaped qualification. Static screening missed it entirely.',
              color: 'bg-red-50 border-red-200',
            },
          ].map(s => (
            <div key={s.step} className={`rounded-xl border p-4 ${s.color}`}>
              <div className="font-mono text-xs font-bold text-navy-500 mb-1">{s.step}</div>
              <div className="font-display font-bold text-navy-900 text-sm mb-2">{s.title}</div>
              <p className="text-xs text-navy-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
