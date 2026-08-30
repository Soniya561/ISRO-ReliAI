import { useState } from 'react';
import { PageProps, ComponentRecord, Classification } from '../types';
import { SHOWCASE_COMPONENTS, EXAMPLE_MODULE_A, EXAMPLE_MODULE_B, EXAMPLE_NORMAL, DATASHEET_CEILING } from '../data';

const CLS_CONFIG: Record<Classification, { label: string; bg: string; border: string; text: string; dot: string }> = {
  NORMAL: { label: 'Normal', bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800', dot: 'bg-teal-500' },
  MODULE_A: { label: 'Module A — z-score flag', bg: 'bg-saffron-50', border: 'border-saffron-200', text: 'text-saffron-800', dot: 'bg-saffron-500' },
  MODULE_B: { label: 'Module B — drift flag', bg: 'bg-navy-50', border: 'border-navy-200', text: 'text-navy-800', dot: 'bg-navy-500' },
};

function ZScoreBar({ value, threshold }: { value: number; threshold: number }) {
  const maxDisplay = Math.max(Math.abs(value) * 1.2, threshold * 1.5, 5);
  const pct = Math.min((Math.abs(value) / maxDisplay) * 100, 100);
  const threshPct = (threshold / maxDisplay) * 100;
  const flagged = Math.abs(value) > threshold;

  return (
    <div className="relative mt-2">
      <div className="w-full bg-navy-50 rounded-full h-4 overflow-hidden">
        <div className={`h-4 rounded-full transition-all duration-700 ${flagged ? 'bg-saffron-500' : 'bg-teal-500'}`}
          style={{ width: `${pct}%` }} />
      </div>
      {/* Threshold marker */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-navy-700"
        style={{ left: `${threshPct}%` }} />
      <div className="flex justify-between mt-1 text-[9px] font-mono text-navy-400">
        <span>0</span>
        <span style={{ position: 'absolute', left: `${threshPct}%`, transform: 'translateX(-50%)' }}>
          threshold {threshold}
        </span>
        <span>{Math.abs(value).toFixed(1)}</span>
      </div>
    </div>
  );
}

function ReadingTimeline({ c }: { c: ComponentRecord }) {
  const points = [
    { label: '0h', value: c.value_0h },
    { label: '24h', value: c.value_24h },
    { label: '96h', value: c.value_96h },
    { label: '168h', value: c.value_168h },
    { label: 'Pred.', value: c.predicted_168h, predicted: true },
  ];
  const maxVal = Math.max(...points.map(p => p.value), DATASHEET_CEILING);

  return (
    <div className="flex items-end gap-2 h-28 mt-3">
      {points.map((p, i) => {
        const pct = (p.value / maxVal) * 100;
        const exceeds = p.value > DATASHEET_CEILING;
        const color = exceeds ? 'bg-red-500' : p.value > c.safetySlope ? 'bg-navy-500' : p.value > 20 ? 'bg-amber-400' : 'bg-teal-500';
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="text-[9px] font-mono text-navy-600 font-bold">{p.value.toFixed(1)}</div>
            <div className="w-full relative flex items-end justify-center" style={{ height: '80px' }}>
              <div className={`w-full rounded-t transition-all duration-700 ${color} ${p.predicted ? 'opacity-60' : ''} ${p.predicted ? 'border-2 border-dashed border-current' : ''}`}
                style={{ height: `${pct}%` }} />
            </div>
            <div className={`text-[9px] font-mono ${p.predicted ? 'text-saffron-600' : 'text-navy-400'}`}>{p.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function RiskExplainability({ selectedComponent, setSelectedComponent, onNavigate, addToast, zThreshold }: PageProps) {
  const [localSelected, setLocalSelected] = useState<ComponentRecord>(
    selectedComponent ?? EXAMPLE_MODULE_B
  );

  const c = localSelected;
  const cc = CLS_CONFIG[c.classification];
  const flaggedByA = Math.abs(c.zScore) > zThreshold;
  const flaggedByB = c.predicted_168h > c.safetySlope;
  const exceedsCeiling = c.value_168h > DATASHEET_CEILING;

  const quickSelect = [EXAMPLE_MODULE_B, EXAMPLE_MODULE_A, EXAMPLE_NORMAL];

  return (
    <div className="p-6 max-w-screen-xl">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-navy-900 tracking-tight">Risk & Explainability</h1>
        <p className="text-navy-400 mt-1 text-sm">Plain-language classification reasoning for each component — traceable to real computed values.</p>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Component selector */}
        <div className="col-span-4">
          <div className="bg-white rounded-2xl border border-border p-4 mb-4">
            <div className="text-[10px] font-mono text-navy-400 uppercase tracking-widest mb-3">Quick Select</div>
            {quickSelect.map(qc => {
              const qcc = CLS_CONFIG[qc.classification];
              return (
                <button key={qc.id}
                  onClick={() => { setLocalSelected(qc); setSelectedComponent(qc); }}
                  className={`w-full text-left p-3 rounded-xl border mb-2 transition-all
                    ${localSelected.id === qc.id ? `${qcc.bg} ${qcc.border}` : 'border-border hover:bg-ice-50'}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`w-2 h-2 rounded-full ${qcc.dot}`} />
                    <span className="font-mono font-bold text-navy-900 text-xs">{qc.id}</span>
                  </div>
                  <div className={`text-[10px] font-mono font-semibold ${qcc.text}`}>{qcc.label}</div>
                </button>
              );
            })}

            <div className="border-t border-border-light pt-3 mt-1">
              <div className="text-[10px] font-mono text-navy-400 uppercase tracking-widest mb-2">Or select from grid</div>
              <select
                onChange={e => {
                  const found = SHOWCASE_COMPONENTS.find(comp => comp.id === e.target.value);
                  if (found) { setLocalSelected(found); setSelectedComponent(found); }
                }}
                value={c.id}
                className="w-full border border-border rounded-lg px-3 py-2 text-xs font-mono text-navy-800 bg-white focus:outline-none focus:border-navy-400"
              >
                {SHOWCASE_COMPONENTS.map(comp => (
                  <option key={comp.id} value={comp.id}>
                    {comp.id} — {comp.classification.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main explainability panel */}
        <div className="col-span-8">
          <div className={`bg-white rounded-2xl border-2 p-6 ${cc.border}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-bold mb-2 ${cc.bg} ${cc.border} ${cc.text}`}>
                  <span className={`w-2 h-2 rounded-full ${cc.dot}`} />
                  {cc.label.toUpperCase()}
                </div>
                <h2 className="text-2xl font-display font-bold text-navy-900">{c.id}</h2>
                <div className="text-sm text-navy-500">{c.lotLabel} · Lot median: {c.lotMedian} µA · MAD: {c.lotMAD} µA</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono text-navy-400">Datasheet ceiling</div>
                <div className="font-mono font-bold text-navy-900">{DATASHEET_CEILING} µA</div>
              </div>
            </div>

            {/* Bar timeline */}
            <div className="mb-5">
              <div className="text-[10px] font-mono text-navy-400 uppercase tracking-widest mb-1">Measured readings + GB prediction (µA)</div>
              <ReadingTimeline c={c} />
            </div>

            {/* Module A result */}
            <div className={`p-4 rounded-xl border mb-3 ${flaggedByA ? 'bg-saffron-50 border-saffron-200' : 'bg-teal-50 border-teal-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-1"
                    style={{ color: flaggedByA ? '#C05C00' : '#0A6660' }}>Module A — Robust Z-Score</div>
                  <div className="text-xs text-navy-700 space-y-0.5">
                    <div>Observed 0h: <span className="font-mono font-bold">{c.value_0h} µA</span></div>
                    <div>Lot median: <span className="font-mono font-bold">{c.lotMedian} µA</span></div>
                    <div>Lot MAD: <span className="font-mono font-bold">{c.lotMAD} µA</span></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-navy-400">Modified z-score</div>
                  <div className={`text-2xl font-mono font-bold ${flaggedByA ? 'text-saffron-700' : 'text-teal-700'}`}>{c.zScore}</div>
                  <div className={`text-[10px] font-mono font-bold mt-0.5 px-2 py-0.5 rounded-full ${flaggedByA ? 'bg-saffron-500 text-white' : 'bg-teal-500 text-white'}`}>
                    {flaggedByA ? `⚠ FLAGGED (>${zThreshold})` : `✓ PASS (<${zThreshold})`}
                  </div>
                </div>
              </div>
              <ZScoreBar value={c.zScore} threshold={zThreshold} />
            </div>

            {/* Module B result */}
            <div className={`p-4 rounded-xl border mb-4 ${flaggedByB ? 'bg-navy-50 border-navy-200' : 'bg-teal-50 border-teal-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-1"
                    style={{ color: flaggedByB ? '#163054' : '#0A6660' }}>Module B — Gradient Boosting Drift</div>
                  <div className="text-xs text-navy-700 space-y-0.5">
                    <div>Predicted 168h: <span className="font-mono font-bold">{c.predicted_168h} µA</span></div>
                    <div>Safety slope: <span className="font-mono font-bold">{c.safetySlope} µA</span></div>
                    <div>
                      {flaggedByB
                        ? <span>Margin: <span className="font-mono font-bold text-navy-700">+{(c.predicted_168h - c.safetySlope).toFixed(1)} µA over slope</span></span>
                        : <span>Margin: <span className="font-mono font-bold text-teal-700">{(c.safetySlope - c.predicted_168h).toFixed(1)} µA under slope</span></span>
                      }
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-navy-400">GB MAE</div>
                  <div className="text-sm font-mono font-bold text-navy-900">±0.57 µA</div>
                  <div className={`text-[10px] font-mono font-bold mt-1 px-2 py-0.5 rounded-full ${flaggedByB ? 'bg-navy-700 text-white' : 'bg-teal-500 text-white'}`}>
                    {flaggedByB ? '⚠ FLAGGED' : '✓ PASS'}
                  </div>
                </div>
              </div>
            </div>

            {/* explain_flag() verbatim output */}
            <div className="bg-ice-50 rounded-xl border border-border-light p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded bg-navy-800 flex items-center justify-center">
                  <span className="text-white text-[9px] font-mono font-bold">{'{}'}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-navy-600 uppercase tracking-wide">explain_flag() output — verbatim</span>
              </div>
              <p className="text-xs text-navy-700 leading-relaxed font-sans">{c.explanation}</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { onNavigate('drift-prediction'); addToast(`Viewing drift trajectory for ${c.id}`, 'info'); }}
                className="flex-1 py-2.5 border border-border hover:bg-ice-100 text-navy-700 text-sm font-semibold rounded-xl transition-colors">
                Drift Trajectory
              </button>
              <button onClick={() => { onNavigate('report-export'); addToast(`Preparing report for ${c.id}`, 'info'); }}
                className="flex-1 py-2.5 bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold rounded-xl transition-colors">
                Generate Report →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
