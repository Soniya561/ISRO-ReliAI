import { useState } from 'react';
import { PageProps, ComponentRecord, Classification } from '../types';
import { SHOWCASE_COMPONENTS } from '../data';

const CLS_CONFIG: Record<Classification, { bg: string; border: string; text: string; dot: string; ring: string; label: string }> = {
  NORMAL: {
    bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800',
    dot: 'bg-teal-500', ring: 'ring-teal-300', label: 'Normal',
  },
  MODULE_A: {
    bg: 'bg-saffron-50', border: 'border-saffron-200', text: 'text-saffron-800',
    dot: 'bg-saffron-500', ring: 'ring-saffron-300', label: 'Module A — z-score flag',
  },
  MODULE_B: {
    bg: 'bg-navy-50', border: 'border-navy-300', text: 'text-navy-800',
    dot: 'bg-navy-500', ring: 'ring-navy-300', label: 'Module B — drift flag',
  },
};

function DetailPanel({ c, onExplain }: { c: ComponentRecord; onExplain: () => void }) {
  const cc = CLS_CONFIG[c.classification];
  const exceedsSlope = c.predicted_168h > c.safetySlope;
  const flaggedByA = Math.abs(c.zScore) > 3.5;

  return (
    <div className={`bg-white rounded-2xl border-2 p-5 ${cc.border}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[10px] font-mono text-navy-400 uppercase tracking-widest mb-1">Component Profile</div>
          <h2 className="text-xl font-display font-bold text-navy-900">{c.id}</h2>
          <div className="text-sm text-navy-500 mt-0.5">{c.lotLabel} · {c.classification.replace('_', ' ')}</div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-bold ${cc.bg} ${cc.border} ${cc.text}`}>
          <span className={`w-2 h-2 rounded-full ${cc.dot}`} />
          {cc.label}
        </div>
      </div>

      {/* Measured values */}
      <div className="mb-4">
        <div className="text-[10px] font-mono text-navy-400 uppercase tracking-widest mb-2">Measured Leakage Current (µA)</div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: '0h', value: c.value_0h },
            { label: '24h', value: c.value_24h },
            { label: '96h', value: c.value_96h },
            { label: '168h', value: c.value_168h },
          ].map(m => (
            <div key={m.label} className="bg-ice-50 rounded-xl border border-border-light p-3 text-center">
              <div className="text-[9px] font-mono text-navy-400 uppercase mb-1">{m.label}</div>
              <div className={`text-base font-mono font-bold ${m.value > 40 ? 'text-red-600' : m.value > 20 ? 'text-amber-600' : 'text-navy-900'}`}>
                {m.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Module A check */}
      <div className={`mb-3 p-3 rounded-xl border ${flaggedByA ? 'bg-saffron-50 border-saffron-200' : 'bg-teal-50 border-teal-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wide mb-0.5" style={{ color: flaggedByA ? '#C05C00' : '#0A6660' }}>
              Module A — Robust Z-Score
            </div>
            <div className="text-xs text-navy-600">
              Lot median: {c.lotMedian} µA · MAD: {c.lotMAD} µA
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono text-navy-400">Modified z-score</div>
            <div className={`text-xl font-mono font-bold ${flaggedByA ? 'text-saffron-700' : 'text-teal-700'}`}>
              {c.zScore}
            </div>
            <div className="text-[9px] font-mono text-navy-400">threshold: 3.5</div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${flaggedByA ? 'bg-saffron-500 text-white' : 'bg-teal-500 text-white'}`}>
            {flaggedByA ? '⚠ FLAGGED' : '✓ PASS'}
          </span>
        </div>
      </div>

      {/* Module B check */}
      <div className={`mb-4 p-3 rounded-xl border ${exceedsSlope ? 'bg-navy-50 border-navy-300' : 'bg-teal-50 border-teal-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wide mb-0.5" style={{ color: exceedsSlope ? '#163054' : '#0A6660' }}>
              Module B — Gradient Boosting
            </div>
            <div className="text-xs text-navy-600">
              Safety slope: {c.safetySlope} µA · MAE: ±0.57 µA
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono text-navy-400">Predicted 168h</div>
            <div className={`text-xl font-mono font-bold ${exceedsSlope ? 'text-navy-800' : 'text-teal-700'}`}>
              {c.predicted_168h} µA
            </div>
            {exceedsSlope && (
              <div className="text-[9px] font-mono text-navy-500">+{(c.predicted_168h - c.safetySlope).toFixed(1)} µA over slope</div>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${exceedsSlope ? 'bg-navy-700 text-white' : 'bg-teal-500 text-white'}`}>
            {exceedsSlope ? '⚠ FLAGGED' : '✓ PASS'}
          </span>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-ice-50 rounded-xl border border-border-light p-3 mb-4">
        <div className="text-[9px] font-mono text-navy-400 uppercase tracking-wide mb-1">explain_flag() output</div>
        <p className="text-xs text-navy-700 leading-relaxed">{c.explanation}</p>
      </div>

      <button
        onClick={onExplain}
        className="w-full py-2.5 bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        Full Explainability →
      </button>
    </div>
  );
}

