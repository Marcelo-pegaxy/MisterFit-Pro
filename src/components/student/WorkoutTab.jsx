import React, { useState, useEffect } from 'react';
import { WorkoutPlan } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Target, Calendar, Clock, MoreHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AssignWorkoutDialog = ({ trainer, student, onWorkoutAssigned }) => {
  const [availableWorkouts, setAvailableWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    const fetchAvailableWorkouts = async () => {
      setIsLoading(true);
      try {
        // Buscar treinos do personal que não estão atribuídos a nenhum aluno
        const allWorkouts = await WorkoutPlan.available({ trainer_email: trainer.email });
        const unassignedWorkouts = allWorkouts.filter(w => (!w.student_id && !w.aluno_id));
        setAvailableWorkouts(unassignedWorkouts);
      } catch (error) {
        console.error("Erro ao buscar treinos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailableWorkouts();
  }, [trainer.email]);

  const handleAssignWorkout = async (workout) => {
    setIsAssigning(true);
    try {
      await WorkoutPlan.update(workout.id, { student_id: student.id });
      onWorkoutAssigned();
    } catch (error) {
      console.error("Erro ao atribuir treino:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Atribuir Treino para {student.full_name}</DialogTitle>
        <DialogDescription>
          Selecione um treino da sua biblioteca para atribuir ao aluno.
        </DialogDescription>
      </DialogHeader>
      
      <div className="max-h-96 overflow-y-auto space-y-3 p-1">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : availableWorkouts.length > 0 ? (
          availableWorkouts.map(workout => (
            <Card key={workout.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{workout.name}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">{workout.description}</CardDescription>
                  </div>
                  <Button 
                    onClick={() => handleAssignWorkout(workout)}
                    disabled={isAssigning}
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white flex-shrink-0"
                  >
                    {isAssigning ? 'Atribuindo...' : 'Atribuir'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">
                    {(workout.exercises || []).length} exercícios
                  </Badge>
                  {workout.next_assessment_date && (
                    <Badge variant="secondary">
                      Reavaliação: {format(new Date(workout.next_assessment_date), 'dd/MM/yyyy')}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum treino disponível para atribuir.</p>
            <p className="text-sm text-gray-400 mt-1">Crie treinos na aba "Criar Treinos" primeiro.</p>
          </div>
        )}
      </div>
    </DialogContent>
  );
};

export default function WorkoutTab({ student, trainer }) {
  const [studentWorkouts, setStudentWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudentWorkouts = async () => {
    setIsLoading(true);
    try {
      // Buscar treinos atribuídos especificamente a este aluno
      const workouts = await WorkoutPlan.filter({ student_id: student.id });
      console.log('Treinos encontrados para o aluno:', workouts);
      setStudentWorkouts(workouts);
    } catch (error) {
      console.error("Erro ao buscar treinos do aluno:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentWorkouts();
  }, [student.id]);

  const handleWorkoutAssigned = () => {
    fetchStudentWorkouts(); // Recarregar a lista
  };

  const handleRemoveWorkout = async (workoutId) => {
    try {
      // Remove a atribuição do treino (limpa o student_email)
      await WorkoutPlan.update(workoutId, { student_email: null });
      fetchStudentWorkouts();
    } catch (error) {
      console.error("Erro ao remover treino:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Treinos Atribuídos</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <PlusCircle className="w-4 h-4 mr-2" />
              Atribuir Treino
            </Button>
          </DialogTrigger>
          <AssignWorkoutDialog 
            trainer={trainer} 
            student={student} 
            onWorkoutAssigned={handleWorkoutAssigned}
          />
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
        ) : studentWorkouts.length > 0 ? (
          studentWorkouts.map(workout => (
            <Card key={workout.id} className="hover:shadow-md transition-shadow">
              {workout.image_url && (
                <img src={workout.image_url} alt={workout.name} className="w-full h-40 object-cover rounded-t-lg" />
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{workout.name}</CardTitle>
                    <CardDescription className="mt-1">{workout.description}</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemoveWorkout(workout.id)}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap mb-4">
                  <Badge variant="outline">
                    <Target className="w-3 h-3 mr-1" />
                    {(workout.exercises || []).length} exercícios
                  </Badge>
                  {workout.next_assessment_date && (
                    <Badge variant="secondary">
                      <Calendar className="w-3 h-3 mr-1" />
                      Reavaliação: {format(new Date(workout.next_assessment_date), 'dd/MM/yyyy')}
                    </Badge>
                  )}
                </div>
                
                {/* Lista de exercícios */}
                {workout.exercises && workout.exercises.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Exercícios:</h4>
                    <div className="space-y-1">
                      {workout.exercises.slice(0, 3).map((exercise, index) => (
                        <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <strong>{exercise.exercise_name}</strong>
                          {exercise.sets && exercise.reps && (
                            <span className="ml-2">- {exercise.sets} séries x {exercise.reps} repetições</span>
                          )}
                        </div>
                      ))}
                      {workout.exercises.length > 3 && (
                        <p className="text-xs text-gray-500">+ {workout.exercises.length - 3} exercícios</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum Treino Atribuído</h3>
              <p className="text-gray-500 mb-4">Este aluno ainda não possui treinos atribuídos.</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Atribuir Primeiro Treino
                  </Button>
                </DialogTrigger>
                <AssignWorkoutDialog 
                  trainer={trainer} 
                  student={student} 
                  onWorkoutAssigned={handleWorkoutAssigned}
                />
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}