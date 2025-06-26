import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import apiService from '@/services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Verificar se há token salvo e validar com a API
  useEffect(() => {
    console.log('AuthContext useEffect executado');
    const checkAuth = async () => {
      const token = localStorage.getItem('misterfit_token');
      console.log('Token encontrado:', token);
      if (token) {
        try {
          const response = await apiService.getProfile();
          console.log('Resposta do getProfile:', response);
          setUser(response);
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          // Token inválido, limpar dados
          localStorage.removeItem('misterfit_token');
          localStorage.removeItem('misterfit_user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Função de login
  const login = async (email, password) => {
    try {
      const response = await apiService.login(email, password);
      console.log('Login response:', response);
      
      // Salvar token
      localStorage.setItem('misterfit_token', response.token);
      
      // Salvar dados do usuário
      setUser(response.user);

      // Redirecionar baseado no user_type
      if (response.user.user_type) {
        const dashboardUrl = response.user.user_type === 'aluno' 
          ? '/student-dashboard' 
          : '/dashboard';
        navigate(dashboardUrl);
      } else {
        navigate('/complete-profile');
      }

      return response;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  // Função de registro
  const register = async (userData) => {
    try {
      await apiService.register(userData);
      // Exibir mensagem de sucesso e redirecionar para login
      alert('Cadastro realizado com sucesso! Verifique seu e-mail para ativar a conta.');
      navigate(createPageUrl('Login'));
    } catch (error) {
      throw error;
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('misterfit_token');
    localStorage.removeItem('misterfit_user');
    setUser(null);
    setSubscription(null);
    navigate('/');
  };

  // Função para atualizar dados do usuário
  const updateUser = async (updatedData) => {
    try {
      const response = await apiService.updateProfile(updatedData);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Função para completar perfil
  const completeProfile = async (role) => {
    try {
      const response = await apiService.updateProfile({ role });
      setUser(response.user);
      // Redirecionar para o dashboard apropriado
      const dashboardUrl = role === 'student' 
        ? '/student-dashboard' 
        : createPageUrl('dashboard');
      navigate(dashboardUrl);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Função para alterar senha
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await apiService.changePassword(currentPassword, newPassword);
    } catch (error) {
      throw error;
    }
  };

  // Função para verificar se o usuário tem assinatura ativa
  const hasActiveSubscription = () => {
    if (!subscription) return false;
    
    if (subscription.status === 'trial') {
      return new Date(subscription.trial_ends_at) > new Date();
    }
    
    return subscription.status === 'active';
  };

  // Função para obter dias restantes do trial
  const getTrialDaysLeft = () => {
    if (!subscription || subscription.status !== 'trial') return 0;
    
    const trialEnd = new Date(subscription.trial_ends_at);
    const now = new Date();
    const diffTime = trialEnd - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const value = {
    user,
    subscription,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    completeProfile,
    changePassword,
    hasActiveSubscription,
    getTrialDaysLeft,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 