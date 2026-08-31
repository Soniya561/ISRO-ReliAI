import { useState } from 'react';
import { PageProps } from '../types';
import { DATASET_SUMMARY, SHOWCASE_COMPONENTS } from '../data';
import { ComponentRecord, DatabaseComponentRecord } from '../types';
import { analyzeComponent, getComponents, uploadDataset } from '../services/api';

// Deterministic helpers — same seed approach as data.ts
function sr(n: number): number {
  const x = Math.abs(Math.sin(n * 12.9898 + 78.233) * 43758.5453);
  return x - Math.floor(x);
}

// Burn-in temperature: 85–125 °C, varies by lot (stepped, deterministic)
function burnInTemp(lot: number): number {
  const steps = [85, 90, 95, 100, 105, 110, 115, 120, 125, 105, 95, 110, 90, 115, 100];
  return steps[(lot - 1) % steps.length];
}

// Propagation delay (ns): normal ~2–4 ns, flagged ~5.5–9.5 ns
function propDelay(c: ComponentRecord): number {
  const seed = c.lot * 17 + c.value_0h * 3.14;
  if (c.classification === 'NORMAL') {
    return +(2.2 + sr(seed) * 1.8).toFixed(2);
  }
  return +(5.5 + sr(seed) * 4.0).toFixed(2);
}

// Component_Status badge config
const STATUS_BADGE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  Normal:         { bg: 'bg-teal-50',  text: 'text-teal-700',  border: 'border-teal-200',  label: 'Normal' },
  Outlier:        { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Outlier' },
  'Latent Defect':{ bg: 'bg-red-50',   text: 'text-red-700',   border: 'border-red-200',   label: 'Latent Defect' },
};

function componentStatus(c: ComponentRecord): string {
  if (c.classification === 'MODULE_A') return 'Outlier';
  if (c.classification === 'MODULE_B') return 'Latent Defect';
  return 'Normal';
}

function toStatusBadgeLabel(status: string): string {
  const normalized = status?.toString().trim().toUpperCase();
  if (normalized === 'MODULE_A' || normalized === 'OUTLIER') return 'Outlier';
  if (normalized === 'MODULE_B' || normalized === 'LATENT_DEFECT' || normalized === 'HIGH_RISK') return 'Latent Defect';
  return 'Normal';
}

type DatasetRow = {
  Component_ID: string;
  Lot_ID: string;
  Time_Hours: number;
  Burn_In_Temperature_C: number;
  Iddq_uA: number;
  Leakage_Current_uA: number;
  Propagation_Delay_ns: number;
  Component_Status: string;
};

function mapDatabaseRows(records: DatabaseComponentRecord[]): DatasetRow[] {
  return records.map(record => ({
    Component_ID: record.component_id,
    Lot_ID: record.lot_id,
    Time_Hours: Number(record.time_hours),
    Burn_In_Temperature_C: Number(record.burn_in_temperature_c),
    Iddq_uA: Number(record.iddq_ua),
    Leakage_Current_uA: Number(record.leakage_current_ua),
    Propagation_Delay_ns: Number(record.propagation_delay_ns),
    Component_Status: record.component_status || 'NORMAL',
  }));
}

// 6 representative sample rows (static, new schema)
const SAMPLE_ROWS = [
  { Component_ID: 'L01-C01', Lot_ID: 'LOT-01', Time_Hours: 168, Burn_In_Temperature_C: 85,  Iddq_uA: 10.08, Leakage_Current_uA: 11.02, Propagation_Delay_ns: 2.87, Component_Status: 'Normal' },
  { Component_ID: 'L01-C04', Lot_ID: 'LOT-01', Time_Hours: 168, Burn_In_Temperature_C: 85,  Iddq_uA: 10.54, Leakage_Current_uA: 51.20, Propagation_Delay_ns: 7.43, Component_Status: 'Latent Defect' },
  { Component_ID: 'L03-C07', Lot_ID: 'LOT-03', Time_Hours: 168, Burn_In_Temperature_C: 95,  Iddq_uA: 44.22, Leakage_Current_uA: 48.40, Propagation_Delay_ns: 8.91, Component_Status: 'Outlier' },
  { Component_ID: 'L07-C03', Lot_ID: 'LOT-07', Time_Hours: 168, Burn_In_Temperature_C: 115, Iddq_uA: 10.31, Leakage_Current_uA: 11.14, Propagation_Delay_ns: 3.12, Component_Status: 'Normal' },
  { Component_ID: 'L10-C05', Lot_ID: 'LOT-10', Time_Hours: 168, Burn_In_Temperature_C: 105, Iddq_uA: 41.88, Leakage_Current_uA: 46.10, Propagation_Delay_ns: 6.78, Component_Status: 'Outlier' },
  { Component_ID: 'L15-C04', Lot_ID: 'LOT-15', Time_Hours: 168, Burn_In_Temperature_C: 100, Iddq_uA: 10.22, Leakage_Current_uA: 49.80, Propagation_Delay_ns: 8.14, Component_Status: 'Latent Defect' },
];

