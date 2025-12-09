import { api } from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const authService = {
  // Login
  login: async (email, senha) => {
    try {
      const response = await api.post(`${API_ENDPOINTS.auth}/login`, {
        email,
        senha
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Registrar novo usuário
  register: async (userData) => {
    try {
      const response = await api.post(`${API_ENDPOINTS.auth}/register`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obter usuário atual
  getMe: async (token) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.auth}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar usuário');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  // Definir senha para profissional
  definirSenha: async (email, senha) => {
    try {
      const response = await api.post(`${API_ENDPOINTS.auth}/definir-senha`, {
        email,
        senha
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
