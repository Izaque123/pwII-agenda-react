import { api } from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

// Função auxiliar para converter string de data para Date sem problemas de fuso horário
const parseDate = (dateString) => {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  
  // Se for string no formato YYYY-MM-DD, criar Date no fuso horário local
  const dateStr = typeof dateString === 'string' ? dateString.split('T')[0] : dateString;
  const [year, month, day] = dateStr.split('-').map(Number);
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return new Date(dateString); // Fallback para conversão padrão
  }
  
  return new Date(year, month - 1, day);
};

export const agendaService = {
  // Buscar todos os eventos
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.data) {
        const date = filters.data instanceof Date 
          ? filters.data.toISOString().split('T')[0] 
          : filters.data;
        queryParams.append('data', date);
      }
      
      if (filters.dentista) queryParams.append('dentista', filters.dentista);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.status) queryParams.append('status', filters.status);

      const url = queryParams.toString() 
        ? `${API_ENDPOINTS.agenda}?${queryParams.toString()}`
        : API_ENDPOINTS.agenda;

      const response = await api.get(url);
      // Converter strings de data para objetos Date (sem problemas de fuso horário)
      if (response.data && Array.isArray(response.data)) {
        response.data = response.data.map(event => ({
          ...event,
          date: parseDate(event.date)
        }));
      }
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      throw error;
    }
  },

  // Buscar evento por ID
  getById: async (id) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.agenda}/${id}`);
      if (response.data) {
        response.data.date = parseDate(response.data.date);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar evento:', error);
      throw error;
    }
  },

  // Criar novo evento
  create: async (eventData) => {
    try {
      // Converter Date para string YYYY-MM-DD no timezone local (evitar problemas de UTC)
      let dateStr = eventData.date;
      if (eventData.date instanceof Date) {
        // Usar métodos getFullYear, getMonth, getDate que retornam valores no timezone local
        const year = eventData.date.getFullYear();
        const month = String(eventData.date.getMonth() + 1).padStart(2, '0');
        const day = String(eventData.date.getDate()).padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
      } else if (typeof eventData.date === 'string') {
        if (eventData.date.includes('T')) {
          // Se for ISO string, parsear e converter para timezone local
          const dateObj = new Date(eventData.date);
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          dateStr = `${year}-${month}-${day}`;
        } else if (eventData.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Já está no formato YYYY-MM-DD
          dateStr = eventData.date;
        }
      }

      const dataToSend = {
        ...eventData,
        date: dateStr
      };


      const response = await api.post(API_ENDPOINTS.agenda, dataToSend);
      if (response.data) {
        response.data.date = parseDate(response.data.date);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  },

  // Atualizar evento
  update: async (id, eventData) => {
    try {
      // Converter Date para string YYYY-MM-DD no timezone local (evitar problemas de UTC)
      let dateStr = eventData.date;
      if (eventData.date instanceof Date) {
        const year = eventData.date.getFullYear();
        const month = String(eventData.date.getMonth() + 1).padStart(2, '0');
        const day = String(eventData.date.getDate()).padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
      } else if (typeof eventData.date === 'string' && eventData.date.includes('T')) {
        dateStr = eventData.date.split('T')[0];
      }

      const dataToSend = {
        ...eventData,
        date: dateStr
      };


      const response = await api.put(`${API_ENDPOINTS.agenda}/${id}`, dataToSend);
      if (response.data) {
        response.data.date = parseDate(response.data.date);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }
  },

  // Deletar evento
  delete: async (id) => {
    try {
      await api.delete(`${API_ENDPOINTS.agenda}/${id}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      throw error;
    }
  },
};
