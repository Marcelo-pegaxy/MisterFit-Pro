
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Assessment } from '@/api/entities';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function AssessmentForm({ user, students, onFinished }) {
    const [assessment, setAssessment] = useState({
        student_email: students?.length === 1 ? students[0].email : '',
        assessment_date: new Date(),
        health_history: '',
        physical_activity_history: '',
        specific_objectives: '',
        physical_limitations: '',
        weekly_frequency: '',
        session_duration: '',
        preferred_schedule: '',
        weight: '',
        height: '',
        body_fat_percentage: '',
        muscle_mass: '',
        bmi: '',
        strength_tests: '',
        flexibility_tests: '',
        cardio_tests: '',
        posture_biomechanics: '',
        general_observations: ''
    });
    
    const [isSaving, setIsSaving] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        anamnese: true,
        fisica: false,
        testes: false,
        flexibilidade: false,
        cardio: false,
        postura: false,
        observacoes: false
    });

    const handleChange = (field, value) => {
        setAssessment(prev => ({ ...prev, [field]: value }));
    };

    // Calcular IMC automaticamente
    useEffect(() => {
        if (assessment.weight && assessment.height) {
            const bmi = assessment.weight / (assessment.height * assessment.height);
            setAssessment(prev => ({ ...prev, bmi: Math.round(bmi * 10) / 10 }));
        }
    }, [assessment.weight, assessment.height]);

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!assessment.student_email) return;
        
        setIsSaving(true);
        try {
            const assessmentData = {
                ...assessment,
                trainer_email: user.email,
                assessment_date: assessment.assessment_date.toISOString().split('T')[0],
                weight: assessment.weight ? parseFloat(assessment.weight) : null,
                height: assessment.height ? parseFloat(assessment.height) : null,
                body_fat_percentage: assessment.body_fat_percentage ? parseFloat(assessment.body_fat_percentage) : null,
                bmi: assessment.bmi ? parseFloat(assessment.bmi) : null
            };
            await Assessment.create(assessmentData);
            onFinished();
        } catch (error) {
            console.error("Erro ao salvar avaliação:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 mt-4 max-h-[70vh] overflow-y-auto pr-4">
            {/* Seleção de Aluno e Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>Aluno</Label>
                    {students?.length === 1 ? (
                        <Input value={students[0].full_name} disabled className="mt-1" />
                    ) : (
                        <>
                            <Select onValueChange={(value) => handleChange('student_email', value)} value={assessment.student_email} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um aluno" />
                                </SelectTrigger>
                                <SelectContent>
                                    {students.map(student => (
                                        <SelectItem key={student.id} value={student.email}>{student.full_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">Vincule alunos na página 'Alunos' para selecioná-los aqui.</p>
                        </>
                    )}
                </div>
                <div>
                    <Label>Data da Avaliação</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(assessment.assessment_date, "dd/MM/yyyy", { locale: ptBR })}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={assessment.assessment_date}
                                onSelect={(date) => handleChange('assessment_date', date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Anamnese Completa */}
            <Collapsible open={expandedSections.anamnese} onOpenChange={() => toggleSection('anamnese')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <h3 className="text-lg font-semibold">Anamnese Completa</h3>
                    {expandedSections.anamnese ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                    <div>
                        <Label>Histórico de Saúde (Lesões, cirurgias, medicamentos)</Label>
                        <Textarea
                            value={assessment.health_history}
                            onChange={(e) => handleChange('health_history', e.target.value)}
                            className="h-24"
                        />
                    </div>
                    <div>
                        <Label>Histórico de Atividade Física (Experiência, modalidades)</Label>
                        <Textarea
                            value={assessment.physical_activity_history}
                            onChange={(e) => handleChange('physical_activity_history', e.target.value)}
                            className="h-24 border-orange-300 focus:border-orange-500"
                        />
                    </div>
                    <div>
                        <Label>Objetivos Específicos</Label>
                        <Textarea
                            value={assessment.specific_objectives}
                            onChange={(e) => handleChange('specific_objectives', e.target.value)}
                            className="h-24"
                        />
                    </div>
                    <div>
                        <Label>Limitações Físicas (Restrições, dores, desconfortos)</Label>
                        <Textarea
                            value={assessment.physical_limitations}
                            onChange={(e) => handleChange('physical_limitations', e.target.value)}
                            className="h-24 border-orange-300 focus:border-orange-500"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Disponibilidade: Frequência Semanal</Label>
                            <Input
                                value={assessment.weekly_frequency}
                                onChange={(e) => handleChange('weekly_frequency', e.target.value)}
                                className="border-orange-300 focus:border-orange-500"
                            />
                        </div>
                        <div>
                            <Label>Disponibilidade: Tempo por Sessão</Label>
                            <Input
                                value={assessment.session_duration}
                                onChange={(e) => handleChange('session_duration', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Disponibilidade: Horários Preferenciais</Label>
                            <Input
                                value={assessment.preferred_schedule}
                                onChange={(e) => handleChange('preferred_schedule', e.target.value)}
                            />
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            {/* Avaliação Física */}
            <div className="border-t pt-6">
                <h3 className="text-xl font-semibold text-blue-600 mb-4">Avaliação Física</h3>
                
                <Collapsible open={expandedSections.fisica} onOpenChange={() => toggleSection('fisica')}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <h4 className="text-lg font-semibold">Composição Corporal</h4>
                        {expandedSections.fisica ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label>Peso (kg)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={assessment.weight}
                                    onChange={(e) => handleChange('weight', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Altura (m)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={assessment.height}
                                    onChange={(e) => handleChange('height', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>% Gordura Corporal</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={assessment.body_fat_percentage}
                                    onChange={(e) => handleChange('body_fat_percentage', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Massa Muscular (kg ou descrição)</Label>
                                <Input
                                    value={assessment.muscle_mass}
                                    onChange={(e) => handleChange('muscle_mass', e.target.value)}
                                    className="border-orange-300 focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <Label>IMC (Será calculado se peso e altura informados)</Label>
                                <Input
                                    value={assessment.bmi || 'Ex: 22.5 ou deixe em branco'}
                                    onChange={(e) => handleChange('bmi', e.target.value)}
                                    placeholder="Ex: 22.5 ou deixe em branco"
                                    disabled={assessment.weight && assessment.height}
                                />
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>

            {/* Testes Específicos */}
            {[
                { key: 'testes', title: 'Testes de Força', field: 'strength_tests' },
                { key: 'flexibilidade', title: 'Flexibilidade', field: 'flexibility_tests' },
                { key: 'cardio', title: 'Capacidade Cardiovascular', field: 'cardio_tests', highlight: true },
                { key: 'postura', title: 'Postura e Biomecânica', field: 'posture_biomechanics' },
                { key: 'observacoes', title: 'Observações Gerais da Avaliação', field: 'general_observations' }
            ].map(section => (
                <Collapsible key={section.key} open={expandedSections[section.key]} onOpenChange={() => toggleSection(section.key)}>
                    <CollapsibleTrigger className={`flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${section.highlight ? 'border-orange-300' : ''}`}>
                        <h4 className="text-lg font-semibold">{section.title}</h4>
                        {expandedSections[section.key] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                        <Textarea
                            value={assessment[section.field]}
                            onChange={(e) => handleChange(section.field, e.target.value)}
                            className="h-24"
                        />
                    </CollapsibleContent>
                </Collapsible>
            ))}

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={onFinished}>Cancelar</Button>
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isSaving ? 'Registrando...' : 'Registrar Avaliação'}
                </Button>
            </div>
        </form>
    );
}
