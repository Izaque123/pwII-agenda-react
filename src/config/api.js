// Configuração da API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/auth`,
  agenda: `${API_BASE_URL}/agenda`,
  pacientes: `${API_BASE_URL}/pacientes`,
  professionals: `${API_BASE_URL}/professionals`,
  retornos: `${API_BASE_URL}/retornos`,
};