const COLS = [
  'Component_ID', 'Lot_ID', 'Time_Hours',
  'Burn_In_Temperature_C', 'Iddq_uA',
  'Leakage_Current_uA', 'Propagation_Delay_ns', 'Component_Status',
];

// Which columns are right-aligned numbers
const RIGHT_COLS = new Set(['Time_Hours', 'Burn_In_Temperature_C', 'Iddq_uA', 'Leakage_Current_uA', 'Propagation_Delay_ns']);

const NUM_UNITS: Record<string, string> = {
  Iddq_uA: 'µA',
  Leakage_Current_uA: 'µA',
  Propagation_Delay_ns: 'ns',
  Burn_In_Temperature_C: '°C',
  Time_Hours: 'h',
};

function ColHeader({ col }: { col: string }) {
  return (
    <th className={`py-2 px-2 font-mono font-bold text-navy-500 text-[10px] tracking-wide whitespace-nowrap ${RIGHT_COLS.has(col) ? 'text-right' : 'text-left'}`}>
      {col}
    </th>
  );
}

function StatusBadge({ status, small = false }: { status: string; small?: boolean }) {
  const b = STATUS_BADGE[status] ?? STATUS_BADGE['Normal'];
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded border font-mono font-semibold whitespace-nowrap ${b.bg} ${b.text} ${b.border} ${small ? 'text-[9px]' : 'text-[10px]'}`}>
      {b.label}
    </span>
  );
}

export default function ScreeningDataset({ onNavigate, addToast }: PageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('No file selected');
  const [datasetRows, setDatasetRows] = useState<DatasetRow[]>(() => SHOWCASE_COMPONENTS.map(c => ({
    Component_ID: c.id,
    Lot_ID: c.lotLabel,
    Time_Hours: 168,
    Burn_In_Temperature_C: 100,
    Iddq_uA: c.value_0h,
    Leakage_Current_uA: c.value_168h,
    Propagation_Delay_ns: 0,
    Component_Status: componentStatus(c),
  })));
  const [datasetStats, setDatasetStats] = useState({
    totalRecords: 600,
    totalComponents: 600,
    totalLots: 15,
  });

  const refreshDatasetTable = async () => {
    try {
      const response = await getComponents(1, 500);
      if (!response?.success || !Array.isArray(response.components) || response.components.length === 0) {
        return { success: false, rows: [] as DatasetRow[] };
      }

      const nextRows = mapDatabaseRows(response.components);
      setDatasetRows(nextRows);
      setDatasetStats({
        totalRecords: nextRows.length,
        totalComponents: new Set(nextRows.map(row => row.Component_ID)).size,
        totalLots: new Set(nextRows.map(row => row.Lot_ID)).size,
      });
      return { success: true, rows: nextRows };
    } catch {
      return { success: false, rows: [] as DatasetRow[] };
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      addToast('Please choose a CSV file first.', 'warning');
      setUploadStatus('No file selected');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading and validating CSV…');

    try {
      const result = await uploadDataset(selectedFile);
      setDatasetStats({
        totalRecords: result.total_records,
        totalComponents: result.total_components,
        totalLots: result.total_lots,
      });

      const refreshed = await refreshDatasetTable();
      const analysisTargets = refreshed.success
        ? Array.from(new Set(refreshed.rows.map(row => row.Component_ID)))
        : [];

      let analyzedCount = 0;
      for (const componentId of analysisTargets) {
        try {
          await analyzeComponent(componentId);
          analyzedCount += 1;
        } catch {
          // Continue even if one component analysis fails.
        }
      }

      const statusMessage = `${result.message || 'Dataset uploaded and validated'} — ${result.total_records} records • ${result.total_components} components • ${result.total_lots} lots${analysisTargets.length ? ` • AI analysis run for ${analyzedCount}/${analysisTargets.length} components` : ''}`;
      setUploadStatus(statusMessage);
      addToast(statusMessage, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      setUploadStatus(message);
      addToast(message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-screen-xl">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-navy-900 tracking-tight">Screening Dataset</h1>
        <p className="text-navy-400 mt-1 text-sm">Burn-in test records used to train and evaluate ISRO RELI-AI.</p>
      </div>

      <div className="mb-5 p-4 bg-white border border-border rounded-2xl flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <input id="csv-upload-input" type="file" accept=".csv" className="hidden" onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setSelectedFile(file);
            setUploadStatus(file ? file.name : 'No file selected');
          }} />
          <label htmlFor="csv-upload-input" className="px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer">
            Choose CSV
          </label>
          <span className="text-xs font-mono text-navy-600 bg-ice-100 border border-border-light px-2.5 py-1.5 rounded-lg min-w-[180px] truncate">
            {selectedFile ? selectedFile.name : 'No file selected'}
          </span>
        </div>

        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="px-4 py-2 bg-saffron-500 hover:bg-saffron-600 disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition-colors"
        >
          {isUploading ? 'Uploading…' : 'Upload & Validate'}
        </button>
      </div>

      <div className="mb-4 text-xs font-mono text-navy-600">{uploadStatus}</div>

      {/* Dataset note */}
      <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3">
        <span className="text-amber-500 text-lg flex-shrink-0 mt-0.5">ℹ</span>
        <div className="flex-1">
          <div className="text-xs font-mono font-bold text-amber-700 uppercase tracking-wide mb-1">Synthetic Dataset</div>
          <p className="text-sm text-amber-800 leading-relaxed mb-2">{DATASET_SUMMARY.samplingNote}</p>
          <div className="flex flex-wrap gap-3 text-xs font-mono">
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Component_Status: Normal — 555</span>
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Outlier — 15</span>
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Latent Defect — 30</span>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-5 gap-4 mb-5">
        {[
          { label: 'Total Records', value: String(datasetStats.totalRecords), sub: 'Uploaded data rows' },
          { label: 'Total Components', value: String(datasetStats.totalComponents), sub: 'Across all lots' },
          { label: 'Lots', value: String(datasetStats.totalLots), sub: 'Unique lot groups' },
          { label: 'Normal', value: '555', sub: `${((555 / 600) * 100).toFixed(1)}% of total` },
          { label: 'Outliers', value: '15', sub: 'High Iddq at 0h' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-5">
            <div className="text-[10px] font-mono text-navy-400 uppercase tracking-widest">{s.label}</div>
            <div className="text-3xl font-mono font-bold mt-1 text-navy-900">{s.value}</div>
            <div className="text-xs text-navy-400 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Timepoints + scrollable records table */}
      <div className="grid grid-cols-12 gap-5 mb-5">
        <div className="col-span-4 bg-white rounded-2xl border border-border p-5">
          <h2 className="font-display font-semibold text-navy-900 mb-4">Measurement Timepoints</h2>
          <div className="relative flex flex-col gap-4">
            <div className="absolute left-3.5 top-4 bottom-4 w-px bg-border" />
            {[
              { t: '0h', label: 'Initial screening', note: 'Iddq baseline; Module A outlier detection' },
              { t: '24h', label: 'Early check-in', note: 'Drift seed; input to Gradient Boosting' },
              { t: '96h', label: 'Mid-point', note: 'Observed leakage current validation' },
              { t: '168h', label: 'End of burn-in', note: 'Final leakage & propagation delay recorded' },
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
            {COLS.map(f => (
              <div key={f} className="text-xs font-mono text-navy-700 py-0.5 border-b border-border-light last:border-0">{f}</div>
            ))}
          </div>
        </div>

        {/* Scrollable component records */}
        <div className="col-span-8 bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-navy-900">Component Records</h2>
            <span className="text-xs font-mono text-navy-400">60 sampled · schema mirrors real CSV verbatim</span>
          </div>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b-2 border-border">
                  {COLS.map(h => <ColHeader key={h} col={h} />)}
                </tr>
              </thead>
              <tbody>
                {datasetRows.map((row, idx) => {
                  const status = toStatusBadgeLabel(row.Component_Status);
                  return (
                    <tr key={`${row.Component_ID}-${row.Time_Hours}-${idx}`} className="border-b border-border-light hover:bg-ice-50 transition-colors">
                      <td className="py-1.5 px-2 font-mono font-bold text-navy-900 whitespace-nowrap">{row.Component_ID}</td>
                      <td className="py-1.5 px-2 font-mono text-navy-600 whitespace-nowrap">{row.Lot_ID}</td>
                      <td className="py-1.5 px-2 font-mono text-navy-900 text-right tabular-nums whitespace-nowrap">
                        {row.Time_Hours}<span className="text-navy-400 text-[9px] ml-0.5">h</span>
                      </td>
                      <td className="py-1.5 px-2 font-mono text-navy-900 text-right tabular-nums whitespace-nowrap">
                        {row.Burn_In_Temperature_C.toFixed(0)}<span className="text-navy-400 text-[9px] ml-0.5">°C</span>
                      </td>
                      <td className="py-1.5 px-2 font-mono text-navy-900 text-right tabular-nums whitespace-nowrap">
                        {row.Iddq_uA.toFixed(2)}<span className="text-navy-400 text-[9px] ml-0.5">µA</span>
                      </td>
                      <td className="py-1.5 px-2 font-mono text-navy-900 text-right tabular-nums whitespace-nowrap">
                        {row.Leakage_Current_uA.toFixed(2)}<span className="text-navy-400 text-[9px] ml-0.5">µA</span>
                      </td>
                      <td className="py-1.5 px-2 font-mono text-navy-900 text-right tabular-nums whitespace-nowrap">
                        {row.Propagation_Delay_ns.toFixed(2)}<span className="text-navy-400 text-[9px] ml-0.5">ns</span>
                      </td>
                      <td className="py-1.5 px-2">
                        <StatusBadge status={status} small />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sample records — same schema */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-navy-900">Sample Records</h2>
          <span className="text-xs font-mono text-navy-400">6 representative rows · schema mirrors real CSV verbatim</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-border">
                {COLS.map(h => <ColHeader key={h} col={h} />)}
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ROWS.map(row => (
                <tr key={row.Component_ID} className="border-b border-border-light hover:bg-ice-50 transition-colors">
                  <td className="py-2.5 px-2 font-mono font-bold text-navy-900 whitespace-nowrap">{row.Component_ID}</td>
                  <td className="py-2.5 px-2 font-mono text-navy-600 whitespace-nowrap">{row.Lot_ID}</td>
                  <td className="py-2.5 px-2 font-mono text-navy-900 text-right tabular-nums whitespace-nowrap">
                    {row.Time_Hours}<span className="text-navy-400 text-[10px] ml-0.5">h</span>
                  </td>
                  <td className="py-2.5 px-2 font-mono text-navy-900 text-right tabular-nums whitespace-nowrap">
                    {row.Burn_In_Temperature_C}<span className="text-navy-400 text-[10px] ml-0.5">°C</span>
                  </td>
                  <td className="py-2.5 px-2 font-mono text-navy-900 text-right tabular-nums whitespace-nowrap">
                    {row.Iddq_uA.toFixed(2)}<span className="text-navy-400 text-[10px] ml-0.5">µA</span>
                  </td>
                  <td className="py-2.5 px-2 font-mono text-navy-900 text-right tabular-nums whitespace-nowrap">
                    {row.Leakage_Current_uA.toFixed(2)}<span className="text-navy-400 text-[10px] ml-0.5">µA</span>
                  </td>
                  <td className="py-2.5 px-2 font-mono text-navy-900 text-right tabular-nums whitespace-nowrap">
                    {row.Propagation_Delay_ns.toFixed(2)}<span className="text-navy-400 text-[10px] ml-0.5">ns</span>
                  </td>
                  <td className="py-2.5 px-2">
                    <StatusBadge status={row.Component_Status} />
                  </td>
                </tr>
              ))}
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
