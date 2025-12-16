import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSidebar } from '../contexts/SidebarContext';
import { LiveChat } from '../components/LiveChat';
import { ReturnsCenter } from '../components/Returns/ReturnsCenter';
import {
  CalendarDaysIcon,
  UsersIcon,
  CurrencyDollarIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
  BellIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  ChatBubbleLeftRightIcon,
  UserPlusIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showReturnsCenter, setShowReturnsCenter] = useState(false);

  // Definir menus baseado no role do usuário
  const getMenuItems = () => {
    const role = user?.role;
    
    // Administrador: Cadastro de Suporte e Lista de Usuários
    if (role === 'admin') {
      return [
        { path: '/cadastro-suporte', label: 'Cadastrar Suporte', icon: UserPlusIcon },
        { path: '/lista-usuarios', label: 'Lista de Usuários', icon: UserGroupIcon },
      ];
    }
    
    // Suporte: Mensagens
    if (role === 'suporte') {
      return [
        { path: '/mensagens', label: 'Mensagens', icon: ChatBubbleLeftRightIcon },
      ];
    }
    
    // Usuário padrão e Profissionais: Agenda, Pacientes, Financeiro
    if (role === 'user' || role === 'profissional') {
      return [
        { path: '/agenda', label: 'Agenda', icon: CalendarDaysIcon },
        { path: '/pacientes', label: 'Pacientes', icon: UsersIcon },
        { path: '/financeiro', label: 'Financeiro', icon: CurrencyDollarIcon },
      ];
    }
    
    // Fallback: se não tiver role definido, mostrar agenda
    return [
      { path: '/agenda', label: 'Agenda', icon: CalendarDaysIcon },
    ];
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 h-16 z-30 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="h-full px-4 flex items-center justify-between">
          {/* Logo e Menu */}
          <div className="flex items-center gap-6">
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <Bars3Icon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            
            <Link to={menuItems.length > 0 ? menuItems[0].path : '/agenda'} className="flex items-center gap-2">
              <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Esmile
              </span>
            </Link>

            {/* Menu Principal */}
            <nav className="hidden md:flex items-center gap-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive
                        ? isDark 
                          ? 'bg-blue-900/40 text-blue-400'
                          : 'bg-blue-50 text-blue-600'
                        : isDark
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Ações do Header */}
          <div className="flex items-center gap-2">
            {/* Busca */}
            <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>

            {/* Notificações */}
            <button className={`p-2 rounded-lg relative ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Tema */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>

            {/* Configurações */}
            <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
              <Cog6ToothIcon className="w-5 h-5" />
            </button>

            {/* Apps - Central de Retornos */}
            <button 
              onClick={() => setShowReturnsCenter(true)}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              title="Central de retornos"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                  {user?.nome?.charAt(0) || 'U'}
                </div>
                <span className={`hidden sm:block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>
                  {user?.nome || 'Conta'}
                </span>
                <ChevronDownIcon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>

              {showUserMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.nome}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`}
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Live Chat - Não mostrar na página de mensagens */}
      {location.pathname !== '/mensagens' && <LiveChat />}

      {/* Central de Retornos */}
      <ReturnsCenter 
        isOpen={showReturnsCenter} 
        onClose={() => setShowReturnsCenter(false)} 
      />
    </div>
  );
};

