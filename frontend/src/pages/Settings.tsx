import { PageProps } from '../types';

interface SettingsProps extends PageProps {
  onChangeZThreshold: (v: number) => void;
  onChangeKFactor: (v: number) => void;
  onChangeAbsoluteLimit: (v: number) => void;
}

export default function Settings({
  zThreshold, kFactor, absoluteLimit,
  onChangeZThreshold, onChangeKFactor, onChangeAbsoluteLimit,
  addToast,
}: SettingsProps) {
  const safetySlope = (median: number, mad: number) =>
    (median + kFactor * (mad / 0.6745)).toFixed(2);

  const exampleSlope = safetySlope(10.1, 1.1);

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-navy-900 tracking-tight">Settings</h1>
        <p className="text-navy-400 mt-1 text-sm">Real, adjustable model parameters — all values used directly in ISRO RELI-AI classification logic.</p>
      </div>

      <div className="space-y-5">
        {/* Module A */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-saffron-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <h2 className="font-display font-semibold text-navy-900">Module A — Robust Z-Score Threshold</h2>
          </div>

          <div className="mb-4">
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-mono text-navy-600">Modified z-score threshold</label>
              <span className="text-sm font-mono font-bold text-saffron-600">{zThreshold.toFixed(1)}</span>
            </div>
            <input type="range" min={2.0} max={5.0} step={0.1} value={zThreshold}
              onChange={e => onChangeZThreshold(Number(e.target.value))}
              className="w-full accent-navy-700" />
            <div className="flex justify-between text-[9px] font-mono text-navy-300 mt-0.5">
              <span>2.0 (more sensitive)</span>
              <span>5.0 (less sensitive)</span>
            </div>
          </div>

          <div className="p-3 bg-saffron-50 rounded-xl border border-saffron-100">
            <div className="text-[9px] font-mono text-saffron-600 uppercase tracking-wide mb-1">Effect</div>
            <p className="text-xs text-navy-700">
              M<sub>i</sub> = 0.6745 × (x − median) / MAD. Component flagged if |M<sub>i</sub>| &gt; {zThreshold.toFixed(1)}.
              At threshold {zThreshold.toFixed(1)} with lot MAD = 1.1 µA, flag boundary ≈{' '}
              <span className="font-mono font-bold">{(10.1 + zThreshold * 1.1 / 0.6745).toFixed(1)} µA</span> for a 10.1 µA lot.
            </p>
          </div>
        </div>

        {/* Module B */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-navy-700 flex items-center justify-center">
              <span className="text-white text-xs font-bold">B</span>
            </div>
            <h2 className="font-display font-semibold text-navy-900">Module B — Safety Slope k-Factor</h2>
          </div>

          <div className="mb-4">
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-mono text-navy-600">k-factor (safety slope sensitivity)</label>
              <span className="text-sm font-mono font-bold text-navy-700">{kFactor.toFixed(1)}</span>
            </div>
            <input type="range" min={1.5} max={5.0} step={0.1} value={kFactor}
              onChange={e => onChangeKFactor(Number(e.target.value))}
              className="w-full accent-navy-700" />
            <div className="flex justify-between text-[9px] font-mono text-navy-300 mt-0.5">
              <span>1.5 (tighter)</span>
              <span>5.0 (looser)</span>
            </div>
          </div>

          <div className="p-3 bg-navy-50 rounded-xl border border-navy-100">
            <div className="text-[9px] font-mono text-navy-500 uppercase tracking-wide mb-1">Effect</div>
            <p className="text-xs text-navy-700">
              Safety slope = lot_median_168h + k × (lot_MAD / 0.6745).
              With k = {kFactor.toFixed(1)} and a representative lot (median = 10.1 µA, MAD = 1.1 µA), safety slope ≈{' '}
              <span className="font-mono font-bold">{exampleSlope} µA</span>.
              Module B flags predicted_168h &gt; this slope.
            </p>
          </div>
        </div>

        {/* Absolute limit */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-display font-semibold text-navy-900 mb-4">Datasheet Absolute Limit</h2>

          <div className="mb-4">
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-mono text-navy-600">Maximum permissible leakage current (µA)</label>
              <span className="text-sm font-mono font-bold text-red-600">{absoluteLimit} µA</span>
            </div>
            <input type="range" min={30} max={100} step={1} value={absoluteLimit}
              onChange={e => onChangeAbsoluteLimit(Number(e.target.value))}
              className="w-full accent-navy-700" />
            <div className="flex justify-between text-[9px] font-mono text-navy-300 mt-0.5">
              <span>30 µA</span>
              <span>100 µA</span>
            </div>
          </div>

          <div className="p-3 bg-red-50 rounded-xl border border-red-100">
            <div className="text-[9px] font-mono text-red-500 uppercase tracking-wide mb-1">Note</div>
            <p className="text-xs text-navy-700">
              This is the hard disqualification threshold from the device datasheet. Currently set to {absoluteLimit} µA.
              The synthetic dataset is calibrated to the ISRO problem-statement value of 50 µA.
              Changing this value adjusts the reference line in the Drift Prediction chart.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-ice-50 rounded-2xl border border-border-light p-5">
          <h3 className="font-display font-semibold text-navy-700 mb-3 text-sm">Current Configuration Summary</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Module A threshold', value: `|z| > ${zThreshold.toFixed(1)}` },
              { label: 'Module B k-factor', value: `k = ${kFactor.toFixed(1)}` },
              { label: 'Absolute limit', value: `${absoluteLimit} µA` },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-border p-3 text-center">
                <div className="text-[9px] font-mono text-navy-400 uppercase mb-1">{s.label}</div>
                <div className="font-mono font-bold text-navy-900 text-sm">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => addToast('Settings applied to classification pipeline.', 'success')}
          className="w-full py-3 bg-navy-800 hover:bg-navy-700 text-white text-base font-bold font-display rounded-xl transition-colors"
        >
          Apply Settings
        </button>
      </div>
    </div>
  );
}
