import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { pacientesService } from '../../services/pacientesService';
import {
  XMarkIcon,
  ClockIcon,
  PlusIcon,
  ChevronDownIcon,
  TrashIcon,
  CheckIcon,
  UserCircleIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

export const EventModal = ({ isOpen, onClose, onSave, onDelete, selectedDate, selectedHour, professionals, editingEvent }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  // Verificar se o usuário logado é um profissional
  const isProfissional = user?.tipo === 'profissional';
  const profissionalNome = isProfissional ? (user?.nome || user?.name) : null;
  const [activeTab, setActiveTab] = useState('consulta');
  const [pacientes, setPacientes] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPacienteIndex, setSelectedPacienteIndex] = useState(-1);
  const pacienteInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  const isEditing = !!editingEvent;

  // Form de Consulta
  const [consultaForm, setConsultaForm] = useState({
    dentista: isProfissional ? profissionalNome : (professionals[0]?.name || ''),
    paciente: '',
    data: '',
    horario: '07:45',
    duracao: '30',
    observacoes: '',
    enviarConfirmacao: true,
    retornoEm: '',
    motivoRetorno: '',
    etiqueta: '',
  });

  // Form de Compromisso
  const [compromissoForm, setCompromissoForm] = useState({
    dentista: isProfissional ? profissionalNome : (professionals[0]?.name || ''),
    titulo: '',
    dataInicio: '',
    horaInicio: '07:45',
    dataTermino: '',
    horaTermino: '08:00',
    repetir: false,
  });

  const formatDateForInput = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Carregar pacientes da API (apenas ativos)
  useEffect(() => {
    const loadPacientes = async () => {
      try {
        // Filtrar apenas pacientes ativos para a agenda
        const dados = await pacientesService.getAll({ status: 'ativo' });
        setPacientes(dados);
      } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
        setPacientes([]);
      }
    };

    if (isOpen) {
      loadPacientes();
    }
  }, [isOpen]);

  // Atualizar dentista quando a lista de profissionais mudar (apenas se o dentista atual não existir)
  // Se for profissional, sempre usar o nome dele
  useEffect(() => {
    if (isProfissional && profissionalNome) {
      // Se for profissional, forçar o dentista a ser ele mesmo
      setConsultaForm(prev => ({ ...prev, dentista: profissionalNome }));
      setCompromissoForm(prev => ({ ...prev, dentista: profissionalNome }));
    } else if (professionals && professionals.length > 0 && isOpen) {
      const firstProfessional = professionals[0].name;
      
      // Verificar e atualizar o formulário de consulta
      setConsultaForm(prev => {
        const currentDentista = prev.dentista;
        const dentistaExists = currentDentista && professionals.some(p => p.name === currentDentista);
        if (!dentistaExists) {
          return { ...prev, dentista: firstProfessional };
        }
        return prev;
      });
      
      // Verificar e atualizar o formulário de compromisso
      setCompromissoForm(prev => {
        const currentDentista = prev.dentista;
        const dentistaExists = currentDentista && professionals.some(p => p.name === currentDentista);
        if (!dentistaExists) {
          return { ...prev, dentista: firstProfessional };
        }
        return prev;
      });
    }
  }, [professionals, isOpen, isProfissional, profissionalNome]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showSuggestions &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        pacienteInputRef.current &&
        !pacienteInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSuggestions]);

  // Filtrar pacientes baseado na busca
  const pacientesFiltrados = pacientes.filter(paciente => {
    if (!consultaForm.paciente.trim()) return false;
    const termo = consultaForm.paciente.toLowerCase();
    return (
      paciente.nome?.toLowerCase().includes(termo) ||
      paciente.cpf?.includes(termo) ||
      paciente.telefone?.toLowerCase().includes(termo) ||
      paciente.celular?.toLowerCase().includes(termo)
    );
  }).slice(0, 5); // Limitar a 5 sugestões

  useEffect(() => {
    if (isOpen) {
      if (editingEvent) {
        const dateStr = formatDateForInput(editingEvent.date);
        if (editingEvent.type === 'consulta') {
          setActiveTab('consulta');
          setConsultaForm({
            dentista: isProfissional ? profissionalNome : (editingEvent.dentista || professionals[0]?.name || ''),
            paciente: editingEvent.patient || editingEvent.title || '',
            data: dateStr,
            horario: editingEvent.start,
            duracao: calculateDuration(editingEvent.start, editingEvent.end),
            observacoes: editingEvent.observacoes || '',
            enviarConfirmacao: editingEvent.enviarConfirmacao ?? true,
            retornoEm: editingEvent.retornoEm || '',
            motivoRetorno: editingEvent.motivoRetorno || '',
            etiqueta: editingEvent.status || editingEvent.etiqueta || '',
          });
          
          // Se for profissional e o evento não for dele, não permitir edição
          if (isProfissional && profissionalNome && editingEvent.dentista !== profissionalNome) {
            // Não permitir edição de eventos de outros profissionais
            // O backend também vai validar isso
          }
        } else {
          setActiveTab('compromisso');
          setCompromissoForm({
            dentista: isProfissional ? profissionalNome : (editingEvent.dentista || professionals[0]?.name || ''),
            titulo: editingEvent.title || '',
            dataInicio: dateStr,
            horaInicio: editingEvent.start,
            dataTermino: dateStr,
            horaTermino: editingEvent.end,
            repetir: false,
          });
        }
      } else {
        // Novo evento - resetar formulários
        const dateStr = selectedDate ? formatDateForInput(selectedDate) : '';
        const startHour = selectedHour || '07:45';
        // Calcular hora de término (1 hora depois)
        const [h, m] = startHour.split(':').map(Number);
        const endHour = `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        
        setActiveTab('consulta');
        setConsultaForm({
          dentista: isProfissional ? profissionalNome : (professionals[0]?.name || ''),
          paciente: '',
          data: dateStr,
          horario: startHour,
          duracao: '30',
          observacoes: '',
          enviarConfirmacao: true,
          retornoEm: '',
          motivoRetorno: '',
          etiqueta: '',
        });
        setCompromissoForm({
          dentista: isProfissional ? profissionalNome : (professionals[0]?.name || ''),
          titulo: '',
          dataInicio: dateStr,
          horaInicio: startHour,
          dataTermino: dateStr,
          horaTermino: endHour,
          repetir: false,
        });
      }
    }
  }, [isOpen, selectedDate, selectedHour, editingEvent, professionals]);

  const calculateDuration = (start, end) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    return String((endH * 60 + endM) - (startH * 60 + startM));
  };

  // Selecionar paciente do autocomplete
  const handleSelectPaciente = (paciente) => {
    setConsultaForm({ ...consultaForm, paciente: paciente.nome });
    setShowSuggestions(false);
    setSelectedPacienteIndex(-1);
  };

  const parseInputDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const getColorByEtiqueta = (etiqueta) => {
    const colors = {
      'agendado': 'bg-blue-50 border-l-4 border-l-blue-300 border-y border-r border-blue-100 text-blue-700 dark:bg-blue-100 dark:border-l-blue-400 dark:border-blue-200 dark:text-blue-800',
      'confirmado': 'bg-green-50 border-l-4 border-l-green-400 border-y border-r border-green-200 text-green-800 dark:bg-green-200 dark:border-l-green-500 dark:border-green-300 dark:text-green-900',
      'em_atendimento': 'bg-purple-50 border-l-4 border-l-purple-400 border-y border-r border-purple-200 text-purple-800 dark:bg-purple-200 dark:border-l-purple-500 dark:border-purple-300 dark:text-purple-900',
      'concluido': 'bg-gray-50 border-l-4 border-l-gray-400 border-y border-r border-gray-200 text-gray-800 dark:bg-gray-200 dark:border-l-gray-500 dark:border-gray-300 dark:text-gray-900',
      'cancelado': 'bg-red-50 border-l-4 border-l-red-400 border-y border-r border-red-200 text-red-800 dark:bg-red-200 dark:border-l-red-500 dark:border-red-300 dark:text-red-900',
      'falta': 'bg-orange-50 border-l-4 border-l-orange-400 border-y border-r border-orange-200 text-orange-800 dark:bg-orange-200 dark:border-l-orange-500 dark:border-orange-300 dark:text-orange-900',
      'retorno': 'bg-blue-50 border-l-4 border-l-blue-300 border-y border-r border-blue-100 text-blue-700 dark:bg-blue-100 dark:border-l-blue-400 dark:border-blue-200 dark:text-blue-800',
      'primeira': 'bg-emerald-50 border-l-4 border-l-emerald-400 border-y border-r border-emerald-200 text-emerald-800 dark:bg-emerald-200 dark:border-l-emerald-500 dark:border-emerald-300 dark:text-emerald-900',
    };
    // Sem etiqueta - cor cinza/neutra
    return colors[etiqueta] || 'bg-gray-50 border-l-4 border-l-gray-400 border-y border-r border-gray-200 text-gray-800 dark:bg-gray-200 dark:border-l-gray-500 dark:border-gray-300 dark:text-gray-900';
  };

  const handleSaveConsulta = () => {
    const status = consultaForm.etiqueta || 'agendado';
    
    // Converter data de DD/MM/AAAA para Date object
    const dateObj = parseInputDate(consultaForm.data);
    
    const eventData = {
      id: isEditing ? editingEvent.id : Date.now(),
      title: consultaForm.paciente || 'Consulta',
      patient: consultaForm.paciente,
      start: consultaForm.horario,
      end: calculateEndTime(consultaForm.horario, parseInt(consultaForm.duracao)),
      date: dateObj,
      type: 'consulta',
      color: getColorByEtiqueta(status),
      etiqueta: consultaForm.etiqueta,
      status: status, // Salvar status também
      dentista: consultaForm.dentista || null,
      observacoes: consultaForm.observacoes,
      enviarConfirmacao: consultaForm.enviarConfirmacao,
      retornoEm: consultaForm.retornoEm || null,
      motivoRetorno: consultaForm.motivoRetorno || null,
    };
    
    console.log('Dados do evento sendo enviados:', {
      dentista: eventData.dentista,
      date: eventData.date,
      dateString: eventData.date instanceof Date ? `${eventData.date.getFullYear()}-${String(eventData.date.getMonth() + 1).padStart(2, '0')}-${String(eventData.date.getDate()).padStart(2, '0')}` : eventData.date,
      retornoEm: eventData.retornoEm,
      motivoRetorno: eventData.motivoRetorno
    });
    
    onSave(eventData, isEditing);
    resetForms();
    onClose();
  };

  const handleSaveCompromisso = () => {
    const eventData = {
      id: isEditing ? editingEvent.id : Date.now(),
      title: compromissoForm.titulo || 'Compromisso',
      start: compromissoForm.horaInicio,
      end: compromissoForm.horaTermino,
      date: parseInputDate(compromissoForm.dataInicio),
      type: 'compromisso',
      color: 'event-striped border-gray-300 text-gray-700',
      dentista: compromissoForm.dentista,
    };
    onSave(eventData, isEditing);
    resetForms();
    onClose();
  };

  const handleDelete = () => {
    if (editingEvent && onDelete) {
      onDelete(editingEvent.id);
      resetForms();
      onClose();
    }
  };

  const calculateEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const resetForms = () => {
    setConsultaForm({
      dentista: professionals[0]?.name || '',
      paciente: '',
      data: '',
      horario: '07:45',
      duracao: '30',
      observacoes: '',
      enviarConfirmacao: true,
      retornoEm: '',
      motivoRetorno: '',
      etiqueta: '',
    });
    setCompromissoForm({
      dentista: professionals[0]?.name || '',
      titulo: '',
      dataInicio: '',
      horaInicio: '07:45',
      dataTermino: '',
      horaTermino: '08:00',
      repetir: false,
    });
    setActiveTab('consulta');
    setShowSuggestions(false);
    setSelectedPacienteIndex(-1);
  };

  if (!isOpen) return null;

  const inputClass = `w-full px-3 py-2.5 rounded-lg border text-sm transition-all ${
    isDark 
      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
  } outline-none`;

  const selectClass = `w-full px-3 py-2.5 rounded-lg border text-sm appearance-none cursor-pointer transition-all ${
    isDark 
      ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
      : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
  } outline-none`;

  const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative max-w-3xl rounded-2xl shadow-xl ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header com Tabs */}
        <div className="flex items-center justify-between px-6 pt-5">
          <div className="flex">
            <button
              onClick={() => setActiveTab('consulta')}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'consulta'
                  ? isDark 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-100 text-gray-900'
                  : isDark 
                    ? 'text-gray-400 hover:text-gray-200' 
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Agendar consulta
            </button>
            <button
              onClick={() => setActiveTab('compromisso')}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'compromisso'
                  ? isDark 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-100 text-gray-900'
                  : isDark 
                    ? 'text-gray-400 hover:text-gray-200' 
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Compromisso
            </button>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[95vh] overflow-y-auto">
          {activeTab === 'consulta' ? (
            /* Form Consulta */
            <div className="space-y-4">
              {/* Dentista */}
              <div>
                <label className={labelClass}>Dentista</label>
                <div className="relative">
                  {isProfissional ? (
                    <input
                      type="text"
                      value={consultaForm.dentista}
                      disabled
                      className={`${selectClass} bg-gray-100 dark:bg-gray-200 cursor-not-allowed`}
                    />
                  ) : (
                    <select
                      value={consultaForm.dentista}
                      onChange={(e) => setConsultaForm({ ...consultaForm, dentista: e.target.value })}
                      className={selectClass}
                    >
                      {professionals.map((prof) => (
                        <option key={prof.id} value={prof.name}>{prof.name}</option>
                      ))}
                    </select>
                  )}
                  {!isProfissional && (
                    <ChevronDownIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  )}
                </div>
              </div>

              {/* Paciente */}
              <div className="relative">
                <label className={labelClass}>Paciente</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      ref={pacienteInputRef}
                      type="text"
                      value={consultaForm.paciente}
                      onChange={(e) => {
                        setConsultaForm({ ...consultaForm, paciente: e.target.value });
                        setShowSuggestions(true);
                        setSelectedPacienteIndex(-1);
                      }}
                      onFocus={() => {
                        if (pacientesFiltrados.length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                      onBlur={(e) => {
                        // Delay para permitir clique na sugestão
                        setTimeout(() => {
                          const activeElement = document.activeElement;
                          if (!suggestionsRef.current?.contains(activeElement) && activeElement !== pacienteInputRef.current) {
                            setShowSuggestions(false);
                          }
                        }, 200);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setSelectedPacienteIndex(prev => 
                            prev < pacientesFiltrados.length - 1 ? prev + 1 : prev
                          );
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setSelectedPacienteIndex(prev => prev > 0 ? prev - 1 : -1);
                        } else if (e.key === 'Enter' && selectedPacienteIndex >= 0) {
                          e.preventDefault();
                          handleSelectPaciente(pacientesFiltrados[selectedPacienteIndex]);
                        } else if (e.key === 'Escape') {
                          setShowSuggestions(false);
                        }
                      }}
                      placeholder="Busque por nome, telefone, CPF ou cadastre um novo paciente"
                      className={`${inputClass} flex-1`}
                    />
                    
                    {/* Dropdown de sugestões */}
                    {showSuggestions && pacientesFiltrados.length > 0 && consultaForm.paciente.trim() && (
                      <div
                        ref={suggestionsRef}
                        className={`absolute z-50 w-full mt-1 rounded-lg border shadow-lg overflow-hidden ${
                          isDark 
                            ? 'bg-gray-800 border-gray-700' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        {pacientesFiltrados.map((paciente, index) => (
                          <button
                            key={paciente.id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault(); // Prevenir blur do input
                              handleSelectPaciente(paciente);
                            }}
                            onMouseEnter={() => setSelectedPacienteIndex(index)}
                            className={`w-full text-left px-4 py-3 hover:bg-opacity-50 transition-colors ${
                              index === selectedPacienteIndex
                                ? isDark ? 'bg-blue-900/50' : 'bg-blue-50'
                                : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                                paciente.foto 
                                  ? 'bg-cover bg-center' 
                                  : 'bg-blue-500'
                              }`} style={paciente.foto ? { backgroundImage: `url(${paciente.foto})` } : {}}>
                                {!paciente.foto && (paciente.nome?.charAt(0)?.toUpperCase() || 'P')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {paciente.nome}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  {paciente.cpf && (
                                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                      CPF: {paciente.cpf}
                                    </span>
                                  )}
                                  {(paciente.telefone || paciente.celular) && (
                                    <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                      <PhoneIcon className="w-3 h-3" />
                                      {paciente.telefone || paciente.celular}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    type="button"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors ${
                      isDark 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <PlusIcon className="w-4 h-4" />
                    Cadastrar
                    <ChevronDownIcon className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Data, Horário, Duração */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className={labelClass}>Data da consulta</label>
                  <input
                    type="text"
                    value={consultaForm.data}
                    onChange={(e) => setConsultaForm({ ...consultaForm, data: e.target.value })}
                    placeholder="DD/MM/AAAA"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Horário</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={consultaForm.horario}
                      onChange={(e) => setConsultaForm({ ...consultaForm, horario: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Duração</label>
                  <input
                    type="number"
                    value={consultaForm.duracao}
                    onChange={(e) => setConsultaForm({ ...consultaForm, duracao: e.target.value })}
                    placeholder="30"
                    className={inputClass}
                  />
                </div>
                <div className="flex items-end">
                  <button className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium">
                    <ClockIcon className="w-4 h-4" />
                    Encontrar horário
                  </button>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className={labelClass}>Observações</label>
                <textarea
                  value={consultaForm.observacoes}
                  onChange={(e) => setConsultaForm({ ...consultaForm, observacoes: e.target.value })}
                  placeholder="Adicione observações sobre esta consulta"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Enviar confirmação e Retorno */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Enviar mensagem de confirmação?</label>
                  <div className="flex gap-4 mt-1">
                    <label 
                      onClick={() => setConsultaForm({ ...consultaForm, enviarConfirmacao: true })}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        consultaForm.enviarConfirmacao 
                          ? 'border-blue-500 bg-blue-500' 
                          : isDark ? 'border-gray-600' : 'border-gray-300'
                      }`}>
                        {consultaForm.enviarConfirmacao && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Sim</span>
                    </label>
                    <label 
                      onClick={() => setConsultaForm({ ...consultaForm, enviarConfirmacao: false })}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          !consultaForm.enviarConfirmacao 
                            ? 'border-blue-500 bg-blue-500' 
                            : isDark ? 'border-gray-600' : 'border-gray-300'
                        }`}
                      >
                        {!consultaForm.enviarConfirmacao && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Não
                      </span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Retornar em</label>
                  <div className="relative">
                    <select
                      value={consultaForm.retornoEm}
                      onChange={(e) => setConsultaForm({ ...consultaForm, retornoEm: e.target.value })}
                      className={selectClass}
                    >
                      <option value="">Sem retorno</option>
                      <option value="7">7 dias</option>
                      <option value="15">15 dias</option>
                      <option value="30">30 dias</option>
                      <option value="60">60 dias</option>
                      <option value="90">90 dias</option>
                    </select>
                    <ChevronDownIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                </div>
              </div>

              {/* Motivo do Retorno - aparece apenas se retornoEm estiver preenchido */}
              {consultaForm.retornoEm && (
                <div>
                  <label className={labelClass}>Motivo do retorno</label>
                  <input
                    type="text"
                    value={consultaForm.motivoRetorno}
                    onChange={(e) => setConsultaForm({ ...consultaForm, motivoRetorno: e.target.value })}
                    placeholder="Ex: Limpeza, Verificar pontos, Negociar tratamento..."
                    className={inputClass}
                  />
                </div>
              )}

              {/* Etiqueta/Status */}
              <div>
                <label className={labelClass}>Status</label>
                <div className="relative">
                  <select
                    value={consultaForm.etiqueta}
                    onChange={(e) => setConsultaForm({ ...consultaForm, etiqueta: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">Sem etiqueta</option>
                    <option value="agendado">Agendado</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="em_atendimento">Paciente em atendimento</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                    <option value="falta">Falta</option>
                  </select>
                  <ChevronDownIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
              </div>
            </div>
          ) : (
            /* Form Compromisso */
            <div className="space-y-4">
              {/* Dentista */}
              <div>
                <label className={labelClass}>Dentista</label>
                <div className="relative">
                  {isProfissional ? (
                    <input
                      type="text"
                      value={compromissoForm.dentista}
                      disabled
                      className={`${selectClass} bg-gray-100 dark:bg-gray-700 cursor-not-allowed`}
                    />
                  ) : (
                    <select
                      value={compromissoForm.dentista}
                      onChange={(e) => setCompromissoForm({ ...compromissoForm, dentista: e.target.value })}
                      className={selectClass}
                    >
                      {professionals.map((prof) => (
                        <option key={prof.id} value={prof.name}>{prof.name}</option>
                      ))}
                    </select>
                  )}
                  {!isProfissional && (
                    <ChevronDownIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  )}
                </div>
                {isProfissional && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Você só pode criar eventos para si mesmo
                  </p>
                )}
              </div>

              {/* Título */}
              <div>
                <label className={labelClass}>Título</label>
                <input
                  type="text"
                  value={compromissoForm.titulo}
                  onChange={(e) => setCompromissoForm({ ...compromissoForm, titulo: e.target.value })}
                  placeholder="Dê um título ao compromisso"
                  className={inputClass}
                />
              </div>

              {/* Datas e Horários */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className={labelClass}>Data de início</label>
                  <input
                    type="text"
                    value={compromissoForm.dataInicio}
                    onChange={(e) => setCompromissoForm({ ...compromissoForm, dataInicio: e.target.value })}
                    placeholder="DD/MM/AAAA"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Hora de início</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={compromissoForm.horaInicio}
                      onChange={(e) => setCompromissoForm({ ...compromissoForm, horaInicio: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Data de término</label>
                  <input
                    type="text"
                    value={compromissoForm.dataTermino}
                    onChange={(e) => setCompromissoForm({ ...compromissoForm, dataTermino: e.target.value })}
                    placeholder="DD/MM/AAAA"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Hora de término</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={compromissoForm.horaTermino}
                      onChange={(e) => setCompromissoForm({ ...compromissoForm, horaTermino: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Repetir */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCompromissoForm({ ...compromissoForm, repetir: !compromissoForm.repetir })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    compromissoForm.repetir 
                      ? 'bg-blue-500' 
                      : isDark ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    compromissoForm.repetir ? 'translate-x-5' : ''
                  }`} />
                </button>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Repetir este compromisso
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between px-6 py-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          {/* Botão Excluir */}
          <div>
            {isEditing && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                Excluir
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                isDark 
                  ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Cancelar
            </button>
            <button
              onClick={activeTab === 'consulta' ? handleSaveConsulta : handleSaveCompromisso}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <CheckIcon className="w-4 h-4" />
              {isEditing 
                ? 'Salvar alterações' 
                : activeTab === 'consulta' ? 'Agendar consulta' : 'Salvar compromisso'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
