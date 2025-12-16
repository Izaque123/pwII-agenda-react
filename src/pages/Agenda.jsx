import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useSidebar } from '../contexts/SidebarContext';
import { useAuth } from '../contexts/AuthContext';
import { EventModal } from '../components/Agenda/EventModal';
import { ProfessionalModal } from '../components/Professionals/ProfessionalModal';
import { agendaService } from '../services/agendaService';
import { professionalsService } from '../services/professionalsService';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  PrinterIcon,
  EllipsisVerticalIcon,
  ChevronUpIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export const AgendaPage = () => {
  const { isDark } = useTheme();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const { user } = useAuth();
  
  // Verificar se o usuário logado é um profissional
  const isProfissional = user?.tipo === 'profissional';
  const profissionalNome = isProfissional ? (user?.nome || user?.name) : null;
  const [currentDate, setCurrentDate] = useState(new Date()); // Data atual
  const [viewMode, setViewMode] = useState('week'); // 'week' ou 'day'
  const [showAgendas, setShowAgendas] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingProfessional, setEditingProfessional] = useState(null);
  const [draggingEvent, setDraggingEvent] = useState(null);
  const [feriados, setFeriados] = useState([]);
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedEventCard, setSelectedEventCard] = useState(null);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [cardJustClosed, setCardJustClosed] = useState(false);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [professionals, setProfessionals] = useState([]);
  const [loadingProfessionals, setLoadingProfessionals] = useState(true);
  
  // Carregar profissionais da API
  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        setLoadingProfessionals(true);
        const profissionaisData = await professionalsService.getAll({ ativo: true });
        // Converter para o formato esperado (name ao invés de nome)
        const profissionaisFormatados = profissionaisData.map(p => ({
          id: p.id,
          name: p.nome,
          color: p.color || 'bg-blue-500',
          ...p
        }));
        setProfessionals(profissionaisFormatados);
      } catch (error) {
        console.error('Erro ao carregar profissionais:', error);
        // Em caso de erro, usar lista vazia ou padrão
        setProfessionals([]);
      } finally {
        setLoadingProfessionals(false);
      }
    };

    loadProfessionals();
  }, []);

  // Carregar eventos da API
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const eventos = await agendaService.getAll();
        setEvents(eventos);
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        // Em caso de erro, manter array vazio
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Buscar feriados da Brasil API
  useEffect(() => {
    const fetchFeriados = async () => {
      try {
        const year = currentDate.getFullYear();
        // Verificar se já temos os feriados deste ano em cache
        const cacheKey = `esmile-feriados-${year}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
          setFeriados(JSON.parse(cached));
          return;
        }

        const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`);
        if (response.ok) {
          const data = await response.json();
          setFeriados(data);
          // Cachear no localStorage para evitar requisições repetidas
          localStorage.setItem(cacheKey, JSON.stringify(data));
        }
      } catch (error) {
        console.error('Erro ao buscar feriados:', error);
      }
    };

    fetchFeriados();
  }, [currentDate.getFullYear()]);

  // Função para verificar se uma data é feriado
  const getFeriado = (date) => {
    const dateStr = date.toISOString().split('T')[0]; // formato YYYY-MM-DD
    return feriados.find(f => f.date === dateStr);
  };

  // Adicionar ou atualizar evento
  const handleSaveEvent = async (eventData, isEditing) => {
    try {
      let savedEvent;
      
      if (isEditing) {
        // Atualizar evento na API
        savedEvent = await agendaService.update(eventData.id, eventData);
        setEvents(prev => prev.map(e => e.id === savedEvent.id ? savedEvent : e));
      } else {
        // Criar novo evento na API
        savedEvent = await agendaService.create(eventData);
        setEvents(prev => [...prev, savedEvent]);
      }
      
      // Retornos são criados automaticamente no backend quando o evento tem retornoEm e motivoRetorno
      
      setEditingEvent(null);
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      alert('Erro ao salvar evento. Tente novamente.');
    }
  };

  // Excluir evento
  const handleDeleteEvent = async (eventId) => {
    try {
      // Se for profissional, verificar se o evento pertence a ele antes de deletar
      if (isProfissional && profissionalNome) {
        const evento = events.find(e => e.id === eventId);
        if (evento && evento.dentista !== profissionalNome) {
          alert('Você só pode deletar seus próprios eventos');
          return;
        }
      }
      
      await agendaService.delete(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      setEditingEvent(null);
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao deletar evento. Tente novamente.';
      alert(errorMessage);
    }
  };

  // Abrir modal para edição
  const handleEditEvent = (event) => {
    // Se for profissional, verificar se o evento pertence a ele
    if (isProfissional && profissionalNome && event.dentista !== profissionalNome) {
      alert('Você só pode editar seus próprios eventos');
      return;
    }
    setEditingEvent(event);
    setShowEventModal(true);
  };

  // Função para obter cor baseada no status/etiqueta
  const getColorByStatus = (status) => {
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
    return colors[status] || 'bg-gray-50 border-l-4 border-l-gray-400 border-y border-r border-gray-200 text-gray-800 dark:bg-gray-200 dark:border-l-gray-500 dark:border-gray-300 dark:text-gray-900';
  };

  // Atualizar status do evento
  const handleStatusChange = async (eventId, newStatus) => {
    try {
      const evento = events.find(e => e.id === eventId);
      if (!evento) return;

      // Se for profissional, verificar se o evento pertence a ele
      if (isProfissional && profissionalNome && evento.dentista !== profissionalNome) {
        alert('Você só pode atualizar o status dos seus próprios eventos');
        return;
      }

      const updated = await agendaService.update(eventId, {
        status: newStatus,
        etiqueta: newStatus,
        color: getColorByStatus(newStatus)
      });

      setEvents(prev => prev.map(ev => ev.id === eventId ? updated : ev));
      
      // Atualizar o card se estiver aberto
      if (selectedEventCard && selectedEventCard.id === eventId) {
        setSelectedEventCard(updated);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao atualizar status. Tente novamente.';
      alert(errorMessage);
    }
  };

  // Abrir modal para novo evento em data/horário específico
  const handleNewEventAt = (date, hour) => {
    setCurrentDate(date);
    setSelectedHour(`${String(hour).padStart(2, '0')}:00`);
    setEditingEvent(null);
    setShowEventModal(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
    setSelectedHour(null);
  };

  // Salvar ou atualizar profissional
  const handleSaveProfessional = async (professionalData, isEditing) => {
    try {
      let savedProfessional;
      
      if (isEditing) {
        // Atualizar profissional existente na API
        savedProfessional = await professionalsService.update(professionalData.id, professionalData);
      } else {
        // Criar novo profissional na API
        savedProfessional = await professionalsService.create(professionalData);
      }
      
      // Atualizar lista local
      setProfessionals(prev => {
        if (isEditing) {
          return prev.map(p => 
            p.id === savedProfessional.id 
              ? { ...p, ...savedProfessional, name: savedProfessional.nome, color: savedProfessional.color || p.color }
              : p
          );
        } else {
          // Adicionar novo profissional formatado
          const newProfessional = {
            id: savedProfessional.id,
            name: savedProfessional.nome,
            color: savedProfessional.color || 'bg-blue-500',
            ...savedProfessional
          };
          return [...prev, newProfessional];
        }
      });
      
      setEditingProfessional(null);
      setShowProfessionalModal(false);
    } catch (error) {
      console.error('Erro ao salvar profissional:', error);
      alert('Erro ao salvar profissional. Tente novamente.');
    }
  };

  const handleCloseProfessionalModal = () => {
    setShowProfessionalModal(false);
    setEditingProfessional(null);
  };

  // Drag and Drop handlers
  const handleDragStart = (e, event) => {
    setDraggingEvent(event);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', event.id);
    // Adiciona classe de arraste
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggingEvent(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetDate, targetHour) => {
    e.preventDefault();
    
    if (!draggingEvent) return;
    
    // Calcular a posição do mouse dentro da célula para determinar os minutos
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const minutes = Math.floor((relativeY / rect.height) * 60);
    const roundedMinutes = Math.round(minutes / 15) * 15; // Arredonda para 15 min
    
    // Calcular duração do evento original
    const [startH, startM] = draggingEvent.start.split(':').map(Number);
    const [endH, endM] = draggingEvent.end.split(':').map(Number);
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    
    // Novo horário de início
    const newStartMinutes = targetHour * 60 + roundedMinutes;
    const newEndMinutes = newStartMinutes + durationMinutes;
    
    const newStart = `${String(Math.floor(newStartMinutes / 60)).padStart(2, '0')}:${String(newStartMinutes % 60).padStart(2, '0')}`;
    const newEnd = `${String(Math.floor(newEndMinutes / 60)).padStart(2, '0')}:${String(newEndMinutes % 60).padStart(2, '0')}`;
    
    // Atualizar o evento na API
    try {
      const updated = await agendaService.update(draggingEvent.id, {
        date: targetDate instanceof Date 
          ? targetDate.toISOString().split('T')[0] 
          : targetDate,
        start: newStart,
        end: newEnd
      });
      
      setEvents(prev => prev.map(ev => 
        ev.id === draggingEvent.id ? updated : ev
      ));
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      // Reverter visualmente se houver erro
    }
    
    setDraggingEvent(null);
  };

  // Gerar dias da semana
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6h às 22h

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const goToToday = () => setCurrentDate(new Date());
  const goToPrev = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };
  const goToNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  // Verificar se dois eventos se sobrepõem
  const eventsOverlap = (event1, event2) => {
    const [start1H, start1M] = event1.start.split(':').map(Number);
    const [end1H, end1M] = event1.end.split(':').map(Number);
    const [start2H, start2M] = event2.start.split(':').map(Number);
    const [end2H, end2M] = event2.end.split(':').map(Number);
    
    const start1 = start1H * 60 + start1M;
    const end1 = end1H * 60 + end1M;
    const start2 = start2H * 60 + start2M;
    const end2 = end2H * 60 + end2M;
    
    return start1 < end2 && start2 < end1;
  };

  // Calcular posições para eventos sobrepostos (com deslocamento para direita)
  const calculateEventPositions = (dayEvents) => {
    if (dayEvents.length === 0) return [];
    
    // Ordenar eventos por horário de início
    const sortedEvents = [...dayEvents].sort((a, b) => {
      const [aH, aM] = a.start.split(':').map(Number);
      const [bH, bM] = b.start.split(':').map(Number);
      return (aH * 60 + aM) - (bH * 60 + bM);
    });
    
    // Calcular nível de sobreposição para cada evento
    const eventPositions = new Map();
    
    sortedEvents.forEach((event, index) => {
      let overlapLevel = 0;
      
      // Verificar quantos eventos anteriores ainda estão ativos
      for (let i = 0; i < index; i++) {
        const prevEvent = sortedEvents[i];
        if (eventsOverlap(prevEvent, event)) {
          const prevLevel = eventPositions.get(prevEvent.id).level;
          overlapLevel = Math.max(overlapLevel, prevLevel + 1);
        }
      }
      
      eventPositions.set(event.id, { level: overlapLevel });
    });
    
    // Verificar quais eventos têm sobreposição
    sortedEvents.forEach(event => {
      const hasOverlap = sortedEvents.some(other => 
        other.id !== event.id && eventsOverlap(event, other)
      );
      const currentPos = eventPositions.get(event.id);
      eventPositions.set(event.id, { ...currentPos, hasOverlap });
    });
    
    // Calcular posição com deslocamento
    const offsetPerLevel = 20; // pixels de deslocamento por nível
    const baseWidthReduction = 25; // redução de largura para eventos embaixo com sobreposição
    
    return sortedEvents.map(event => {
      const position = eventPositions.get(event.id);
      const leftOffset = position.level * offsetPerLevel;
      
      // Evento de nível 0 com sobreposição fica um pouco menor
      const widthReduction = position.level === 0 && position.hasOverlap 
        ? baseWidthReduction 
        : 0;
      
      return {
        ...event,
        style: {
          width: `calc(100% - ${8 + leftOffset + widthReduction}px)`,
          left: `${4 + leftOffset}px`,
          zIndex: position.level + 1,
        }
      };
    });
  };

  // Componente de Card do Evento
  const EventCard = ({ event, position, onClose, onEdit, onStatusChange }) => {
    const cardRef = useRef(null);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const statusDropdownRef = useRef(null);

    // Status disponíveis
    const statusOptions = [
      { value: 'agendado', label: 'Agendado', color: 'bg-blue-500' },
      { value: 'confirmado', label: 'Confirmado', color: 'bg-green-500' },
      { value: 'em_atendimento', label: 'Paciente em atendimento', color: 'bg-purple-500' },
      { value: 'concluido', label: 'Concluído', color: 'bg-gray-500' },
      { value: 'cancelado', label: 'Cancelado', color: 'bg-red-500' },
      { value: 'falta', label: 'Falta', color: 'bg-orange-500' },
    ];

    // Usar status ou etiqueta como fallback
    const eventStatus = event.status || event.etiqueta || 'agendado';
    const currentStatus = statusOptions.find(s => s.value === eventStatus) || statusOptions[0];

    // Fechar ao clicar fora do card
    useEffect(() => {
      const handleClickOutside = (e) => {
        if (cardRef.current && !cardRef.current.contains(e.target)) {
          // Verificar se clicou em uma célula de horário
          const clickedCell = e.target.closest('[data-hour-cell]');
          if (clickedCell) {
            setCardJustClosed(true);
            // Resetar após um curto delay
            setTimeout(() => setCardJustClosed(false), 200);
          }
          onClose();
        }
      };

      // Adiciona o listener com um pequeno delay para evitar fechar imediatamente
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [onClose]);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
      const handleClickOutsideDropdown = (e) => {
        if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
          setShowStatusDropdown(false);
        }
      };

      if (showStatusDropdown) {
        document.addEventListener('mousedown', handleClickOutsideDropdown);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutsideDropdown);
      };
    }, [showStatusDropdown]);

    if (!event) return null;
    
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      return `${dias[d.getDay()]}, ${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
    };

    const isConsulta = event.type === 'consulta';

    return (
        <div 
          ref={cardRef}
          className={`fixed z-[100] w-90 rounded-xl shadow-2xl border animate-in fade-in zoom-in-95 duration-200 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          style={{ 
            left: `${Math.min(position.x, window.innerWidth - 340)}px`, 
            top: `${Math.min(Math.max(position.y, 100), window.innerHeight - 300)}px`,
            transform: 'translateY(-50%)'
          }}
        >
          {/* Header */}
          <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${
                isConsulta 
                  ? 'bg-blue-400 ' 
                  : 'bg-gray-400 '
              }`}>
                {event.title?.charAt(0)?.toUpperCase() || (isConsulta ? 'P' : 'C')}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {event.title || (isConsulta ? 'Paciente' : 'Compromisso')}
                </h4>
                <div className="flex items-center gap-2 text-xs mt-0.5">
                  {isConsulta && event.enviarConfirmacao && (
                    <span className="flex items-center gap-1 text-green-600">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Confirmar consulta
                    </span>
                  )}
                  {!isConsulta && (
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Compromisso</span>
                  )}
                </div>
              </div>
              {/* Botão Fechar */}
              <button 
                onClick={onClose}
                className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Botões de ação */}
          {isConsulta && (
            <div className={`px-4 py-3 flex gap-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <button className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}>
                Abrir prontuário
              </button>
              <button className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}>
                Adicionar evolução
              </button>
            </div>
          )}

          {/* Botão Editar */}
          <div className="px-4 py-3">
            <button 
              onClick={() => {
                onClose();
                onEdit(event);
              }}
              className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar agendamento
            </button>
          </div>

          {/* Informações */}
          <div className={`px-4 py-3 space-y-3 text-sm border-t ${isDark ? 'border-gray-700 text-gray-300' : 'border-gray-100 text-gray-600'}`}>
            {event.dentista && (
              <div className="flex items-center gap-2">
                <svg className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{event.dentista}</span>
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <svg className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{event.start} - {event.end}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          {isConsulta && (
            <div className={`px-4 py-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="relative" ref={statusDropdownRef}>
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${currentStatus.color}`}></span>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {currentStatus.label}
                    </span>
                  </div>
                  <svg 
                    className={`w-4 h-4 transition-transform ${isDark ? 'text-gray-500' : 'text-gray-400'} ${
                      showStatusDropdown ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown de Status */}
                {showStatusDropdown && (
                  <div className={`absolute bottom-full left-0 right-0 mb-2 rounded-lg shadow-lg border overflow-hidden z-10 ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    {statusOptions.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => {
                          if (onStatusChange) {
                            onStatusChange(event.id, status.value);
                          }
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                          event.status === status.value || (!event.status && status.value === 'agendado')
                            ? isDark 
                              ? 'bg-blue-900/30 text-blue-400' 
                              : 'bg-blue-50 text-blue-600'
                            : isDark
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${status.color}`}></span>
                        <span>{status.label}</span>
                        {(event.status === status.value || (!event.status && status.value === 'agendado')) && (
                          <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
    );
  };

  // Mini calendário
  const MiniCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendarDays = [];
    
    // Dias do mês anterior
    for (let i = firstDay - 1; i >= 0; i--) {
      calendarDays.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
    }
    
    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      const feriadoDoDia = getFeriado(dayDate);
      const isSelected = i === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear();
      calendarDays.push({ 
        day: i, 
        isCurrentMonth: true, 
        isToday: i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear(),
        isSelected,
        feriado: feriadoDoDia
      });
    }
    
    // Dias do próximo mês
    const remaining = 42 - calendarDays.length;
    for (let i = 1; i <= remaining; i++) {
      calendarDays.push({ day: i, isCurrentMonth: false });
    }

    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {monthNames[month]} {year}
          </span>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <ChevronLeftIcon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <ChevronRightIcon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <div key={i} className={`py-1 font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {d}
            </div>
          ))}
          {calendarDays.map((item, i) => (
            <button
              key={i}
              onClick={() => item.isCurrentMonth && setCurrentDate(new Date(year, month, item.day))}
              title={item.feriado ? item.feriado.name : ''}
              className={`
                py-1 rounded-full text-xs transition-colors
                ${item.isToday 
                  ? 'bg-blue-500 text-white' 
                  : item.isSelected && !item.isToday
                    ? isDark ? 'bg-blue-900/50 text-blue-300 ring-1 ring-blue-500' : 'bg-blue-100 text-blue-600 ring-1 ring-blue-400'
                    : item.feriado
                      ? 'text-cyan-500 font-semibold hover:bg-cyan-100 dark:hover:bg-cyan-900/30'
                      : item.isCurrentMonth 
                        ? isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                        : isDark ? 'text-gray-600' : 'text-gray-400'
                }
              `}
            >
              {item.day}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Calcular posição e altura do evento
  const getEventStyle = (event) => {
    const [startHour, startMin] = event.start.split(':').map(Number);
    const [endHour, endMin] = event.end.split(':').map(Number);
    
    const top = ((startHour - 6) * 80) + (startMin / 60 * 80);
    const height = ((endHour - startHour) * 80) + ((endMin - startMin) / 60 * 80);
    
    return { top: `${top}px`, height: `${height}px` };
  };

  return (
    <div className="flex h-[calc(100vh-64px)] relative">
      {/* Sidebar */}
      <aside className={`
        border-r flex-shrink-0 overflow-hidden
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-64' : 'w-0'}
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <div className={`w-64 h-full overflow-y-auto transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>

        {/* Botão Adicionar */}
        <div className="p-4">
          <button 
            onClick={() => setShowEventModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="font-medium">Novo Evento</span>
          </button>
        </div>

        {/* Mini Calendário */}
        <MiniCalendar />

        {/* Agendas */}
        <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => setShowAgendas(!showAgendas)}
            className={`w-full flex items-center justify-between px-4 py-3 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
          >
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Agendas</span>
            <ChevronUpIcon className={`w-4 h-4 transition-transform ${isDark ? 'text-gray-400' : 'text-gray-600'} ${showAgendas ? '' : 'rotate-180'}`} />
          </button>
          
          {showAgendas && (
            <div className="px-4 pb-4">
              {professionals.map((prof) => (
                <div key={prof.id} className="flex items-center gap-3 py-2">
                  <div className={`w-3 h-3 rounded-full ${prof.color}`}></div>
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{prof.name}</span>
                </div>
              ))}
              <button 
                onClick={() => {
                  setEditingProfessional(null);
                  setShowProfessionalModal(true);
                }}
                className={`flex items-center gap-2 text-sm mt-2 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <PlusIcon className="w-4 h-4" />
                Adicionar profissional
              </button>
            </div>
          )}
        </div>
        </div>
      </aside>

      {/* Área Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className={`flex items-center justify-between px-2 sm:px-4 py-3 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 sm:gap-4">
            <h2 className={`text-base sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPrev()}
              className={`p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <ChevronLeftIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={() => goToNext()}
              className={`p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <ChevronRightIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={goToToday}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm font-medium ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Hoje
            </button>

            <div className={`hidden sm:flex rounded-lg border overflow-hidden ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'week'
                    ? 'bg-blue-500 text-white'
                    : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'day'
                    ? 'bg-blue-500 text-white'
                    : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Dia
              </button>
            </div>

            <button className={`p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <PrinterIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>

            <button className={`p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <EllipsisVerticalIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>

        {/* Calendário */}
        <div className="flex-1 overflow-auto">
          {/* Cabeçalho dos dias */}
          <div className={`sticky top-0 z-10 flex border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="w-12 flex-shrink-0"></div>
            {weekDays.map((date, index) => {
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = date.toDateString() === currentDate.toDateString();
              const feriado = getFeriado(date);
              return (
                <div
                  key={index}
                  className={`flex-1 text-center py-3 border-l transition-colors ${isDark ? 'border-gray-700' : 'border-gray-200'} ${
                    isSelected 
                      ? isDark ? 'bg-blue-900/30' : 'bg-blue-50' 
                      : ''
                  }`}
                  title={feriado ? feriado.name : ''}
                >
                  <div className={`text-sm font-medium ${
                    isSelected 
                      ? 'text-blue-500' 
                      : isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {dayNames[date.getDay()]} {date.getDate()}
                  </div>
                  {isToday && (
                    <div className="text-xs text-blue-500 font-medium">Hoje</div>
                  )}
                  {feriado && (
                    <div 
                      className={`text-xs font-medium truncate mx-1 px-2 py-0.5 rounded ${
                        isDark 
                          ? 'bg-cyan-900/40 text-cyan-300' 
                          : 'bg-cyan-100 text-cyan-700'
                      }`} 
                      title={feriado.name}
                    >
                      {feriado.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grid de horários */}
          <div className="flex">
            {/* Coluna de horários */}
            <div className="w-12 flex-shrink-0">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className={`h-20 border-b text-right pr-1 pt-1 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {hour.toString().padStart(2, '0')}h
                  </span>
                </div>
              ))}
            </div>

            {/* Colunas dos dias */}
            {weekDays.map((date, dayIndex) => {
              const dayEvents = events.filter((e) => 
                e.date && e.date.toDateString() === date.toDateString()
              );
              const positionedEvents = calculateEventPositions(dayEvents);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const isSelected = date.toDateString() === currentDate.toDateString();
              
              return (
                <div
                  key={dayIndex}
                  className={`flex-1 relative border-l transition-colors ${isDark ? 'border-gray-700' : 'border-gray-200'} ${
                    isSelected 
                      ? isDark ? 'bg-blue-900/20' : 'bg-blue-50/70'
                      : isWeekend ? (isDark ? 'bg-gray-800/50' : 'bg-gray-50/50') : ''
                  }`}
                >
                  {/* Linhas de horário (drop zones e click para novo evento) */}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      data-hour-cell="true"
                      className={`h-20 border-b cursor-pointer ${isDark ? 'border-gray-700' : 'border-gray-200'} ${
                        draggingEvent ? 'hover:bg-blue-500/10' : 'hover:bg-gray-100/50 dark:hover:bg-gray-700/30'
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, date, hour)}
                      onClick={() => !draggingEvent && !selectedEventCard && !cardJustClosed && handleNewEventAt(date, hour)}
                    ></div>
                  ))}

                  {/* Eventos */}
                  {positionedEvents.map((event) => (
                    <div
                      key={event.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, event)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => {
                        if (draggingEvent && draggingEvent.id !== event.id) {
                          handleDragOver(e);
                        }
                      }}
                      onDrop={(e) => {
                        if (draggingEvent && draggingEvent.id !== event.id) {
                          // Calcular o horário baseado na posição do evento existente
                          const [startH] = event.start.split(':').map(Number);
                          handleDrop(e, date, startH);
                        }
                      }}
                      style={{
                        ...getEventStyle(event),
                        width: event.style.width,
                        left: event.style.left,
                        zIndex: event.style.zIndex,
                      }}
                      onClick={(e) => {
                        if (!draggingEvent) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setCardPosition({ 
                            x: rect.right + 10, 
                            y: rect.top + rect.height / 2 
                          });
                          setSelectedEventCard(event);
                        }
                      }}
                      className={`absolute rounded-md px-3 py-1.5 overflow-hidden cursor-grab active:cursor-grabbing hover:shadow-xl hover:brightness-95 hover:z-50 transition-all duration-200 ease-out ${event.color}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-medium">{event.start} - {event.end}</div>
                        {event.enviarConfirmacao && (
                          <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        )}
                      </div>
                      <div className="text-[13px] font-semibold truncate">{event.title}</div>
                    </div>
                  ))}

                  {/* Indicador de hora atual */}
                  {date.toDateString() === new Date().toDateString() && (
                    <div
                      className="absolute left-0 right-0 border-t-2 border-orange-500 z-10"
                      style={{
                        top: `${((new Date().getHours() - 6) * 80) + (new Date().getMinutes() / 60 * 80)}px`,
                      }}
                    >
                      <div className="w-3 h-3 bg-orange-500 rounded-full -mt-1.5 -ml-1.5"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Botão flutuante para adicionar evento - mobile */}
      <button
        onClick={() => setShowEventModal(true)}
        className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {/* Card do Evento */}
      {selectedEventCard && (
        <EventCard 
          event={selectedEventCard} 
          position={cardPosition} 
          onClose={() => setSelectedEventCard(null)}
          onEdit={handleEditEvent}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Modal de Novo Evento */}
      <EventModal
        isOpen={showEventModal}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        selectedDate={currentDate}
        selectedHour={selectedHour}
        professionals={professionals}
        editingEvent={editingEvent}
      />

      {/* Modal de Cadastro de Profissional */}
      <ProfessionalModal
        isOpen={showProfessionalModal}
        onClose={handleCloseProfessionalModal}
        onSave={handleSaveProfessional}
        editingProfessional={editingProfessional}
      />
    </div>
  );
};

