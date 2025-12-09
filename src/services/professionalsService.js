import { api } from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const professionalsService = {
  // Buscar todos os profissionais
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.busca) queryParams.append('busca', filters.busca);
      if (filters.tipo) queryParams.append('tipo', filters.tipo);
      if (filters.ativo !== undefined) queryParams.append('ativo', filters.ativo);

      const url = queryParams.toString() 
        ? `${API_ENDPOINTS.professionals}?${queryParams.toString()}`
        : API_ENDPOINTS.professionals;

      const response = await api.get(url);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
      throw error;
    }
  },

  // Buscar profissional por ID
  getById: async (id) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.professionals}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar profissional:', error);
      throw error;
    }
  },

  // Criar novo profissional
  create: async (professionalData) => {
    try {
      const response = await api.post(API_ENDPOINTS.professionals, professionalData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar profissional:', error);
      throw error;
    }
  },

  // Atualizar profissional
  update: async (id, professionalData) => {
    try {
      const response = await api.put(`${API_ENDPOINTS.professionals}/${id}`, professionalData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error);
      throw error;
    }
  },

  // Inativar profissional
  delete: async (id) => {
    try {
      const response = await api.delete(`${API_ENDPOINTS.professionals}/${id}`);
      return response.data; // Retorna o profissional inativado
    } catch (error) {
      console.error('Erro ao inativar profissional:', error);
      throw error;
    }
  },
};
