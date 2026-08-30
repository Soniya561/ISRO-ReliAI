import { useState } from 'react';

type AuthMode = 'signin' | 'signup' | 'forgot';
type SuccessState = 'signin' | 'signup' | 'forgot' | null;

interface LoginProps {
  onLogin: (username: string) => void;
}

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.8}>
      <path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.8}>
      <path d="M2 2l16 16M7.5 7.6A4.5 4.5 0 0112.4 12.5M5.2 5.3C3.1 6.8 1.7 8.8 1 10c1.8 3.1 5 6 9 6a9.3 9.3 0 004.8-1.4M8 4.2A9 9 0 0110 4c4 0 7.2 2.9 9 6-.5.9-1.2 1.8-2 2.6" strokeLinecap="round" />
    </svg>
  );
}

function InputField({
  label, type = 'text', value, onChange, placeholder, autoComplete, showToggle, onToggle, visible,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder: string; autoComplete?: string;
  showToggle?: boolean; onToggle?: () => void; visible?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-mono font-bold text-navy-500 mb-1.5 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <input
          type={showToggle ? (visible ? 'text' : 'password') : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full px-3.5 py-2.5 bg-ice-50 border border-border rounded-xl text-sm font-mono text-navy-900 placeholder-navy-300 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition-all pr-10"
        />
        {showToggle && (
          <button type="button" onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 transition-colors">
            <EyeIcon visible={!!visible} />
          </button>
        )}
      </div>
    </div>
  );
}

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
}

function passwordRules(p: string) {
  return {
    length: p.length >= 8,
    upper: /[A-Z]/.test(p),
    lower: /[a-z]/.test(p),
    number: /[0-9]/.test(p),
    special: /[^A-Za-z0-9]/.test(p),
  };
}

