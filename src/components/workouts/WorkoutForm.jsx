import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlusCircle, Trash2, CalendarIcon, Upload, Loader2 } from 'lucide-react';
import { WorkoutPlan } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const emptyExercise = {
    exercise_name: '',
    sets: '',
    reps: '',
    intensity: '',
    rest_interval: '',
    recommended_frequency: '',
    planned_progression: '',
    execution_notes: '',
    video_url: '', // Added new field
};

export default function WorkoutForm({ user, students, onFinished, existingWorkout }) {
    const [plan, setPlan] = useState({ name: '', description: '', image_url: '', next_assessment_date: null, student_email: '' });
    const [exercises, setExercises] = useState([emptyExercise]);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState({ index: null, isLoading: false });
    
    useEffect(() => {
      if (existingWorkout) {
          setPlan({
              name: existingWorkout.name || '',
              description: existingWorkout.description || '',
              image_url: existingWorkout.image_url || '',
              next_assessment_date: existingWorkout.next_assessment_date ? new Date(existingWorkout.next_assessment_date) : null,
              student_email: existingWorkout.student_email || ''
          });
          setExercises(existingWorkout.exercises && existingWorkout.exercises.length > 0 ? existingWorkout.exercises.map(ex => ({ ...emptyExercise, ...ex })) : [emptyExercise]);
      } else {
          // Reset form for new workout
          setPlan({ name: '', description: '', image_url: '', next_assessment_date: null, student_email: '' });
          setExercises([emptyExercise]);
      }
    }, [existingWorkout]);


    const handlePlanChange = (field, value) => setPlan(prev => ({ ...prev, [field]: value }));

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const { file_url } = await UploadFile({ file });
            handlePlanChange('image_url', file_url);
        } catch (error) {
            console.error("Erro no upload da imagem:", error);
        }
        setIsUploading(false);
    };

    const handleExerciseChange = (index, field, value) => {
        const newExercises = [...exercises];
        newExercises[index][field] = value;
        setExercises(newExercises);
    };
    
    const handleVideoUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('video/')) {
            alert('Por favor, selecione um arquivo de vídeo válido.');
            e.target.value = null; // Clear the input
            return;
        }

        setUploadingVideo({ index, isLoading: true });
        try {
            const { file_url } = await UploadFile({ file });
            handleExerciseChange(index, 'video_url', file_url);
        } catch (error) {
            console.error("Erro no upload do vídeo:", error);
            alert("Erro ao fazer upload do vídeo.");
        } finally {
            setUploadingVideo({ index: null, isLoading: false });
            e.target.value = null; // Clear the input after upload attempt
        }
    };

    const addExercise = () => setExercises([...exercises, { ...emptyExercise }]);
    const removeExercise = (index) => setExercises(exercises.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (!user || !user.email) {
                alert('Usuário não encontrado. Faça login novamente.');
                setIsSaving(false);
                return;
            }
            const fullPlanData = {
                ...plan,
                trainer_email: user.email,
                exercises: exercises,
                next_assessment_date: plan.next_assessment_date ? plan.next_assessment_date.toISOString().split('T')[0] : null
            };
            if (existingWorkout) {
              await WorkoutPlan.update(existingWorkout.id, fullPlanData);
            } else {
              await WorkoutPlan.create(fullPlanData);
            }
            onFinished();
        } catch (error) {
            console.error("Erro ao salvar plano:", error);
        }
        setIsSaving(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 mt-4 max-h-[70vh] overflow-y-auto pr-4">
            {/* Campos do Plano */}
            <div className="space-y-4">
                <div>
                    <Label htmlFor="plan-name">Nome do Treino</Label>
                    <Input id="plan-name" value={plan.name} onChange={e => handlePlanChange('name', e.target.value)} required />
                </div>
                 {students && students.length > 0 && (
                     <div>
                        <Label>Atribuir para o aluno (Opcional)</Label>
                        <Select onValueChange={(value) => handlePlanChange('student_email', value)} value={plan.student_email}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um aluno..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null">Não atribuir</SelectItem>
                                {students.map(s => <SelectItem key={s.id} value={s.email}>{s.full_name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <div>
                    <Label htmlFor="plan-desc">Descrição</Label>
                    <Textarea id="plan-desc" value={plan.description} onChange={e => handlePlanChange('description', e.target.value)} />
                </div>
                <div>
                    <Label>Imagem de Capa (Opcional)</Label>
                    <div className="flex items-center gap-4">
                        <Input id="plan-img-url" placeholder="URL da imagem ou faça upload" value={plan.image_url} onChange={e => handlePlanChange('image_url', e.target.value)} className="flex-grow" />
                        <Button asChild variant="outline">
                            <Label htmlFor="file-upload" className="cursor-pointer">
                                {isUploading ? "Enviando..." : <Upload className="w-4 h-4 mr-2" />} Upload
                            </Label>
                        </Button>
                        <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                    </div>
                    {plan.image_url && <img src={plan.image_url} alt="Preview" className="mt-2 rounded-md max-h-40" />}
                </div>
                <div>
                    <Label>Data Próxima Reavaliação Sugerida (Opcional)</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {plan.next_assessment_date ? format(plan.next_assessment_date, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={plan.next_assessment_date} onSelect={(d) => handlePlanChange('next_assessment_date', d)} initialFocus /></PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Seção de Exercícios */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold border-t pt-4">Exercícios</h3>
                {exercises.map((ex, index) => (
                    <div key={index} className="border p-4 rounded-lg space-y-4 bg-gray-50/50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1"><Label>Nome do Exercício</Label><Input value={ex.exercise_name} onChange={e => handleExerciseChange(index, 'exercise_name', e.target.value)} placeholder="Ex: Supino Reto"/></div>
                            <div><Label>Séries</Label><Input type="text" value={ex.sets} onChange={e => handleExerciseChange(index, 'sets', e.target.value)} placeholder="Ex: 3"/></div>
                            <div><Label>Repetições</Label><Input value={ex.reps} onChange={e => handleExerciseChange(index, 'reps', e.target.value)} placeholder="Ex: 10-12"/></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div><Label>Intensidade</Label><Input value={ex.intensity} onChange={e => handleExerciseChange(index, 'intensity', e.target.value)} placeholder="Ex: 70% 1RM, RPE 8"/></div>
                           <div><Label>Intervalo Descanso</Label><Input value={ex.rest_interval} onChange={e => handleExerciseChange(index, 'rest_interval', e.target.value)} placeholder="Ex: 60-90s"/></div>
                           <div><Label>Frequência Rec.</Label><Input value={ex.recommended_frequency} onChange={e => handleExerciseChange(index, 'recommended_frequency', e.target.value)} placeholder="Ex: 2x/semana"/></div>
                        </div>
                         <div><Label>Progressão Planejada (opcional)</Label><Textarea value={ex.planned_progression} onChange={e => handleExerciseChange(index, 'planned_progression', e.target.value)} placeholder="Ex: Aumentar 2 reps ou 2.5kg quando atingir o teto de reps"/></div>
                         <div><Label>Observações sobre Execução (opcional)</Label><Textarea value={ex.execution_notes} onChange={e => handleExerciseChange(index, 'execution_notes', e.target.value)} placeholder="Ex: Cadência 2-0-2, foco na fase excêntrica"/></div>
                         <div>
                            <Label>URL do Vídeo Explicativo (opcional)</Label>
                            <div className="flex items-center gap-2">
                                <Input 
                                    value={ex.video_url || ''} 
                                    onChange={e => handleExerciseChange(index, 'video_url', e.target.value)} 
                                    placeholder="Cole a URL ou faça upload"
                                    className="flex-grow"
                                />
                                <Button asChild variant="outline" size="icon">
                                    <Label htmlFor={`video-upload-${index}`} className="cursor-pointer">
                                        {uploadingVideo.isLoading && uploadingVideo.index === index ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Upload className="w-4 h-4" />
                                        )}
                                    </Label>
                                </Button>
                                <Input
                                    id={`video-upload-${index}`}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleVideoUpload(e, index)}
                                    accept="video/*"
                                    disabled={uploadingVideo.isLoading}
                                />
                            </div>
                         </div>
                         <Button type="button" variant="destructive" size="sm" onClick={() => removeExercise(index)}><Trash2 className="w-4 h-4 mr-2" />Remover Exercício</Button>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={addExercise} className="w-full"><PlusCircle className="w-4 h-4 mr-2" />Adicionar Exercício</Button>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={onFinished}>Cancelar</Button>
                <Button type="submit" disabled={isSaving || isUploading || uploadingVideo.isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isSaving ? 'Salvando...' : existingWorkout ? 'Salvar Alterações' : 'Criar Treino'}
                </Button>
            </div>
        </form>
    );
}
