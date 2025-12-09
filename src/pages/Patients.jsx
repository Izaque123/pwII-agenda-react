import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { PatientModal } from '../components/Patients/PatientModal';
import { pacientesService } from '../services/pacientesService';
import { agendaService } from '../services/agendaService';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PhoneIcon,
  UserCircleIcon,
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export default function Patients() {
  const { isDark } = useTheme();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [activeTab, setActiveTab] = useState('buscar');
  const [statusFilter, setStatusFilter] = useState('ativo'); // 'ativo', 'inativo', 'todos'
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const navigate = useNavigate();

  // Carregar pacientes da API
  useEffect(() => {
    const loadPacientes = async () => {
      try {
        setLoading(true);
        const filters = {};
        if (statusFilter !== 'todos') {
          filters.status = statusFilter;
        }
        const pacientesData = await pacientesService.getAll(filters);
        setPacientes(pacientesData);
      } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
        setPacientes([]);
      } finally {
        setLoading(false);
      }
    };

    loadPacientes();
  }, [statusFilter]);

  // Carregar eventos da agenda para calcular última consulta
  const [agendaEvents, setAgendaEvents] = useState([]);
  useEffect(() => {
    const loadAgendaEvents = async () => {
      try {
        const eventos = await agendaService.getAll();
        setAgendaEvents(eventos);
      } catch (error) {
        console.error('Erro ao carregar eventos da agenda:', error);
        setAgendaEvents([]);
      }
    };

    loadAgendaEvents();
  }, []);

  // Função para calcular última consulta agendada ou próxima consulta
  const getUltimaConsulta = (pacienteNome) => {
    const consultas = agendaEvents
      .filter(e => {
        if (e.type !== 'consulta') return false;
        // Comparar nome do paciente (pode estar em patient ou title)
        const eventPatient = e.patient || e.title || '';
        return eventPatient.toLowerCase() === pacienteNome.toLowerCase();
      })
      .map(e => ({
        ...e,
        date: e.date instanceof Date ? e.date : new Date(e.date)
      }))
      .filter(e => !isNaN(e.date.getTime())) // Filtrar datas inválidas
      .sort((a, b) => {
        // Ordenar: primeiro as futuras (mais próximas primeiro), depois as passadas (mais recentes primeiro)
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const aDate = new Date(a.date);
        aDate.setHours(0, 0, 0, 0);
        const bDate = new Date(b.date);
        bDate.setHours(0, 0, 0, 0);
        
        const aIsFuture = aDate >= hoje;
        const bIsFuture = bDate >= hoje;
        
        if (aIsFuture && !bIsFuture) return -1; // a é futuro, b é passado
        if (!aIsFuture && bIsFuture) return 1;  // a é passado, b é futuro
        
        if (aIsFuture && bIsFuture) {
          return aDate - bDate; // Ambos futuros: mais próximo primeiro
        } else {
          return bDate - aDate; // Ambos passados: mais recente primeiro
        }
      });
    
    if (consultas.length === 0) return null;
    
    // Pegar a próxima consulta futura, ou a mais recente passada
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const proximaFutura = consultas.find(c => {
      const cDate = new Date(c.date);
      cDate.setHours(0, 0, 0, 0);
      return cDate >= hoje;
    });
    
    const consulta = proximaFutura || consultas[0];
    const dataConsulta = consulta.date;
    const dataConsultaNormalizada = new Date(dataConsulta);
    dataConsultaNormalizada.setHours(0, 0, 0, 0);
    
    const diffTime = dataConsultaNormalizada - hoje;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    let tempoAtraso = '';
    const isFuturo = diffDays > 0;
    
    if (diffDays === 0) {
      tempoAtraso = 'hoje';
    } else if (isFuturo) {
      // Consulta futura
      if (diffDays === 1) {
        tempoAtraso = 'em 1 dia';
      } else if (diffDays < 30) {
        tempoAtraso = `em ${diffDays} dias`;
      } else if (diffDays < 60) {
        tempoAtraso = `em ${Math.floor(diffDays / 30)} mês`;
      } else if (diffDays < 365) {
        const meses = Math.floor(diffDays / 30);
        tempoAtraso = `em ${meses} meses`;
      } else {
        const anos = Math.floor(diffDays / 365);
        tempoAtraso = `em aproximadamente ${anos} ${anos === 1 ? 'ano' : 'anos'}`;
      }
    } else {
      // Consulta passada
      const diasAtras = Math.abs(diffDays);
      if (diasAtras === 1) {
        tempoAtraso = '1 dia atrás';
      } else if (diasAtras < 30) {
        tempoAtraso = `${diasAtras} dias atrás`;
      } else if (diasAtras < 60) {
        tempoAtraso = `${Math.floor(diasAtras / 30)} mês atrás`;
      } else if (diasAtras < 365) {
        const meses = Math.floor(diasAtras / 30);
        tempoAtraso = `${meses} meses atrás`;
      } else {
        const anos = Math.floor(diasAtras / 365);
        tempoAtraso = `aproximadamente ${anos} ${anos === 1 ? 'ano' : 'anos'} atrás`;
      }
    }

    return {
      data: formatDate(dataConsulta),
      tempoAtraso,
      isFuturo
    };
  };

  // Filtrar pacientes baseado na busca e tab ativa
  const pacientesFiltrados = useMemo(() => {
    let filtrados = [...pacientes];

    // Filtrar por busca (se não estiver usando busca da API)
    if (busca && activeTab === 'buscar') {
      const termoBusca = busca.toLowerCase();
      filtrados = filtrados.filter(paciente => 
        paciente.nome.toLowerCase().includes(termoBusca) ||
        paciente.cpf?.includes(termoBusca) ||
        paciente.telefone?.includes(termoBusca) ||
        paciente.celular?.includes(termoBusca)
      );
    }

    // Filtrar por tab
    if (activeTab === 'aniversariantes') {
      const hoje = new Date();
      const mesAtual = hoje.getMonth();
      filtrados = filtrados.filter(paciente => {
        if (!paciente.dataNascimento) return false;
        const dataNasc = new Date(paciente.dataNascimento);
        return dataNasc.getMonth() === mesAtual;
      });
    } else if (activeTab === 'retornos') {
      // Filtrar pacientes que precisam de retorno semestral (apenas consultas passadas)
      filtrados = filtrados.filter(paciente => {
        const ultimaConsulta = getUltimaConsulta(paciente.nome);
        if (!ultimaConsulta || ultimaConsulta.isFuturo) return false; // Ignorar consultas futuras
        const dataConsulta = new Date(ultimaConsulta.data.split('/').reverse().join('-'));
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        dataConsulta.setHours(0, 0, 0, 0);
        const diffTime = hoje - dataConsulta;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 180; // 6 meses
      });
    }

    // Filtrar por status (se não estiver usando filtro da API)
    // Nota: O filtro de status já é aplicado na API, mas mantemos aqui como backup
    if (statusFilter !== 'todos' && activeTab === 'buscar') {
      filtrados = filtrados.filter(paciente => paciente.status === statusFilter);
    }

    // Ordenar por nome
    return [...filtrados].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [pacientes, busca, activeTab, statusFilter]);

  // Salvar ou atualizar paciente
  const handleSavePatient = async (pacienteData, isEditing) => {
    try {
      let savedPaciente;
      
      if (isEditing) {
        savedPaciente = await pacientesService.update(pacienteData.id, pacienteData);
        setPacientes(prev => {
          const updated = prev.map(p => p.id === savedPaciente.id ? savedPaciente : p);
          // Se o paciente foi inativado e o filtro é 'ativo', removê-lo da lista
          if (savedPaciente.status === 'inativo' && statusFilter === 'ativo') {
            return updated.filter(p => p.id !== savedPaciente.id);
          }
          // Se o paciente foi ativado e o filtro é 'inativo', removê-lo da lista
          if (savedPaciente.status === 'ativo' && statusFilter === 'inativo') {
            return updated.filter(p => p.id !== savedPaciente.id);
          }
          return updated;
        });
      } else {
        savedPaciente = await pacientesService.create(pacienteData);
        // Só adicionar se o status corresponder ao filtro ou se o filtro for 'todos'
        if (statusFilter === 'todos' || savedPaciente.status === statusFilter) {
          setPacientes(prev => [...prev, savedPaciente]);
        }
      }
      
      setEditingPatient(null);
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
      alert('Erro ao salvar paciente. Tente novamente.');
    }
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowPatientModal(false);
    setEditingPatient(null);
  };

  const handleViewFDI = (paciente) => {
    sessionStorage.setItem('pacienteSelecionado', JSON.stringify(paciente));
    navigate('/fdi-viewer');
  };

  // Editar paciente
  const handleEditPatient = (paciente) => {
    setEditingPatient(paciente);
    setShowPatientModal(true);
  };

  // Inativar paciente
  const handleDeletePatient = (paciente) => {
    setPatientToDelete(paciente);
  };

  // Reativar paciente
  const handleReactivatePatient = async (paciente) => {
    try {
      const pacienteReativado = await pacientesService.update(paciente.id, { status: 'ativo' });
      // Atualizar o paciente na lista
      setPacientes(prev => {
        const updated = prev.map(p => p.id === pacienteReativado.id ? pacienteReativado : p);
        // Se o filtro é 'inativo', remover o paciente reativado da lista
        if (statusFilter === 'inativo') {
          return updated.filter(p => p.id !== pacienteReativado.id);
        }
        return updated;
      });
    } catch (error) {
      console.error('Erro ao reativar paciente:', error);
      alert('Erro ao reativar paciente. Tente novamente.');
    }
  };

  const confirmDelete = async () => {
    if (patientToDelete) {
      try {
        const pacienteInativado = await pacientesService.delete(patientToDelete.id);
        // Atualizar o paciente na lista (agora está inativo)
        setPacientes(prev => {
          const updated = prev.map(p => p.id === pacienteInativado.id ? pacienteInativado : p);
          // Se o filtro é 'ativo', remover o paciente inativado da lista
          if (statusFilter === 'ativo') {
            return updated.filter(p => p.id !== pacienteInativado.id);
          }
          return updated;
        });
        setPatientToDelete(null);
      } catch (error) {
        console.error('Erro ao inativar paciente:', error);
        alert('Erro ao deletar paciente. Tente novamente.');
      }
    }
  };

  const cancelDelete = () => {
    setPatientToDelete(null);
  };

  // Ações rápidas
  const handleCall = (telefone) => {
    if (telefone) {
      const numeroLimpo = telefone.replace(/\D/g, '');
      window.open(`tel:${numeroLimpo}`, '_self');
    }
  };

  const handleWhatsApp = (telefone) => {
    if (telefone) {
      const numeroLimpo = telefone.replace(/\D/g, '');
      window.open(`https://wa.me/55${numeroLimpo}`, '_blank');
    }
  };

  // Calcular idade
  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nasc = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const mes = hoje.getMonth() - nasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return idade;
  };

  // Formatar data de nascimento
  const formatarDataNascimento = (dataNascimento) => {
    if (!dataNascimento) return null;
    const data = new Date(dataNascimento);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Pacientes
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {activeTab === 'buscar' && !busca}
            </p>
          </div>
          <button 
            onClick={() => {
              setEditingPatient(null);
              setShowPatientModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-colors font-medium"
          >
            <PlusIcon className="w-5 h-5" />
            Cadastrar paciente
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-1 border-b" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
            <button
              onClick={() => setActiveTab('buscar')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'buscar'
                  ? isDark 
                    ? 'text-blue-400' 
                    : 'text-blue-600'
                  : isDark 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Buscar
              {activeTab === 'buscar' && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`} />
              )}
            </button>
            <button
              onClick={() => setActiveTab('aniversariantes')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'aniversariantes'
                  ? isDark 
                    ? 'text-blue-400' 
                    : 'text-blue-600'
                  : isDark 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Aniversariantes
              {activeTab === 'aniversariantes' && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`} />
              )}
            </button>
            <button
              onClick={() => setActiveTab('retornos')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'retornos'
                  ? isDark 
                    ? 'text-blue-400' 
                    : 'text-blue-600'
                  : isDark 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Retornos semestrais
              {activeTab === 'retornos' && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`} />
              )}
            </button>
          </div>
        </div>

        {/* Campo de Busca e Filtro de Status */}
        {activeTab === 'buscar' && (
          <div className="mb-6 space-y-4">
            <div className="relative">
              <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Digite o nome ou CPF do paciente"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border text-sm transition-all ${
                  isDark 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                } outline-none`}
              />
            </div>
            
            {/* Filtro de Status */}
            <div className="flex items-center gap-3">
              <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Status:
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter('ativo')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'ativo'
                      ? 'bg-blue-500 text-white'
                      : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Ativos
                </button>
                <button
                  onClick={() => setStatusFilter('inativo')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'inativo'
                      ? 'bg-blue-500 text-white'
                      : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Inativos
                </button>
                <button
                  onClick={() => setStatusFilter('todos')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'todos'
                      ? 'bg-blue-500 text-white'
                      : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Todos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Pacientes */}
        <div className={`rounded-lg border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {pacientesFiltrados.length === 0 ? (
            <div className={`p-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <UserCircleIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">
                {activeTab === 'aniversariantes' 
                  ? 'Nenhum aniversariante este mês'
                  : activeTab === 'retornos'
                  ? 'Nenhum paciente com retorno semestral pendente'
                  : busca
                  ? 'Nenhum paciente encontrado'
                  : 'Nenhum paciente cadastrado'}
              </p>
            </div>
          ) : (
            <>
              {/* Cabeçalho da tabela (desktop) */}
              <div className={`hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 border-b ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="col-span-4">
                  <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Nome
                  </span>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    CPF
                  </span>
                </div>
                <div className="col-span-3">
                  <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Telefone
                  </span>
                </div>
                <div className="col-span-3">
                  <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Ações
                  </span>
                </div>
              </div>

              {/* Lista de pacientes */}
              <div className="divide-y" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                {pacientesFiltrados.map((paciente) => {
                  const ultimaConsulta = getUltimaConsulta(paciente.nome);
                  const telefone = paciente.telefone || paciente.celular;
                  const idade = calcularIdade(paciente.dataNascimento);
                  const dataNascFormatada = formatarDataNascimento(paciente.dataNascimento);
                  
                  return (
                    <div
                      key={paciente.id}
                      className={`px-4 md:px-6 py-4 hover:bg-opacity-50 transition-colors group ${
                        isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        {/* Nome e Avatar */}
                        <div className="col-span-1 md:col-span-4 flex items-center gap-4">
                          {/* Avatar */}
                          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${
                            paciente.foto 
                              ? 'bg-cover bg-center' 
                              : 'bg-blue-500'
                          }`} style={paciente.foto ? { backgroundImage: `url(${paciente.foto})` } : {}}>
                            {!paciente.foto && (paciente.nome?.charAt(0)?.toUpperCase() || 'P')}
                          </div>

                          {/* Nome e Informações */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {paciente.nome}
                              </div>
                              {idade && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                  {idade} anos
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              {dataNascFormatada && (
                                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                  Nasc: {dataNascFormatada}
                                </div>
                              )}
                              {ultimaConsulta && (
                                <div className={`text-sm flex items-center gap-1 ${ultimaConsulta.isFuturo ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>
                                  <CalendarDaysIcon className="w-3.5 h-3.5" />
                                  {ultimaConsulta.isFuturo 
                                    ? `Próxima: ${ultimaConsulta.data} (${ultimaConsulta.tempoAtraso})`
                                    : `Última: ${ultimaConsulta.data} (${ultimaConsulta.tempoAtraso})`
                                  }
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* CPF */}
                        <div className={`col-span-1 md:col-span-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} ${
                          !paciente.cpf ? 'opacity-50' : ''
                        }`}>
                          <span className="md:hidden font-medium mr-2">CPF:</span>
                          {paciente.cpf || '-'}
                        </div>

                        {/* Telefone com ações rápidas */}
                        <div className={`col-span-1 md:col-span-3 flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} ${
                          !telefone ? 'opacity-50' : ''
                        }`}>
                          {telefone ? (
                            <div className="flex items-center gap-2">
                              <PhoneIcon className="w-4 h-4 flex-shrink-0" />
                              <span>{telefone}</span>
                              <div className="flex items-center gap-1 ml-2">
                                <button
                                  onClick={() => handleCall(telefone)}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    isDark 
                                      ? 'hover:bg-gray-600 text-gray-400 hover:text-green-400' 
                                      : 'hover:bg-gray-100 text-gray-500 hover:text-green-600'
                                  }`}
                                  title="Ligar"
                                >
                                  <PhoneIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleWhatsApp(telefone)}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    isDark 
                                      ? 'hover:bg-gray-600 text-gray-400 hover:text-green-400' 
                                      : 'hover:bg-gray-100 text-gray-500 hover:text-green-600'
                                  }`}
                                  title="WhatsApp"
                                >
                                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <PhoneIcon className="w-4 h-4 flex-shrink-0 opacity-30" />
                              <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>-</span>
                            </>
                          )}
                        </div>

                        {/* Ações */}
                        <div className="col-span-1 md:col-span-3 flex items-center justify-end gap-2 flex-wrap">
                          <button
                            onClick={() => handleEditPatient(paciente)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              isDark 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                            title="Editar paciente"
                          >
                            <PencilIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Editar</span>
                          </button>
                          
                          {paciente.foto && (
                            <button
                              onClick={() => handleViewFDI(paciente)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                isDark 
                                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                              }`}
                              title="Ver FDI"
                            >
                              <CalendarDaysIcon className="w-4 h-4" />
                              <span className="hidden sm:inline">FDI</span>
                            </button>
                          )}
                          
                          {paciente.status === 'inativo' ? (
                            <button
                              onClick={() => handleReactivatePatient(paciente)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                isDark 
                                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                              title="Reativar paciente"
                            >
                              <ArrowPathIcon className="w-4 h-4" />
                              <span className="hidden sm:inline">Reativar</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeletePatient(paciente)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                isDark 
                                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                                  : 'bg-red-500 hover:bg-red-600 text-white'
                              }`}
                              title="Inativar paciente"
                            >
                              <TrashIcon className="w-4 h-4" />
                              <span className="hidden sm:inline">Inativar</span>
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
      </div>

      {/* Modal de Cadastro/Edição de Paciente */}
      <PatientModal
        isOpen={showPatientModal}
        onClose={handleCloseModal}
        onSave={handleSavePatient}
        editingPatient={editingPatient}
      />

      {/* Modal de Confirmação de Exclusão */}
      {patientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40"
            onClick={cancelDelete}
          />
          <div className={`relative max-w-md w-full rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Confirmar inativação
              </h3>
              <button
                onClick={cancelDelete}
                className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Tem certeza que deseja inativar o paciente <strong>{patientToDelete.nome}</strong>? O paciente não aparecerá mais na lista de pacientes ativos, mas poderá ser reativado posteriormente.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  isDark 
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Inativar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
