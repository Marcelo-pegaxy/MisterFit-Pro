import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const ExerciseForm = ({ onExerciseAdded }) => {
    const [name, setName] = useState('');
    const [muscleGroup, setMuscleGroup] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.post('/exercises', { name, muscle_group: muscleGroup, difficulty, description });
            onExerciseAdded();
            // Reset form
            setName('');
            setMuscleGroup('');
            setDifficulty('');
            setDescription('');
        } catch (error) {
            console.error("Erro ao adicionar exercício:", error);
        }
        setIsSaving(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="ex-name">Nome do Exercício</Label>
                <Input id="ex-name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
                <Label htmlFor="ex-muscle">Grupo Muscular</Label>
                <Input id="ex-muscle" value={muscleGroup} onChange={e => setMuscleGroup(e.target.value)} required placeholder="Ex: Peito, Costas, Pernas" />
            </div>
            <div>
                <Label htmlFor="ex-difficulty">Dificuldade</Label>
                <Select onValueChange={setDifficulty} value={difficulty}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Iniciante">Iniciante</SelectItem>
                        <SelectItem value="Intermediário">Intermediário</SelectItem>
                        <SelectItem value="Avançado">Avançado</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="ex-desc">Descrição</Label>
                <Textarea id="ex-desc" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Salvando...' : 'Salvar Exercício'}
                </Button>
            </DialogFooter>
        </form>
    );
}

export default function ExercisesPage() {
    const [exercises, setExercises] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const fetchExercises = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/exercises');
            setExercises(response.data);
        } catch (error) {
            console.error("Erro ao buscar exercícios:", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchExercises();
    }, []);

    const handleExerciseAdded = () => {
        setIsFormOpen(false);
        fetchExercises();
    };
    
    const difficultyVariant = {
        Iniciante: 'default',
        Intermediário: 'secondary',
        Avançado: 'destructive',
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Biblioteca de Exercícios</h1>
                    <p className="text-gray-500">Crie e gerencie os exercícios para seus treinos.</p>
                </div>
                 <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Novo Exercício
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Adicionar Novo Exercício</DialogTitle>
                            <DialogDescription>
                                Preencha os campos para adicionar um exercício à biblioteca.
                            </DialogDescription>
                        </DialogHeader>
                        <ExerciseForm onExerciseAdded={handleExerciseAdded} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => <Card key={i}><CardHeader><div className="space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4"></div><div className="h-3 bg-gray-200 rounded w-1/2"></div></div></CardHeader><CardContent><div className="h-10 bg-gray-200 rounded"></div></CardContent></Card>)
                ) : exercises.length > 0 ? (
                    exercises.map(exercise => (
                        <Card key={exercise.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle>{exercise.name}</CardTitle>
                                    <Badge variant={difficultyVariant[exercise.difficulty]}>{exercise.difficulty}</Badge>
                                </div>
                                <CardDescription>{exercise.muscle_group}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 line-clamp-3">{exercise.description || 'Nenhuma descrição fornecida.'}</p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="md:col-span-2 lg:col-span-3 text-center py-10 text-gray-500">Nenhum exercício cadastrado.</p>
                )}
            </div>
        </div>
    );
}