export default function ComponentGrid({ onNavigate, selectedComponent, setSelectedComponent, addToast, zThreshold }: PageProps) {
  const [filter, setFilter] = useState<Classification | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const filtered = SHOWCASE_COMPONENTS.filter(c => {
    if (filter !== 'ALL' && c.classification !== filter) return false;
    if (search && !c.id.toLowerCase().includes(search.toLowerCase()) && !c.lotLabel.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    NORMAL: SHOWCASE_COMPONENTS.filter(c => c.classification === 'NORMAL').length,
    MODULE_A: SHOWCASE_COMPONENTS.filter(c => c.classification === 'MODULE_A').length,
    MODULE_B: SHOWCASE_COMPONENTS.filter(c => c.classification === 'MODULE_B').length,
  };

  return (
    <div className="p-6 max-w-screen-xl">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-navy-900 tracking-tight">Component Grid</h1>
        <p className="text-navy-400 mt-1 text-sm">Click any component to view its classification reasoning (z-score, drift rate, explain_flag output).</p>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Grid panel */}
        <div className="col-span-7">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1.5">
              {(['ALL', 'NORMAL', 'MODULE_A', 'MODULE_B'] as const).map(f => {
                const count = f === 'ALL' ? 60 : counts[f];
                return (
                  <button key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-1.5
                      ${filter === f ? 'bg-navy-800 text-white' : 'bg-white border border-border text-navy-600 hover:bg-ice-100'}`}
                  >
                    {f !== 'ALL' && <span className={`w-1.5 h-1.5 rounded-full ${CLS_CONFIG[f].dot}`} />}
                    {f.replace('_', ' ')} <span className="opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search component…"
              className="ml-auto border border-border rounded-lg px-3 py-1.5 text-xs text-navy-800 bg-white outline-none focus:border-navy-400 w-36" />
          </div>

          {/* Grid */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))' }}>
              {filtered.map(c => {
                const cc = CLS_CONFIG[c.classification];
                const isSelected = selectedComponent?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedComponent(c); }}
                    className={`group flex flex-col items-center gap-1 p-2 rounded-xl border transition-all hover:shadow-sm
                      ${isSelected ? `ring-2 ${cc.ring} ${cc.bg} ${cc.border} shadow-sm` : `bg-white border-border hover:${cc.bg} hover:${cc.border}`}`}
                  >
                    <span className={`w-4 h-4 rounded-full ${cc.dot} ${isSelected ? '' : 'opacity-70 group-hover:opacity-100'}`} />
                    <span className="text-[9px] font-mono text-navy-600 leading-none text-center">{c.id}</span>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full py-8 text-center text-navy-400 text-sm">No components match filter.</div>
              )}
            </div>
            <div className="mt-4 flex gap-4 text-xs font-mono text-navy-400 pt-3 border-t border-border-light">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Normal — z-score &lt; {zThreshold}, predicted 168h &lt; safety slope</span>
            </div>
            <div className="flex gap-4 text-xs font-mono text-navy-400 mt-1">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-saffron-500" /> Module A — modified z-score &gt; {zThreshold} at 0h</span>
            </div>
            <div className="flex gap-4 text-xs font-mono text-navy-400 mt-1">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-navy-500" /> Module B — predicted 168h exceeds lot safety slope</span>
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <div className="col-span-5">
          {selectedComponent ? (
            <DetailPanel
              c={selectedComponent}
              onExplain={() => { onNavigate('risk-explainability'); addToast(`Viewing full explainability for ${selectedComponent.id}`, 'info'); }}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-border p-10 text-center text-navy-400 h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-3">🧩</div>
              <div className="font-display font-semibold text-navy-600 text-lg mb-1">Select a Component</div>
              <div className="text-sm leading-relaxed">Click any component in the grid to view its measured values, z-score, GB prediction, and plain-language explanation.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
