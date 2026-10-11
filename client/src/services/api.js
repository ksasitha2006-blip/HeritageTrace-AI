import axios from 'axios';

// Base API URL — reads from environment or defaults to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create a reusable Axios instance with defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// ========================================
// Artefact API calls
// ========================================

/**
 * Fetch all artefacts (with optional query params for filtering)
 * GET /api/artefacts?status=missing&category=sculpture
 */
export const getArtefacts = async (params = {}) => {
  const response = await api.get('/artefacts', { params });
  return response.data;
};

/**
 * Fetch a single artefact by ID
 * GET /api/artefacts/:id
 */
export const getArtefactById = async (id) => {
  const response = await api.get(`/artefacts/${id}`);
  return response.data;
};

/**
 * Create a new artefact
 * POST /api/artefacts
 */
export const createArtefact = async (artefactData) => {
  const { imageFile, ...fields } = artefactData;
  if (!imageFile) {
    const response = await api.post('/artefacts', fields, { timeout: 300000 });
    return response.data;
  }

  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && key !== 'image') {
      formData.append(key, String(value));
    }
  });
  formData.append('image', imageFile);
  const response = await api.post('/artefacts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });
  return response.data;
};

/**
 * Update an existing artefact
 * PUT /api/artefacts/:id
 */
export const updateArtefact = async (id, artefactData) => {
  const response = await api.put(`/artefacts/${id}`, artefactData);
  return response.data;
};

/**
 * Delete an artefact
 * DELETE /api/artefacts/:id
 */
export const deleteArtefact = async (id) => {
  const response = await api.delete(`/artefacts/${id}`);
  return response.data;
};

/**
 * Upload an image for an artefact (multipart form data)
 * POST /api/artefacts/:id/upload
 */
export const uploadArtefactImage = async (id, formData) => {
  const response = await api.post(`/artefacts/${id}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ========================================
// Dashboard / Stats API calls
// ========================================

/**
 * Get dashboard statistics
 * GET /api/stats
 */
export const getDashboardStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export const checkBackendAvailability = async () => {
  try {
    await api.get('/health');
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return true;
    }
    throw error;
  }
};

export default api;
