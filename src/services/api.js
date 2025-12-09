// Cliente HTTP para fazer requisições à API

const getAuthToken = () => {
  return localStorage.getItem('esmile_token');
};

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Se for erro 401, limpar token e redirecionar para login
    if (response.status === 401) {
      localStorage.removeItem('esmile_token');
      localStorage.removeItem('esmile_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Criar erro com informações completas
    const error = new Error(data.error || data.message || 'Erro na requisição');
    error.response = {
      status: response.status,
      data: data
    };
    throw error;
  }
  
  return data;
};

export const api = {
  // GET
  get: async (url) => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      headers
    });
    return handleResponse(response);
  },

  // POST
  post: async (url, data) => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // PUT
  put: async (url, data) => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // DELETE
  delete: async (url) => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });
    return handleResponse(response);
  },
};
