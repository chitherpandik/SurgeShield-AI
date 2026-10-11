import axios from 'axios';

/**
 * Centralized API Service for SurgeShield AI.
 * Handles all HTTP communication with the FastAPI backend.
 * Uses configurable VITE_API_BASE_URL (defaults to http://127.0.0.1:8001).
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Response interceptor for consistent error normalization
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred while communicating with SurgeShield backend.';
    
    if (error.response) {
      // Backend returned a non-2xx status code
      const data = error.response.data;
      if (typeof data?.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data?.detail)) {
        // Pydantic validation error format
        message = data.detail.map((err) => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
      } else if (data?.message) {
        message = data.message;
      } else {
        message = `Server returned status ${error.response.status}: ${error.response.statusText}`;
      }
    } else if (error.request) {
      // Request made but no response received (server down or CORS issue)
      message = `Unable to connect to SurgeShield backend at ${BASE_URL}. Please verify the FastAPI server is running on port 8001.`;
    } else if (error.message) {
      message = error.message;
    }

    const enhancedError = new Error(message);
    enhancedError.status = error.response?.status;
    enhancedError.originalError = error;
    return Promise.reject(enhancedError);
  }
);

/**
 * Check backend service and database health status
 * @returns {Promise<{status: string, service: string, database: string}>}
 */
export async function getHealth() {
  const response = await apiClient.get('/health');
  return response.data;
}

/**
 * Fetch real-time executive dashboard metrics from MySQL
 * @returns {Promise<DashboardResponse>}
 */
export async function getDashboard() {
  const response = await apiClient.get('/dashboard');
  return response.data;
}

/**
 * Fetch paginated transactions history from MySQL (newest first)
 * @param {number} skip - Offset count
 * @param {number} limit - Maximum records
 * @returns {Promise<Array<TransactionItemResponse>>}
 */
export async function getTransactions(skip = 0, limit = 50) {
  const response = await apiClient.get('/transactions', {
    params: { skip, limit },
  });
  return response.data;
}

/**
 * Fetch full transaction intelligence and explainability by ID
 * @param {number|string} id - Transaction ID
 * @returns {Promise<TransactionDetailResponse>}
 */
export async function getTransaction(id) {
  const response = await apiClient.get(`/transactions/${id}`);
  return response.data;
}

/**
 * Fetch risk breakdown and decision distribution counts from MySQL
 * @returns {Promise<RiskSummaryResponse>}
 */
export async function getRiskSummary() {
  const response = await apiClient.get('/risk-summary');
  return response.data;
}

/**
 * Fetch current real-time surge intelligence status and baseline
 * @returns {Promise<SurgeStatusResponse>}
 */
export async function getSurge() {
  const response = await apiClient.get('/surge');
  return response.data;
}

/**
 * Perform raw ML model fraud inference
 * @param {Object} data - Transaction numerical payload (Time, V1-V28, Amount)
 * @returns {Promise<PredictionResponse>}
 */
export async function predictTransaction(data) {
  const response = await apiClient.post('/predict', data);
  return response.data;
}

/**
 * Execute full multi-indicator analysis, decisioning, and MySQL persistence
 * @param {Object} data - Transaction numerical payload (Time, V1-V28, Amount)
 * @returns {Promise<AnalysisResponse>}
 */
export async function analyzeTransaction(data) {
  const response = await apiClient.post('/analyze', data);
  return response.data;
}

/**
 * Perform transaction-specific volume surge evaluation
 * @param {Object} data - Transaction numerical payload (Time, V1-V28, Amount)
 * @returns {Promise<SurgeAnalysisResponse>}
 */
export async function analyzeSurge(data) {
  const response = await apiClient.post('/surge', data);
  return response.data;
}

export default {
  getHealth,
  getDashboard,
  getTransactions,
  getTransaction,
  getRiskSummary,
  getSurge,
  predictTransaction,
  analyzeTransaction,
  analyzeSurge,
};
