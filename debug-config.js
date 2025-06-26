// Configuração de debug para MisterFit Pro
const debugConfig = {
  // URLs dos serviços
  api: {
    baseUrl: 'http://localhost:5000/api',
    healthCheck: 'http://localhost:5000/api/health'
  },
  
  // Configurações do frontend
  frontend: {
    port: 5174,
    url: 'http://localhost:5174'
  },
  
  // Configurações do backend
  backend: {
    port: 5000,
    url: 'http://localhost:5000'
  },
  
  // Configurações de debug
  debug: {
    enableLogs: true,
    enableApiLogs: true,
    enableAuthLogs: true
  },
  
  // Contas de teste
  testAccounts: {
    trainer: {
      email: 'trainer@demo.com',
      password: '123456'
    },
    student: {
      email: 'aluno@demo.com', 
      password: '123456'
    },
    admin: {
      email: 'admin@demo.com',
      password: '123456'
    }
  },
  
  // Mapeamento de roles
  roleMapping: {
    frontend: {
      student: 'student',
      trainer: 'trainer'
    },
    backend: {
      student: 'aluno',
      trainer: 'personal'
    }
  }
};

// Função para verificar se os serviços estão rodando
async function checkServices() {
  console.log('🔍 Verificando serviços...');
  
  try {
    const response = await fetch(debugConfig.api.healthCheck);
    if (response.ok) {
      console.log('✅ Backend está rodando');
    } else {
      console.log('❌ Backend não está respondendo corretamente');
    }
  } catch (error) {
    console.log('❌ Backend não está acessível:', error.message);
  }
}

// Função para limpar dados locais
function clearLocalData() {
  localStorage.removeItem('misterfit_token');
  localStorage.removeItem('misterfit_user');
  console.log('🧹 Dados locais limpos');
}

// Exportar configuração
if (typeof module !== 'undefined' && module.exports) {
  module.exports = debugConfig;
} else {
  window.debugConfig = debugConfig;
  window.checkServices = checkServices;
  window.clearLocalData = clearLocalData;
} 