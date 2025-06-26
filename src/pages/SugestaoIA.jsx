import React, { useState } from 'react';
import { FaDumbbell, FaUtensils, FaWaveSquare, FaMagic, FaStar, FaInfoCircle } from 'react-icons/fa';
import ExerciseAnalyzer from '../components/exercise/ExerciseAnalyzer';

const tabs = [
  { label: 'Sugestão de Treino', icon: <FaDumbbell /> },
  { label: 'Sugestão de Dieta', icon: <FaUtensils /> },
  { label: 'Análise de Movimento', icon: <FaWaveSquare /> },
];

function SugestaoIA() {
  const [activeTab, setActiveTab] = useState(0);
  // Estados para o formulário de treino
  const [perfil, setPerfil] = useState('');
  const [preferencias, setPreferencias] = useState('');
  const [equipamentos, setEquipamentos] = useState('');
  const [loading, setLoading] = useState(false);
  const [sugestao, setSugestao] = useState('');
  const [erro, setErro] = useState('');

  // Estados para o formulário de dieta
  const [perfilDieta, setPerfilDieta] = useState('');
  const [preferenciasDieta, setPreferenciasDieta] = useState('');
  const [restricoesDieta, setRestricoesDieta] = useState('');
  const [loadingDieta, setLoadingDieta] = useState(false);
  const [sugestaoDieta, setSugestaoDieta] = useState('');
  const [erroDieta, setErroDieta] = useState('');

  // Limpa sugestão ao trocar de aba
  React.useEffect(() => {
    setSugestao('');
    setErro('');
    setLoading(false);
    setSugestaoDieta('');
    setErroDieta('');
    setLoadingDieta(false);
  }, [activeTab]);

  const handleGerarSugestaoTreino = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSugestao('');
    setErro('');
    try {
      const resp = await fetch('http://localhost:5000/api/ia/treino', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perfil, preferencias, equipamentos })
      });
      if (!resp.ok) throw new Error('Erro ao gerar sugestão');
      const data = await resp.json();
      setSugestao(data.sugestao);
    } catch (err) {
      setErro('Erro ao gerar sugestão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGerarSugestaoDieta = async (e) => {
    e.preventDefault();
    setLoadingDieta(true);
    setSugestaoDieta('');
    setErroDieta('');
    try {
      const resp = await fetch('http://localhost:5000/api/ia/dieta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perfil: perfilDieta, preferencias: preferenciasDieta, restricoes: restricoesDieta })
      });
      if (!resp.ok) throw new Error('Erro ao gerar sugestão');
      const data = await resp.json();
      setSugestaoDieta(data.sugestao);
    } catch (err) {
      setErroDieta('Erro ao gerar sugestão. Tente novamente.');
    } finally {
      setLoadingDieta(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8fb] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <FaMagic className="text-orange-500 text-3xl" />
          <h1 className="text-3xl font-bold">Sugestão com IA</h1>
        </div>
        <p className="text-gray-500 mb-6">Utilize inteligência artificial para gerar sugestões e analisar movimentos.</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded border transition-all text-lg font-medium ${
                activeTab === idx
                  ? 'bg-white border-black text-black shadow'
                  : 'bg-white border-gray-300 text-gray-500 hover:border-black'
              }`}
              onClick={() => setActiveTab(idx)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formulário */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
            {activeTab === 0 && (
              <form onSubmit={handleGerarSugestaoTreino} className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaInfoCircle className="text-blue-500" />
                  <h2 className="text-xl font-semibold">Informações para a IA</h2>
                </div>
                <p className="text-gray-500 mb-2">Forneça detalhes para a IA criar a melhor sugestão de treino.</p>
                <div>
                  <label className="font-semibold">Perfil do Aluno *</label>
                  <textarea className="w-full mt-1 p-2 border rounded resize-none" rows={3} required value={perfil} onChange={e => setPerfil(e.target.value)} placeholder="Ex: Homem, 30 anos, 80kg, 1,75m, nível intermediário, objetivo de hipertrofia, sem limitações físicas." />
                </div>
                <div>
                  <label className="font-semibold">Preferências de Treino</label>
                  <textarea className="w-full mt-1 p-2 border rounded resize-none" rows={2} value={preferencias} onChange={e => setPreferencias(e.target.value)} placeholder="Ex: Prefere treinos 3-4x por semana, duração de 60 minutos, gosta de exercícios compostos como agachamento, supino." />
                </div>
                <div>
                  <label className="font-semibold">Equipamentos Disponíveis</label>
                  <textarea className="w-full mt-1 p-2 border rounded resize-none" rows={2} value={equipamentos} onChange={e => setEquipamentos(e.target.value)} placeholder="Ex: Barra olímpica, anilhas, halteres variados, banco ajustável, barra fixa, esteira, bicicleta." />
                </div>
                <button type="submit" className="mt-2 bg-orange-200 hover:bg-orange-300 text-orange-900 font-semibold py-2 rounded transition-all flex items-center justify-center disabled:opacity-60" disabled={loading}>
                  <FaMagic className="inline mr-2" />
                  {loading ? 'Gerando sugestão...' : 'Gerar Sugestão de Treino'}
                </button>
                {erro && <div className="text-red-500 text-sm mt-2">{erro}</div>}
              </form>
            )}
            {activeTab === 1 && (
              <form onSubmit={handleGerarSugestaoDieta} className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaInfoCircle className="text-blue-500" />
                  <h2 className="text-xl font-semibold">Informações para a IA</h2>
                </div>
                <p className="text-gray-500 mb-2">Forneça detalhes para a IA criar a melhor sugestão de dieta.</p>
                <div>
                  <label className="font-semibold">Perfil do Aluno *</label>
                  <textarea className="w-full mt-1 p-2 border rounded resize-none" rows={3} required value={perfilDieta} onChange={e => setPerfilDieta(e.target.value)} placeholder="Ex: Mulher, 25 anos, 65kg, 1,65m, objetivo de emagrecimento, pratica exercícios 4x por semana." />
                </div>
                <div>
                  <label className="font-semibold">Preferências Alimentares</label>
                  <textarea className="w-full mt-1 p-2 border rounded resize-none" rows={2} value={preferenciasDieta} onChange={e => setPreferenciasDieta(e.target.value)} placeholder="Ex: Não gosta de peixes, prefere carnes brancas, adora frutas, evita doces, gosta de saladas." />
                </div>
                <div>
                  <label className="font-semibold">Condições de Saúde/Restrições</label>
                  <textarea className="w-full mt-1 p-2 border rounded resize-none" rows={2} value={restricoesDieta} onChange={e => setRestricoesDieta(e.target.value)} placeholder="Ex: Intolerância à lactose, diabético tipo 2, hipertensão, não pode consumir glúten." />
                </div>
                <button type="submit" className="mt-2 bg-orange-200 hover:bg-orange-300 text-orange-900 font-semibold py-2 rounded transition-all flex items-center justify-center disabled:opacity-60" disabled={loadingDieta}>
                  <FaMagic className="inline mr-2" />
                  {loadingDieta ? 'Gerando sugestão...' : 'Gerar Sugestão de Dieta'}
                </button>
                {erroDieta && <div className="text-red-500 text-sm mt-2">{erroDieta}</div>}
              </form>
            )}
            {activeTab === 2 && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <FaInfoCircle className="text-purple-500" />
                  <h2 className="text-xl font-semibold">Análise de Movimento</h2>
                </div>
                <p className="text-gray-500 mb-2">Faça upload de um vídeo do exercício para análise biomecânica detalhada ou utilize a webcam para análise em tempo real.</p>
                <div>
                  <label className="font-semibold">Aluno *</label>
                  <select className="w-full mt-1 p-2 border rounded">
                    <option>Selecione o aluno</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold">Nome do Exercício *</label>
                  <input className="w-full mt-1 p-2 border rounded" placeholder="Ex: Agachamento, Supino, Deadlift..." />
                </div>
                <div>
                  <label className="font-semibold">Vídeo do Exercício *</label>
                  <div className="flex items-center gap-2 mt-1">
                    <label className="bg-orange-100 text-orange-700 px-3 py-1 rounded cursor-pointer hover:bg-orange-200 transition-all">
                      Escolher arquivo
                      <input type="file" className="hidden" />
                    </label>
                    <span className="text-gray-400">Nenhum arquivo escolhido</span>
                  </div>
                </div>
                <div>
                  <label className="font-semibold">Observações Adicionais</label>
                  <textarea className="w-full mt-1 p-2 border rounded resize-none" rows={2} placeholder="Ex: Aluno relata dor no joelho, primeira vez fazendo este exercício, usar carga reduzida..." />
                </div>
                <button className="mt-2 bg-purple-200 hover:bg-purple-300 text-purple-900 font-semibold py-2 rounded transition-all">
                  <FaMagic className="inline mr-2" /> Analisar Movimento
                </button>
                <div className="mt-8">
                  <ExerciseAnalyzer exerciseType="squat" />
                </div>
              </>
            )}
          </div>

          {/* Painel de Sugestão/Relatório */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center min-h-[350px] w-full">
            {activeTab === 0 && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <FaStar className="text-green-600" />
                  <h2 className="text-2xl font-semibold">Sugestão Gerada</h2>
                </div>
                <div className="flex flex-col items-center mt-8 w-full">
                  {loading && <div className="text-gray-400 text-lg">Gerando sugestão...</div>}
                  {sugestao ? (
                    <pre className="bg-gray-50 border rounded p-4 text-gray-800 w-full whitespace-pre-wrap text-sm">{sugestao}</pre>
                  ) : !loading && (
                    <>
                      <FaMagic className="text-4xl text-gray-300 mb-4" />
                      <p className="text-xl font-semibold mb-2">Pronto para uma sugestão?</p>
                      <p className="text-gray-500 text-center max-w-xs">Preencha o formulário para que nossa IA crie um plano de treino para você.</p>
                    </>
                  )}
                </div>
              </>
            )}
            {activeTab === 1 && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <FaUtensils className="text-green-600" />
                  <h2 className="text-2xl font-semibold">Sugestão Gerada</h2>
                </div>
                <div className="flex flex-col items-center mt-8 w-full">
                  {loadingDieta && <div className="text-gray-400 text-lg">Gerando sugestão...</div>}
                  {sugestaoDieta ? (
                    <pre className="bg-gray-50 border rounded p-4 text-gray-800 w-full whitespace-pre-wrap text-sm">{sugestaoDieta}</pre>
                  ) : !loadingDieta && (
                    <>
                      <FaMagic className="text-4xl text-gray-300 mb-4" />
                      <p className="text-xl font-semibold mb-2">Pronto para uma sugestão?</p>
                      <p className="text-gray-500 text-center max-w-xs">Preencha o formulário para que nossa IA crie um plano alimentar para você.</p>
                    </>
                  )}
                </div>
              </>
            )}
            {activeTab === 2 && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <FaWaveSquare className="text-green-600" />
                  <h2 className="text-2xl font-semibold">Relatório da Análise</h2>
                </div>
                <div className="flex flex-col items-center mt-8">
                  <FaWaveSquare className="text-4xl text-gray-300 mb-4" />
                  <p className="text-xl font-semibold mb-2">Pronto para analisar?</p>
                  <ul className="text-gray-500 text-left list-disc pl-5 max-w-xs">
                    <li>Análise biomecânica detalhada</li>
                    <li>Detecção de erros técnicos</li>
                    <li>Predição de riscos de lesão</li>
                    <li>Recomendações corretivas</li>
                    <li>Plano de progressão personalizado</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SugestaoIA; 