import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities'; // Changed from UserAccount to User
import { WorkoutPlan } from '@/api/entities';
import { DietPlan } from '@/api/entities';
import { RecentActivity } from '@/api/entities';
import { Payment } from '@/api/entities';
import { Assessment } from '@/api/entities';
import { ChatMessage } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, ClipboardList, Salad, TrendingUp, AlertTriangle, History, PlusCircle, LinkIcon, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import api from '../services/api';

const StatCard = ({ title, value, subtext, icon: Icon, isLoading, link, action, variant }) => (
  <Card className={`bg-white shadow-sm hover:shadow-md transition-shadow ${variant === 'highlight' ? 'ring-2 ring-orange-200' : ''}`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <Icon className="h-5 w-5 text-gray-400" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-1/2 mt-2" />
      ) : (
        <>
          <div className="text-2xl font-bold text-gray-800">{value}</div>
          <p className="text-xs text-gray-500">{subtext}</p>
          {(link || action) && (
            <div className="mt-3">
              {link ? (
                <Link to={link}>
                  <Button size="sm" variant="outline" className="text-xs">
                    Ver Todos
                  </Button>
                </Link>
              ) : (
                <Button size="sm" variant="outline" className="text-xs" onClick={action}>
                  Adicionar
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </CardContent>
  </Card>
);

const AttentionPayments = ({ payments, students, isLoading }) => (
    <Card className="bg-white shadow-sm">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Atenção Pagamentos
            </CardTitle>
        </CardHeader>
        <CardContent>
            {isLoading ? <Skeleton className="h-4 w-full" /> :
             payments.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                    {payments.map(p => {
                        const student = students.find(s => s.email === p.student_email);
                        return (
                            <div key={p.id} className="text-sm p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                                <span className="font-medium">{student?.full_name || p.student_email}</span>
                                <br />
                                <span className="text-gray-600">Status: </span>
                                <Badge className={p.status === 'atrasado' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                                    {p.status}
                                </Badge>
                                {p.due_date && (
                                    <span className="text-xs text-gray-500 block">
                                        Vencimento: {new Date(p.due_date).toLocaleDateString('pt-BR')}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
             ) : (
                <p className="text-sm text-gray-500">✅ Todos os pagamentos estão em dia!</p>
             )
            }
        </CardContent>
    </Card>
);

const RecentActivities = ({ activities, isLoading }) => (
    <Card className="bg-white shadow-sm">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
                <History className="w-5 h-5 text-gray-500" />
                Atividades Recentes
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-3 max-h-32 overflow-y-auto">
            {isLoading ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full" />) :
             activities.length > 0 ? (
                activities.map(act => (
                    <div key={act.id} className="flex justify-between items-start text-sm p-2 hover:bg-gray-50 rounded">
                        <p className="text-gray-700 flex-1">{act.description}</p>
                        <p className="text-gray-500 text-xs flex-shrink-0 ml-4">
                            {formatDistanceToNow(new Date(act.created_date), { addSuffix: true, locale: ptBR })}
                        </p>
                    </div>
                ))
             ) : (
                <p className="text-sm text-gray-500">Nenhuma atividade recente.</p>
             )
            }
            </div>
        </CardContent>
    </Card>
);

const LinkStudentForm = ({ trainer, onStudentLinked }) => {
    const [shareId, setShareId] = useState('');
    const [isLinking, setIsLinking] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLinking(true);
        setError('');
        setSuccess('');

        if (!shareId.trim()) {
            setError("Por favor, insira o ID do aluno.");
            setIsLinking(false);
            return;
        }

        try {
            const allUsers = await User.list(); // Changed from UserAccount to User
            const studentsToLink = allUsers.filter(user => 
                user.unique_share_id === shareId.trim().toUpperCase() && 
                user.user_type === 'student' && 
                user.linked_trainer_email === trainer.email
            );
            
            if (studentsToLink.length === 0) {
                setError(`Nenhum aluno encontrado com este ID.`);
                setIsLinking(false);
                return;
            }

            const student = studentsToLink[0];

            if (student.linked_trainer_email) {
                setError(`Este aluno já está vinculado a ${student.linked_trainer_email === trainer.email ? 'você' : 'outro personal'}.`);
                setIsLinking(false);
                return;
            }

            await User.update(student.id, { linked_trainer_email: trainer.email }); // Changed from UserAccount to User
            
            // Registrar atividade
            // Comentar chamadas a RecentActivity.create pois não existe
            /*
            await RecentActivity.create({
                trainer_email: trainer.email,
                description: `Novo aluno vinculado: ${student.full_name}`,
                link_to: createPageUrl(`StudentDetails?id=${student.id}`)
            });
            */
            
            setSuccess(`Aluno ${student.full_name} vinculado com sucesso!`);
            setShareId('');
            setTimeout(() => {
                onStudentLinked();
            }, 1500);

        } catch (err) {
            console.error("Erro ao vincular aluno:", err);
            setError("Ocorreu um erro inesperado. Tente novamente.");
        } finally {
            setIsLinking(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
                <Label htmlFor="shareId">ID de Compartilhamento do Aluno</Label>
                <Input 
                    id="shareId" 
                    value={shareId} 
                    onChange={e => setShareId(e.target.value)} 
                    placeholder="Ex: ABC12345"
                    required 
                />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Fechar</Button>
                </DialogClose>
                <Button type="submit" disabled={isLinking} className="bg-orange-500 hover:bg-orange-600 text-white">
                    {isLinking ? 'Vinculando...' : 'Vincular Aluno'}
                </Button>
            </DialogFooter>
        </form>
    );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ 
    activeStudents: 0, 
    workoutPlans: 0, 
    dietPlans: 0, 
    progressPercentage: 0,
    lastMonthStudents: 0,
    newStudentsThisMonth: 0,
    unreadMessages: 0
  });
  const [students, setStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        setIsLoading(false);
        return;
      }

      console.log('[DASHBOARD] Usuário logado:', user);

      if (user.user_type === 'personal' || user.user_type === 'admin') {
          const allUsers = await User.list();
          console.log('[DASHBOARD] Todos os usuários:', allUsers);
          
          let currentStudents = [];
          let workoutsCount = 0;
          let dietsCount = 0;
          let unreadMessagesCount = 0;
          let lastMessageInfo = null;
          let activitiesData = [];
          let paymentsData = [];

          if (user.user_type === 'personal') {
              currentStudents = allUsers.filter(u => 
                  u.user_type === 'student' && 
                  u.linked_trainer_email === user.email
              );
              console.log('[DASHBOARD] Alunos filtrados para o treinador:', currentStudents);

              // Fetch trainer's own workout and diet plans
              const [trainerWorkouts, trainerDiets] = await Promise.all([
                  WorkoutPlan.filter({ trainer_email: user.email }),
                  DietPlan.filter({ trainer_email: user.email })
              ]);
              console.log('[DASHBOARD] Treinos encontrados:', trainerWorkouts);
              console.log('[DASHBOARD] Dietas encontradas:', trainerDiets);
              workoutsCount = trainerWorkouts.length;
              dietsCount = trainerDiets.length;

              // Check unread messages for trainer
              if (currentStudents.length > 0) {
                  try {
                      const allMessages = await ChatMessage.list();
                      console.log('[DASHBOARD] Todas as mensagens:', allMessages);
                      const unreadMsgs = allMessages.filter(msg => 
                          msg.receiver_email === user.email && 
                          !msg.is_read
                      );
                      console.log('[DASHBOARD] Mensagens não lidas:', unreadMsgs);
                      unreadMessagesCount = unreadMsgs.length;
                      
                      const receivedMessages = allMessages
                          .filter(msg => msg.receiver_email === user.email)
                          .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
                      
                      if (receivedMessages.length > 0) {
                          const lastMsg = receivedMessages[0];
                          const senderStudent = currentStudents.find(s => s.email === lastMsg.sender_email);
                          if (senderStudent) {
                              lastMessageInfo = {
                                  senderName: senderStudent.full_name,
                                  message: lastMsg.message_type === 'image' ? '📷 Imagem' : 
                                          lastMsg.message_type === 'file' ? '📎 Arquivo' : 
                                          lastMsg.message,
                                  time: lastMsg.created_date
                              };
                          }
                      }
                  } catch (chatError) {
                      console.error('Erro ao buscar mensagens:', chatError);
                  }
              }

              // Fetch payments specific to trainer's students
              if (currentStudents.length > 0) {
                  const studentEmails = currentStudents.map(s => s.email);
                  const allPayments = await Payment.list();
                  paymentsData = allPayments.filter(p => 
                      studentEmails.includes(p.student_email) && 
                      (p.status === 'pendente' || p.status === 'atrasado')
                  );
              }

          } else { // admin
              currentStudents = allUsers.filter(u => u.user_type === 'student');
              
              // For admin, count all workouts/diets in the system if they want to manage them.
              // If only interested in admin's *own* creations, the filter below is correct.
              // Assuming 'trainer_email' in the filter refers to the creator of the plan.
              const [allWorkouts, allDiets] = await Promise.all([
                  WorkoutPlan.list(), // Admin can see all workouts
                  DietPlan.list() // Admin can see all diets
              ]);
              workoutsCount = allWorkouts.length;
              dietsCount = allDiets.length;

              // Admin sees all pending payments
              paymentsData = await Payment.filter({ status: ['pendente', 'atrasado'] });
              
              // Admin does not have personal chat with students, so unreadMessagesCount remains 0
          }

          // Filtro genérico: considera como aluno qualquer usuário diferente do treinador logado
          const allStudents = allUsers.filter(u => u.email !== user.email);
          console.log('[DASHBOARD] Todos os alunos encontrados (genérico):', allStudents);
          allStudents.forEach(u => {
            console.log(`[DASHBOARD] Aluno: ${u.full_name}, linked_trainer_email: ${u.linked_trainer_email}`);
          });

          currentStudents = allUsers.filter(u =>
            u.email !== user.email &&
            u.linked_trainer_email &&
            u.linked_trainer_email.toLowerCase() === user.email.toLowerCase()
          );

          setStudents(currentStudents);
          setPendingPayments(paymentsData); // Set payments here, after conditional logic

          // Recent Activities (Applies to both trainer and admin showing their own activities)
          // RecentActivity.filter não existe, então usamos array vazio temporariamente
          let trainerActs = [];
          // let trainerActs = await RecentActivity.filter({ trainer_email: user.email }, '-created_date', 10);
          
          // Add activity for new message if applicable (trainer-specific logic)
          if (user.user_type === 'personal' && unreadMessagesCount > 0 && lastMessageInfo) {
              const hasRecentChatActivity = trainerActs.some(act => 
                  act.description.includes('Nova mensagem') && 
                  (new Date().getTime() - new Date(act.created_date).getTime()) < 60000 
              );
              
              if (!hasRecentChatActivity) {
                  try {
                      // Comentar chamadas a RecentActivity.create pois não existe
                      /*
                      await RecentActivity.create({
                          trainer_email: user.email,
                          description: `Nova mensagem de ${lastMessageInfo.senderName}: ${lastMessageInfo.message.substring(0, 50)}${lastMessageInfo.message.length > 50 ? '...' : ''}`,
                          link_to: createPageUrl('Chat')
                      });
                      */
                      // trainerActs = await RecentActivity.filter({ trainer_email: user.email }, '-created_date', 10);
                  } catch (activityError) {
                      console.error('Erro ao criar atividade de chat:', activityError);
                  }
              }
          }

          // If no recent activities linked to the current user, create some defaults
          if (trainerActs.length === 0) {
              const activitiesToCreate = [];
              
              if (currentStudents.length > 0) {
                  activitiesToCreate.push({
                      trainer_email: user.email,
                      description: `${currentStudents.length} aluno${currentStudents.length !== 1 ? 's' : ''} vinculado${currentStudents.length !== 1 ? 's' : ''} ao seu perfil`,
                      link_to: createPageUrl('Students')
                  });
              }
              
              if (workoutsCount > 0) {
                  activitiesToCreate.push({
                      trainer_email: user.email,
                      description: `${workoutsCount} treino${workoutsCount !== 1 ? 's' : ''} criado${workoutsCount !== 1 ? 's' : ''}`,
                      link_to: createPageUrl('Workouts')
                  });
              }
              
              if (dietsCount > 0) {
                  activitiesToCreate.push({
                      trainer_email: user.email,
                      description: `${dietsCount} dieta${dietsCount !== 1 ? 's' : ''} criada${dietsCount !== 1 ? 's' : ''}`,
                      link_to: createPageUrl('Diets')
                  });
              }
              
              if (activitiesToCreate.length === 0) {
                  activitiesToCreate.push({
                      trainer_email: user.email,
                      description: 'Bem-vindo ao MisterFit! Comece vinculando seus alunos.',
                      link_to: createPageUrl('Students')
                  });
              }
              
              // Comentar chamadas a RecentActivity.create pois não existe
              /*
              for (const activity of activitiesToCreate) {
                  await RecentActivity.create(activity);
              }
              */
              // trainerActs = await RecentActivity.filter({ trainer_email: user.email }, '-created_date', 10);
          }
          activitiesData = trainerActs;
          setActivities(activitiesData);

          // Calculate monthly growth using currentStudents
          const oneMonthAgo = subMonths(new Date(), 1);
          const studentsLastMonth = currentStudents.filter(s => 
              new Date(s.created_date) <= oneMonthAgo
          ).length;
          
          const studentsThisMonth = currentStudents.filter(s => 
              new Date(s.created_date) > oneMonthAgo
          ).length;
          
          const currentStudentsCount = currentStudents.length;
          const growth = studentsLastMonth > 0 
              ? Math.round(((currentStudentsCount - studentsLastMonth) / studentsLastMonth) * 100)
              : currentStudentsCount > 0 ? 100 : 0;

          setStats({
              activeStudents: currentStudentsCount,
              workoutPlans: workoutsCount,
              dietPlans: dietsCount,
              progressPercentage: Math.max(0, growth),
              lastMonthStudents: studentsLastMonth,
              newStudentsThisMonth: studentsThisMonth,
              unreadMessages: unreadMessagesCount
          });
          console.log('[DASHBOARD] Stats finais:', {
              activeStudents: currentStudentsCount,
              workoutPlans: workoutsCount,
              dietPlans: dietsCount,
              progressPercentage: Math.max(0, growth),
              lastMonthStudents: studentsLastMonth,
              newStudentsThisMonth: studentsThisMonth,
              unreadMessages: unreadMessagesCount
          });
      }

    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchUnread = () => {
      if (user) {
        api.getUnreadChatCount()
          .then(res => setUnreadChatCount(res.unreadCount || 0))
          .catch(() => setUnreadChatCount(0));
      }
    };
    fetchUnread(); // Busca inicial
    const interval = setInterval(fetchUnread, 30000); // Atualiza a cada 30s
    return () => clearInterval(interval);
  }, [user]);

  const handleStudentLinked = () => {
    setIsFormOpen(false);
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Header com foto e nome do personal */}
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={user?.profile_photo} />
          <AvatarFallback className="text-xl bg-orange-100 text-orange-600">
            {user?.full_name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">
            Olá, {user ? user.full_name.split(' ')[0] : 'Personal'}!
          </h1>
          <p className="text-gray-500">
            Bem-vindo de volta! Aqui está um resumo da sua atividade.
          </p>
          <Badge className="mt-1 bg-blue-100 text-blue-800 capitalize">
            {user?.user_type === 'personal' ? 'Personal Trainer' : user?.user_type}
          </Badge>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 24, right: 32, zIndex: 10 }}>
        <Link to={createPageUrl('Chat')} style={{ position: 'relative', display: 'inline-block' }}>
          <MessageSquare size={32} color="#856404" />
          {unreadChatCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -6,
              right: -6,
              background: 'red',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 7px',
              fontSize: 12,
              fontWeight: 'bold',
              minWidth: 22,
              textAlign: 'center',
              border: '2px solid #fff'
            }}>
              {unreadChatCount}
            </span>
          )}
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Alunos Ativos" 
          value={stats.activeStudents} 
          subtext={stats.activeStudents === 0 ? "Adicione seu primeiro aluno" : `${stats.newStudentsThisMonth} novo${stats.newStudentsThisMonth !== 1 ? 's' : ''} este mês`}
          icon={Users} 
          isLoading={isLoading} 
          link={stats.activeStudents > 0 ? createPageUrl('Students') : null}
          action={stats.activeStudents === 0 ? () => setIsFormOpen(true) : null}
          variant={stats.activeStudents === 0 ? 'highlight' : 'normal'}
        />
        <StatCard 
          title="Treinos Criados" 
          value={stats.workoutPlans} 
          subtext={stats.workoutPlans === 0 ? "Crie seu primeiro treino" : `${Math.round(stats.workoutPlans / Math.max(stats.activeStudents, 1) * 100) / 100} por aluno`}
          icon={ClipboardList} 
          isLoading={isLoading} 
          link={createPageUrl('Workouts')}
        />
        <StatCard 
          title="Dietas Criadas" 
          value={stats.dietPlans} 
          subtext={stats.dietPlans === 0 ? "Crie sua primeira dieta" : `${Math.round(stats.dietPlans / Math.max(stats.activeStudents, 1) * 100) / 100} por aluno`}
          icon={Salad} 
          isLoading={isLoading} 
          link={createPageUrl('Diets')}
        />
        <StatCard 
          title="Crescimento" 
          value={`${stats.progressPercentage >= 0 ? '+' : ''}${stats.progressPercentage}%`} 
          subtext={stats.progressPercentage > 0 ? "Crescimento este mês" : stats.progressPercentage < 0 ? "Redução este mês" : "Sem variação este mês"}
          icon={TrendingUp} 
          isLoading={isLoading} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttentionPayments payments={pendingPayments} students={students} isLoading={isLoading} />
        <RecentActivities activities={activities} isLoading={isLoading} />
      </div>

      {/* Modal para vincular aluno */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular Novo Aluno</DialogTitle>
            <DialogDescription>
              Insira o ID de compartilhamento fornecido pelo seu aluno para vinculá-lo à sua conta.
            </DialogDescription>
          </DialogHeader>
          {user && <LinkStudentForm trainer={user} onStudentLinked={handleStudentLinked} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
