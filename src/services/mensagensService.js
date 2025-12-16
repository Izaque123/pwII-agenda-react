import { api } from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const mensagensService = {
  // Enviar mensagem para suporte
  enviarMensagem: async (mensagem) => {
    try {
      const response = await api.post(`${API_ENDPOINTS.mensagens}`, {
        mensagem
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar mensagens recebidas (para suporte)
  getMensagensRecebidas: async () => {
    try {
      const response = await api.get(`${API_ENDPOINTS.mensagens}/recebidas`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar mensagens não lidas (para suporte)
  getMensagensNaoLidas: async () => {
    try {
      const response = await api.get(`${API_ENDPOINTS.mensagens}/nao-lidas`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar mensagens enviadas pelo usuário
  getMensagensEnviadas: async () => {
    try {
      const response = await api.get(`${API_ENDPOINTS.mensagens}/enviadas`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Contar mensagens não lidas
  getContadorNaoLidas: async () => {
    try {
      const response = await api.get(`${API_ENDPOINTS.mensagens}/contador`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Marcar mensagem como lida
  marcarComoLida: async (id) => {
    try {
      const response = await api.put(`${API_ENDPOINTS.mensagens}/${id}/ler`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Marcar múltiplas mensagens como lidas
  marcarMultiplasComoLidas: async (ids) => {
    try {
      const response = await api.put(`${API_ENDPOINTS.mensagens}/ler-multiplas`, {
        ids
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Responder uma mensagem
  responderMensagem: async (mensagemId, mensagem) => {
    try {
      const response = await api.post(`${API_ENDPOINTS.mensagens}/${mensagemId}/responder`, {
        mensagem
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar thread de mensagens
  getThread: async (mensagemId) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.mensagens}/${mensagemId}/thread`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

