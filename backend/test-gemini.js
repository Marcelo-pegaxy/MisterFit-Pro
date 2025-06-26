const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: './config.env' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log('Modelos disponíveis:', models);
  } catch (err) {
    console.error('Erro ao listar modelos:', err);
  }
}

listModels(); 