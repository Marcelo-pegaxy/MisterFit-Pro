const { GoogleGenerativeAI } = require("@google/generative-ai");

// Em produção, as variáveis de ambiente são carregadas automaticamente
// Em desenvolvimento, carrega do arquivo config.env
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '../config.env' });
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro-latest" });

module.exports = { model }; 