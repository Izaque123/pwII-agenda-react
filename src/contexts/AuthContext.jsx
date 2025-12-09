import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { authService } from '../services/authService';

const AuthContext = createContext();

// Classe de erros personalizados
class AuthError extends Error {
  constructor(message, type = 'generic') {
    super(message);
    this.name = 'AuthError';
    this.type = type;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    // Verificar se há token e usuário salvos
    const savedToken = localStorage.getItem('esmile_token');
    const savedUser = localStorage.getItem('esmile_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      
      // Verificar se o token ainda é válido
      authService.getMe(savedToken)
        .then(userData => {
          setUser(userData);
        })
        .catch(() => {
          // Token inválido, limpar dados
          localStorage.removeItem('esmile_token');
          localStorage.removeItem('esmile_user');
          setToken(null);
          setUser(null);
        });
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      if (!credentials.email || !credentials.senha) {
        throw new AuthError('E-mail e senha são obrigatórios', 'validation');
      }

      const response = await authService.login(credentials.email, credentials.senha);
      
      const { user: userData, token: userToken } = response;
      
      setUser(userData);
      setToken(userToken);
      localStorage.setItem('esmile_token', userToken);
      localStorage.setItem('esmile_user', JSON.stringify(userData));
      
      toast.success('Login realizado com sucesso!');
      
      return userData;
    } catch (error) {
      // Verificar se é erro de senha não definida (status 403)
      if (error.response?.status === 403) {
        const errorData = error.response?.data || {};
        if (errorData.error?.precisaDefinirSenha || errorData.precisaDefinirSenha) {
          const authError = new AuthError(errorData.error?.message || errorData.message || 'Profissional não possui senha cadastrada', 'senha_nao_definida');
          authError.email = errorData.error?.email || errorData.email;
          throw authError;
        }
      }

      let errorMessage = 'Erro ao fazer login. Tente novamente.';
      let errorType = 'generic';
      
      if (error.message) {
        errorMessage = error.message;
        if (error.message.includes('Email ou senha')) {
          errorType = 'invalid_credentials';
        } else if (error.message.includes('conectar') || error.message.includes('fetch')) {
          errorType = 'connection';
        } else if (error.message.includes('obrigatório') || error.message.includes('inválido')) {
          errorType = 'validation';
        }
      }
      
      const authError = new AuthError(errorMessage, errorType);
      
      switch (errorType) {
        case 'invalid_credentials':
          toast.error(errorMessage, 'Credenciais Incorretas', 5000);
          break;
        case 'connection':
          toast.error(errorMessage, 'Erro de Conexão', 6000);
          break;
        case 'validation':
          toast.warning(errorMessage, 'Dados Inválidos', 4000);
          break;
        default:
          toast.error(errorMessage, 'Erro no Login', 4000);
      }
      
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const definirSenha = async (email, senha) => {
    setLoading(true);
    try {
      if (!email || !senha) {
        throw new AuthError('E-mail e senha são obrigatórios', 'validation');
      }

      if (senha.length < 6) {
        throw new AuthError('Senha deve ter no mínimo 6 caracteres', 'validation');
      }

      const response = await authService.definirSenha(email, senha);
      
      const { user: userData, token: userToken } = response;
      
      setUser(userData);
      setToken(userToken);
      localStorage.setItem('esmile_token', userToken);
      localStorage.setItem('esmile_user', JSON.stringify(userData));
      
      toast.success('Senha definida com sucesso! Login realizado.');
      
      return userData;
    } catch (error) {
      let errorMessage = 'Erro ao definir senha. Tente novamente.';
      let errorType = 'generic';
      
      if (error.message) {
        errorMessage = error.message;
        if (error.message.includes('obrigatório') || error.message.includes('inválido')) {
          errorType = 'validation';
        } else if (error.message.includes('conectar') || error.message.includes('fetch')) {
          errorType = 'connection';
        }
      }
      
      const authError = new AuthError(errorMessage, errorType);
      
      switch (errorType) {
        case 'validation':
          toast.warning(errorMessage, 'Dados Inválidos', 4000);
          break;
        case 'connection':
          toast.error(errorMessage, 'Erro de Conexão', 6000);
          break;
        default:
          toast.error(errorMessage, 'Erro ao Definir Senha', 4000);
      }
      
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      if (!userData.nome || !userData.email || !userData.senha) {
        throw new AuthError('Todos os campos são obrigatórios', 'validation');
      }

      if (userData.senha.length < 6) {
        throw new AuthError('Senha deve ter no mínimo 6 caracteres', 'validation');
      }

      const response = await authService.register(userData);
      
      const { user: newUser, token: userToken } = response;
      
      setUser(newUser);
      setToken(userToken);
      localStorage.setItem('esmile_token', userToken);
      localStorage.setItem('esmile_user', JSON.stringify(newUser));
      
      toast.success('Cadastro realizado com sucesso!');
      
      return newUser;
    } catch (error) {
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      let errorType = 'generic';
      
      if (error.message) {
        errorMessage = error.message;
        if (error.message.includes('já cadastrado')) {
          errorType = 'duplicate';
        } else if (error.message.includes('obrigatório') || error.message.includes('inválido')) {
          errorType = 'validation';
        } else if (error.message.includes('conectar') || error.message.includes('fetch')) {
          errorType = 'connection';
        }
      }
      
      const authError = new AuthError(errorMessage, errorType);
      
      switch (errorType) {
        case 'duplicate':
          toast.error(errorMessage, 'Email já cadastrado', 5000);
          break;
        case 'validation':
          toast.warning(errorMessage, 'Dados Inválidos', 4000);
          break;
        case 'connection':
          toast.error(errorMessage, 'Erro de Conexão', 6000);
          break;
        default:
          toast.error(errorMessage, 'Erro no Cadastro', 4000);
      }
      
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('esmile_token');
    localStorage.removeItem('esmile_user');
    toast.info('Logout realizado com sucesso', 'Até logo!');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      login, 
      register,
      definirSenha,
      logout, 
      loading,
      isAuthenticated: !!user && !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};