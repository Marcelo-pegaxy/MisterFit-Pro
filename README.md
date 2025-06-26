# MisterFit Pro - Sistema Completo

Sistema completo de gestão para Personal Trainers e Alunos com autenticação própria e backend Node.js.

## 🚀 Migração do Base44 para Sistema Próprio

Este projeto foi migrado do Base44 (Google Auth) para um sistema próprio com:
- **Backend**: Node.js + Express + JWT + PostgreSQL
- **Frontend**: React + Tailwind CSS + shadcn/ui
- **Autenticação**: Email/senha com diferenciação PT/Aluno
- **Modelo de negócio**: PTs gratuitos, Alunos R$ 12,90/mês

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

## 🗄️ Configuração do Banco de Dados

1. **Instalar PostgreSQL**
2. **Criar banco de dados**:
   ```sql
   CREATE DATABASE misterfit_db;
   ```

3. **Executar schema**:
   ```bash
   cd backend
   psql -d misterfit_db -f database/schema.sql
   ```

## ⚙️ Configuração do Backend

1. **Instalar dependências**:
   ```bash
   cd backend
   npm install
   ```

2. **Configurar variáveis de ambiente**:
   ```bash
   cp config.env .env
   # Editar .env com suas configurações
   ```

3. **Iniciar servidor**:
   ```bash
   npm run dev
   ```

## 🎨 Configuração do Frontend

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente** (opcional):
   ```bash
   # Criar .env.local se necessário
   VITE_API_URL=http://localhost:3001/api
   ```

3. **Iniciar aplicação**:
   ```bash
   npm run dev
   ```

## 🔐 Sistema de Autenticação

### Tipos de Usuário
- **Personal Trainer**: Acesso gratuito, funcionalidades completas
- **Aluno**: Trial 30 dias, depois R$ 12,90/mês
- **Admin**: Acesso total ao sistema

### Fluxo de Registro
1. Usuário se registra com email/senha
2. Escolhe tipo de conta (PT ou Aluno)
3. Se for Aluno, recebe trial de 30 dias automaticamente
4. Redirecionado para dashboard apropriado

## 📊 Estrutura do Banco de Dados

### Tabelas Principais
- `users` - Usuários do sistema
- `subscriptions` - Assinaturas dos alunos
- `workout_plans` - Planos de treino
- `diet_plans` - Planos de dieta
- `assessments` - Avaliações físicas
- `chat_messages` - Mensagens do chat
- `payments` - Pagamentos

## 🔧 Funcionalidades Implementadas

### ✅ Backend
- [x] Autenticação JWT
- [x] Registro/Login diferenciado
- [x] Validação de dados
- [x] Middleware de autorização
- [x] Sistema de assinaturas
- [x] Rate limiting
- [x] Logs de requisições

### ✅ Frontend
- [x] Contexto de autenticação
- [x] Páginas de login/registro
- [x] Proteção de rotas
- [x] Sistema de navegação
- [x] Interface responsiva
- [x] Integração com API

### 🚧 Em Desenvolvimento
- [ ] Integração com Stripe
- [ ] Sistema de notificações
- [ ] Upload de imagens
- [ ] Relatórios avançados
- [ ] Sistema de IA

## 🛠️ Comandos Úteis

### Backend
```bash
# Desenvolvimento
npm run dev

# Produção
npm start

# Verificar saúde da API
curl http://localhost:3001/api/health
```

### Frontend
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 📁 Estrutura do Projeto

```
misterfit-pro/
├── backend/                 # Backend Node.js
│   ├── config/             # Configurações
│   ├── controllers/        # Controladores
│   ├── database/           # Schema do banco
│   ├── middleware/         # Middlewares
│   ├── routes/             # Rotas da API
│   └── server.js           # Servidor principal
├── src/                    # Frontend React
│   ├── components/         # Componentes UI
│   ├── contexts/           # Contextos React
│   ├── hooks/              # Hooks customizados
│   ├── pages/              # Páginas da aplicação
│   ├── services/           # Serviços de API
│   └── utils/              # Utilitários
└── README.md
```

## 🔒 Segurança

- **JWT**: Tokens com expiração de 7 dias
- **bcrypt**: Hash de senhas com salt rounds 12
- **Helmet**: Headers de segurança
- **Rate Limiting**: 100 requests por 15 minutos
- **CORS**: Configurado para desenvolvimento/produção
- **Validação**: Dados validados com express-validator

## 💳 Modelo de Negócio

### Personal Trainers
- ✅ Cadastro gratuito
- ✅ Acesso total às funcionalidades
- ✅ Gestão ilimitada de alunos
- ✅ Criação de treinos e dietas

### Alunos
- ✅ Trial gratuito de 30 dias
- ✅ R$ 12,90/mês após trial
- ✅ Acesso aos treinos e dietas
- ✅ Chat com o personal trainer
- ✅ Acompanhamento de progresso

## 🚀 Deploy

### Backend (Heroku/Railway)
```bash
# Configurar variáveis de ambiente
# Conectar banco PostgreSQL
# Deploy via Git
```

### Frontend (Vercel/Netlify)
```bash
# Configurar VITE_API_URL
# Build e deploy automático
```

## 📞 Suporte

Para dúvidas ou problemas:
- Email: suporte@misterfit.com
- Documentação: [docs.misterfit.com](https://docs.misterfit.com)

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**MisterFit Pro** - Transformando a relação entre Personal Trainers e Alunos 🏋️‍♂️