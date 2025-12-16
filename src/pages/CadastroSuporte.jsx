import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authService } from '../services/authService';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  UserPlusIcon,
  UsersIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export default function CadastroSuporte() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    usuariosIds: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [showModalUsuarios, setShowModalUsuarios] = useState(false);
  const [buscaUsuarios, setBuscaUsuarios] = useState('');

  // Verificar se o usuário tem permissão (admin ou suporte)
  const hasPermission = user?.role === 'suporte' || user?.role === 'admin';

  // Carregar usuários disponíveis para atribuição
  const loadUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      const usuariosData = await authService.getAllUsers({ role: 'user', ativo: true });
      setUsuariosDisponiveis(usuariosData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  // Abrir modal de seleção de usuários
  const handleOpenModalUsuarios = () => {
    if (usuariosDisponiveis.length === 0) {
      loadUsuarios();
    }
    setShowModalUsuarios(true);
  };

  // Filtrar usuários pela busca
  const usuariosFiltrados = usuariosDisponiveis.filter(usuario => 
    usuario.nome.toLowerCase().includes(buscaUsuarios.toLowerCase()) ||
    usuario.email.toLowerCase().includes(buscaUsuarios.toLowerCase())
  );

  // Toggle seleção de usuário
  const toggleUsuario = (usuarioId) => {
    if (formData.usuariosIds.includes(usuarioId)) {
      setFormData({
        ...formData,
        usuariosIds: formData.usuariosIds.filter(id => id !== usuarioId)
      });
    } else {
      setFormData({
        ...formData,
        usuariosIds: [...formData.usuariosIds, usuarioId]
      });
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      await authService.registerSuporte({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        usuariosIds: formData.usuariosIds
      });

      toast.success('Usuário de suporte cadastrado com sucesso!', 'Sucesso');
      
      // Limpar formulário
      setFormData({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        usuariosIds: []
      });
    } catch (error) {
      console.error('Erro ao cadastrar suporte:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao cadastrar usuário de suporte';
      toast.error(errorMessage, 'Erro');
    } finally {
      setLoading(false);
    }
  };

  // Se não tiver permissão, mostrar mensagem de acesso negado
  if (!hasPermission) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full p-8 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="text-center">
            <UserPlusIcon className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Acesso Negado
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Apenas administradores ou usuários de suporte podem cadastrar novos suportes.
            </p>
            <button
              onClick={() => navigate('/agenda')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/40' : 'bg-blue-100'}`}>
              <UserPlusIcon className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Cadastro de Suporte
            </h1>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Cadastre novos usuários de suporte no sistema
          </p>
        </div>

        {/* Formulário */}
        <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div>
              <label htmlFor="nome" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Nome completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  value={formData.nome}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-all ${
                    errors.nome
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  } outline-none`}
                  placeholder="Nome completo do suporte"
                />
              </div>
              {errors.nome && (
                <p className="text-red-500 text-sm mt-1">{errors.nome}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-all ${
                    errors.email
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  } outline-none`}
                  placeholder="email@exemplo.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="senha" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="senha"
                  name="senha"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.senha}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-2.5 rounded-lg border text-sm transition-all ${
                    errors.senha
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  } outline-none`}
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.senha && (
                <p className="text-red-500 text-sm mt-1">{errors.senha}</p>
              )}
            </div>

            {/* Confirmar Senha */}
            <div>
              <label htmlFor="confirmarSenha" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Confirmar senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-2.5 rounded-lg border text-sm transition-all ${
                    errors.confirmarSenha
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  } outline-none`}
                  placeholder="Confirme a senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmarSenha && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmarSenha}</p>
              )}
            </div>

            {/* Seleção de Usuários */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-5 h-5" />
                  Usuários que este suporte irá auxiliar (opcional)
                </div>
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenModalUsuarios}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    isDark
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <UsersIcon className="w-4 h-4" />
                  Selecionar Usuários
                </button>
                {formData.usuariosIds.length > 0 && (
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {formData.usuariosIds.length} usuário(s) selecionado(s)
                  </span>
                )}
              </div>
            </div>

            {/* Botão Submit */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cadastrando...
                  </span>
                ) : (
                  'Cadastrar Suporte'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Seleção de Usuários */}
      {showModalUsuarios && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowModalUsuarios(false);
              setBuscaUsuarios('');
            }}
          />
          <div className={`relative max-w-2xl w-full rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 max-h-[90vh] flex flex-col`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Selecionar Usuários
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Selecione os usuários que este suporte irá auxiliar
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModalUsuarios(false);
                  setBuscaUsuarios('');
                }}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Barra de Pesquisa */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  value={buscaUsuarios}
                  onChange={(e) => setBuscaUsuarios(e.target.value)}
                  placeholder="Buscar por nome ou email..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  } outline-none`}
                />
              </div>
            </div>

            {/* Lista de Usuários */}
            <div className="flex-1 overflow-y-auto">
              {loadingUsuarios ? (
                <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-sm mt-4">Carregando usuários...</p>
                </div>
              ) : usuariosFiltrados.length === 0 ? (
                <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <UsersIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">
                    {buscaUsuarios ? 'Nenhum usuário encontrado' : 'Nenhum usuário disponível'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {usuariosFiltrados.map((usuario) => (
                    <label
                      key={usuario.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${
                        formData.usuariosIds.includes(usuario.id)
                          ? isDark
                            ? 'bg-blue-900/30 border-blue-700'
                            : 'bg-blue-50 border-blue-200'
                          : isDark
                            ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.usuariosIds.includes(usuario.id)}
                        onChange={() => toggleUsuario(usuario.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {usuario.nome}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {usuario.email}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {formData.usuariosIds.length} de {usuariosDisponiveis.length} usuário(s) selecionado(s)
              </span>
              <button
                onClick={() => {
                  setShowModalUsuarios(false);
                  setBuscaUsuarios('');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

