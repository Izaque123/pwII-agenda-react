import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { retornosService } from '../../services/retornosService';
import {
  XMarkIcon,
  PrinterIcon,
  CalendarIcon,
  TrashIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

export const ReturnsCenter = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const [retornos, setRetornos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataFiltro, setDataFiltro] = useState(() => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  });

  // Carregar retornos da API
  useEffect(() => {
    if (isOpen) {
      loadRetornos();
    }
  }, [isOpen, dataFiltro]);

  const loadRetornos = async () => {
    try {
      setLoading(true);
      const dados = await retornosService.getAll({ dataMinima: dataFiltro });
      setRetornos(dados);
    } catch (error) {
      console.error('Erro ao carregar retornos:', error);
      setRetornos([]);
    } finally {
      setLoading(false);
    }
  };

  // Os retornos já vêm filtrados da API, apenas ordenar
  const retornosFiltrados = useMemo(() => {
    return [...retornos].sort((a, b) => {
      // Parsear datas no formato YYYY-MM-DD sem problemas de timezone
      const parseDate = (dateStr) => {
        if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
          const [year, month, day] = dateStr.split('-').map(Number);
          return new Date(year, month - 1, day);
        }
        return new Date(dateStr);
      };
      
      const dataA = parseDate(a.dataRetorno);
      const dataB = parseDate(b.dataRetorno);
      return dataA - dataB;
    });
  }, [retornos]);

  // Calcular dias até o retorno (sempre no frontend para usar timezone do cliente)
  const calcularDiasAteRetorno = (dataRetorno) => {
    // Obter data de hoje no timezone local do navegador
    const agora = new Date();
    const hojeYear = agora.getFullYear();
    const hojeMonth = agora.getMonth();
    const hojeDay = agora.getDate();
    const hojeLocal = new Date(hojeYear, hojeMonth, hojeDay, 0, 0, 0, 0);
    
    // Parsear data de retorno no formato YYYY-MM-DD
    let data;
    if (typeof dataRetorno === 'string' && dataRetorno.match(/^\d{4}-\d{2}-\d{2}/)) {
      const [year, month, day] = dataRetorno.split('-').map(Number);
      data = new Date(year, month - 1, day, 0, 0, 0, 0);
    } else {
      // Fallback: parsear e normalizar
      const temp = new Date(dataRetorno);
      const year = temp.getFullYear();
      const month = temp.getMonth();
      const day = temp.getDate();
      data = new Date(year, month, day, 0, 0, 0, 0);
    }
    
    // Calcular diferença em milissegundos e converter para dias
    const diffTime = data.getTime() - hojeLocal.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Formatar data (evitar problemas de timezone)
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    
    // Se for string no formato YYYY-MM-DD, parsear manualmente para evitar problemas de timezone
    if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    }
    
    // Fallback para outras formatos
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Deletar retorno
  const handleDeleteRetorno = async (retornoId) => {
    if (!window.confirm('Deseja realmente remover este retorno?')) {
      return;
    }

    try {
      await retornosService.delete(retornoId);
      // Recarregar retornos após deletar
      await loadRetornos();
    } catch (error) {
      console.error('Erro ao deletar retorno:', error);
      alert('Erro ao remover retorno. Tente novamente.');
    }
  };

  // Agendar retorno
  const handleAgendar = (retorno) => {
    // Aqui você pode abrir o modal de agendamento com os dados pré-preenchidos
    // Por enquanto, apenas fecha o modal
    onClose();
  };

  // Converter data para formato brasileiro para input
  const formatDateForInput = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative max-w-6xl w-full rounded-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-5 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Central de retornos
          </h2>
          <div className="flex items-center gap-3">
            {/* Filtro de data */}
            <div className="flex items-center gap-2">
              <CalendarIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Retornos a partir de
              </span>
              <input
                type="date"
                value={dataFiltro}
                onChange={(e) => setDataFiltro(e.target.value)}
                className={`px-3 py-1.5 rounded-lg border text-sm ${
                  isDark 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              />
            </div>
            <button
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}
            >
              <PrinterIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className={`p-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <p className="text-sm">Carregando retornos...</p>
            </div>
          ) : retornosFiltrados.length === 0 ? (
            <div className={`p-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <p className="text-sm">Nenhum retorno encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Cabeçalho da tabela */}
              <div className={`hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <div className="col-span-3">
                  <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Paciente
                  </span>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Última consulta
                  </span>
                </div>
                <div className="col-span-3">
                  <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Motivo
                  </span>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Retorno previsto
                  </span>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Ações
                  </span>
                </div>
              </div>

              {/* Lista de retornos */}
              <div className="space-y-2">
                {retornosFiltrados.map((retorno) => {
                  // SEMPRE recalcular no frontend para usar o timezone do cliente
                  const diasAteRetorno = calcularDiasAteRetorno(retorno.dataRetorno);
                  
                  return (
                    <div
                      key={retorno.id}
                      className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-4 py-4 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      {/* Paciente */}
                      <div className="col-span-1 md:col-span-3 flex items-center gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          retorno.foto 
                            ? 'bg-cover bg-center' 
                            : 'bg-blue-500'
                        }`} style={retorno.foto ? { backgroundImage: `url(${retorno.foto})` } : {}}>
                          {!retorno.foto && (retorno.paciente?.charAt(0)?.toUpperCase() || 'P')}
                        </div>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {retorno.paciente}
                        </span>
                      </div>

                      {/* Última consulta */}
                      <div className={`col-span-1 md:col-span-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div>{formatDate(retorno.dataUltimaConsulta)}</div>
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {retorno.dentista}
                        </div>
                      </div>

                      {/* Motivo */}
                      <div className={`col-span-1 md:col-span-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {retorno.motivo || '-'}
                      </div>

                      {/* Retorno previsto */}
                      <div className="col-span-1 md:col-span-2">
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {formatDate(retorno.dataRetorno)}
                        </div>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isDark 
                              ? 'bg-blue-900/40 text-blue-300' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            Daqui {diasAteRetorno} {diasAteRetorno === 1 ? 'dia' : 'dias'}
                          </span>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteRetorno(retorno.id)}
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-500'}`}
                          title="Excluir retorno"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                        <button
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-green-400' : 'hover:bg-gray-100 text-green-500'}`}
                          title="Enviar WhatsApp"
                        >
                          <PhoneIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleAgendar(retorno)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            isDark 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          Agendar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

