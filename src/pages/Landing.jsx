import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Users, MessageSquare, BarChart2, Zap } from 'lucide-react';

const Logo = () => (
  <div className="flex items-center space-x-2">
    <img 
      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/ee7cadce2_novologo.png" 
      alt="MisterFit Logo" 
      className="w-10 h-10 object-contain"
    />
    <span className="text-2xl font-bold">MisterFit</span>
  </div>
);

const Header = () => (
  <header className="absolute top-0 left-0 right-0 p-4 bg-transparent text-white">
    <div className="container mx-auto flex justify-between items-center">
      <Logo />
    </div>
  </header>
);

const Hero = () => {
    const navigate = useNavigate();
    return (
        <div className="relative text-center text-white bg-gradient-to-r from-orange-500 to-orange-600 py-40 px-4">
            <Header />
            <div className="relative z-10">
                <div className="flex justify-center mb-4">
                    <div className="bg-white/20 rounded-full p-3">
                        <Zap className="h-12 w-12 text-white" />
                    </div>
                </div>
                <h1 className="text-5xl font-bold mb-4">
                    A plataforma completa para Personal Trainers e Alunos
                </h1>
                <p className="text-xl max-w-3xl mx-auto mb-8">
                    Gerencie treinos, dietas, avaliações e mantenha contato direto com seus alunos. Tudo em um só lugar, de forma simples e profissional.
                </p>
                <Button 
                    size="lg"
                    className="bg-white text-orange-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg"
                    onClick={() => navigate('/login')}
                >
                    Entrar na Plataforma
                </Button>
            </div>
        </div>
    );
};

const features = [
  {
    icon: <Dumbbell className="h-10 w-10 text-orange-500" />,
    title: 'Treinos Personalizados',
    description: 'Crie e gerencie planos de treino únicos para cada aluno',
  },
  {
    icon: <Users className="h-10 w-10 text-orange-500" />,
    title: 'Gestão de Alunos',
    description: 'Acompanhe o progresso e histórico completo de cada pessoa',
  },
  {
    icon: <MessageSquare className="h-10 w-10 text-orange-500" />,
    title: 'Chat Integrado',
    description: 'Comunicação direta e rápida com seus alunos',
  },
  {
    icon: <BarChart2 className="h-10 w-10 text-orange-500" />,
    title: 'Relatórios Detalhados',
    description: 'Acompanhe resultados e evolução com dados precisos',
  },
];

const Features = () => (
  <section className="py-20 bg-gray-50">
    <div className="container mx-auto text-center">
      <h2 className="text-4xl font-bold mb-4 text-gray-800">Tudo que você precisa em uma plataforma</h2>
      <p className="text-lg text-gray-600 mb-12">Ferramentas profissionais para elevar seu trabalho a outro nível</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-white p-8 rounded-lg shadow-md border border-gray-200 flex flex-col items-center text-center">
            <div className="bg-orange-100 rounded-full p-4 mb-4">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CTA = () => {
    const navigate = useNavigate();
    return (
        <section className="bg-gray-800 text-white py-20">
            <div className="container mx-auto text-center">
                <h2 className="text-4xl font-bold mb-4">Pronto para transformar seu trabalho?</h2>
                <p className="text-lg mb-8">Junte-se a centenas de profissionais que já utilizam o MisterFit</p>
                <Button 
                    size="lg"
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
                    onClick={() => navigate('/register')}
                >
                    Começar Agora - É Grátis
                </Button>
            </div>
        </section>
    );
};

const Footer = () => (
  <footer className="bg-gray-900 text-white py-8">
    <div className="container mx-auto text-center">
      <Logo />
      <p className="text-gray-400 mt-4">© 2024 MisterFit. Transformando a relação entre Personal Trainers e Alunos.</p>
    </div>
  </footer>
);


export default function LandingPage() {
    return (
        <div className="bg-white">
            <Hero />
            <Features />
            <CTA />
            <Footer />
        </div>
    );
}