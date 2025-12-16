import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { getInitialRoute } from '../utils/routeUtils';
import { Eye, EyeOff, Mail, Lock, User, KeyRound, ArrowLeft } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, definirSenha, loading } = useAuth();
  
  // Verificar se há parâmetros na URL para pré-preencher
  const emailParam = searchParams.get('email');
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabParam || 'cadastro'); // 'cadastro' ou 'definir-senha'
  
  // Estados para cadastro
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  
  // Estados para definir senha
  const [senhaForm, setSenhaForm] = useState({
    email: emailParam || '',
    senha: '',
    confirmarSenha: ''
  });

  // Atualizar email se vier da URL
  useEffect(() => {
    if (emailParam) {
      setSenhaForm(prev => ({ ...prev, email: emailParam }));
      setActiveTab('definir-senha');
    }
  }, [emailParam]);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSenhaPassword, setShowSenhaPassword] = useState(false);
  const [showSenhaConfirmPassword, setShowSenhaConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [senhaErrors, setSenhaErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCadastroChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSenhaChange = (e) => {
    const { name, value } = e.target;
    setSenhaForm(prev => ({
      ...prev,
      [name]: value
    }));

    if (senhaErrors[name]) {
      setSenhaErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateCadastroForm = () => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter no mínimo 6 caracteres';
    }
    
    if (!formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSenhaForm = () => {
    const newErrors = {};
    
    if (!senhaForm.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!validateEmail(senhaForm.email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    if (!senhaForm.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (senhaForm.senha.length < 6) {
      newErrors.senha = 'Senha deve ter no mínimo 6 caracteres';
    }
    
    if (!senhaForm.confirmarSenha) {
      newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (senhaForm.senha !== senhaForm.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }

    setSenhaErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCadastroSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCadastroForm()) return;

    try {
      const userData = await register({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha
      });
      
      // Redirecionar para a rota inicial baseada no role do usuário
      const initialRoute = getInitialRoute(userData?.role);
      navigate(initialRoute);
    } catch (error) {
      console.error('Erro no registro:', error);
    }
  };

  const handleDefinirSenhaSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateSenhaForm()) return;

    try {
      const userData = await definirSenha(senhaForm.email, senhaForm.senha);
      // Redirecionar para a rota inicial baseada no role do usuário
      const initialRoute = getInitialRoute(userData?.role);
      navigate(initialRoute);
    } catch (error) {
      console.error('Erro ao definir senha:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <div className="max-w-md w-full animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <Link
            to="/login"
            className="flex items-center gap-2 text-white/90 dark:text-white/80 hover:text-white transition-colors"
          >
          </Link>
          <ThemeToggle />
        </div>

        <div className="login-card">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-[#3311cb] to-[#2575fc] rounded-lg">
              </div>
              <h1 className="text-3xl font-bold title-label">Esmile</h1> 
            </div>
            <p className="sub-title-label text-sm font-medium"> 
              Sistema de Gestão Odontológica
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setActiveTab('cadastro')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                activeTab === 'cadastro'
                  ? 'border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Criar Conta
            </button>
            <button
              onClick={() => setActiveTab('definir-senha')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                activeTab === 'definir-senha'
                  ? 'border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Definir Senha
            </button>
          </div>

          {/* Formulário de Cadastro */}
          {activeTab === 'cadastro' && (
            <form onSubmit={handleCadastroSubmit} className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-sm login-text">
                  Crie sua conta para começar a usar o sistema
                </p>
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <label htmlFor="nome" className="block text-sm font-medium login-label">
                  Nome completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    value={formData.nome}
                    onChange={handleCadastroChange}
                    className="input-field"
                    placeholder="Seu nome completo"
                  />
                </div>
                {errors.nome && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.nome}</p>
                )}
              </div>

              {/* Email */}
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
                    onChange={handleCadastroChange}
                    className="input-field"
                    placeholder="seu@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Senha */}
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
                    onChange={handleCadastroChange}
                    className="input-field pr-12"
                    placeholder="Mínimo 6 caracteres"
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

              {/* Confirmar Senha */}
              <div className="space-y-2">
                <label htmlFor="confirmarSenha" className="block text-sm font-medium login-label">
                  Confirmar senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmarSenha}
                    onChange={handleCadastroChange}
                    className="input-field pr-12"
                    placeholder="Confirme sua senha"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmarSenha && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.confirmarSenha}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando conta...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </button>
            </form>
          )}

          {/* Formulário de Definir Senha */}
          {activeTab === 'definir-senha' && (
            <form onSubmit={handleDefinirSenhaSubmit} className="space-y-6">
              <div className="text-center mb-4">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <KeyRound className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-sm login-text">
                  Você foi adicionado à equipe. Defina uma senha para acessar o sistema.
                </p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="senha-email" className="block text-sm font-medium login-label">
                  E-mail do profissional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="senha-email"
                    name="email"
                    type="email"
                    value={senhaForm.email}
                    onChange={handleSenhaChange}
                    className="input-field"
                    placeholder="email@profissional.com"
                  />
                </div>
                {senhaErrors.email && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{senhaErrors.email}</p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <label htmlFor="senha-senha" className="block text-sm font-medium login-label">
                  Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="senha-senha"
                    name="senha"
                    type={showSenhaPassword ? 'text' : 'password'}
                    value={senhaForm.senha}
                    onChange={handleSenhaChange}
                    className="input-field pr-12"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    onClick={() => setShowSenhaPassword(!showSenhaPassword)}
                  >
                    {showSenhaPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {senhaErrors.senha && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{senhaErrors.senha}</p>
                )}
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-2">
                <label htmlFor="senha-confirmarSenha" className="block text-sm font-medium login-label">
                  Confirmar senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="senha-confirmarSenha"
                    name="confirmarSenha"
                    type={showSenhaConfirmPassword ? 'text' : 'password'}
                    value={senhaForm.confirmarSenha}
                    onChange={handleSenhaChange}
                    className="input-field pr-12"
                    placeholder="Confirme sua senha"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    onClick={() => setShowSenhaConfirmPassword(!showSenhaConfirmPassword)}
                  >
                    {showSenhaConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {senhaErrors.confirmarSenha && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{senhaErrors.confirmarSenha}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Definindo senha...
                  </>
                ) : (
                  'Definir Senha'
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm login-text">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/90 dark:text-white/80 text-sm font-medium">
            &copy; 2025 EsMile. Desenvolvido por Izaque Nicolas
          </p>
        </div>
      </div>
    </div>
  );
};
