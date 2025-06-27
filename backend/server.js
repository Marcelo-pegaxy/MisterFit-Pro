const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: './config.env' });
const supabase = require('./config/supabaseClient');
const { protect } = require('./middleware/auth');

// Importar rotas
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de segurança
app.use(helmet());

// Configuração do CORS
// Em desenvolvimento, permite múltiplas portas do localhost. Em produção, use uma lista restrita.
const whitelist = [
    'https://mister-fit-pro.vercel.app'
];
if (process.env.NODE_ENV !== 'production') {
  whitelist.push('http://localhost:3000', 'http://127.0.0.1:3000');
  for (let i = 5173; i <= 5183; i++) { // Permite portas de 5173 a 5183 para o Vite
    whitelist.push(`http://localhost:${i}`);
    whitelist.push(`http://127.0.0.1:${i}`);
  }
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.options('*', cors());

// Rate limiting
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite de 100 requests por IP
    message: {
      success: false,
      message: 'Muitas requisições. Tente novamente em alguns minutos.'
    }
  });
  app.use('/api/', limiter);
}

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

// Define Exercise routes
const exerciseRoutes = require('./routes/exercises');
app.use('/api/exercises', exerciseRoutes);

// Define Assessment routes
const assessmentRoutes = require('./routes/assessments');
app.use('/api/assessments', assessmentRoutes);

// Adicionar rota de workout plans
const workoutPlansRoutes = require('./routes/workoutPlans');
app.use('/api/workout-plans', workoutPlansRoutes);

// Adicionar rota de diet plans
const dietPlansRoutes = require('./routes/dietPlans');
app.use('/api/diet-plans', dietPlansRoutes);

// Adicionar rota de financial
const financialRoutes = require('./routes/financial');
app.use('/api/financial', financialRoutes);

// Adicionar rota de chat
const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);

// Adicionar rota de IA
const iaRoutes = require('./routes/ia');
app.use('/api/ia', iaRoutes);

// Endpoint para listar todos os usuários
app.get('/api/users', protect, async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// Endpoint para atualizar um usuário
app.put('/api/users/:id', protect, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('users')
    .update(req.body)
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MisterFit API está funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor MisterFit rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
}); 