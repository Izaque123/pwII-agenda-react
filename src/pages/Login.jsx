import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/Login/LoginForm';
import { RoleButtons } from '../components/Login/RoleButtons';
import { ThemeToggle } from '../components/ThemeToggle';
import { LiveChat } from '../components/LiveChat';
import { useAuth } from '../contexts/AuthContext';
import { getInitialRoute } from '../utils/routeUtils';

export const LoginPage = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const initialRoute = getInitialRoute(user.role);
      navigate(initialRoute);
    }
  }, [isAuthenticated, loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <div className="max-w-md w-full animate-slide-up">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>

        <div className="login-card">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-[#3311cb] to-[#2575fc] rounded-lg">
              </div>
              <h1 className="text-3xl font-bold title-label">Esmile</h1> 
            </div>
            <p className="sub-title-label text-sm font-medium"> 
              Sistema de Gestão Odontológica
            </p>
          </div>

          <LoginForm />
          <RoleButtons />
        </div>
        <Footer />
      </div>

      <LiveChat />
    </div>
  );
};

const Footer = () => (
  <div className="mt-6 text-center">
    <p className="text-white/90 dark:text-white/80 text-sm font-medium">
      &copy; 2025 EsMile. Desenvolvido por Izaque Nicolas
    </p>
  </div>
);