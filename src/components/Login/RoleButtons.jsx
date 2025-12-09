import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const RoleButtons = () => {
  const navigate = useNavigate();

  const handleCadastroClick = () => {
    navigate('/register');
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-600">
      <div className="text-center">
        <p className="free-label text-sm mb-4">
          Ainda não tem uma conta?
        </p>
        
        <button
          onClick={handleCadastroClick}
          className="group w-full flex items-center justify-center space-x-2 py-2.5 px-4 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white rounded-lg transition-all duration-200 font-medium"
        >
          <span className="text-sm">Teste Grátis por 7 Dias</span>
          <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="free-label text-xs mt-2">
          Cancele a qualquer momento
        </p>
      </div>
    </div>
  );
};