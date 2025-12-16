import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getInitialRoute } from '../../utils/routeUtils';
import { Eye, EyeOff, Mail, Lock, UserCheck } from 'lucide-react';

export const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const userData = await login(formData);
      // Redirecionar para a rota inicial baseada no role do usuário
      const initialRoute = getInitialRoute(userData?.role);
      navigate(initialRoute);
    } catch (error) {
      console.error('Erro no login:', error);
      // Se o erro for de senha não definida, redirecionar para página de cadastro
      if (error.type === 'senha_nao_definida' && error.email) {
        navigate(`/register?email=${encodeURIComponent(error.email)}&tab=definir-senha`);
      }
    }
  };


  const handleDemoLogin = () => {
    setFormData({
      email: 'demo@esmile.com',
      senha: 'demo123',
      rememberMe: false
    });
  };

  const handleTestError = (errorType) => {
    const testCases = {
      credentials: { email: 'teste@email.com', senha: 'senhaerrada' },
      connection: { email: 'teste@email.com', senha: 'erroconexao' },
      server: { email: 'teste@email.com', senha: 'servidor' },
      validation: { email: '', senha: '' }
    };
    
    setFormData({
      ...testCases[errorType],
      rememberMe: false
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium login-label">
          E-mail
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
            placeholder="seu@email.com"
          />
        </div>
        {errors.email && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="senha" className="block text-sm font-medium login-label">
          Senha
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="senha"
            name="senha"
            type={showPassword ? 'text' : 'password'}
            value={formData.senha}
            onChange={handleChange}
            className="input-field pr-12"
            placeholder="Sua senha"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.senha && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.senha}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-400 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <span className="login-text text-sm font-medium">
            Lembrar senha
          </span>
        </label>
        <a href="#" className="text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-colors font-medium">
          Esqueceu a senha?
        </a>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Entrando...
          </>
        ) : (
          'Entrar'
        )}
      </button>
    </form>
  );
};