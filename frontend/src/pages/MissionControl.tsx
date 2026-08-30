import { useMemo, useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PageProps } from '../types';
import { SHOWCASE_COMPONENTS, COMPARISON, DATASET_SUMMARY, EXAMPLE_MODULE_B } from '../data';

function StatCard({ label, value, sub, accent = false }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? 'bg-teal-50 border-teal-200' : 'bg-white border-border'}`}>
      <div className="text-[10px] font-mono text-navy-400 uppercase tracking-widest">{label}</div>
      <div className={`text-3xl font-mono font-bold mt-1 ${accent ? 'text-teal-700' : 'text-navy-900'}`}>{value}</div>
      {sub && <div className="text-xs text-navy-400 mt-1">{sub}</div>}
    </div>
  );
}

const RECALL_BAR_DATA = [
  { method: 'Static Limit', recall: 7.7, fill: '#D42626', label: '7.7%' },
  { method: 'ISRO RELI-AI', recall: 100, fill: '#10A695', label: '100%' },
];

export default function MissionControl({ onNavigate, setSelectedComponent, addToast }: PageProps) {
  const riskMap = useMemo(() => SHOWCASE_COMPONENTS, []);
  const [livePreview, setLivePreview] = useState(false);
  const [scannedCount, setScannedCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (livePreview) {
      setScannedCount(0);
      intervalRef.current = setInterval(() => {
        setScannedCount(prev => {
          if (prev >= riskMap.length - 1) {
            clearInterval(intervalRef.current!);
            return riskMap.length;
          }
          return prev + 1;
        });
      }, 60);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setScannedCount(0);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [livePreview, riskMap.length]);

  const statusColor = (cls: string, idx: number) => {
    const revealed = !livePreview || idx < scannedCount;
    const scanning = livePreview && idx === scannedCount;
    if (scanning) return 'bg-saffron-200 border-saffron-300 ring-2 ring-saffron-400 animate-pulse';
    if (!revealed) return 'bg-navy-100 border-navy-200';
    return cls === 'MODULE_A' ? 'bg-saffron-400 border-saffron-300 hover:ring-2 hover:ring-saffron-400'
      : cls === 'MODULE_B' ? 'bg-navy-400 border-navy-300 hover:ring-2 hover:ring-navy-400'
      : 'bg-teal-400 border-teal-300 hover:ring-2 hover:ring-teal-400';
  };

  const handleComponentClick = (c: typeof SHOWCASE_COMPONENTS[0]) => {
    setSelectedComponent(c);
    onNavigate('risk-explainability');
    addToast(`Viewing ${c.id} — ${c.classification === 'NORMAL' ? 'Normal' : c.classification === 'MODULE_A' ? 'Module A Flag' : 'Module B Flag'}`, 'info');
  };

  return (
    <div className="p-6 max-w-screen-xl">
      {/* Header */}
      <div className="mb-5">
        <div className="text-[10px] font-mono text-navy-400 uppercase tracking-widest mb-1">ISRO RELI-AI · Detect. Predict. Protect.</div>
        <h1 className="text-3xl font-display font-bold text-navy-900 tracking-tight">Mission Control</h1>
        <p className="text-navy-400 mt-1 text-sm">Statistical and ML-driven screening intelligence for component burn-in testing.</p>
      </div>

      {/* ─── HERO: Method Comparison ─── */}
      <div className="bg-white rounded-2xl border-2 border-navy-100 p-6 mb-5">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-[10px] font-mono text-navy-400 uppercase tracking-widest mb-1">Primary Result</div>
            <h2 className="text-xl font-display font-bold text-navy-900">Recall Comparison — Hold-Out Test Set (n = 600)</h2>
            <p className="text-sm text-navy-500 mt-1">
              Static datasheet-limit screening misses 8/8 latent-defect parts (100% escape rate).{' '}
              <span className="font-semibold text-teal-700">ISRO RELI-AI misses 0/8.</span>
            </p>
          </div>
          <button
            onClick={() => onNavigate('comparison')}
            className="flex-shrink-0 px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Full Analysis →
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-display font-semibold text-red-700">Static Limit Screening</span>
              <span className="font-mono font-bold text-red-700 text-lg">7.7%</span>
            </div>
            <div className="w-full bg-red-50 border border-red-100 rounded-full h-8 overflow-hidden relative">
              <div className="h-full bg-red-500 rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
                style={{ width: '7.7%' }}>
              </div>
              <div className="absolute inset-0 flex items-center pl-3">
                <span className="text-xs font-mono text-red-700">1 TP · 12 FN · misses all latent defects</span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-display font-semibold text-teal-700">ISRO RELI-AI (Robust Z-Score + Gradient Boosting)</span>
              <span className="font-mono font-bold text-teal-700 text-lg">100%</span>
            </div>
            <div className="w-full bg-teal-50 border border-teal-200 rounded-full h-8 overflow-hidden relative">
              <div className="h-full bg-teal-500 rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                style={{ width: '100%' }}>
                <span className="text-xs font-mono text-white font-bold">13 TP · 0 FN · precision 81.3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key metrics row */}
      <div className="grid grid-cols-5 gap-4 mb-5">
        <StatCard label="Components Screened" value="600" sub="Across 15 lots" />
        <StatCard label="Lots Monitored" value="15" sub="40 per lot" />
        <StatCard label="Combined Recall" value="100%" sub="0 false negatives" accent />
        <StatCard label="Precision" value="81.3%" sub="3 false positives" />
        <StatCard label="GB Drift MAE" value="0.57 µA" sub="vs 4.6 µA baseline" />
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Component risk map */}
        <div className="col-span-8 bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold text-navy-900">Component Risk Map</h2>
              <p className="text-xs text-navy-400 mt-0.5">60 sampled components — click any to view classification reasoning</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Live Preview toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-navy-500">Live Preview</span>
                <button
                  onClick={() => setLivePreview(v => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${livePreview ? 'bg-teal-500' : 'bg-navy-200'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${livePreview ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                {livePreview && (
                  <span className="text-[10px] font-mono text-teal-600 font-semibold">
                    {scannedCount < riskMap.length ? `${scannedCount}/${riskMap.length}` : 'done'}
                  </span>
                )}
              </div>
              <div className="flex gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-400" /> Normal</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-saffron-400" /> Module A</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-navy-400" /> Module B</span>
              </div>
            </div>
          </div>

          {livePreview && (
            <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-demo-tick" />
              <span className="text-[10px] font-mono text-amber-700">Replaying pre-computed classification results — DEMO MODE · SYNTHETIC DATA</span>
            </div>
          )}

          <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
            {riskMap.map((c, i) => (
              <button
                key={c.id}
                title={`${c.id} — ${c.classification.replace('_', ' ')}`}
                onClick={() => handleComponentClick(c)}
                className={`aspect-square rounded-lg border transition-all duration-100 ${statusColor(c.classification, i)}`}
              />
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-xs font-mono text-navy-400">
            <span>{SHOWCASE_COMPONENTS.filter(c => c.classification === 'NORMAL').length} normal</span>
            <span>{SHOWCASE_COMPONENTS.filter(c => c.classification === 'MODULE_A').length} Module A flags</span>
            <span>{SHOWCASE_COMPONENTS.filter(c => c.classification === 'MODULE_B').length} Module B flags</span>
          </div>
        </div>

        {/* AI Insight + chart */}
        <div className="col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-saffron-100 p-5 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-saffron-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-bold">GB</span>
              </div>
              <span className="text-[10px] font-mono font-semibold text-saffron-600 uppercase tracking-widest">AI Insight — Module B</span>
            </div>
            <p className="text-sm text-navy-800 leading-relaxed">
              "{EXAMPLE_MODULE_B.explanation}"
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-navy-50 rounded-lg p-2.5">
                <div className="text-[9px] font-mono text-navy-400 uppercase">Predicted 168h</div>
                <div className="font-mono font-bold text-navy-900">{EXAMPLE_MODULE_B.predicted_168h} µA</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-2.5">
                <div className="text-[9px] font-mono text-amber-600 uppercase">Safety Slope</div>
                <div className="font-mono font-bold text-amber-700">{EXAMPLE_MODULE_B.safetySlope} µA</div>
              </div>
            </div>
            <button
              onClick={() => { setSelectedComponent(EXAMPLE_MODULE_B); onNavigate('risk-explainability'); }}
              className="w-full mt-3 py-2 bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Explain Flag →
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-border p-4">
            <div className="text-[10px] font-mono text-navy-400 uppercase tracking-widest mb-2">Recall Comparison</div>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={RECALL_BAR_DATA} layout="vertical" margin={{ left: 0, right: 30, top: 4, bottom: 4 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="method" width={68} tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#3A70A8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', borderRadius: '8px' }}
                    formatter={(v) => [`${v}%`, 'Recall']} />
                  <Bar dataKey="recall" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 10, fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                    {RECALL_BAR_DATA.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
