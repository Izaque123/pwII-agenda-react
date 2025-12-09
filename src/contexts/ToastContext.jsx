import { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X, WifiOff, Server } from 'lucide-react';

const ToastContext = createContext();

// Hook para verificar o tema
const useIsDark = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    // Observer para mudanças na classe
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);
  
  return isDark;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, title = '', type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, title, type, duration, createdAt: Date.now() };
    
    setToasts(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const toast = {
    success: (message, title = '', duration) => addToast(message, title, 'success', duration),
    error: (message, title = '', duration) => addToast(message, title, 'error', duration),
    warning: (message, title = '', duration) => addToast(message, title, 'warning', duration),
    info: (message, title = '', duration) => addToast(message, title, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
};

const Toast = ({ toast, removeToast }) => {
  const isDark = useIsDark();
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (toast.duration > 0) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - toast.createdAt;
        const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
        setProgress(remaining);
      }, 50);

      return () => clearInterval(interval);
    }
  }, [toast.duration, toast.createdAt]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => removeToast(toast.id), 200);
  };

  const getToastStyles = (type) => {
    if (isDark) {
      // Tema escuro
      const styles = {
        success: {
          container: 'bg-gray-800/95 border-emerald-500/50',
          icon: 'text-emerald-400',
          title: 'text-emerald-300',
          message: 'text-gray-300',
          progress: 'bg-emerald-500',
          closeBtn: 'text-gray-500 hover:text-gray-300',
        },
        error: {
          container: 'bg-gray-800/95 border-red-500/50',
          icon: 'text-red-400',
          title: 'text-red-300',
          message: 'text-gray-300',
          progress: 'bg-red-500',
          closeBtn: 'text-gray-500 hover:text-gray-300',
        },
        warning: {
          container: 'bg-gray-800/95 border-amber-500/50',
          icon: 'text-amber-400',
          title: 'text-amber-300',
          message: 'text-gray-300',
          progress: 'bg-amber-500',
          closeBtn: 'text-gray-500 hover:text-gray-300',
        },
        info: {
          container: 'bg-gray-800/95 border-blue-500/50',
          icon: 'text-blue-400',
          title: 'text-blue-300',
          message: 'text-gray-300',
          progress: 'bg-blue-500',
          closeBtn: 'text-gray-500 hover:text-gray-300',
        },
      };
      return styles[type] || styles.info;
    } else {
      // Tema claro
      const styles = {
        success: {
          container: 'bg-white/95 border-emerald-200',
          icon: 'text-emerald-600',
          title: 'text-emerald-800',
          message: 'text-gray-600',
          progress: 'bg-emerald-500',
          closeBtn: 'text-gray-400 hover:text-gray-600',
        },
        error: {
          container: 'bg-white/95 border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-gray-600',
          progress: 'bg-red-500',
          closeBtn: 'text-gray-400 hover:text-gray-600',
        },
        warning: {
          container: 'bg-white/95 border-amber-200',
          icon: 'text-amber-600',
          title: 'text-amber-800',
          message: 'text-gray-600',
          progress: 'bg-amber-500',
          closeBtn: 'text-gray-400 hover:text-gray-600',
        },
        info: {
          container: 'bg-white/95 border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-gray-600',
          progress: 'bg-blue-500',
          closeBtn: 'text-gray-400 hover:text-gray-600',
        },
      };
      return styles[type] || styles.info;
    }
  };

  const getIcon = (type) => {
    const icons = {
      success: <CheckCircle className="h-5 w-5" />,
      error: <XCircle className="h-5 w-5" />,
      warning: <AlertTriangle className="h-5 w-5" />,
      info: <Info className="h-5 w-5" />,
    };
    return icons[type] || icons.info;
  };

  // Ícones especiais para tipos específicos de erro
  const getCustomIcon = (message, title) => {
    if (message.includes('conectar') || title.includes('Conexão')) {
      return <WifiOff className="h-5 w-5" />;
    }
    if (message.includes('servidor') || title.includes('Servidor')) {
      return <Server className="h-5 w-5" />;
    }
    return null;
  };

  const styles = getToastStyles(toast.type);
  const customIcon = getCustomIcon(toast.message, toast.title);

  return (
    <div 
      className={`
        pointer-events-auto
        ${styles.container}
        border-l-4 rounded-lg shadow-xl
        backdrop-blur-sm
        overflow-hidden
        transform transition-all duration-200 ease-out
        ${isExiting 
          ? 'opacity-0 translate-x-full scale-95' 
          : 'opacity-100 translate-x-0 scale-100 animate-toast-in'
        }
      `}
    >
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${styles.icon}`}>
            {customIcon || getIcon(toast.type)}
          </div>
          
          {/* Text */}
          <div className="flex-1 min-w-0">
            {toast.title && (
              <h4 className={`text-sm font-semibold ${styles.title} mb-0.5`}>
                {toast.title}
              </h4>
            )}
            <p className={`text-sm ${styles.message} leading-relaxed`}>
              {toast.message}
            </p>
          </div>
          
          {/* Close Button */}
          <button
            onClick={handleRemove}
            className={`flex-shrink-0 p-1 rounded-lg transition-colors ${styles.closeBtn}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className={`h-1 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div 
          className={`h-full ${styles.progress} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Inline styles for animation */}
      <style>{`
        @keyframes toast-in {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        .animate-toast-in {
          animation: toast-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
};
