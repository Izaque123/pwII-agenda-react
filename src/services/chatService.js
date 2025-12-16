import { api } from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const chatService = {
  sendMessage: async (message, history) => {
    try {
      const response = await api.post(API_ENDPOINTS.chat, {
        message,
        history
      });
      return response; 
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }
};