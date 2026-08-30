import React, { useState, useEffect, useCallback } from 'react';
import { Page, Toast, ComponentRecord } from './types';
import Login from './pages/Login';
import MissionControl from './pages/MissionControl';
import ScreeningDataset from './pages/ScreeningDataset';
import ComponentGrid from './pages/ComponentGrid';
import AIAnalysis from './pages/AIAnalysis';
import DriftPrediction from './pages/DriftPrediction';
import RiskExplainability from './pages/RiskExplainability';
import Comparison from './pages/Comparison';
import ReportExport from './pages/ReportExport';
import Settings from './pages/Settings';

interface NavItem { id: Page; icon: string; label: string }

const NAV_ITEMS: NavItem[] = [
  { id: 'mission-control', icon: '🏠', label: 'Mission Control' },
  { id: 'screening-dataset', icon: '🧪', label: 'Screening Dataset' },
  { id: 'component-grid', icon: '🧩', label: 'Component Grid' },
  { id: 'ai-analysis', icon: '🤖', label: 'AI Analysis' },
  { id: 'drift-prediction', icon: '📈', label: 'Drift Prediction' },
  { id: 'risk-explainability', icon: '⚠', label: 'Risk & Explainability' },
  { id: 'comparison', icon: '📊', label: 'Static vs AI' },
  { id: 'report-export', icon: '📑', label: 'Report Export' },
  { id: 'settings', icon: '⚙', label: 'Settings' },
];

const TOUR_PAGES: Page[] = [
  'mission-control',
  'component-grid',
  'ai-analysis',
  'drift-prediction',
  'comparison',
];

