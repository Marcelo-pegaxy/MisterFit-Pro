const { createClient } = require('@supabase/supabase-js');

// Em produção, as variáveis de ambiente são carregadas automaticamente
// Em desenvolvimento, carrega do arquivo config.env
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '../config.env' });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Service Key are required.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase; 