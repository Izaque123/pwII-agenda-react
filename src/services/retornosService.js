import { api } from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const retornosService = {
  // Buscar todos os retornos
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.dataMinima) {
        const date = filters.dataMinima instanceof Date 
          ? filters.dataMinima.toISOString().split('T')[0] 
          : filters.dataMinima;
        queryParams.append('dataMinima', date);
      }
      
      if (filters.paciente) queryParams.append('paciente', filters.paciente);

      const url = queryParams.toString() 
        ? `${API_ENDPOINTS.retornos}?${queryParams.toString()}`
        : API_ENDPOINTS.retornos;

      const response = await api.get(url);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar retornos:', error);
      throw error;
    }
  },

  // Buscar retorno por ID
  getById: async (id) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.retornos}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar retorno:', error);
      throw error;
    }
  },

  // Deletar retorno
  delete: async (id) => {
    try {
      await api.delete(`${API_ENDPOINTS.retornos}/${id}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar retorno:', error);
      throw error;
    }
  },
};
