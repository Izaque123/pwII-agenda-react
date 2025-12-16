import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { mensagensService } from '../services/mensagensService';
import { suporteUsuariosService } from '../services/suporteUsuariosService';
import { useToast } from '../contexts/ToastContext';
import {
  ChatBubbleLeftRightIcon,
  UserIcon,
  EnvelopeIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export default function Mensagens() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const toast = useToast();
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [thread, setThread] = useState(null);
  const [respostaTexto, setRespostaTexto] = useState('');
  const [enviandoResposta, setEnviandoResposta] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [busca, setBusca] = useState('');
  const messagesEndRef = useRef(null);

  // Verificar se o usuário é de suporte
  const isSuporte = user?.role === 'suporte';

  // Carregar usuários atribuídos ao suporte
  useEffect(() => {
    if (!isSuporte) return;

    const loadUsuarios = async () => {
      try {
        setLoading(true);
        const usuariosData = await suporteUsuariosService.getUsuariosPorSuporte(user.id);
        
        // Buscar mensagens para cada usuário para mostrar última mensagem e contador
        const usuariosComMensagens = await Promise.all(
          usuariosData.map(async (usuario) => {
            try {
              // Buscar mensagens recebidas deste usuário
              const mensagens = await mensagensService.getMensagensRecebidas();
              
              // Converter IDs para número para comparação correta
              const mensagensDoUsuario = mensagens.filter(
                m => {
                  const remetenteMatch = Number(m.remetenteId) === Number(usuario.id);
                  const isOriginal = !m.mensagemOriginalId;
                  return remetenteMatch && isOriginal;
                }
              );
              
              // Ordenar por data (mais recente primeiro)
              mensagensDoUsuario.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
              });
              
              const naoLidas = mensagensDoUsuario.filter(m => !m.lida).length;
              const ultimaMensagem = mensagensDoUsuario.length > 0 
                ? mensagensDoUsuario[0] 
                : null;

              return {
                ...usuario,
                naoLidas,
                ultimaMensagem
              };
            } catch (error) {
              console.error(`Erro ao buscar mensagens do usuário ${usuario.id}:`, error);
              return {
                ...usuario,
                naoLidas: 0,
                ultimaMensagem: null
              };
            }
          })
        );

        setUsuarios(usuariosComMensagens);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        toast.error('Erro ao carregar usuários', 'Erro');
        setUsuarios([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsuarios();
  }, [isSuporte, user, toast]);

  // Carregar thread quando selecionar usuário
  useEffect(() => {
    if (!selectedUsuario) {
      setThread(null);
      return;
    }

    const loadThread = async () => {
      try {
        setLoadingThread(true);
        
        // Buscar mensagens recebidas deste usuário
        const mensagens = await mensagensService.getMensagensRecebidas();
        // Converter IDs para número para comparação correta
        const mensagensDoUsuario = mensagens.filter(
          m => {
            const remetenteMatch = Number(m.remetenteId) === Number(selectedUsuario.id);
            const isOriginal = !m.mensagemOriginalId;
            return remetenteMatch && isOriginal;
          }
        );

        // Ordenar por data (mais recente primeiro)
        mensagensDoUsuario.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        if (mensagensDoUsuario.length > 0) {
          // Buscar thread da mensagem mais recente
          const mensagemOriginal = mensagensDoUsuario[0];
          const threadData = await mensagensService.getThread(mensagemOriginal.id);
          setThread(threadData);
          
          // Marcar como lida se não estiver
          if (!mensagemOriginal.lida) {
            await mensagensService.marcarComoLida(mensagemOriginal.id);
            // Atualizar na lista
            setUsuarios(prev => prev.map(u => 
              u.id === selectedUsuario.id 
                ? { ...u, naoLidas: Math.max(0, u.naoLidas - 1) }
                : u
            ));
          }
        } else {
          setThread(null);
        }
      } catch (error) {
        console.error('Erro ao carregar thread:', error);
        toast.error('Erro ao carregar conversa', 'Erro');
        setThread(null);
      } finally {
        setLoadingThread(false);
      }
    };

    loadThread();
  }, [selectedUsuario, toast]);

  // Scroll para o final quando thread mudar
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread, respostaTexto]);

  // Formatar data
  const formatarData = (dataString) => {
    if (!dataString) return '';
    const data = new Date(dataString);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataMsg = new Date(data);
    dataMsg.setHours(0, 0, 0, 0);

    const diffTime = hoje - dataMsg;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`;
    } else {
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  // Formatar data completa
  const formatarDataCompleta = (dataString) => {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Enviar resposta
  const handleEnviarResposta = async () => {
    if (!respostaTexto.trim() || !thread || !thread.original) return;

    try {
      setEnviandoResposta(true);
      await mensagensService.responderMensagem(thread.original.id, respostaTexto);
      
      // Recarregar thread
      const threadData = await mensagensService.getThread(thread.original.id);
      setThread(threadData);
      
      setRespostaTexto('');
      toast.success('Mensagem enviada com sucesso!', 'Sucesso');
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao enviar mensagem';
      toast.error(errorMessage, 'Erro');
    } finally {
      setEnviandoResposta(false);
    }
  };

  // Filtrar usuários pela busca
  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
    usuario.email.toLowerCase().includes(busca.toLowerCase())
  );

  // Se não for suporte, mostrar mensagem de acesso negado
  if (!isSuporte) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full p-8 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="text-center">
            <EnvelopeIcon className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Acesso Negado
            </h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Apenas usuários de suporte podem acessar esta página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-[calc(100vh-4rem)] ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex h-full">
        {/* Lista de Usuários - Sidebar */}
        <div className={`w-80 border-r flex flex-col ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {/* Header da Lista */}
          <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Conversas
            </h2>
            {/* Barra de Busca */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar usuário..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                } outline-none`}
              />
            </div>
          </div>

          {/* Lista de Usuários */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-sm">Carregando...</p>
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <UserIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">
                  {busca ? 'Nenhum usuário encontrado' : 'Nenhum usuário atribuído'}
                </p>
              </div>
            ) : (
              usuariosFiltrados.map((usuario) => (
                <button
                  key={usuario.id}
                  onClick={() => setSelectedUsuario(usuario)}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-colors border-b ${
                    selectedUsuario?.id === usuario.id
                      ? isDark
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-blue-50 border-gray-200'
                      : isDark
                        ? 'hover:bg-gray-700/50 border-gray-700'
                        : 'hover:bg-gray-50 border-gray-100'
                  }`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                    usuario.naoLidas > 0 ? 'bg-blue-500' : 'bg-gray-400'
                  }`}>
                    <UserIcon className="w-6 h-6" />
                  </div>

                  {/* Informações */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <h3 className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {usuario.nome}
                        </h3>
                        {/* Badge de não lidas ao lado do nome */}
                        {usuario.naoLidas > 0 && (
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-semibold flex items-center justify-center">
                            {usuario.naoLidas > 9 ? '9+' : usuario.naoLidas}
                          </div>
                        )}
                      </div>
                      {usuario.ultimaMensagem && (
                        <span className={`text-xs flex-shrink-0 ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatarData(usuario.ultimaMensagem.createdAt)}
                        </span>
                      )}
                    </div>
                    {usuario.ultimaMensagem ? (
                      <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {usuario.ultimaMensagem.mensagem}
                      </p>
                    ) : (
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Nenhuma mensagem
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Área de Conversa */}
        <div className="flex-1 flex flex-col">
          {!selectedUsuario ? (
            <div className={`flex-1 flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="text-center">
                <ChatBubbleLeftRightIcon className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Selecione um usuário para iniciar a conversa
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header da Conversa */}
              <div className={`px-6 py-4 border-b flex items-center gap-3 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold bg-blue-500`}>
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedUsuario.nome}
                  </h3>
                </div>
              </div>

              {/* Mensagens */}
              <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                {loadingThread ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : !thread || !thread.original ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <ChatBubbleLeftRightIcon className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Nenhuma mensagem ainda
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Mensagem Original do Usuário */}
                    <div className="flex justify-start">
                      <div className={`max-w-[70%] px-4 py-2 rounded-lg rounded-bl-none ${
                        isDark ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-900 border border-gray-200'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{thread.original.mensagem}</p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatarDataCompleta(thread.original.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Respostas do Suporte */}
                    {thread.respostas && thread.respostas.map((resposta) => (
                      <div key={resposta.id} className="flex justify-end">
                        <div className={`max-w-[70%] px-4 py-2 rounded-lg rounded-br-none ${
                          isDark 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-blue-500 text-white'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{resposta.mensagem}</p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-blue-200' : 'text-blue-100'}`}>
                            {formatarDataCompleta(resposta.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input de Resposta */}
              {thread && thread.original && (
                <div className={`px-6 py-4 border-t ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-end gap-3">
                    <textarea
                      value={respostaTexto}
                      onChange={(e) => setRespostaTexto(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleEnviarResposta();
                        }
                      }}
                      placeholder="Digite sua mensagem..."
                      rows={3}
                      className={`flex-1 px-4 py-2 rounded-lg border text-sm resize-none ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      } outline-none`}
                    />
                    <button
                      onClick={handleEnviarResposta}
                      disabled={!respostaTexto.trim() || enviandoResposta}
                      className={`p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDark
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {enviandoResposta ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <PaperAirplaneIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