export default function Login({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [success, setSuccess] = useState<SuccessState>(null);

  // Sign in
  const [siEmail, setSiEmail] = useState('');
  const [siPass, setSiPass] = useState('');
  const [siShowPass, setSiShowPass] = useState(false);
  const [siRemember, setSiRemember] = useState(false);
  const [siError, setSiError] = useState('');

  // Sign up
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPass, setSuPass] = useState('');
  const [suConfirm, setSuConfirm] = useState('');
  const [suShowPass, setSuShowPass] = useState(false);
  const [suShowConfirm, setSuShowConfirm] = useState(false);
  const [suError, setSuError] = useState('');

  // Forgot password
  const [fpEmail, setFpEmail] = useState('');
  const [fpError, setFpError] = useState('');

  const switchMode = (m: AuthMode) => { setMode(m); setSuccess(null); setSiError(''); setSuError(''); setFpError(''); };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(siEmail)) { setSiError('Please enter a valid email address.'); return; }
    if (!siPass) { setSiError('Password cannot be empty.'); return; }
    setSiError('');
    setSuccess('signin');
    setTimeout(() => onLogin(siEmail.split('@')[0]), 1600);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suName.trim()) { setSuError('Full name is required.'); return; }
    if (!isValidEmail(suEmail)) { setSuError('Please enter a valid email address.'); return; }
    const rules = passwordRules(suPass);
    if (!Object.values(rules).every(Boolean)) { setSuError('Password does not meet all requirements.'); return; }
    if (suPass !== suConfirm) { setSuError('Passwords do not match.'); return; }
    setSuError('');
    setSuccess('signup');
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(fpEmail)) { setFpError('Please enter a valid email address.'); return; }
    setFpError('');
    setSuccess('forgot');
  };

  const rules = passwordRules(suPass);
  const ruleList = [
    { label: 'At least 8 characters', ok: rules.length },
    { label: 'One uppercase letter', ok: rules.upper },
    { label: 'One lowercase letter', ok: rules.lower },
    { label: 'One number', ok: rules.number },
    { label: 'One special character', ok: rules.special },
  ];

  return (
    <div className="min-h-screen bg-ice-50 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.035]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,#0F1F3D 0,#0F1F3D 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#0F1F3D 0,#0F1F3D 1px,transparent 1px,transparent 48px)' }} />
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-navy-800 via-saffron-500 to-teal-500" />

      {/* Logo */}
      <div className="mb-7 flex flex-col items-center gap-3 relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-navy-800 flex items-center justify-center shadow-lg">
          <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
            <path d="M16 3L22 11H10L16 3Z" fill="#F58822" />
            <circle cx="16" cy="20" r="7" stroke="white" strokeWidth="2" fill="none" />
            <circle cx="16" cy="20" r="2.5" fill="white" />
            <line x1="9" y1="20" x2="7" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="23" y1="20" x2="25" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="text-center">
          <div className="font-display font-bold text-2xl text-navy-900 tracking-wide">ISRO RELI-AI</div>
          <div className="text-[11px] font-mono text-navy-400 uppercase tracking-widest mt-0.5">Component Reliability Intelligence</div>
        </div>
      </div>

      {/* Auth card */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-white rounded-3xl border border-border shadow-xl shadow-navy-900/6 p-8">

          {/* ── SIGN IN ── */}
          {mode === 'signin' && !success && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="mb-5">
                <h1 className="font-display font-bold text-xl text-navy-900">Sign In</h1>
                <p className="text-xs text-navy-400 mt-1">Access the reliability screening dashboard</p>
              </div>

              <InputField label="Email Address" type="email" value={siEmail} onChange={setSiEmail}
                placeholder="Enter your email address" autoComplete="email" />
              <InputField label="Password" value={siPass} onChange={setSiPass}
                placeholder="Enter your password" autoComplete="current-password"
                showToggle onToggle={() => setSiShowPass(v => !v)} visible={siShowPass} />

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={siRemember} onChange={e => setSiRemember(e.target.checked)}
                    className="w-3.5 h-3.5 accent-navy-700 rounded" />
                  <span className="text-xs font-mono text-navy-500">Remember me</span>
                </label>
                <button type="button" onClick={() => switchMode('forgot')}
                  className="text-xs font-mono text-navy-500 hover:text-navy-800 transition-colors underline underline-offset-2">
                  Forgot Password?
                </button>
              </div>

              {siError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <span className="text-red-500 text-xs mt-0.5">⚠</span>
                  <span className="text-xs text-red-700 font-mono">{siError}</span>
                </div>
              )}

              <button type="submit"
                className="w-full py-3 bg-navy-800 hover:bg-navy-700 text-white font-display font-bold text-sm rounded-xl transition-colors">
                Sign In
              </button>

              <p className="text-center text-xs text-navy-400 pt-1">
                Don't have an account?{' '}
                <button type="button" onClick={() => switchMode('signup')}
                  className="font-semibold text-navy-700 hover:text-navy-900 transition-colors">
                  Sign Up
                </button>
              </p>
            </form>
          )}

          {/* ── SIGN IN SUCCESS ── */}
          {mode === 'signin' && success === 'signin' && (
            <div className="py-6 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 10l4 4 8-8" />
                </svg>
              </div>
              <div>
                <div className="font-display font-bold text-navy-900">Sign in successful</div>
                <div className="text-sm text-navy-400 mt-0.5">Welcome to RELI-AI</div>
              </div>
              <div className="text-xs text-navy-300 font-mono">Redirecting to dashboard…</div>
            </div>
          )}

          {/* ── SIGN UP ── */}
          {mode === 'signup' && !success && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div className="mb-4">
                <h1 className="font-display font-bold text-xl text-navy-900">Create Account</h1>
                <p className="text-xs text-navy-400 mt-1">Create your RELI-AI account</p>
              </div>

              <InputField label="Full Name" value={suName} onChange={setSuName}
                placeholder="Enter your full name" autoComplete="name" />
              <InputField label="Email Address" type="email" value={suEmail} onChange={setSuEmail}
                placeholder="Enter your email address" autoComplete="email" />
              <InputField label="Password" value={suPass} onChange={setSuPass}
                placeholder="Create your password" autoComplete="new-password"
                showToggle onToggle={() => setSuShowPass(v => !v)} visible={suShowPass} />
              <InputField label="Confirm Password" value={suConfirm} onChange={setSuConfirm}
                placeholder="Confirm your password" autoComplete="new-password"
                showToggle onToggle={() => setSuShowConfirm(v => !v)} visible={suShowConfirm} />

              {/* Password requirements */}
              {suPass && (
                <div className="p-3 bg-ice-50 rounded-xl border border-border-light space-y-1">
                  {ruleList.map(r => (
                    <div key={r.label} className="flex items-center gap-2">
                      <span className={`text-xs font-mono ${r.ok ? 'text-teal-600' : 'text-navy-300'}`}>
                        {r.ok ? '✓' : '○'}
                      </span>
                      <span className={`text-[11px] font-mono ${r.ok ? 'text-teal-700' : 'text-navy-400'}`}>{r.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {suError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <span className="text-red-500 text-xs mt-0.5">⚠</span>
                  <span className="text-xs text-red-700 font-mono">{suError}</span>
                </div>
              )}

              <button type="submit"
                className="w-full py-3 bg-navy-800 hover:bg-navy-700 text-white font-display font-bold text-sm rounded-xl transition-colors">
                Create Account
              </button>

              <p className="text-center text-xs text-navy-400 pt-1">
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('signin')}
                  className="font-semibold text-navy-700 hover:text-navy-900 transition-colors">
                  Sign In
                </button>
              </p>
            </form>
          )}

          {/* ── SIGN UP SUCCESS ── */}
          {mode === 'signup' && success === 'signup' && (
            <div className="py-6 flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 10l4 4 8-8" />
                </svg>
              </div>
              <div>
                <div className="font-display font-bold text-navy-900">Account created successfully</div>
                <div className="text-sm text-navy-400 mt-0.5">Your RELI-AI account is ready.</div>
              </div>
              <button onClick={() => switchMode('signin')}
                className="px-5 py-2.5 bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold rounded-xl transition-colors">
                Continue to Sign In
              </button>
            </div>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {mode === 'forgot' && !success && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="mb-4">
                <h1 className="font-display font-bold text-xl text-navy-900">Reset Password</h1>
                <p className="text-xs text-navy-400 mt-1">Enter your email address to receive a password reset link.</p>
              </div>

              <InputField label="Email Address" type="email" value={fpEmail} onChange={setFpEmail}
                placeholder="Enter your email address" autoComplete="email" />

              {fpError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <span className="text-red-500 text-xs mt-0.5">⚠</span>
                  <span className="text-xs text-red-700 font-mono">{fpError}</span>
                </div>
              )}

              <button type="submit"
                className="w-full py-3 bg-navy-800 hover:bg-navy-700 text-white font-display font-bold text-sm rounded-xl transition-colors">
                Send Reset Link
              </button>

              <p className="text-center text-xs text-navy-400 pt-1">
                Remember your password?{' '}
                <button type="button" onClick={() => switchMode('signin')}
                  className="font-semibold text-navy-700 hover:text-navy-900 transition-colors">
                  Sign In
                </button>
              </p>
            </form>
          )}

          {/* ── FORGOT SUCCESS ── */}
          {mode === 'forgot' && success === 'forgot' && (
            <div className="py-6 flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 10l4 4 8-8" />
                </svg>
              </div>
              <div>
                <div className="font-display font-bold text-navy-900">Reset link sent</div>
                <div className="text-sm text-navy-400 mt-1 leading-relaxed">Check your email for instructions<br />to reset your password.</div>
              </div>
              <button onClick={() => switchMode('signin')}
                className="px-5 py-2.5 bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold rounded-xl transition-colors">
                Back to Sign In
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-7 text-center">
        <div className="text-[10px] font-mono text-navy-300 uppercase tracking-widest">ISRO · QCSD · Component Burn-In Screening</div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-[10px] font-mono text-amber-600 font-semibold">DEMO MODE — SYNTHETIC DATA</span>
        </div>
      </div>
    </div>
  );
}
