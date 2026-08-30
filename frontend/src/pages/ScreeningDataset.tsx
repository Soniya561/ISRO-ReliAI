import { PageProps } from '../types';
import { DATASET_SUMMARY, SHOWCASE_COMPONENTS } from '../data';

// part_type matches real CSV values: 'normal' | 'obvious_outlier' | 'latent_defect'
// is_anomaly: 0 = pass, 1 = flagged
const SAMPLE_ROWS = [
  { lot_id: 'LOT-01', part_id: 'L01-C01', part_type: 'normal',          is_anomaly: 0, value_0h: 10.08, value_24h: 10.21, value_96h: 10.63, value_168h: 11.02 },
  { lot_id: 'LOT-01', part_id: 'L01-C04', part_type: 'latent_defect',   is_anomaly: 1, value_0h: 10.54, value_24h: 12.31, value_96h: 28.40, value_168h: 51.20 },
  { lot_id: 'LOT-03', part_id: 'L03-C07', part_type: 'obvious_outlier', is_anomaly: 1, value_0h: 44.22, value_24h: 45.08, value_96h: 46.90, value_168h: 48.40 },
  { lot_id: 'LOT-07', part_id: 'L07-C03', part_type: 'normal',          is_anomaly: 0, value_0h: 10.31, value_24h: 10.45, value_96h: 10.78, value_168h: 11.14 },
  { lot_id: 'LOT-10', part_id: 'L10-C05', part_type: 'obvious_outlier', is_anomaly: 1, value_0h: 41.88, value_24h: 42.71, value_96h: 44.10, value_168h: 46.10 },
  { lot_id: 'LOT-15', part_id: 'L15-C04', part_type: 'latent_defect',   is_anomaly: 1, value_0h: 10.22, value_24h: 11.94, value_96h: 29.70, value_168h: 49.80 },
];

const PART_TYPE_BADGE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  normal:          { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200',    label: 'normal' },
  obvious_outlier: { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   label: 'obvious_outlier' },
  latent_defect:   { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     label: 'latent_defect' },
};

