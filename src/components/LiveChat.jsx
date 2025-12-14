import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { chatService } from '../services/chatService';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  PaperAirplaneIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CpuChipIcon,
  UserIcon
} from '@heroicons/react/24/outline';

// Dados dos contatos
const CONTACTS = [
  {
    id: 'bot',
    name: 'Assistente EsMile',
    avatarType: 'bot',
    status: 'online',
    role: 'Suporte Automático',
    lastMessage: 'Como posso ajudar?',
    isBot: true
  },
  {
    id: 'suporte-team',
    name: 'Izaque, Iago',
    avatarType: 'team',
    status: 'online',
    role: 'Time de Suporte',
    lastMessage: 'Olá! Como posso te ajudar?',
    isTeam: true,
    members: ['Izaque', 'Iago']
  }
];

// Componente de Avatar com ícones Heroicons
const ContactAvatar = ({ type, size = 'md', isDark = false }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
  };
  
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
  };

  const bgColors = {
    bot: 'bg-gradient-to-br from-violet-500 to-indigo-600',
  };

  // Avatar especial para o time (dois avatares lado a lado)
  if (type === 'team') {
    const teamSize = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';
    const teamIconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    const ringColor = isDark ? 'ring-gray-900' : 'ring-gray-50';
    
    return (
      <div className="flex -space-x-3">
        <div className={`${teamSize} rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white shadow-lg ring-2 ${ringColor} z-10`}>
          <UserIcon className={teamIconSize} />
        </div>
        <div className={`${teamSize} rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white shadow-lg ring-2 ${ringColor}`}>
          <UserIcon className={teamIconSize} />
        </div>
      </div>
    );
  }

  const IconComponent = {
    bot: CpuChipIcon,
  }[type];

  return (
    <div className={`${sizeClasses[size]} rounded-full ${bgColors[type]} flex items-center justify-center text-white shadow-lg`}>
      <IconComponent className={iconSizes[size]} />
    </div>
  );
};

// Respostas automáticas por contato
const AUTO_RESPONSES = {
  'bot': (input) => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('senha') || lowerInput.includes('esqueci')) {
      return 'Para recuperar sua senha, clique em "Esqueci minha senha" na tela de login ou entre em contato com o administrador do sistema.';
    }
    if (lowerInput.includes('cadastro') || lowerInput.includes('conta')) {
      return 'Para criar uma nova conta, entre em contato com o administrador da sua clínica. Apenas administradores podem criar novos usuários.';
    }
    if (lowerInput.includes('horário') || lowerInput.includes('funcionamento')) {
      return 'Nosso suporte funciona de segunda a sexta, das 8h às 18h. Fora desse horário, deixe sua mensagem que retornaremos!';
    }
    if (lowerInput.includes('agend') || lowerInput.includes('consulta')) {
      return 'Para agendar uma consulta, acesse o menu "Agendamentos" após fazer login ou entre em contato com a recepção.';
    }
    return 'Obrigado pela sua mensagem! Posso ajudar com dúvidas sobre login, senha, cadastro ou agendamentos.';
  },
  'suporte-team': () => 'Olá! Recebemos sua mensagem. Nossa equipe vai analisar e retornar em breve!'
};

