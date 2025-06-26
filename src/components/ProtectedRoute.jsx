import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { createPageUrl } from '@/utils';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, requireRole = null }) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Log para depuração
  console.log('ProtectedRoute:', { user, isLoading, isAuthenticated });

  // Mostrar loader enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to={createPageUrl('Login')} replace />;
  }

  // Se não tem user_type definido, redirecionar para completar perfil
  if (!user || !user.user_type) {
    return <Navigate to={'/complete-profile'} replace />;
  }

  // Se requer um user_type específico e o usuário não tem, redirecionar
  if (requireRole && user.user_type !== requireRole) {
    const dashboardUrl = user.user_type === 'aluno' 
      ? createPageUrl('StudentDashboard') 
      : createPageUrl('dashboard');
    return <Navigate to={dashboardUrl} replace />;
  }

  // Se chegou até aqui, renderizar o conteúdo protegido
  return children || <Outlet />;
};

// Componente específico para rotas de estudantes
export const StudentRoute = ({ children }) => (
  <ProtectedRoute requireRole="student">
    {children}
  </ProtectedRoute>
);

// Componente específico para rotas de trainers
export const TrainerRoute = ({ children }) => (
  <ProtectedRoute requireRole="trainer">
    {children}
  </ProtectedRoute>
);

// Componente específico para rotas de admin
export const AdminRoute = ({ children }) => (
  <ProtectedRoute requireRole="admin">
    {children}
  </ProtectedRoute>
);

// Componente para rotas que requerem autenticação mas não role específico
export const AuthRoute = ({ children }) => (
  <ProtectedRoute>
    {children}
  </ProtectedRoute>
); 