export default function ScreeningDataset({ onNavigate, addToast }: PageProps) {
  return (
    <div className="p-6 max-w-screen-xl">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-navy-900 tracking-tight">Screening Dataset</h1>
        <p className="text-navy-400 mt-1 text-sm">Burn-in test records used to train and evaluate ISRO RELI-AI.</p>
      </div>

      {/* Dataset note */}
      <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3">
        <span className="text-amber-500 text-lg flex-shrink-0 mt-0.5">ℹ</span>
        <div className="flex-1">
          <div className="text-xs font-mono font-bold text-amber-700 uppercase tracking-wide mb-1">Synthetic Dataset</div>
          <p className="text-sm text-amber-800 leading-relaxed mb-2">{DATASET_SUMMARY.samplingNote}</p>
          <div className="flex flex-wrap gap-3 text-xs font-mono">
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">part_type: normal — 555</span>
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">obvious_outlier — 15</span>
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">latent_defect — 30</span>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-5 gap-4 mb-5">
        {[
          { label: 'Total Components', value: '600', sub: 'Across all lots' },
          { label: 'Lots', value: '15', sub: '40 components each' },
          { label: 'Normal', value: '555', sub: `${((555/600)*100).toFixed(1)}% of total` },
          { label: 'Obvious Outliers', value: '15', sub: 'Module A (0h flag)' },
          { label: 'Latent Defects', value: '30', sub: 'Module B (drift flag)' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-5">
            <div className="text-[10px] font-mono text-navy-400 uppercase tracking-widest">{s.label}</div>
            <div className="text-3xl font-mono font-bold mt-1 text-navy-900">{s.value}</div>
            <div className="text-xs text-navy-400 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Timepoints + schema */}
      <div className="grid grid-cols-12 gap-5 mb-5">
        <div className="col-span-4 bg-white rounded-2xl border border-border p-5">
          <h2 className="font-display font-semibold text-navy-900 mb-4">Measurement Timepoints</h2>
          <div className="relative flex flex-col gap-4">
            <div className="absolute left-3.5 top-4 bottom-4 w-px bg-border" />
            {[
              { t: '0h', label: 'Initial screening', note: 'Module A outlier detection (z-score)' },
              { t: '24h', label: 'Early check-in', note: 'Input to Gradient Boosting model' },
              { t: '96h', label: 'Mid-point', note: 'Observed drift validation' },
              { t: '168h', label: 'End of burn-in', note: 'Final qualification decision' },
            ].map((tp, i) => (
              <div key={tp.t} className="flex items-start gap-4 pl-8 relative">
                <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-navy-800 flex items-center justify-center flex-shrink-0 z-10">
                  <span className="text-white text-[10px] font-mono font-bold">{i + 1}</span>
                </div>
                <div>
                  <div className="font-mono font-bold text-navy-900 text-sm">{tp.t}</div>
                  <div className="text-xs font-semibold text-navy-700">{tp.label}</div>
                  <div className="text-xs text-navy-400 leading-relaxed">{tp.note}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3 bg-ice-50 rounded-xl border border-border-light">
            <div className="text-[10px] font-mono text-navy-400 uppercase tracking-wide mb-1">CSV Column Schema</div>
            {['lot_id', 'part_id', 'part_type', 'is_anomaly', 'value_0h', 'value_24h', 'value_96h', 'value_168h'].map(f => (
              <div key={f} className="text-xs font-mono text-navy-700 py-0.5 border-b border-border-light last:border-0">{f}</div>
            ))}
          </div>
        </div>

        {/* Component records table — CSV schema verbatim */}
        <div className="col-span-8 bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-navy-900">Component Records</h2>
            <span className="text-xs font-mono text-navy-400">60 sampled · schema mirrors real CSV verbatim</span>
          </div>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b-2 border-border">
                  {['lot_id', 'part_id', 'part_type', 'is_anomaly', 'value_0h', 'value_24h', 'value_96h', 'value_168h'].map((h, i) => (
                    <th key={h}
                      className={`py-2 px-2 font-mono font-bold text-navy-500 text-[10px] tracking-wide whitespace-nowrap
                        ${i >= 4 ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SHOWCASE_COMPONENTS.map(c => {
                  const pt = c.classification === 'MODULE_A' ? 'obvious_outlier'
                    : c.classification === 'MODULE_B' ? 'latent_defect'
                    : 'normal';
                  const isAnomaly = c.classification !== 'NORMAL' ? 1 : 0;
                  const badge = PART_TYPE_BADGE[pt];
                  return (
                    <tr key={c.id} className="border-b border-border-light hover:bg-ice-50 transition-colors">
                      <td className="py-1.5 px-2 font-mono text-navy-600 whitespace-nowrap">{c.lotLabel}</td>
                      <td className="py-1.5 px-2 font-mono font-bold text-navy-900 whitespace-nowrap">{c.id}</td>
                      <td className="py-1.5 px-2">
                        <span className={`inline-block px-1.5 py-0.5 rounded border font-mono font-semibold text-[9px] whitespace-nowrap ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        {isAnomaly === 1
                          ? <span className="text-red-500 text-xs leading-none" title="is_anomaly = 1">🔴</span>
                          : <span className="font-mono text-navy-300">—</span>}
                      </td>
                      {([c.value_0h, c.value_24h, c.value_96h, c.value_168h] as number[]).map((v, i) => (
                        <td key={i} className="py-1.5 px-2 font-mono text-navy-900 text-right whitespace-nowrap tabular-nums">
                          {v.toFixed(2)}<span className="text-navy-400 text-[9px] ml-0.5">µA</span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sample data preview */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-navy-900">Sample Records</h2>
          <span className="text-xs font-mono text-navy-400">6 representative rows · schema mirrors real CSV verbatim</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-border">
                {/* Exact CSV column names, snake_case, no friendly labels */}
                {['lot_id', 'part_id', 'part_type', 'is_anomaly', 'value_0h', 'value_24h', 'value_96h', 'value_168h'].map((h, i) => (
                  <th key={h}
                    className={`py-2.5 px-3 font-mono font-bold text-navy-500 text-[10px] tracking-wide whitespace-nowrap
                      ${i >= 4 ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ROWS.map(row => {
                const badge = PART_TYPE_BADGE[row.part_type];
                return (
                  <tr key={row.part_id} className="border-b border-border-light hover:bg-ice-50 transition-colors">
                    {/* lot_id — left, mono */}
                    <td className="py-2.5 px-3 font-mono text-navy-600 whitespace-nowrap">{row.lot_id}</td>
                    {/* part_id — left, mono, bold */}
                    <td className="py-2.5 px-3 font-mono font-bold text-navy-900 whitespace-nowrap">{row.part_id}</td>
                    {/* part_type — colored badge */}
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded border font-mono font-semibold text-[10px] whitespace-nowrap ${badge.bg} ${badge.text} ${badge.border}`}>
                        {badge.label}
                      </span>
                    </td>
                    {/* is_anomaly — binary indicator */}
                    <td className="py-2.5 px-3 text-center">
                      {row.is_anomaly === 1
                        ? <span className="text-red-500 text-sm leading-none" title="is_anomaly = 1">🔴</span>
                        : <span className="font-mono text-navy-300 text-sm">—</span>}
                    </td>
                    {/* value columns — right-aligned, mono, µA suffix */}
                    {([row.value_0h, row.value_24h, row.value_96h, row.value_168h] as number[]).map((v, i) => (
                      <td key={i} className="py-2.5 px-3 font-mono text-navy-900 text-right whitespace-nowrap tabular-nums">
                        {v.toFixed(2)}<span className="text-navy-400 text-[10px] ml-0.5">µA</span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={() => addToast('CSV export ready — 600 rows × 8 columns.', 'success')}
            className="px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold rounded-xl transition-colors">
            Export CSV
          </button>
          <button onClick={() => onNavigate('component-grid')}
            className="px-4 py-2 border border-border hover:bg-ice-100 text-navy-700 text-xs font-semibold rounded-xl transition-colors">
            Component Grid →
          </button>
        </div>
      </div>
    </div>
  );
}