export const LiveChat = () => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [conversations, setConversations] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1); // Começa com 1 para chamar atenção
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, selectedContact]);

  // Inicializa conversa com mensagem de boas-vindas
  const initConversation = (contactId) => {
    if (!conversations[contactId]) {
      const contact = CONTACTS.find(c => c.id === contactId);
      const welcomeMessage = contact.isBot 
        ? 'Olá! Sou o assistente virtual do EsMile. Como posso ajudar você hoje?'
        : `Olá! Você está conversando com o time de suporte do EsMile. Como posso ajudar?`;
      
      setConversations(prev => ({
        ...prev,
        [contactId]: [{
          id: 1,
          type: 'received',
          text: welcomeMessage,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }]
      }));
    }
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    initConversation(contact.id);
    setUnreadCount(0);
  };

  const handleBack = () => {
    setSelectedContact(null);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !selectedContact) return;

    const contactId = selectedContact.id;
    const userText = inputValue;

    // Adiciona a mensagem do usuário na UI imediatamente
    const newMessage = {
      id: Date.now(),
      type: 'sent',
      text: userText,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMessage]
    }));
    
    setInputValue('');
    setIsTyping(true);

    if (!selectedContact.isBot) {
        setTimeout(() => {
            setIsTyping(false);
            const botResponse = {
                id: Date.now() + 1,
                type: 'received',
                text: 'Olá! Um atendente humano responderá em breve.',
                time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            };
            setConversations(prev => ({
                ...prev,
                [contactId]: [...(prev[contactId] || []), botResponse]
            }));
        }, 1000);
        return;
    }

    // Lógica do ChatBot
    try {
      // Prepara o histórico para enviar ao backend
      // O backend espera: [{ role: 'user', content: '...' }, { role: 'assistant', content: '...' }]
      const currentHistory = conversations[contactId] || [];
      const historyPayload = currentHistory.map(msg => ({
        role: msg.type === 'sent' ? 'user' : 'assistant',
        content: msg.text
      }));

      // Chama o backend
      const data = await chatService.sendMessage(userText, historyPayload);

      // Adiciona a resposta da IA na UI
      const botResponse = {
        id: Date.now() + 1,
        type: 'received',
        text: data.reply,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setConversations(prev => ({
        ...prev,
        [contactId]: [...(prev[contactId] || []), botResponse]
      }));

    } catch (error) {
      // Tratamento de erro na UI
      const errorResponse = {
        id: Date.now() + 1,
        type: 'received',
        text: 'Desculpe, estou com problemas de conexão no momento.',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setConversations(prev => ({
        ...prev,
        [contactId]: [...(prev[contactId] || []), errorResponse]
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentMessages = selectedContact ? (conversations[selectedContact.id] || []) : [];

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-6 right-6 z-50
          w-16 h-16 rounded-full
          flex items-center justify-center
          transition-all duration-300 ease-out
          hover:scale-110 active:scale-95
          ${isOpen}
          bg-black shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40
        `}
        aria-label={isOpen ? 'Fechar chat' : 'Abrir chat'}
      >
        {isOpen ? (
          <XMarkIcon className="w-7 h-7 text-white" />
        ) : (
          <>
            <ChatBubbleLeftRightIcon className="w-7 h-7 text-white" />
          </>
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`
          fixed bottom-24 right-6 z-40
          w-[480px] max-w-[calc(100vw-3rem)]
          rounded-2xl overflow-hidden
          shadow-2xl shadow-black/20
          transition-all duration-300 ease-out
          ${isOpen 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 translate-y-4 pointer-events-none'
          }
        `}
      >
        {/* Header */}
        <div className={`px-5 py-4 ${isDark ? 'bg-[#0f3a8a]' : 'bg-[#2575fc]'}`}>
          <div className="flex items-center gap-3">
            {selectedContact ? (
              <>
                <button 
                  onClick={handleBack}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4 text-white" />
                </button>
                <ContactAvatar type={selectedContact.avatarType} size="sm" isDark={isDark} />
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-base">{selectedContact.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${selectedContact.status === 'online' ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}></span>
                    <span className="text-white/80 text-xs">{selectedContact.status === 'online' ? 'Online' : 'Ausente'}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base">Chat</h3>
                  <span className="text-white/80 text-xs">Selecione um contato</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {selectedContact ? (
          <>
            {/* Messages */}
            <div className={`h-[500px] overflow-y-auto p-4 space-y-4 chat-scrollbar ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
              {currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[80%] px-4 py-2.5 rounded-2xl
                      ${message.type === 'sent'
                        ? isDark 
                          ? 'bg-gradient-to-r from-[#1a0c5e] to-[#0f3a8a] text-white rounded-br-md'
                          : 'bg-gradient-to-r from-[#3311cb] to-[#2575fc] text-white rounded-br-md'
                        : isDark 
                          ? 'bg-gray-800 text-gray-200 rounded-bl-md shadow-sm border border-gray-700'
                          : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                      }
                    `}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <span className={`text-[10px] mt-1 block ${message.type === 'sent' ? 'text-white/70' : 'text-gray-400'}`}>
                      {message.time}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className={`px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`border-t p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className={`
                    flex-1 px-4 py-2.5 rounded-full
                    text-sm border-none outline-none
                    focus:ring-2 focus:ring-blue-500/50
                    transition-all
                    ${isDark 
                      ? 'bg-gray-700 text-gray-200 placeholder-gray-500' 
                      : 'bg-gray-100 text-gray-800 placeholder-gray-400'
                    }
                  `}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className={`
                    w-10 h-10 rounded-full
                    flex items-center justify-center
                    transition-all duration-200
                    hover:scale-105 
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                    ${isDark 
                      ? 'bg-gradient-to-r from-[#1a0c5e] to-[#0f3a8a] hover:shadow-lg hover:shadow-blue-900/40' 
                      : 'bg-gradient-to-r from-[#3311cb] to-[#2575fc] hover:shadow-lg hover:shadow-blue-500/30'
                    }
                  `}
                >
                  <PaperAirplaneIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Contact List */
          <div className={`h-[560px] overflow-y-auto chat-scrollbar ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {CONTACTS.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleSelectContact(contact)}
                className={`
                  w-full px-4 py-4 flex items-center gap-4
                  transition-all duration-200
                  ${isDark 
                    ? 'hover:bg-gray-800 border-b border-gray-800' 
                    : 'hover:bg-white border-b border-gray-100'
                  }
                `}
              >
                <div className="relative">
                  <ContactAvatar type={contact.avatarType} size="md" isDark={isDark} />
                  <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${isDark ? 'border-gray-900' : 'border-gray-50'} ${contact.status === 'online' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {contact.name}
                    </h4>
                    {contact.isBot && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                        BOT
                      </span>
                    )}
                  </div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{contact.role}</p>
                  <p className={`text-xs mt-1 truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {contact.lastMessage}
                  </p>
                </div>
                <ChevronRightIcon className={`w-5 h-5 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              </button>
            ))}
            
            {/* Info Footer */}
            <div className={`px-4 py-6 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <p className="text-xs">Selecione um contato para iniciar uma conversa</p>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        .chat-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        html.dark .chat-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
        html.dark .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </>
  );
};

