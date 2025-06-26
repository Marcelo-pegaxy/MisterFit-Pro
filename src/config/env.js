// Configurações de ambiente
export const config = {
  // URL da API
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  
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