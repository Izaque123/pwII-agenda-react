import { api } from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const suporteUsuariosService = {
  // Atribuir usuário a um suporte
  atribuirUsuario: async (suporteId, usuarioId) => {
    try {
      const response = await api.post(`${API_ENDPOINTS.suporteUsuarios}`, {
        suporteId,
        usuarioId
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remover atribuição
  removerAtribuicao: async (suporteId, usuarioId) => {
    try {
      const response = await api.delete(`${API_ENDPOINTS.suporteUsuarios}/${suporteId}/${usuarioId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar usuários de um suporte
  getUsuariosPorSuporte: async (suporteId) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.suporteUsuarios}/suporte/${suporteId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar suportes de um usuário
  getSuportesPorUsuario: async (usuarioId) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.suporteUsuarios}/usuario/${usuarioId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Listar todas as atribuições
  getAll: async () => {
    try {
      const response = await api.get(`${API_ENDPOINTS.suporteUsuarios}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

