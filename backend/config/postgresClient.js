const { Pool } = require('pg');
require('dotenv').config({ path: '../config.env' });

// Configuração do PostgreSQL local
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'misterfit_pro',
  user: process.env.DB_USER || 'misterfit_user',
  password: process.env.DB_PASSWORD || 'misterfit123',
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Teste de conexão
pool.on('connect', () => {
  console.log('Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Erro inesperado no cliente PostgreSQL', err);
  process.exit(-1);
});

module.exports = pool; 