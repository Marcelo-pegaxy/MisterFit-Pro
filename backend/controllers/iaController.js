const { model } = require('../config/gemini');

async function gerarSugestaoTreino(req, res) {
  const { perfil, preferencias, equipamentos } = req.body;
  const prompt = `
Você é um personal trainer. Crie um plano de treino personalizado para o seguinte aluno:
Perfil: ${perfil}
Preferências: ${preferencias}
Equipamentos disponíveis: ${equipamentos}
Responda de forma detalhada, organizada por dias da semana, e com dicas de segurança.
  `;
  try {
    const result = await model.generateContent(prompt);
    const resposta = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível gerar sugestão.";
    res.json({ sugestao: resposta });
  } catch (err) {
    console.error('Erro Gemini (Treino):', err);
    res.status(500).json({ sugestao: "Erro ao gerar sugestão com IA.", erro: err.message });
  }
}

async function gerarSugestaoDieta(req, res) {
  const { perfil, preferencias, restricoes } = req.body;
  const prompt = `
Você é um nutricionista. Crie um plano alimentar personalizado para o seguinte aluno:
Perfil: ${perfil}
Preferências alimentares: ${preferencias}
Condições de saúde/restrições: ${restricoes}
Responda de forma detalhada, com exemplos de refeições para cada parte do dia.
  `;
  try {
    const result = await model.generateContent(prompt);
    const resposta = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível gerar sugestão.";
    res.json({ sugestao: resposta });
  } catch (err) {
    console.error('Erro Gemini (Dieta):', err);
    res.status(500).json({ sugestao: "Erro ao gerar sugestão com IA.", erro: err.message });
  }
}

module.exports = { gerarSugestaoTreino, gerarSugestaoDieta }; 