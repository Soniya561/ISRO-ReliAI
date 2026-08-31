/**
 * Frontend API Service
 * Handles all communication with the ISRO-ReliAI backend
 */

// Local Vite development proxies these requests to port 5000, keeping the
// browser request same-origin. Configure VITE_API_BASE_URL for deployments.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// ============ HEALTH CHECK ============

export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    return {
      status: 'unhealthy',
      backend: false,
      mongodb: false,
      models: { isolation_forest: false, scaler: false, lstm: false },
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ============ DATASET UPLOAD ============

export async function uploadDataset(file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/datasets/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error instanceof Error ? error : new Error('Upload failed');
  }
}

// ============ DATASETS ============

export async function getDatasets() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/datasets`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    return { success: false, datasets: [] };
  }
}

// ============ COMPONENTS ============

export async function getComponents(page = 1, limit = 50, search = '') {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (search) {
      params.append('search', search);
    }

    const response = await fetch(`${API_BASE_URL}/api/components?${params}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    return { success: false, components: [] };
  }
}

export async function getComponent(componentId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/components/${encodeURIComponent(componentId)}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to fetch component');
  }
}

// ============ ANALYSIS ============

export async function analyzeComponent(componentId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        component_id: componentId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error instanceof Error ? error : new Error('Analysis failed');
  }
}

export async function getAnalysis(componentId: string, limit = 50) {
  try {
    const params = new URLSearchParams({
      limit: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}/api/analysis/${encodeURIComponent(componentId)}?${params}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    return { success: false, analyses: [] };
  }
}

export async function getAllAnalysis(limit = 50) {
  try {
    const params = new URLSearchParams({
      limit: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}/api/analysis?${params}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    return { success: false, analyses: [] };
  }
}

// ============ UTILITY ============

export function getApiBaseUrl() {
  return API_BASE_URL;
}
