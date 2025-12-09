import { api } from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const pacientesService = {
  // Buscar todos os pacientes
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.busca) queryParams.append('busca', filters.busca);
      if (filters.status) queryParams.append('status', filters.status);

      const url = queryParams.toString() 
        ? `${API_ENDPOINTS.pacientes}?${queryParams.toString()}`
        : API_ENDPOINTS.pacientes;

      const response = await api.get(url);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      throw error;
    }
  },

  // Buscar paciente por ID
  getById: async (id) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.pacientes}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar paciente:', error);
      throw error;
    }
  },

  // Criar novo paciente
  create: async (pacienteData) => {
    try {
      const response = await api.post(API_ENDPOINTS.pacientes, pacienteData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
      throw error;
    }
  },

  // Atualizar paciente
  update: async (id, pacienteData) => {
    try {
      const response = await api.put(`${API_ENDPOINTS.pacientes}/${id}`, pacienteData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      throw error;
    }
  },

  // Inativar paciente
  delete: async (id) => {
    try {
      const response = await api.delete(`${API_ENDPOINTS.pacientes}/${id}`);
      return response.data; // Retorna o paciente inativado
    } catch (error) {
      console.error('Erro ao inativar paciente:', error);
      throw error;
    }
  },
};
