export type Page =
  | 'mission-control'
  | 'screening-dataset'
  | 'component-grid'
  | 'ai-analysis'
  | 'drift-prediction'
  | 'risk-explainability'
  | 'comparison'
  | 'report-export'
  | 'settings';

export type Classification = 'NORMAL' | 'MODULE_A' | 'MODULE_B';

export interface ComponentRecord {
  id: string;
  lot: number;
  lotLabel: string;
  value_0h: number;
  value_24h: number;
  value_96h: number;
  value_168h: number;
  predicted_168h: number;
  lotMedian: number;
  lotMAD: number;
  zScore: number;
  driftRate: number;
  safetySlope: number;
  classification: Classification;
  explanation: string;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export interface PageProps {
  onNavigate: (page: Page) => void;
  selectedComponent: ComponentRecord | null;
  setSelectedComponent: (c: ComponentRecord | null) => void;
  addToast: (msg: string, type: Toast['type']) => void;
  zThreshold: number;
  kFactor: number;
  absoluteLimit: number;
}
