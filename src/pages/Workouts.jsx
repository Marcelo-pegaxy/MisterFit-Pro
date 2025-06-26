import React, { useState, useEffect } from 'react';
import { WorkoutPlan } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { PlusCircle, ListChecks, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import WorkoutForm from '@/components/workouts/WorkoutForm';
import { useAuth } from '@/contexts/AuthContext';

const WorkoutList = ({ plans, students, onEdit, onDelete }) => {
    const getStudentName = (email) => {
        if (!email) return "Não atribuído";
        const student = students.find(s => s.email === email);
        return student ? student.full_name : email; // Changed from 'name' to 'full_name'
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => (
                <Card key={plan.id} className="hover:shadow-lg transition-shadow flex flex-col">
                    {plan.image_url && (
                        <img src={plan.image_url} alt={plan.title || plan.name} className="w-full h-40 object-cover rounded-t-lg" />
                    )}
                    <CardHeader>
                        <div className="flex justify-between items-start">
                           <CardTitle>{plan.title || plan.name}</CardTitle>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEdit(plan)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDelete(plan.id)} className="text-red-600">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Excluir
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <CardDescription>
                            Para: <Badge variant={plan.student_email ? "secondary" : "outline"}>
                                {getStudentName(plan.student_email)}
                            </Badge>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-sm text-gray-600 line-clamp-2">{plan.description}</p>
                        <p className="text-sm text-gray-500 mt-2">{(plan.workout_exercises ? plan.workout_exercises.length : 0)} exercícios</p>
                        {plan.workout_exercises && plan.workout_exercises.length > 0 && (
                          <ul className="mt-2 text-xs text-gray-700">
                            {plan.workout_exercises.map((we, idx) =>
                              <li key={we.id || idx} className="mb-2">
                                <div>{we.exercise?.name || 'Exercício não encontrado'}</div>
                                {we.video_url && (
                                  <video controls width="100%" className="mt-1 rounded">
                                    <source src={we.video_url} type="video/mp4" />
                                    Seu navegador não suporta vídeo.
                                  </video>
                                )}
                              </li>
                            )}
                          </ul>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

const EmptyState = ({ onNewWorkout }) => (
    <Card>
        <div className="text-center py-16 px-4 flex flex-col items-center">
            <div className="p-4 bg-gray-100 rounded-full">
                <ListChecks className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-gray-800">Nenhum treino criado ainda</h2>
            <p className="mt-2 text-sm text-gray-500">Comece adicionando seu primeiro plano de treino.</p>
            <Button onClick={onNewWorkout} className="mt-6 bg-orange-500 hover:bg-orange-600 text-white">
                <PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Treino
            </Button>
        </div>
    </Card>
);

const mapWorkoutForEdit = (plan) => ({
  id: plan.id,
  name: plan.title || '',
  description: plan.description || '',
  image_url: plan.image_url || '',
  next_assessment_date: plan.next_assessment_date ? new Date(plan.next_assessment_date) : null,
  student_email: plan.student_email || '',
  exercises: (plan.workout_exercises || []).map(we => ({
    exercise_name: we.exercise?.name || '',
    sets: we.sets || '',
    reps: we.reps || '',
    intensity: '',
    rest_interval: we.rest_period || '',
    recommended_frequency: '',
    planned_progression: '',
    execution_notes: we.notes || '',
    video_url: '',
  }))
});

export default function Workouts() {
    const { user } = useAuth();
    const [workoutPlans, setWorkoutPlans] = useState([]);
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingWorkout, setEditingWorkout] = useState(null); // New state for editing

    const fetchData = async (currentUser) => {
        if (!currentUser) {
            setIsLoading(false); // Ensure loading state is reset if no user
            return;
        }
        setIsLoading(true);
        try {
            let plans = [];
            if (currentUser.user_type === 'personal') {
                plans = await WorkoutPlan.filter({ trainer_email: currentUser.email });
            } else if (currentUser.user_type === 'aluno' || currentUser.user_type === 'student') {
                plans = await WorkoutPlan.filter({ student_id: currentUser.id }, '-created_date');
            }
            setWorkoutPlans(plans);
            setStudents([]); // Corrigido: não busca alunos por enquanto
        } catch (error) {
            console.error("Error fetching workout data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData(user);
        } else {
            setIsLoading(false);
        }
    }, [user]);
    
    const handleFormFinished = () => {
        setIsFormOpen(false);
        setEditingWorkout(null); // Clear editing state
        fetchData(user); // Re-fetch data after form submission
    };

    const handleNewWorkout = () => {
        setEditingWorkout(null); // Ensure no workout is being edited
        setIsFormOpen(true);
    };

    const handleEditWorkout = (workout) => {
        setEditingWorkout(mapWorkoutForEdit(workout));
        setIsFormOpen(true);
    };

    const handleDeleteWorkout = async (workoutId) => {
        if (window.confirm("Tem certeza que deseja excluir este treino? Esta ação não pode ser desfeita.")) {
            try {
                setIsLoading(true); // Show loading while deleting
                await WorkoutPlan.delete(workoutId);
                fetchData(user); // Re-fetch data to update list
            } catch (error) {
                console.error("Erro ao excluir treino:", error);
                setIsLoading(false); // Stop loading on error
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Criar Treinos</h1>
                    <p className="text-gray-500">Elabore treinos personalizados para seus alunos.</p>
                </div>
                 <Button onClick={handleNewWorkout} className="bg-orange-500 hover:bg-orange-600 text-white">
                     <PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Treino
                 </Button>
            </div>

            <div>
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-lg" />)}
                    </div>
                ) : workoutPlans.length > 0 ? (
                    <WorkoutList 
                        plans={workoutPlans} 
                        students={students} 
                        onEdit={handleEditWorkout} 
                        onDelete={handleDeleteWorkout} 
                    />
                ) : (
                    <EmptyState onNewWorkout={handleNewWorkout} />
                )}
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-3xl">
                     <DialogHeader>
                        <DialogTitle>{editingWorkout ? 'Editar Treino' : 'Criar Novo Treino'}</DialogTitle>
                        <DialogDescription>
                           {editingWorkout ? 'Altere os detalhes do treino abaixo.' : 'Preencha os detalhes do novo treino.'}
                        </DialogDescription>
                    </DialogHeader>
                    <WorkoutForm 
                        user={user} 
                        students={students} 
                        onFinished={handleFormFinished} 
                        existingWorkout={editingWorkout} // Pass existing workout for editing
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
