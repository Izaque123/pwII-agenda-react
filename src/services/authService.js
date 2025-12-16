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
  },

  // Registrar novo usuário de suporte
  registerSuporte: async (userData) => {
    try {
      const response = await api.post(`${API_ENDPOINTS.auth}/register-suporte`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Listar todos os usuários (apenas admin)
  getAllUsers: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.role) queryParams.append('role', filters.role);
      if (filters.ativo !== undefined) queryParams.append('ativo', filters.ativo);
      if (filters.busca) queryParams.append('busca', filters.busca);
      
      const queryString = queryParams.toString();
      const url = `${API_ENDPOINTS.auth}/usuarios${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Atualizar usuário (apenas admin)
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`${API_ENDPOINTS.auth}/usuarios/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Deletar usuário (apenas admin)
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`${API_ENDPOINTS.auth}/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
