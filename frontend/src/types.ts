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

// ============ API RESPONSE TYPES ============

export interface BackendHealthStatus {
  status: string;
  backend: boolean;
  mongodb: boolean;
  models: {
    isolation_forest: boolean;
    scaler: boolean;
    lstm: boolean;
  };
  error?: string;
}

export interface DatasetUploadResponse {
  success: boolean;
  dataset_id: string;
  filename: string;
  total_records: number;
  total_components: number;
  total_lots: number;
  message?: string;
  error?: string;
}

export interface DatabaseComponentRecord {
  _id: string;
  component_id: string;
  lot_id: string;
  time_hours: number;
  burn_in_temperature_c: number;
  iddq_ua: number;
  leakage_current_ua: number;
  propagation_delay_ns: number;
  component_status: string;
  dataset_id: string;
  created_at: string;
}

export interface GetComponentsResponse {
  success: boolean;
  page: number;
  limit: number;
  count: number;
  components: DatabaseComponentRecord[];
}

export interface ModuleAResult {
  status: string;
  anomaly: boolean;
  anomaly_score: number;
}

export interface ModuleBResult {
  prediction: string;
  confidence: number;
  probabilities: {
    NORMAL: number;
    WARNING: number;
    HIGH_RISK: number;
  };
}

export interface AnalysisResponse {
  success: boolean;
  component_id: string;
  lot_id: string;
  analysis_id: string;
  module_a: ModuleAResult;
  module_b: ModuleBResult;
  final_risk: string;
  explanation: string;
  recommendation: string;
  confidence: number;
  error?: string;
}
