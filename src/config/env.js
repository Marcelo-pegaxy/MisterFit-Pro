// Configurações de ambiente
export const config = {
  // URL da API - Mude esta URL após o deploy no Railway
  API_URL: 'https://misterfit-pro-production.up.railway.app/api',
  
  // URL da API em produção (será substituída após deploy)
  // API_URL: 'https://misterfit-backend-production.up.railway.app/api',
  
  // Configurações de pagamento
  STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_...',
  
  // Configurações da aplicação
  APP_NAME: 'MisterFit Pro',
  APP_VERSION: '1.0.0',
  
  // Configurações de assinatura
  SUBSCRIPTION: {
    STUDENT_MONTHLY_PRICE: 12.90,
    TRIAL_DAYS: 30,
    CURRENCY: 'BRL'
  },
  
  // Configurações de upload
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp']
  }
};

// Função para verificar se está em desenvolvimento
export const isDevelopment = () => {
  return import.meta.env.DEV;
};

// Função para verificar se está em produção
export const isProduction = () => {
  return import.meta.env.PROD;
};

// Função para obter a URL da API baseada no ambiente
export const getApiUrl = () => {
  if (isProduction()) {
    // Em produção, use a URL do Railway
    return 'https://misterfit-backend-production.up.railway.app/api';
  }
  return config.API_URL;
}; 