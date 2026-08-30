import { useState } from 'react';
import { PageProps } from '../types';
import { EXAMPLE_MODULE_B, DATASHEET_CEILING } from '../data';

export default function ReportExport({ selectedComponent, addToast }: PageProps) {
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  const c = selectedComponent ?? EXAMPLE_MODULE_B;
  const date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setGenerated(true); addToast(`Report generated for ${c.id}.`, 'success'); }, 1800);
  };

  const sections = [
    {
      num: '01', title: 'Component Information',
      items: [
        { label: 'Component ID', value: c.id },
        { label: 'Lot', value: c.lotLabel },
        { label: 'Classification', value: c.classification.replace('_', ' ') },
        { label: 'Report Date', value: date },
      ],
    },
    {
      num: '02', title: 'Test Readings (µA)',
      items: [
        { label: '0h', value: `${c.value_0h} µA` },
        { label: '24h', value: `${c.value_24h} µA` },
        { label: '96h', value: `${c.value_96h} µA` },
        { label: '168h (measured)', value: `${c.value_168h} µA` },
      ],
    },
    {
      num: '03', title: 'Module A — Robust Z-Score Result',
      items: [
        { label: 'Lot median (0h)', value: `${c.lotMedian} µA` },
        { label: 'Lot MAD (0h)', value: `${c.lotMAD} µA` },
        { label: 'Modified z-score', value: `${c.zScore}` },
        { label: 'Threshold', value: '3.5' },
        { label: 'Module A result', value: Math.abs(c.zScore) > 3.5 ? 'FLAGGED' : 'PASS' },
      ],
    },
    {
      num: '04', title: 'Module B — Gradient Boosting Result',
      items: [
        { label: 'Predicted 168h', value: `${c.predicted_168h} µA` },
        { label: 'Safety slope', value: `${c.safetySlope} µA` },
        { label: 'Margin', value: `${(c.predicted_168h - c.safetySlope).toFixed(1)} µA` },
        { label: 'GB MAE', value: '±0.57 µA' },
        { label: 'Module B result', value: c.predicted_168h > c.safetySlope ? 'FLAGGED' : 'PASS' },
      ],
    },
    {
      num: '05', title: 'Explanation',
      items: [{ label: 'explain_flag() output', value: c.explanation }],
    },
    {
      num: '06', title: 'Recommendation',
      items: [
        {
          label: 'Action',
          value: c.classification === 'NORMAL'
            ? 'Component qualifies for deployment. No anomaly detected by either module.'
            : c.classification === 'MODULE_A'
              ? 'Reject — initial leakage current exceeds lot statistical limit. Do not qualify for flight application.'
              : 'Reject — Gradient Boosting predicts leakage will exceed safety slope by 168h. Extended monitoring or withdrawal recommended.',
        },
        { label: 'Datasheet absolute limit', value: `${DATASHEET_CEILING} µA` },
      ],
    },
  ];

  const statusColor = c.classification === 'NORMAL'
    ? 'text-teal-400'
    : c.classification === 'MODULE_A'
      ? 'text-saffron-400'
      : 'text-red-400';

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy-900 tracking-tight">Engineering Report</h1>
          <p className="text-navy-400 mt-1 text-sm">Automated ISRO RELI-AI screening report — ISRO format.</p>
        </div>
        {!generated ? (
          <button onClick={handleGenerate} disabled={generating}
            className="px-5 py-2.5 bg-saffron-500 hover:bg-saffron-600 disabled:opacity-60 text-white text-sm font-bold font-display rounded-xl transition-all">
            {generating ? '⏳ Generating…' : '📋 Generate Report'}
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => addToast('PDF exported successfully.', 'success')}
              className="px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold rounded-xl transition-colors">Export PDF</button>
            <button onClick={() => addToast('CSV exported — 600 records + per-component summary.', 'success')}
              className="px-4 py-2 border border-border hover:bg-ice-100 text-navy-700 text-sm font-semibold rounded-xl transition-colors">Export CSV</button>
          </div>
        )}
      </div>

      <div className={`bg-white rounded-2xl border border-border overflow-hidden transition-opacity ${!generated ? 'opacity-50' : ''}`}>
        {/* Document header */}
        <div className="bg-navy-900 text-white px-8 py-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-mono text-navy-300 uppercase tracking-widest mb-1">ISRO RELI-AI — Screening Intelligence Report</div>
              <div className="text-xl font-display font-bold">Component Burn-In Analysis</div>
              <div className="font-mono text-navy-300 mt-1 text-sm">{c.id} · {c.lotLabel} · {date}</div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-mono font-bold ${statusColor}`}>{c.classification.replace('_', ' ')}</div>
              <div className="text-[10px] font-mono text-navy-400 mt-1">RPT-{c.id}-{Date.now().toString().slice(-6)}</div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="divide-y divide-border-light">
          {sections.map(section => (
            <div key={section.num} className="px-8 py-5">
              <h3 className="font-display font-semibold text-navy-800 text-sm mb-3 flex items-center gap-2">
                <span className="text-[10px] font-mono bg-navy-50 text-navy-500 px-2 py-0.5 rounded border border-border-light">{section.num}</span>
                {section.title}
              </h3>
              <div className="space-y-1.5">
                {section.items.map(item => (
                  <div key={item.label}
                    className={`flex gap-4 ${section.num === '05' ? 'flex-col' : 'items-baseline justify-between border-b border-border-light pb-1.5'}`}>
                    <span className="text-xs font-mono text-navy-400 flex-shrink-0">{item.label}</span>
                    <span className={`text-xs font-semibold font-mono text-navy-800 ${section.num === '05' ? 'text-xs font-sans font-normal leading-relaxed bg-ice-50 p-2.5 rounded-lg border border-border-light' : ''}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-8 py-4 bg-navy-50 border-t border-border text-center">
          <div className="text-[10px] font-mono text-navy-400">
            Generated by ISRO RELI-AI v2.0 · Robust Z-Score + Gradient Boosting · {date}
          </div>
          <div className="text-[10px] font-mono text-navy-300 mt-0.5">
            DEMO MODE — SYNTHETIC DATA · Not for flight qualification use without real sensor integration
          </div>
        </div>
      </div>

      {!generated && (
        <div className="mt-4 text-center text-sm text-navy-400">
          Click "Generate Report" to compile the full screening document for {c.id}.
        </div>
      )}
    </div>
  );
}
