console.log('=== STUDENT DETAILS JSX CARREGADO ===');

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiService from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, ArrowLeft, Mail, Phone, Dumbbell, Salad, ClipboardCheck, PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

const StatCard = ({ label, value, icon: Icon }) => (
    <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4">
        <div className="bg-orange-100 p-3 rounded-full">
            <Icon className="w-6 h-6 text-orange-600" />
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-lg font-bold">{value}</p>
        </div>
    </div>
);

function VincularTreinoModal({ trainerEmail, studentId, onVinculado }) {
    console.log('VincularTreinoModal montado!');
    const [workouts, setWorkouts] = useState([]);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        console.log('useEffect do VincularTreinoModal rodou!');
        apiService.getAvailableWorkouts(trainerEmail).then(res => {
            console.log('DEBUG - treinos disponíveis:', res);
            setWorkouts(Array.isArray(res) ? res : res.data);
        });
    }, [trainerEmail]);

    const handleVincular = async () => {
        await apiService.assignWorkoutToStudent(selected, studentId);
        onVinculado();
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Novo Treino
                </Button>
            </DialogTrigger>
            <DialogContent>
                <h2 className="text-lg font-bold mb-4">Vincular Treino Existente</h2>
                <ul>
                    {workouts.map(w => (
                        <li key={w.id} className="mb-2">
                            <label>
                                <input
                                    type="radio"
                                    name="workout"
                                    value={w.id}
                                    onChange={() => setSelected(w.id)}
                                />
                                <span className="ml-2">{w.title || w.name || w.nome}</span>
                            </label>
                        </li>
                    ))}
                </ul>
                <Button onClick={handleVincular} disabled={!selected} className="mt-4">
                    Vincular
                </Button>
            </DialogContent>
        </Dialog>
    );
}

function VincularDietaModal({ studentId, onVinculado }) {
    const [diets, setDiets] = useState([]);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        apiService.getAvailableDiets(studentId).then(res => setDiets(res.data || res));
    }, [studentId]);

    const handleVincular = async () => {
        await apiService.assignDietToStudent(selected, studentId);
        onVinculado();
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Nova Dieta
                </Button>
            </DialogTrigger>
            <DialogContent>
                <h2 className="text-lg font-bold mb-4">Vincular Dieta Existente</h2>
                <ul>
                    {diets.map(d => (
                        <li key={d.id} className="mb-2">
                            <label>
                                <input
                                    type="radio"
                                    name="diet"
                                    value={d.id}
                                    onChange={() => setSelected(d.id)}
                                />
                                <span className="ml-2">{d.title}</span>
                            </label>
                        </li>
                    ))}
                </ul>
                <Button onClick={handleVincular} disabled={!selected} className="mt-4">
                    Vincular
                </Button>
            </DialogContent>
        </Dialog>
    );
}

