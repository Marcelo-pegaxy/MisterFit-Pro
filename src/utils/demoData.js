// Dados de demonstração para o sistema
export const initializeDemoData = () => {
  // Verificar se já existem dados de demonstração
  const existingUsers = localStorage.getItem('misterfit_users');
  if (existingUsers) {
    return; // Já existem dados, não inicializar novamente
  }

  const demoUsers = [
    {
      id: '1',
      full_name: 'João Silva',
      email: 'trainer@demo.com',
      password: '123456',
      role: 'trainer',
      created_date: new Date('2024-01-01').toISOString(),
      profile_photo: null,
      phone: '(11) 99999-9999',
      bio: 'Personal Trainer especializado em musculação e funcional'
    },
    {
      id: '2',
      full_name: 'Maria Santos',
      email: 'aluno@demo.com',
      password: '123456',
      role: 'student',
      created_date: new Date('2024-01-15').toISOString(),
      profile_photo: null,
      phone: '(11) 88888-8888',
      bio: 'Aluna dedicada buscando melhorar sua saúde e condicionamento físico'
    },
    {
      id: '3',
      full_name: 'Admin Sistema',
      email: 'admin@demo.com',
      password: '123456',
      role: 'admin',
      created_date: new Date('2024-01-01').toISOString(),
      profile_photo: null,
      phone: '(11) 77777-7777',
      bio: 'Administrador do sistema MisterFit'
    }
  ];

  // Salvar dados de demonstração
  localStorage.setItem('misterfit_users', JSON.stringify(demoUsers));
  
  console.log('✅ Dados de demonstração inicializados com sucesso!');
  console.log('📧 Contas disponíveis:');
  console.log('- Personal Trainer: trainer@demo.com / 123456');
  console.log('- Aluno: aluno@demo.com / 123456');
  console.log('- Admin: admin@demo.com / 123456');
};

// Função para limpar dados de demonstração (útil para reset)
export const clearDemoData = () => {
  localStorage.removeItem('misterfit_users');
  localStorage.removeItem('misterfit_user');
  console.log('🗑️ Dados de demonstração removidos');
}; 