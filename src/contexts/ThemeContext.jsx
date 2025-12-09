import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Função para obter o tema inicial sem flash
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('esmile-theme');
  if (savedTheme) {
    return savedTheme === 'dark';
  }
  // Se não houver tema salvo, usa a preferência do sistema
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    // Aplicar tema no documento
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('esmile-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('esmile-theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const setTheme = (theme) => {
    setIsDark(theme === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};