import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authService } from '../services/authService';
import { suporteUsuariosService } from '../services/suporteUsuariosService';
import {
  UserIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

export default function ListaUsuarios() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const toast = useToast();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroRole, setFiltroRole] = useState('todos'); // 'todos', 'admin', 'suporte', 'user'
  const [filtroStatus, setFiltroStatus] = useState('ativo'); // 'todos', 'ativo', 'inativo'
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    role: 'user',
    ativo: true,
    senha: ''
  });
  const [errors, setErrors] = useState({});
  const [usuariosAtribuidos, setUsuariosAtribuidos] = useState([]);
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [showModalUsuarios, setShowModalUsuarios] = useState(false);
  const [buscaUsuarios, setBuscaUsuarios] = useState('');

  // Verificar se o usuário é admin
  const isAdmin = user?.role === 'admin';

  // Carregar usuários
  useEffect(() => {
    if (!isAdmin) return;

    const loadUsuarios = async () => {
      try {
        setLoading(true);
        const filters = {};
        
        if (filtroRole !== 'todos') {
          filters.role = filtroRole;
        }
        
        if (filtroStatus !== 'todos') {
          filters.ativo = filtroStatus === 'ativo';
        }
        
        if (busca) {
          filters.busca = busca;
        }

        const usuariosData = await authService.getAllUsers(filters);
        setUsuarios(usuariosData);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        toast.error('Erro ao carregar usuários', 'Erro');
        setUsuarios([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsuarios();
  }, [filtroRole, filtroStatus, busca, isAdmin, toast]);

  // Formatar data
  const formatarData = (dataString) => {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obter badge de role
  const getRoleBadge = (role) => {
    const badges = {
      admin: { label: 'Administrador', color: isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700' },
      suporte: { label: 'Suporte', color: isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700' },
      user: { label: 'Usuário', color: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700' }
    };
    return badges[role] || badges.user;
  };

  // Abrir modal de edição
  const handleEdit = async (usuario) => {
    setEditingUser(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      ativo: usuario.ativo,
      senha: ''
    });
    setErrors({});
    setShowPassword(false);

    // Se for suporte, carregar usuários atribuídos
    if (usuario.role === 'suporte') {
      setLoadingUsuarios(true);
      try {
        // Carregar usuários atribuídos
        const atribuidos = await suporteUsuariosService.getUsuariosPorSuporte(usuario.id);
        setUsuariosAtribuidos(atribuidos.map(u => u.id));

        // Carregar todos os usuários disponíveis tá faltandos os profissionais
        const todosUsuarios = await authService.getAllUsers({ role: 'user', ativo: true });
        setUsuariosDisponiveis(todosUsuarios);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        setUsuariosAtribuidos([]);
        setUsuariosDisponiveis([]);
      } finally {
        setLoadingUsuarios(false);
      }
    } else {
      setUsuariosAtribuidos([]);
      setUsuariosDisponiveis([]);
    }
  };

  // Fechar modal de edição
  const handleCloseEdit = () => {
    setEditingUser(null);
    setFormData({
      nome: '',
      email: '',
      role: 'user',
      ativo: true,
      senha: ''
    });
    setErrors({});
    setUsuariosAtribuidos([]);
    setUsuariosDisponiveis([]);
    setShowModalUsuarios(false);
    setBuscaUsuarios('');
  };

  // Abrir modal de seleção de usuários
  const handleOpenModalUsuarios = () => {
    setShowModalUsuarios(true);
  };

  // Filtrar usuários pela busca
  const usuariosFiltrados = usuariosDisponiveis.filter(usuario => 
    usuario.nome.toLowerCase().includes(buscaUsuarios.toLowerCase()) ||
    usuario.email.toLowerCase().includes(buscaUsuarios.toLowerCase())
  );

  // Toggle seleção de usuário
  const toggleUsuario = (usuarioId) => {
    if (usuariosAtribuidos.includes(usuarioId)) {
      setUsuariosAtribuidos(usuariosAtribuidos.filter(id => id !== usuarioId));
    } else {
      setUsuariosAtribuidos([...usuariosAtribuidos, usuarioId]);
    }
  };

  // Validar formulário
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (formData.senha && formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter no mínimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Salvar edição
  const handleSaveEdit = async () => {
    if (!validateForm()) return;

    try {
      const updateData = {
        nome: formData.nome,
        email: formData.email,
        role: formData.role,
        ativo: formData.ativo
      };

      // Só incluir senha se foi preenchida
      if (formData.senha) {
        updateData.senha = formData.senha;
      }

      await authService.updateUser(editingUser.id, updateData);

      // Se for suporte, atualizar atribuições
      if (formData.role === 'suporte' || editingUser.role === 'suporte') {
        // Buscar atribuições atuais
        const atribuicoesAtuais = await suporteUsuariosService.getUsuariosPorSuporte(editingUser.id);
        const idsAtuais = atribuicoesAtuais.map(u => u.id);

        // Adicionar novos
        const paraAdicionar = usuariosAtribuidos.filter(id => !idsAtuais.includes(id));
        for (const usuarioId of paraAdicionar) {
          try {
            await suporteUsuariosService.atribuirUsuario(editingUser.id, usuarioId);
          } catch (error) {
            console.error(`Erro ao atribuir usuário ${usuarioId}:`, error);
          }
        }

        // Remover os que foram desmarcados
        const paraRemover = idsAtuais.filter(id => !usuariosAtribuidos.includes(id));
        for (const usuarioId of paraRemover) {
          try {
            await suporteUsuariosService.removerAtribuicao(editingUser.id, usuarioId);
          } catch (error) {
            console.error(`Erro ao remover atribuição do usuário ${usuarioId}:`, error);
          }
        }
      }
      
      // Recarregar lista
      const filters = {};
      if (filtroRole !== 'todos') filters.role = filtroRole;
      if (filtroStatus !== 'todos') filters.ativo = filtroStatus === 'ativo';
      if (busca) filters.busca = busca;
      
      const usuariosData = await authService.getAllUsers(filters);
      setUsuarios(usuariosData);
      
      toast.success('Usuário atualizado com sucesso!', 'Sucesso');
      handleCloseEdit();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao atualizar usuário';
      toast.error(errorMessage, 'Erro');
    }
  };

  // Confirmar exclusão
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await authService.deleteUser(userToDelete.id);
      
      // Recarregar lista
      const filters = {};
      if (filtroRole !== 'todos') filters.role = filtroRole;
      if (filtroStatus !== 'todos') filters.ativo = filtroStatus === 'ativo';
      if (busca) filters.busca = busca;
      
      const usuariosData = await authService.getAllUsers(filters);
      setUsuarios(usuariosData);
      
      toast.success('Usuário inativado com sucesso!', 'Sucesso');
      setUserToDelete(null);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao deletar usuário';
      toast.error(errorMessage, 'Erro');
    }
  };

  // Se não for admin, mostrar mensagem de acesso negado
  if (!isAdmin) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full p-8 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="text-center">
            <ShieldCheckIcon className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Acesso Negado
            </h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Apenas administradores podem acessar esta página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/40' : 'bg-blue-100'}`}>
              <UserGroupIcon className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Lista de Usuários
            </h1>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Gerencie todos os usuários cadastrados no sistema
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-6 space-y-4">
          {/* Busca */}
          <div className="relative">
            <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-all ${
                isDark 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              } outline-none`}
            />
          </div>

          {/* Filtros de Role e Status */}
          <div className="flex flex-wrap gap-3">
            {/* Filtro de Role */}
            <div className="flex items-center gap-2">
              <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Tipo:
              </label>
              <select
                value={filtroRole}
                onChange={(e) => setFiltroRole(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                  isDark
                    ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                } outline-none`}
              >
                <option value="todos">Todos</option>
                <option value="admin">Administrador</option>
                <option value="suporte">Suporte</option>
                <option value="user">Usuário</option>
              </select>
            </div>

            {/* Filtro de Status */}
            <div className="flex items-center gap-2">
              <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Status:
              </label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                  isDark
                    ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                } outline-none`}
              >
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className={`rounded-lg border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {loading ? (
            <div className={`p-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-sm">Carregando usuários...</p>
            </div>
          ) : usuarios.length === 0 ? (
            <div className={`p-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <UserGroupIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <>
              {/* Cabeçalho da tabela (desktop) */}
              <div className={`hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 border-b ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="col-span-2">
                  <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Nome
                  </span>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    E-mail
                  </span>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Tipo
                  </span>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Status
                  </span>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Cadastrado em
                  </span>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Ações
                  </span>
                </div>
              </div>

              {/* Lista de usuários */}
              <div className="divide-y" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                {usuarios.map((usuario) => {
                  const roleBadge = getRoleBadge(usuario.role);
                  
                  return (
                    <div
                      key={usuario.id}
                      className={`px-4 md:px-6 py-4 hover:bg-opacity-50 transition-colors ${
                        isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        {/* Nome */}
                        <div className="col-span-1 md:col-span-2 flex items-center gap-3">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                            usuario.role === 'admin' ? 'bg-red-500' :
                            usuario.role === 'suporte' ? 'bg-blue-500' :
                            'bg-gray-500'
                          }`}>
                            <UserIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {usuario.nome}
                            </div>
                            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              ID: {usuario.id}
                            </div>
                          </div>
                        </div>

                        {/* E-mail */}
                        <div className={`col-span-1 md:col-span-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          <span className="md:hidden font-medium mr-2">E-mail:</span>
                          {usuario.email}
                        </div>

                        {/* Tipo/Role */}
                        <div className="col-span-1 md:col-span-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge.color}`}>
                            {roleBadge.label}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                          {usuario.ativo ? (
                            <span className={`inline-flex items-center gap-1.5 text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                              <CheckCircleIcon className="w-5 h-5" />
                              <span className="hidden md:inline">Ativo</span>
                            </span>
                          ) : (
                            <span className={`inline-flex items-center gap-1.5 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                              <XCircleIcon className="w-5 h-5" />
                              <span className="hidden md:inline">Inativo</span>
                            </span>
                          )}
                        </div>

                        {/* Data de Cadastro */}
                        <div className={`col-span-1 md:col-span-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span className="md:hidden font-medium mr-2">Cadastrado em:</span>
                          {formatarData(usuario.createdAt)}
                        </div>

                        {/* Ações */}
                        <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(usuario)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? 'hover:bg-gray-700 text-gray-400 hover:text-blue-400'
                                : 'hover:bg-gray-100 text-gray-500 hover:text-blue-600'
                            }`}
                            title="Editar usuário"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          {usuario.id !== user?.id && (
                            <button
                              onClick={() => setUserToDelete(usuario)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDark
                                  ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400'
                                  : 'hover:bg-gray-100 text-gray-500 hover:text-red-600'
                              }`}
                              title="Deletar usuário"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Modal de Edição */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/40"
              onClick={handleCloseEdit}
            />
            <div className={`relative max-w-2xl w-full rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Editar Usuário
                </h2>
                <button
                  onClick={handleCloseEdit}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Nome */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Nome completo
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => {
                      setFormData({ ...formData, nome: e.target.value });
                      if (errors.nome) setErrors({ ...errors, nome: '' });
                    }}
                    className={`w-full px-4 py-2 rounded-lg border text-sm ${
                      errors.nome
                        ? 'border-red-500'
                        : isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                    } outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
                </div>

                {/* E-mail */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    className={`w-full px-4 py-2 rounded-lg border text-sm ${
                      errors.email
                        ? 'border-red-500'
                        : isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                    } outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Role */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tipo de Usuário
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border text-sm ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="user">Usuário</option>
                    <option value="suporte">Suporte</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <input
                      type="checkbox"
                      checked={formData.ativo}
                      onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Usuário ativo</span>
                  </label>
                </div>

                {/* Senha (opcional) */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Nova Senha (deixe em branco para não alterar)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.senha}
                      onChange={(e) => {
                        setFormData({ ...formData, senha: e.target.value });
                        if (errors.senha) setErrors({ ...errors, senha: '' });
                      }}
                      className={`w-full px-4 py-2 pr-10 rounded-lg border text-sm ${
                        errors.senha
                          ? 'border-red-500'
                          : isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                      } outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.senha && <p className="text-red-500 text-sm mt-1">{errors.senha}</p>}
                </div>

                {/* Gerenciar Usuários Atribuídos (apenas para suporte) */}
                {(formData.role === 'suporte' || editingUser?.role === 'suporte') && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div className="flex items-center gap-2">
                        <UsersIcon className="w-5 h-5" />
                        Usuários que este suporte irá auxiliar
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
                      {usuariosAtribuidos.length > 0 && (
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {usuariosAtribuidos.length} usuário(s) selecionado(s)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleCloseEdit}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    isDark
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

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
                          usuariosAtribuidos.includes(usuario.id)
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
                          checked={usuariosAtribuidos.includes(usuario.id)}
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
                  {usuariosAtribuidos.length} de {usuariosDisponiveis.length} usuário(s) selecionado(s)
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

        {/* Modal de Confirmação de Exclusão */}
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/40"
              onClick={() => setUserToDelete(null)}
            />
            <div className={`relative max-w-md w-full rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Confirmar Inativação
                </h2>
                <button
                  onClick={() => setUserToDelete(null)}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Tem certeza que deseja inativar o usuário <strong>{userToDelete.nome}</strong>? 
                O usuário não poderá mais acessar o sistema, mas poderá ser reativado posteriormente.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setUserToDelete(null)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    isDark
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Inativar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