const TOAST_COLORS: Record<Toast['type'], string> = {
  success: 'bg-teal-50 border-teal-200 text-teal-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-navy-50 border-navy-200 text-navy-800',
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState('');
  const [page, setPage] = useState<Page>('mission-control');
  const [selectedComponent, setSelectedComponent] = useState<ComponentRecord | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [zThreshold, setZThreshold] = useState(3.5);
  const [kFactor, setKFactor] = useState(3.0);
  const [absoluteLimit, setAbsoluteLimit] = useState(50);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const onNavigate = useCallback((p: Page) => {
    setPage(p);
    if (tourActive) setTourActive(false);
  }, [tourActive]);

  useEffect(() => {
    if (!tourActive) return;
    setPage(TOUR_PAGES[tourStep]);
    if (tourStep >= TOUR_PAGES.length - 1) {
      setTimeout(() => { setTourActive(false); setTourStep(0); addToast('Demo tour complete.', 'success'); }, 3500);
      return;
    }
    const timer = setTimeout(() => setTourStep(s => s + 1), 3500);
    return () => clearTimeout(timer);
  }, [tourActive, tourStep, addToast]);

  const startTour = () => {
    setTourStep(0);
    setTourActive(true);
    addToast('Demo tour started — 5 pages, 8 clicks.', 'info');
  };

  const handleLogin = (username: string) => {
    setLoggedInUser(username);
    setIsLoggedIn(true);
    addToast(`Welcome to ISRO RELI-AI.`, 'success');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const userInitials = loggedInUser.slice(0, 2).toUpperCase();

  const pageProps = {
    onNavigate,
    selectedComponent,
    setSelectedComponent,
    addToast,
    zThreshold,
    kFactor,
    absoluteLimit,
  };

  const pageMap: Record<Page, React.ReactElement> = {
    'mission-control': <MissionControl {...pageProps} />,
    'screening-dataset': <ScreeningDataset {...pageProps} />,
    'component-grid': <ComponentGrid {...pageProps} />,
    'ai-analysis': <AIAnalysis {...pageProps} />,
    'drift-prediction': <DriftPrediction {...pageProps} />,
    'risk-explainability': <RiskExplainability {...pageProps} />,
    'comparison': <Comparison {...pageProps} />,
    'report-export': <ReportExport {...pageProps} />,
    'settings': <Settings {...pageProps} onChangeZThreshold={setZThreshold} onChangeKFactor={setKFactor} onChangeAbsoluteLimit={setAbsoluteLimit} />,
  };

  return (
    <div className="flex h-full bg-ice-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-border z-20 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border-light">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-lg bg-navy-800 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                <path d="M10 2L14 7H6L10 2Z" fill="#F58822" />
                <circle cx="10" cy="12" r="4" stroke="white" strokeWidth="1.5" fill="none" />
                <circle cx="10" cy="12" r="1.5" fill="white" />
              </svg>
            </div>
            <span className="font-display font-bold text-navy-900 text-sm tracking-wide">ISRO RELI-AI</span>
          </div>
          <div className="text-[9px] font-mono text-navy-400 pl-9 uppercase tracking-widest leading-relaxed">
            Component Reliability Intelligence
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl mb-0.5 text-sm transition-all duration-150
                ${page === item.id
                  ? 'bg-navy-800 text-white shadow-sm'
                  : 'text-navy-600 hover:bg-ice-100 hover:text-navy-900'}`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className={`font-medium truncate ${page === item.id ? 'font-semibold' : ''}`}>{item.label}</span>
              {item.id === 'comparison' && (
                <span className={`ml-auto text-[9px] font-mono font-bold px-1.5 py-0.5 rounded
                  ${page === item.id ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-700'}`}>KEY</span>
              )}
            </button>
          ))}
        </nav>

        {/* Tour / status */}
        <div className="px-3.5 py-4 border-t border-border-light space-y-2">
          <div className="flex items-center gap-2 px-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[10px] font-mono text-amber-700 font-semibold uppercase tracking-wide">Demo — Synthetic Data</span>
          </div>
          {!tourActive ? (
            <button
              onClick={startTour}
              className="w-full py-2 px-3 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white text-xs font-bold font-display transition-colors"
            >
              ▶ Start Demo Tour
            </button>
          ) : (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-2.5">
              <div className="text-[10px] font-mono text-amber-700 mb-1.5">Tour step {tourStep + 1} / {TOUR_PAGES.length}</div>
              <div className="w-full bg-amber-100 rounded-full h-1.5">
                <div className="h-1.5 bg-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${((tourStep + 1) / TOUR_PAGES.length) * 100}%` }} />
              </div>
              <button onClick={() => { setTourActive(false); setTourStep(0); }}
                className="mt-2 text-[10px] text-amber-600 hover:text-amber-800 font-mono">Stop tour</button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-60 flex flex-col min-h-full">
        {/* Topbar */}
        <header className="fixed top-0 left-60 right-0 bg-white/90 backdrop-blur-sm border-b border-border z-10 flex items-center px-5 gap-4" style={{ height: '52px' }}>
          <div className="flex-1 flex items-center gap-2 bg-ice-100 rounded-lg px-3 py-1.5 border border-border-light max-w-xs">
            <svg className="w-3.5 h-3.5 text-navy-400 flex-shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
              <circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" strokeLinecap="round" />
            </svg>
            <input placeholder="Search components, lots…"
              className="bg-transparent text-xs text-navy-800 placeholder-navy-400 outline-none w-full" />
          </div>

          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-demo-tick" />
            <span className="text-xs font-mono font-bold text-amber-700">DEMO MODE — SYNTHETIC DATA</span>
          </div>

          <div className="flex items-center gap-1.5 bg-navy-50 border border-navy-100 rounded-full px-3 py-1">
            <span className="text-xs font-mono text-navy-600 font-semibold">600 components · 15 lots</span>
          </div>

          <div className="flex items-center gap-2 pl-3 border-l border-border-light ml-auto">
            <div className="w-7 h-7 rounded-full bg-navy-800 flex items-center justify-center">
              <span className="text-white text-xs font-display font-bold">{userInitials}</span>
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-semibold text-navy-800 font-mono">{loggedInUser}</div>
              <div className="text-[10px] text-navy-400">ISRO · QCSD</div>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto" style={{ paddingTop: '52px' }}>
          <div key={page} className="page-enter min-h-full">
            {pageMap[page]}
          </div>
        </main>
      </div>

      {/* Toast stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id}
            className={`animate-slide-in pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium max-w-sm ${TOAST_COLORS[t.type]}`}>
            <span className="flex-shrink-0">{t.type === 'success' ? '✓' : t.type === 'warning' ? '⚠' : t.type === 'error' ? '●' : 'ℹ'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
