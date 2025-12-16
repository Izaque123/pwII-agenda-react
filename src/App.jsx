// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { AgendaPage } from './pages/Agenda';
import PatientsPage from './pages/Patients';
import FinanceiroPage from './pages/Financeiro';
import MensagensPage from './pages/Mensagens';
import CadastroSuportePage from './pages/CadastroSuporte';
import ListaUsuariosPage from './pages/ListaUsuarios';
import AtribuicoesSuportePage from './pages/AtribuicoesSuporte';
import { MainLayout } from './layouts/MainLayout';
import { InitialRedirect } from './components/InitialRedirect';
import './App.css';

// Componente de rota protegida
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <SidebarProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Rotas públicas */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Rotas protegidas com layout */}
                <Route 
                  path="/agenda" 
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <AgendaPage />
                      </MainLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/pacientes" 
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <PatientsPage />
                      </MainLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/financeiro" 
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <FinanceiroPage />
                      </MainLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/mensagens" 
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <MensagensPage />
                      </MainLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/cadastro-suporte" 
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <CadastroSuportePage />
                      </MainLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/lista-usuarios" 
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ListaUsuariosPage />
                      </MainLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/atribuicoes-suporte" 
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <AtribuicoesSuportePage />
                      </MainLayout>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Redirecionamentos */}
                <Route path="/dashboard" element={<InitialRedirect />} />
                <Route path="/" element={<InitialRedirect />} />
              </Routes>
            </div>
          </Router>
          </SidebarProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
