# MisterFit Pro - Guia de Desenvolvimento

## 🚀 Início Rápido

### 1. Iniciar o Ambiente de Desenvolvimento

**Opção A: Script Automático (Recomendado)**
```powershell
.\start-dev.ps1
```

**Opção B: Manual**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
npm run dev
```

### 2. URLs de Acesso
- **Frontend**: http://localhost:5174
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🔧 Configuração

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Supabase (configurado)

### Variáveis de Ambiente
Crie um arquivo `backend/config.env`:
```env
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
NODE_ENV=development
PORT=5000
```

## 🐛 Debug e Troubleshooting

### Verificar Status dos Serviços
```javascript
// No console do navegador
checkServices()
```

### Limpar Dados Locais
```javascript
// No console do navegador
clearLocalData()
```

### Logs de Debug
Os logs estão habilitados por padrão. Verifique:
- Console do navegador (F12)
- Terminal do backend
- Network tab para requisições API

## 📱 Contas de Teste

### Personal Trainer
- Email: `trainer@demo.com`
- Senha: `123456`

### Aluno
- Email: `aluno@demo.com`
- Senha: `123456`

### Admin
- Email: `admin@demo.com`
- Senha: `123456`

## 🔄 Fluxo de Autenticação

1. **Registro**: `/register` → Confirmação por email
2. **Login**: `/login` → Redirecionamento baseado no `user_type`
3. **Perfil Incompleto**: `/complete-profile` → Seleção de role
4. **Dashboard**: `/dashboard` (trainer) ou `/student-dashboard` (aluno)

## 🛠️ Estrutura do Projeto

```
MisterFit Pro/
├── backend/                 # API Node.js + Express
│   ├── controllers/        # Lógica de negócio
│   ├── middleware/         # Autenticação e validação
│   ├── routes/            # Definição de rotas
│   └── config/            # Configurações (Supabase, etc.)
├── src/                   # Frontend React
│   ├── components/        # Componentes reutilizáveis
│   ├── pages/            # Páginas da aplicação
│   ├── contexts/         # Context API (Auth)
│   ├── services/         # Serviços de API
│   └── utils/            # Utilitários
└── scripts/              # Scripts de automação
```

## 🔍 Problemas Comuns

### 1. White Screen após Login
- Verifique se o backend está rodando
- Limpe dados locais: `clearLocalData()`
- Verifique logs no console

### 2. Erro 404 em Rotas
- Confirme se o backend está na porta 5000
- Verifique se as rotas estão definidas em `backend/routes/`

### 3. Problemas de CORS
- Backend já está configurado para aceitar localhost:5174
- Verifique se não há conflito de portas

### 4. Token Inválido
- Limpe dados locais e faça login novamente
- Verifique se o Supabase está configurado corretamente

## 📊 Monitoramento

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Logs em Tempo Real
```bash
# Backend logs
cd backend && npm run dev

# Frontend logs (F12 no navegador)
```

## 🚀 Deploy

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
npm run build
# Servir arquivos estáticos
```

## 📞 Suporte

Para problemas específicos:
1. Verifique os logs
2. Use `checkServices()` para diagnóstico
3. Limpe dados locais se necessário
4. Reinicie os servidores

---

**Desenvolvido com ❤️ para MisterFit Pro** 