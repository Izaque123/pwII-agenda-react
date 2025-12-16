import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getInitialRoute } from '../utils/routeUtils';

export const InitialRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const initialRoute = getInitialRoute(user.role);
  return <Navigate to={initialRoute} />;
};

