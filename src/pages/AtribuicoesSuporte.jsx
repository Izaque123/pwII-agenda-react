import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authService } from '../services/authService';
import { suporteUsuariosService } from '../services/suporteUsuariosService';
import {
  UserGroupIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  XMarkIcon,
  TrashIcon,
  LinkIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

export default function AtribuicoesSuporte() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const toast = useToast();
  const [suportes, setSuportes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [atribuicoes, setAtribuicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSuporte, setSelectedSuporte] = useState(null);
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState([]);

  // Verificar se o usuário é admin
  const isAdmin = user?.role === 'admin';

  // Carregar dados
  useEffect(() => {
    if (!isAdmin) return;

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Carregar suportes
        const suportesData = await authService.getAllUsers({ role: 'suporte', ativo: true });
        setSuportes(suportesData);

        // Carregar usuários (user role)
        const usuariosData = await authService.getAllUsers({ role: 'user', ativo: true });
        setUsuarios(usuariosData);

        // Carregar atribuições
        const atribuicoesData = await suporteUsuariosService.getAll();
        setAtribuicoes(atribuicoesData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados', 'Erro');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAdmin, toast]);

  // Abrir modal de atribuição
  const handleAtribuir = (suporte) => {
    setSelectedSuporte(suporte);
    
    // Filtrar usuários que já não estão atribuídos a este suporte
    const usuariosAtribuidos = atribuicoes
      .filter(a => a.suporteId === suporte.id)
      .map(a => a.usuarioId);
    
    const disponiveis = usuarios.filter(u => !usuariosAtribuidos.includes(u.id));
    setUsuariosDisponiveis(disponiveis);
    setShowModal(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSuporte(null);
    setUsuariosDisponiveis([]);
  };

  // Confirmar atribuição
  const handleConfirmarAtribuicao = async (usuarioId) => {
    if (!selectedSuporte) return;

    try {
      await suporteUsuariosService.atribuirUsuario(selectedSuporte.id, usuarioId);
      
      // Recarregar atribuições
      const atribuicoesData = await suporteUsuariosService.getAll();
      setAtribuicoes(atribuicoesData);
      
      toast.success('Usuário atribuído com sucesso!', 'Sucesso');
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao atribuir usuário:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao atribuir usuário';
      toast.error(errorMessage, 'Erro');
    }
  };

  // Remover atribuição
  const handleRemoverAtribuicao = async (suporteId, usuarioId) => {
    try {
      await suporteUsuariosService.removerAtribuicao(suporteId, usuarioId);
      
      // Recarregar atribuições
      const atribuicoesData = await suporteUsuariosService.getAll();
      setAtribuicoes(atribuicoesData);
      
      toast.success('Atribuição removida com sucesso!', 'Sucesso');
    } catch (error) {
      console.error('Erro ao remover atribuição:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao remover atribuição';
      toast.error(errorMessage, 'Erro');
    }
  };

  // Obter usuários de um suporte
  const getUsuariosDoSuporte = (suporteId) => {
    return atribuicoes
      .filter(a => a.suporteId === suporteId)
      .map(a => {
        const usuario = usuarios.find(u => u.id === a.usuarioId);
        return usuario ? { ...usuario, atribuicaoId: a.id } : null;
      })
      .filter(Boolean);
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
              <LinkIcon className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Atribuições de Suporte
            </h1>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Gerencie quais usuários estão atribuídos a cada suporte
          </p>
        </div>

        {/* Lista de Suportes */}
        {loading ? (
          <div className={`p-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-sm">Carregando...</p>
          </div>
        ) : suportes.length === 0 ? (
          <div className={`p-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <UserGroupIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Nenhum suporte cadastrado</p>
          </div>
        ) : (
          <div className="space-y-6">
            {suportes.map((suporte) => {
              const usuariosDoSuporte = getUsuariosDoSuporte(suporte.id);
              
              return (
                <div
                  key={suporte.id}
                  className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6`}
                >
                  {/* Header do Suporte */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        <UserGroupIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {suporte.nome}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {suporte.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAtribuir(suporte)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isDark
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      <UserPlusIcon className="w-4 h-4" />
                      Atribuir Usuário
                    </button>
                  </div>

                  {/* Lista de Usuários Atribuídos */}
                  {usuariosDoSuporte.length === 0 ? (
                    <div className={`p-4 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <p className="text-sm">Nenhum usuário atribuído</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {usuariosDoSuporte.map((usuario) => (
                        <div
                          key={usuario.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-sm font-semibold">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {usuario.nome}
                              </p>
                              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {usuario.email}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoverAtribuicao(suporte.id, usuario.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? 'hover:bg-gray-600 text-gray-400 hover:text-red-400'
                                : 'hover:bg-gray-200 text-gray-500 hover:text-red-600'
                            }`}
                            title="Remover atribuição"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Atribuição */}
      {showModal && selectedSuporte && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40"
            onClick={handleCloseModal}
          />
          <div className={`relative max-w-2xl w-full rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Atribuir Usuário ao Suporte
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedSuporte.nome}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {usuariosDisponiveis.length === 0 ? (
              <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <p className="text-sm">Todos os usuários já estão atribuídos a este suporte</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {usuariosDisponiveis.map((usuario) => (
                  <div
                    key={usuario.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                    } hover:bg-opacity-80 transition-colors cursor-pointer`}
                    onClick={() => handleConfirmarAtribuicao(usuario.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {usuario.nome}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {usuario.email}
                        </p>
                      </div>
                    </div>
                    <UserPlusIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

