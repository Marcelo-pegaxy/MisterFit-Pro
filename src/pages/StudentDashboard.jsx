import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities'; // Changed from UserAccount to User
import { WorkoutPlan } from '@/api/entities';
import { DietPlan } from '@/api/entities';
import { Assessment } from '@/api/entities';
import { StudentFinancials } from '@/api/entities';
import { ChatMessage } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dumbbell, Salad, ClipboardCheck, MessageSquare, Loader2, Calendar, AlertCircle, CheckCircle, User as UserIcon, TrendingUp } from 'lucide-react'; // Renamed User to UserIcon to avoid conflict with imported User entity
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '@/contexts/AuthContext';

const InfoCard = ({ title, description, icon: Icon, link, linkText, status, count, lastUpdate }) => (
    <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${status === 'active' ? 'bg-green-100' : status === 'pending' ? 'bg-yellow-100' : 'bg-orange-100'}`}>
                    <Icon className={`w-6 h-6 ${status === 'active' ? 'text-green-600' : status === 'pending' ? 'text-yellow-600' : 'text-orange-600'}`} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{title}</CardTitle>
                        {count !== undefined && (
                            <Badge variant="secondary" className="text-xs">
                                {count} {count === 1 ? 'item' : 'itens'}
                            </Badge>
                        )}
                    </div>
                    <CardDescription>{description}</CardDescription>
                    {lastUpdate && (
                        <p className="text-xs text-gray-500 mt-1">
                            Atualizado {formatDistanceToNow(new Date(lastUpdate), { addSuffix: true, locale: ptBR })}
                        </p>
                    )}
                </div>
            </div>
        </CardHeader>
        {link && (
            <CardContent className="pt-0">
                <Link to={link}>
                    <Button className="w-full" variant="outline">{linkText}</Button>
                </Link>
            </CardContent>
        )}
    </Card>
);

const TrainerCard = ({ trainer, unreadMessages }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Meu Personal Trainer
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                    <AvatarImage src={trainer?.profile_photo} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                        {trainer?.full_name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="font-semibold">{trainer?.full_name || 'Não atribuído'}</p>
                    <p className="text-sm text-gray-500">{trainer?.email}</p>
                </div>
                <Link to={createPageUrl('Chat')} className="relative">
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Bater papo
                    </Button>
                    {unreadMessages > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                            {unreadMessages}
                        </span>
                    )}
                </Link>
            </div>
        </CardContent>
    </Card>
);

const ProgressCard = ({ assessments }) => {
    if (!assessments || assessments.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Meu Progresso
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-500 text-center py-4">
                        Nenhuma avaliação registrada ainda
                    </p>
                </CardContent>
            </Card>
        );
    }

    const latest = assessments[0];
    const previous = assessments[1];

    const getWeightChange = () => {
        if (!previous || !latest.weight || !previous.weight) return null;
        const change = latest.weight - previous.weight;
        return {
            value: Math.abs(change).toFixed(1),
            trend: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable',
            color: change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : 'text-gray-600'
        };
    };

    const weightChange = getWeightChange();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Meu Progresso
                </CardTitle>
                <CardDescription>
                    Última avaliação: {format(new Date(latest.assessment_date), 'dd/MM/yyyy')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                    {latest.weight && (
                        <div>
                            <p className="text-2xl font-bold">{latest.weight}kg</p>
                            <p className="text-xs text-gray-500">Peso</p>
                            {weightChange && (
                                <p className={`text-xs ${weightChange.color}`}>
                                    {weightChange.trend === 'increase' ? '↗' : weightChange.trend === 'decrease' ? '↘' : '→'} {weightChange.value}kg
                                </p>
                            )}
                        </div>
                    )}
                    {latest.bmi && (
                        <div>
                            <p className="text-2xl font-bold">{latest.bmi}</p>
                            <p className="text-xs text-gray-500">IMC</p>
                        </div>
                    )}
                    {latest.body_fat_percentage && (
                        <div>
                            <p className="text-2xl font-bold">{latest.body_fat_percentage}%</p>
                            <p className="text-xs text-gray-500">Gordura</p>
                        </div>
                    )}
                </div>
                {assessments.length > 1 && (
                    <p className="text-xs text-gray-500 text-center mt-3">
                        Comparado com avaliação anterior
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

const PaymentStatusCard = ({ financials }) => {
    if (!financials) return null;

    const isOverdue = new Date(financials.next_due_date) < new Date();
    const daysUntilDue = Math.ceil((new Date(financials.next_due_date) - new Date()) / (1000 * 60 * 60 * 24));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Status do Pagamento
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isOverdue ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Pagamento em Atraso</AlertTitle>
                        <AlertDescription>
                            Vencimento era em {format(new Date(financials.next_due_date), 'dd/MM/yyyy')}
                        </AlertDescription>
                    </Alert>
                ) : daysUntilDue <= 7 ? (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Vencimento Próximo</AlertTitle>
                        <AlertDescription>
                            Próximo pagamento em {daysUntilDue} dias ({format(new Date(financials.next_due_date), 'dd/MM/yyyy')})
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Em Dia</AlertTitle>
                        <AlertDescription className="text-green-700">
                            Próximo vencimento: {format(new Date(financials.next_due_date), 'dd/MM/yyyy')}
                        </AlertDescription>
                    </Alert>
                )}
                <div className="mt-3 text-sm text-gray-600">
                    <p><strong>Valor:</strong> R$ {financials.amount.toFixed(2)}</p>
                    <p><strong>Período:</strong> {financials.payment_period}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default function StudentDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState({ 
        workouts: [], 
        diets: [], 
        assessments: [], 
        trainer: null, 
        financials: null,
        unreadMessages: 0,
        lastMessage: null
    });
    const [isLoading, setIsLoading] = useState(true);

    // Extracted data fetching logic into its own function
    const fetchData = async (currentUser) => {
        if (!currentUser) {
            setIsLoading(false); // Stop loading if no user is provided
            return;
        }
        try {
            // Buscar dados do aluno usando student_id
            const [workouts, diets, assessments, financials] = await Promise.all([
                WorkoutPlan.filter({ student_id: currentUser.id }, '-created_date'),
                DietPlan.filter({ student_id: currentUser.id }, '-created_date'),
                Assessment.filter({ student_id: currentUser.id }, '-assessment_date'),
                StudentFinancials.filter({ student_id: currentUser.id, trainer_email: currentUser.linked_trainer_email })
            ]);

            // Buscar dados do trainer se vinculado
            let trainer = null;
            if (currentUser.linked_trainer_email) {
                const allUsers = await User.list(); // Using User.list()
                trainer = allUsers.find(u => u.email === currentUser.linked_trainer_email);
            }

            // Verificar mensagens não lidas do personal trainer
            let unreadMessagesCount = 0;
            let lastMessageInfo = null;
            
            if (trainer) {
                try {
                    const allMessages = await ChatMessage.filter({ with: trainer.email });
                    
                    // Contar mensagens não lidas do trainer para o aluno
                    const unreadMessages = allMessages.filter(msg => 
                        msg.receiver_email === currentUser.email && 
                        msg.sender_email === trainer.email &&
                        !msg.is_read
                    );
                    unreadMessagesCount = unreadMessages.length;
                    
                    // Pegar última mensagem do trainer
                    const trainerMessages = allMessages
                        .filter(msg => 
                            msg.sender_email === trainer.email && 
                            msg.receiver_email === currentUser.email
                        )
                        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
                    
                    if (trainerMessages.length > 0) {
                        const lastMsg = trainerMessages[0];
                        lastMessageInfo = {
                            message: lastMsg.message_type === 'image' ? '📷 Imagem' : 
                                    lastMsg.message_type === 'file' ? '📎 Arquivo' : 
                                    lastMsg.message,
                            time: lastMsg.created_date
                        };
                    }
                } catch (chatError) {
                    console.error('Erro ao buscar mensagens:', chatError);
                }
            }

            setData({
                workouts,
                diets,
                assessments,
                trainer,
                financials: Array.isArray(financials) ? (financials[0] || null) : (financials || null),
                unreadMessages: unreadMessagesCount,
                lastMessage: lastMessageInfo
            });

        } catch (error) {
            console.error("Erro ao buscar dados do aluno:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.user_type) {
            fetchData(user);
        } else {
            setIsLoading(false);
        }
    }, [user]);

    if (isLoading || !user) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <p className="ml-2 text-gray-600">Verificando e carregando...</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {/* Header com saudação personalizada */}
            <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                    <AvatarImage src={user?.profile_photo} />
                    <AvatarFallback className="text-xl bg-orange-100 text-orange-600">
                        {user?.full_name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Olá, {user?.full_name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-gray-500">
                        {new Date().getHours() < 12 ? 'Bom dia!' : new Date().getHours() < 18 ? 'Boa tarde!' : 'Boa noite!'} 
                        {' '}Aqui está o resumo do seu treino hoje.
                    </p>
                </div>
                
                {/* Indicador de mensagens não lidas do personal */}
                {data.unreadMessages > 0 && (
                    <Link to={createPageUrl('Chat')}>
                        <Card className="bg-green-50 border-green-200 hover:bg-green-100 transition-colors cursor-pointer">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <MessageSquare className="w-6 h-6 text-green-600" />
                                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {data.unreadMessages}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-green-800">
                                            Mensagem do seu Personal
                                        </p>
                                        <p className="text-xs text-green-600">
                                            {data.lastMessage?.message?.substring(0, 30)}...
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                )}
            </div>

            {/* Status do pagamento se aplicável */}
            {data.financials && (
                <PaymentStatusCard financials={data.financials} />
            )}
            
            {/* Cards principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard 
                    title="Meus Treinos"
                    description={data.workouts.length > 0 ? 
                        `${data.workouts.length} treino${data.workouts.length !== 1 ? 's' : ''} disponível${data.workouts.length !== 1 ? 'eis' : ''}` : 
                        "Nenhum treino atribuído ainda"
                    }
                    icon={Dumbbell}
                    link={createPageUrl('StudentWorkout')}
                    linkText="Ver Meus Treinos"
                    status={data.workouts.length > 0 ? 'active' : 'pending'}
                    count={data.workouts.length}
                    lastUpdate={data.workouts[0]?.created_date}
                />
                
                <InfoCard 
                    title="Minha Dieta"
                    description={data.diets.length > 0 ? 
                        `${data.diets.length} plano${data.diets.length !== 1 ? 's' : ''} alimentar disponível${data.diets.length !== 1 ? 'eis' : ''}` : 
                        "Nenhuma dieta atribuída ainda"
                    }
                    icon={Salad}
                    link={createPageUrl('StudentDiet')}
                    linkText="Ver Minha Dieta"
                    status={data.diets.length > 0 ? 'active' : 'pending'}
                    count={data.diets.length}
                    lastUpdate={data.diets[0]?.created_date}
                />
            </div>

            {/* Segunda linha de cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InfoCard 
                    title="Minhas Avaliações"
                    description={data.assessments.length > 0 ? 
                        `${data.assessments.length} avaliação${data.assessments.length !== 1 ? 'ões' : ''} registrada${data.assessments.length !== 1 ? 's' : ''}` : 
                        "Nenhuma avaliação registrada ainda"
                    }
                    icon={ClipboardCheck}
                    link={createPageUrl('StudentAssessments')}
                    linkText="Ver Minhas Avaliações"
                    status={data.assessments.length > 0 ? 'active' : 'pending'}
                    count={data.assessments.length}
                    lastUpdate={data.assessments[0]?.assessment_date}
                />

                <ProgressCard assessments={data.assessments} />
            </div>

            {/* Card do Personal Trainer */}
            {data.trainer && (
                <TrainerCard trainer={data.trainer} unreadMessages={data.unreadMessages} />
            )}

            {/* Dicas motivacionais */}
            <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
                <CardHeader>
                    <CardTitle className="text-orange-800">💪 Dica do Dia</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-orange-700">
                        {data.workouts.length === 0 
                            ? "Entre em contato com seu personal trainer para receber seu primeiro treino personalizado!"
                            : data.assessments.length === 0
                            ? "Que tal agendar uma avaliação física para acompanhar melhor seus resultados?"
                            : "Continue firme na sua jornada! A consistência é a chave para o sucesso!"
                        }
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
