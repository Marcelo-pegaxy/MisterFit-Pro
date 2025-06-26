import React, { useState, useEffect } from 'react';
import { WorkoutPlan } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dumbbell, Play, Clock, Zap, RotateCcw, Calendar, Video, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

const ExerciseCard = ({ exercise, index }) => {
    const [isOpen, setIsOpen] = useState(false);
    const exerciseName = exercise.exercise?.name || exercise.exercise_name || 'Exercício';
    return (
        <Card className="mb-4">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-semibold text-sm">
                                    {index + 1}
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{exerciseName}</CardTitle>
                                    <div className="flex flex-wrap gap-2 mt-1 items-center">
                                        {exercise.sets && (
                                            <Badge variant="outline" className="text-xs">
                                                {exercise.sets} séries
                                            </Badge>
                                        )}
                                        {exercise.reps && (
                                            <Badge variant="outline" className="text-xs">
                                                {exercise.reps} repetições
                                            </Badge>
                                        )}
                                        {exercise.rest_period && (
                                            <Badge variant="outline" className="text-xs">
                                                {exercise.rest_period} descanso
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {exercise.intensity && (
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm"><strong>Intensidade:</strong> {exercise.intensity}</span>
                                </div>
                            )}
                            {exercise.recommended_frequency && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm"><strong>Frequência Recomendada:</strong> {exercise.recommended_frequency}</span>
                                </div>
                            )}
                        </div>
                        {exercise.notes && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                <h4 className="font-medium text-blue-800 mb-2">📋 Observações</h4>
                                <p className="text-sm text-blue-700">{exercise.notes}</p>
                            </div>
                        )}
                        {exercise.execution_notes && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                <h4 className="font-medium text-blue-800 mb-2">📋 Observações de Execução</h4>
                                <p className="text-sm text-blue-700">{exercise.execution_notes}</p>
                            </div>
                        )}
                        {exercise.planned_progression && (
                            <div className="mb-4 p-3 bg-green-50 rounded-lg">
                                <h4 className="font-medium text-green-800 mb-2">📈 Progressão Planejada</h4>
                                <p className="text-sm text-green-700">{exercise.planned_progression}</p>
                            </div>
                        )}
                        {exercise.video_url && (
                            <div className="mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(exercise.video_url, '_blank')}
                                    className="w-full md:w-auto"
                                >
                                    <Video className="w-4 h-4 mr-2" />
                                    Ver Vídeo Explicativo
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
};

const WorkoutCard = ({ workout }) => {
    const [expandedExercises, setExpandedExercises] = useState(false);
    
    return (
        <Card className="mb-4 p-2 h-full flex flex-col justify-between">
            <CardHeader>
                {workout.image_url && (
                    <img 
                        src={workout.image_url} 
                        alt={workout.name}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                )}
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl mb-2">{workout.name}</CardTitle>
                        <CardDescription className="text-base">{workout.description}</CardDescription>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                        {(workout.exercises || workout.workout_exercises || []).length} exercícios
                    </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {workout.created_date && !isNaN(new Date(workout.created_date)) ? (
                            <>Criado {formatDistanceToNow(new Date(workout.created_date), { addSuffix: true, locale: ptBR })}</>
                        ) : (
                            <>Data de criação não disponível</>
                        )}
                    </div>
                    {workout.next_assessment_date && !isNaN(new Date(workout.next_assessment_date)) && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            Reavaliação em {new Date(workout.next_assessment_date).toLocaleDateString('pt-BR')}
                        </div>
                    )}
                </div>
            </CardHeader>
            
            <CardContent>
                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2 mb-4">
                        <Dumbbell className="w-5 h-5 text-orange-500" />
                        Lista de Exercícios
                    </h3>
                    {((workout.exercises || workout.workout_exercises || []).length > 0) ? (
                        <div>
                            {(workout.exercises || workout.workout_exercises || []).map((exercise, index) => (
                                <ExerciseCard key={index} exercise={exercise} index={index} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">
                            Nenhum exercício cadastrado neste treino ainda.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default function StudentWorkout() {
    const [workouts, setWorkouts] = useState([]);
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWorkouts = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }
            // Buscar treinos do aluno
            const plans = await WorkoutPlan.filter({ student_id: user.id });
            setWorkouts(plans);
            setIsLoading(false);
        };
        fetchWorkouts();
    }, [user]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <Dumbbell className="w-8 h-8 text-orange-500" />
                    Meus Treinos
                </h1>
                <p className="text-gray-500 mt-2">
                    {workouts.length > 0 
                        ? `Você tem ${workouts.length} treino${workouts.length !== 1 ? 's' : ''} personalizado${workouts.length !== 1 ? 's' : ''} disponível${workouts.length !== 1 ? 'eis' : ''}.`
                        : 'Quando seu personal trainer criar treinos para você, eles aparecerão aqui.'
                    }
                </p>
            </div>

            {workouts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                    {workouts.map((workout) => (
                        <WorkoutCard key={workout.id} workout={workout} />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="text-center py-16">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-gray-100 rounded-full">
                                <Dumbbell className="w-12 h-12 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                                    Nenhum treino disponível
                                </h3>
                                <p className="text-gray-500 max-w-md">
                                    Seus treinos personalizados aparecerão aqui quando seu personal trainer os criar. 
                                    Entre em contato com ele para receber seu primeiro treino!
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}