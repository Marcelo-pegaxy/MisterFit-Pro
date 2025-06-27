# MisterFit Backend

Backend da aplicação MisterFit Pro - Sistema de gestão para personal trainers.

## 🚀 Deploy

### Opções de Deploy

#### 1. Railway (Recomendado)
1. Faça fork deste repositório
2. Acesse [Railway](https://railway.app)
3. Conecte seu repositório GitHub
4. Configure as variáveis de ambiente:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `NODE_ENV=production`

#### 2. Heroku
1. Instale o Heroku CLI
2. Execute:
```bash
heroku create misterfit-backend
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_ANON_KEY=your_key
heroku config:set SUPABASE_SERVICE_KEY=your_service_key
heroku config:set JWT_SECRET=your_secret
heroku config:set GEMINI_API_KEY=your_gemini_key
git push heroku main
```

#### 3. Render
1. Conecte seu repositório no Render
2. Configure as variáveis de ambiente
3. Deploy automático

## 🔧 Configuração Local

1. Clone o repositório
2. Instale as dependências:
```bash
cd backend
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example config.env
# Edite o arquivo config.env com suas credenciais
```

4. Execute o servidor:
```bash
npm run dev
```

## 📋 Endpoints Principais

- `GET /api/health` - Health check
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `GET /api/users` - Listar usuários
- `POST /api/exercises` - Criar exercício
- `GET /api/exercises` - Listar exercícios
- `POST /api/assessments` - Criar avaliação
- `GET /api/assessments` - Listar avaliações
- `POST /api/workout-plans` - Criar plano de treino
- `GET /api/workout-plans` - Listar planos de treino
- `POST /api/diet-plans` - Criar plano alimentar
- `GET /api/diet-plans` - Listar planos alimentares
- `POST /api/financial` - Criar registro financeiro
- `GET /api/financial` - Listar registros financeiros
- `POST /api/chat` - Chat com IA
- `POST /api/ia/suggest` - Sugestões de IA

## 🔐 Segurança

- CORS configurado para produção
- Rate limiting ativo em produção
- Helmet para headers de segurança
- JWT para autenticação
- Validação de dados com express-validator

## 📦 Dependências

- Express.js
- Supabase (PostgreSQL)
- JWT
- bcryptjs
- CORS
- Helmet
- Rate Limiting
- Google Gemini AI 