function NovaAvaliacaoModal({ studentId, onAvaliacaoCriada }) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        assessment_date: '',
        health_history: '',
        activity_history: '',
        goals: '',
        physical_limitations: '',
        availability_frequency: '',
        availability_duration: '',
        availability_times: '',
        weight: '',
        height: '',
        body_fat_percentage: '',
        muscle_mass: '',
        imc: '',
        strength_tests: '',
        flexibility: '',
        cardio: '',
        posture: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await apiService.createAssessment({
                ...form,
                aluno_id: studentId,
                personal_id: user.id
            });
            setOpen(false);
            setForm({
                assessment_date: '', health_history: '', activity_history: '', goals: '', physical_limitations: '',
                availability_frequency: '', availability_duration: '', availability_times: '', weight: '', height: '',
                body_fat_percentage: '', muscle_mass: '', imc: '', strength_tests: '', flexibility: '', cardio: '', posture: '', notes: ''
            });
            onAvaliacaoCriada();
        } catch (err) {
            setError('Erro ao salvar avaliação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" onClick={() => setOpen(true)}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Nova Avaliação
                </Button>
            </DialogTrigger>
            <DialogContent style={{ maxWidth: 700 }}>
                <h2 className="text-lg font-bold mb-2">Nova Avaliação Detalhada</h2>
                <p className="text-sm text-gray-500 mb-4">Preencha os dados da Anamnese e Avaliação Física.</p>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label>Data da Avaliação</label>
                            <input type="date" name="assessment_date" value={form.assessment_date} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                        </div>
                    </div>
                    <hr />
                    <h3 className="font-bold">Anamnese Completa</h3>
                    <div>
                        <label>Histórico de Saúde (Lesões, cirurgias, medicamentos)</label>
                        <textarea name="health_history" value={form.health_history} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                    </div>
                    <div>
                        <label>Histórico de Atividade Física (Experiência, modalidades)</label>
                        <textarea name="activity_history" value={form.activity_history} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                    </div>
                    <div>
                        <label>Objetivos Específicos</label>
                        <textarea name="goals" value={form.goals} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                    </div>
                    <div>
                        <label>Limitações Físicas (Restrições, dores, desconfortos)</label>
                        <textarea name="physical_limitations" value={form.physical_limitations} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label>Disponibilidade: Frequência Semanal</label>
                            <input name="availability_frequency" value={form.availability_frequency} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                        </div>
                        <div>
                            <label>Disponibilidade: Tempo por Sessão</label>
                            <input name="availability_duration" value={form.availability_duration} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                        </div>
                        <div>
                            <label>Disponibilidade: Horários Preferenciais</label>
                            <input name="availability_times" value={form.availability_times} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                        </div>
                    </div>
                    <hr />
                    <h3 className="font-bold text-blue-600">Avaliação Física</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label>Peso (kg)</label>
                            <input type="number" step="0.01" name="weight" value={form.weight} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                        </div>
                        <div>
                            <label>Altura (m)</label>
                            <input type="number" step="0.01" name="height" value={form.height} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                        </div>
                        <div>
                            <label>% Gordura Corporal</label>
                            <input type="number" step="0.1" name="body_fat_percentage" value={form.body_fat_percentage} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label>Massa Muscular (kg ou descrição)</label>
                            <input name="muscle_mass" value={form.muscle_mass} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                        </div>
                        <div>
                            <label>IMC (campo livre)</label>
                            <input name="imc" value={form.imc} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                        </div>
                    </div>
                    <div>
                        <label>Testes de Força</label>
                        <textarea name="strength_tests" value={form.strength_tests} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                    </div>
                    <div>
                        <label>Flexibilidade</label>
                        <textarea name="flexibility" value={form.flexibility} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                    </div>
                    <div>
                        <label>Capacidade Cardiovascular</label>
                        <textarea name="cardio" value={form.cardio} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                    </div>
                    <div>
                        <label>Postura e Biomecânica</label>
                        <textarea name="posture" value={form.posture} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                    </div>
                    <div>
                        <label>Observações</label>
                        <textarea name="notes" value={form.notes} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                    </div>
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Registrar Avaliação'}</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DetalheAvaliacaoModal({ avaliacao, open, onClose }) {
    if (!avaliacao) return null;
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent style={{ maxWidth: 700 }}>
                <h2 className="text-lg font-bold mb-2">Detalhes da Avaliação</h2>
                <div className="space-y-2">
                    <div><b>Data:</b> {avaliacao.assessment_date ? new Date(avaliacao.assessment_date).toLocaleDateString() : '-'}</div>
                    <div><b>Peso:</b> {avaliacao.weight || '-'} kg</div>
                    <div><b>Altura:</b> {avaliacao.height || '-'} cm</div>
                    <div><b>% Gordura:</b> {avaliacao.body_fat_percentage || '-'}</div>
                    <div><b>Massa Muscular:</b> {avaliacao.muscle_mass || '-'}</div>
                    <div><b>IMC:</b> {avaliacao.imc || '-'}</div>
                    <div><b>Histórico de Saúde:</b> {avaliacao.health_history || '-'}</div>
                    <div><b>Histórico de Atividade Física:</b> {avaliacao.activity_history || '-'}</div>
                    <div><b>Objetivos:</b> {avaliacao.goals || '-'}</div>
                    <div><b>Limitações Físicas:</b> {avaliacao.physical_limitations || '-'}</div>
                    <div><b>Disponibilidade:</b> {avaliacao.availability_frequency || '-'}x/semana, {avaliacao.availability_duration || '-'} min, {avaliacao.availability_times || '-'}</div>
                    <div><b>Testes de Força:</b> {avaliacao.strength_tests || '-'}</div>
                    <div><b>Flexibilidade:</b> {avaliacao.flexibility || '-'}</div>
                    <div><b>Capacidade Cardiovascular:</b> {avaliacao.cardio || '-'}</div>
                    <div><b>Postura e Biomecânica:</b> {avaliacao.posture || '-'}</div>
                    <div><b>Observações:</b> {avaliacao.notes || '-'}</div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function DetalheTreinoModal({ treino, open, onClose }) {
    if (!treino) return null;
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent style={{ maxWidth: 700 }}>
                <h2 className="text-lg font-bold mb-2">Detalhes do Treino</h2>
                <div className="space-y-2">
                    <div><b>Título:</b> {treino.title || '-'}</div>
                    <div><b>Descrição:</b> {treino.description || '-'}</div>
                    <div><b>Exercícios:</b></div>
                    {treino.workout_exercises && treino.workout_exercises.length > 0 ? (
                        <ul style={{ marginLeft: 16 }}>
                            {treino.workout_exercises.map(we => (
                                <li key={we.id}>
                                    {we.exercise?.name || 'Exercício'} — {we.sets}x{we.reps} {we.rest_period ? `(Descanso: ${we.rest_period}s)` : ''}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div style={{ color: '#888', fontSize: 12 }}>Sem exercícios cadastrados</div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function DetalheDietaModal({ dieta, open, onClose }) {
    if (!dieta) return null;
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent style={{ maxWidth: 700 }}>
                <h2 className="text-lg font-bold mb-2">Detalhes da Dieta</h2>
                <div className="space-y-2">
                    <div><b>Título:</b> {dieta.title || '-'}</div>
                    <div><b>Descrição:</b> {dieta.description || '-'}</div>
                    <div><b>Refeições:</b></div>
                    {dieta.meals && dieta.meals.length > 0 ? (
                        <ul style={{ marginLeft: 16 }}>
                            {dieta.meals.map(meal => (
                                <li key={meal.id}>
                                    {meal.meal_time ? `${meal.meal_time}: ` : ''}
                                    {meal.description}
                                    {meal.calories ? ` (${meal.calories} kcal)` : ''}
                                    {meal.foods && meal.foods.length > 0 && (
                                        <ul style={{ marginLeft: 16 }}>
                                            {meal.foods.map(food => (
                                                <li key={food.id}>
                                                    {food.food_name} — {food.quantity} {food.calories ? `(${food.calories} kcal)` : ''}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div style={{ color: '#888', fontSize: 12 }}>Sem refeições cadastradas</div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function StudentDetails() {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [workoutPlans, setWorkoutPlans] = useState([]);
    const [dietPlans, setDietPlans] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState(null);
    const [treinoSelecionado, setTreinoSelecionado] = useState(null);
    const [dietaSelecionada, setDietaSelecionada] = useState(null);
    const { user } = useAuth();

    // Defina a função fora do useEffect
    const fetchStudentData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const studentRes = await apiService.getStudentDetails(id);
            setStudent(studentRes);
        } catch (err) {
            setError('Falha ao carregar dados do aluno.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Buscar planos de treino atribuídos ao aluno
    const fetchStudentWorkouts = async (studentId) => {
        try {
            const plans = await apiService.getStudentWorkoutPlans(studentId);
            setWorkoutPlans(Array.isArray(plans) ? plans : plans.data);
        } catch (err) {
            setWorkoutPlans([]);
        }
    };

    // Buscar dietas atribuídas ao aluno
    const fetchStudentDiets = async (studentId) => {
        try {
            const diets = await apiService.getStudentDietPlans(studentId);
            setDietPlans(Array.isArray(diets) ? diets : diets.data);
        } catch (err) {
            setDietPlans([]);
        }
    };

    // Buscar avaliações físicas do aluno
    const fetchStudentAssessments = async (studentId) => {
        try {
            const assessments = await apiService.getStudentAssessments(studentId);
            setAssessments(Array.isArray(assessments) ? assessments : assessments.data);
        } catch (err) {
            setAssessments([]);
        }
    };

    useEffect(() => {
        if (id) {
            fetchStudentData();
        }
    }, [id]);

    useEffect(() => {
        if (student && student.id) {
            fetchStudentWorkouts(student.id);
            fetchStudentDiets(student.id);
            fetchStudentAssessments(student.id);
        }
    }, [student]);

    // Log para depuração
    useEffect(() => {
        if (student) {
            console.log('DEBUG - student:', student);
        }
    }, [student]);

    console.log('Entrou no StudentDetails.jsx, student:', student, 'isLoading:', isLoading, 'error:', error);
    if (isLoading) {
        console.log('Return: isLoading');
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <p className="ml-2">Carregando detalhes do aluno...</p>
            </div>
        );
    }

    if (error) {
        console.log('Return: error');
        return (
            <div className="text-center py-10">
                <p className="text-red-500">{error}</p>
                <Link to="/students">
                    <Button variant="link" className="mt-2">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar para Alunos
                    </Button>
                </Link>
            </div>
        );
    }

    if (!student || !student.id) {
        console.log('Return: !student || !student.id');
        return <div>
            <p className="text-center py-10">Aluno não encontrado.</p>
            <pre style={{textAlign: 'left', color: 'red'}}>{JSON.stringify(student, null, 2)}</pre>
        </div>;
    }

    // Antes de renderizar o modal de treino
    console.log('Renderizando VincularTreinoModal com student.id:', student?.id);

    const handleDeleteWorkout = async (id) => {
        if (window.confirm('Tem certeza que deseja remover este treino?')) {
            await apiService.unassignWorkoutFromStudent(id);
            fetchStudentWorkouts(student.id);
        }
    };

    const handleDeleteDiet = async (id) => {
        if (window.confirm('Tem certeza que deseja remover esta dieta?')) {
            await apiService.unassignDietFromStudent(id);
            fetchStudentDiets(student.id);
        }
    };

    return (
        <div className="space-y-6">
            <Link to="/students">
                <Button variant="outline" className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para Alunos
                </Button>
            </Link>

            {/* Student Info Card */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                            <AvatarImage src={student?.profile_photo || ''} alt={student?.full_name || ''} />
                            <AvatarFallback className="text-3xl bg-orange-100 text-orange-600">
                                {student?.full_name?.charAt(0) || ''}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <CardTitle className="text-3xl font-bold">{student?.full_name || '—'}</CardTitle>
                            <CardDescription className="text-gray-500">
                                {student?.created_at && !isNaN(new Date(student.created_at))
                                    ? `Aluno desde ${format(new Date(student.created_at), 'dd MMM yyyy', { locale: ptBR })}`
                                    : 'Aluno desde —'}
                            </CardDescription>
                            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    <span>{student?.email || '—'}</span>
                                </div>
                                {student?.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        <span>{student.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Planos de Treino" value={workoutPlans.length} icon={Dumbbell} />
                <StatCard label="Planos de Dieta" value={dietPlans.length} icon={Salad} />
                <StatCard label="Avaliações Físicas" value={assessments.length} icon={ClipboardCheck} />
            </div>

            {/* Sections for Plans and Assessments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Planos de Treino</CardTitle>
                        <VincularTreinoModal trainerEmail={student.linked_trainer_email || user.email} studentId={student.id} onVinculado={() => fetchStudentWorkouts(student.id)} />
                    </CardHeader>
                    <CardContent>
                        {workoutPlans.length > 0 ? (
                            <ul className="divide-y">
                                {workoutPlans.map(plan => (
                                    <li key={plan.id} className="py-2 flex items-center justify-between gap-2">
                                        <div className="flex-1">
                                            <button type="button" className="text-left w-full hover:underline" onClick={() => setTreinoSelecionado(plan)}>
                                                <strong>{plan.title}</strong>
                                            </button>
                                            {plan.workout_exercises && plan.workout_exercises.length > 0 ? (
                                                <ul style={{ marginLeft: 16 }}>
                                                    {plan.workout_exercises.map(we => (
                                                        <li key={we.id}>
                                                            {we.exercise?.name || 'Exercício'} — {we.sets}x{we.reps} {we.rest_period ? `(Descanso: ${we.rest_period}s)` : ''}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div style={{ color: '#888', fontSize: 12 }}>Sem exercícios cadastrados</div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteWorkout(plan.id)}
                                            title="Remover treino"
                                            className="ml-2 text-red-600 hover:text-red-800"
                                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-block' }}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-center py-4">Nenhum plano de treino atribuído.</p>
                        )}
                        <DetalheTreinoModal treino={treinoSelecionado} open={!!treinoSelecionado} onClose={() => setTreinoSelecionado(null)} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Planos de Dieta</CardTitle>
                        <VincularDietaModal studentId={student.id} onVinculado={fetchStudentData} />
                    </CardHeader>
                    <CardContent>
                        {dietPlans.length > 0 ? (
                            <ul className="divide-y">
                                {dietPlans.map(plan => (
                                    <li key={plan.id} className="py-2 flex items-center justify-between gap-2">
                                        <div className="flex-1">
                                            <button type="button" className="text-left w-full hover:underline" onClick={() => setDietaSelecionada(plan)}>
                                                <strong>{plan.title}</strong>
                                            </button>
                                            {plan.meals && plan.meals.length > 0 ? (
                                                <ul style={{ marginLeft: 16 }}>
                                                    {plan.meals.map(meal => (
                                                        <li key={meal.id}>
                                                            {meal.meal_time ? `${meal.meal_time}: ` : ''}
                                                            {meal.description}
                                                            {meal.calories ? ` (${meal.calories} kcal)` : ''}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div style={{ color: '#888', fontSize: 12 }}>Sem refeições cadastradas</div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteDiet(plan.id)}
                                            title="Remover dieta"
                                            className="ml-2 text-red-600 hover:text-red-800"
                                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-block' }}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-center py-4">Nenhum plano de dieta atribuído.</p>
                        )}
                        <DetalheDietaModal dieta={dietaSelecionada} open={!!dietaSelecionada} onClose={() => setDietaSelecionada(null)} />
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Avaliações Físicas</CardTitle>
                    <NovaAvaliacaoModal studentId={student.id} onAvaliacaoCriada={() => fetchStudentWorkouts(student.id)} />
                </CardHeader>
                <CardContent>
                    {assessments.length > 0 ? (
                        <ul className="divide-y">
                            {assessments.map(av => (
                                <li key={av.id} className="py-2">
                                    <button type="button" className="text-left w-full hover:underline" onClick={() => setAvaliacaoSelecionada(av)}>
                                        Avaliação de {av.assessment_date ? new Date(av.assessment_date).toLocaleDateString() : '-'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-center py-4">Nenhuma avaliação física registrada.</p>
                    )}
                    <DetalheAvaliacaoModal avaliacao={avaliacaoSelecionada} open={!!avaliacaoSelecionada} onClose={() => setAvaliacaoSelecionada(null)} />
                </CardContent>
            </Card>
        </div>
    );
}
