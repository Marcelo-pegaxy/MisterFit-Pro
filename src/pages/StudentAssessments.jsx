import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardCheck, Calendar, TrendingUp, TrendingDown, Activity, User, Target, AlertCircle } from 'lucide-react';
import { format, compareAsc } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { Assessment } from '@/api/entities';

const StudentAssessments = () => {
  const { studentId } = useParams();
  const [assessments, setAssessments] = useState([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      // Buscar avaliações do aluno
      const userAssessments = await Assessment.filter(
        { student_id: user.id },
        '-assessment_date'
      );
      setAssessments(userAssessments);
      setIsLoading(false);
    };
    fetchAssessments();
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
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Avaliações Físicas</h1>
      {assessments.length > 0 ? (
        <div className="grid gap-6">
          {assessments.map((assessment) => (
            <Card key={assessment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Avaliação de {new Date(assessment.assessment_date).toLocaleDateString()}</CardTitle>
                    <CardDescription>Realizada por: {assessment.trainer_name || 'N/A'}</CardDescription>
                  </div>
                  <Badge>ID: {assessment.id}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><span className="font-semibold">Data:</span> {assessment.assessment_date ? new Date(assessment.assessment_date).toLocaleDateString() : '-'}</div>
                  <div><span className="font-semibold">Peso:</span> {assessment.weight || '-'} kg</div>
                  <div><span className="font-semibold">Altura:</span> {assessment.height || '-'} cm</div>
                  <div><span className="font-semibold">% Gordura:</span> {assessment.body_fat_percentage || '-'}</div>
                  <div><span className="font-semibold">Massa Muscular:</span> {assessment.muscle_mass || '-'}</div>
                  <div><span className="font-semibold">IMC:</span> {assessment.bmi || '-'}</div>
                  <div><span className="font-semibold">Histórico de Saúde:</span> {assessment.health_history || '-'}</div>
                  <div><span className="font-semibold">Histórico de Atividade Física:</span> {assessment.physical_activity_history || '-'}</div>
                  <div><span className="font-semibold">Objetivos:</span> {assessment.specific_objectives || '-'}</div>
                  <div><span className="font-semibold">Limitações Físicas:</span> {assessment.physical_limitations || '-'}</div>
                  <div><span className="font-semibold">Disponibilidade:</span> {assessment.weekly_frequency || '-'}{assessment.session_duration ? `, ${assessment.session_duration}` : ''}{assessment.preferred_schedule ? `, ${assessment.preferred_schedule}` : ''}</div>
                  <div><span className="font-semibold">Testes de Força:</span> {assessment.strength_tests || '-'}</div>
                  <div><span className="font-semibold">Flexibilidade:</span> {assessment.flexibility_tests || '-'}</div>
                  <div><span className="font-semibold">Capacidade Cardiovascular:</span> {assessment.cardio_tests || '-'}</div>
                  <div><span className="font-semibold">Postura e Biomecânica:</span> {assessment.posture_biomechanics || '-'}</div>
                  <div><span className="font-semibold">Observações:</span> {assessment.general_observations || assessment.notes || '-'}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>Nenhuma avaliação encontrada para este aluno.</p>
      )}
    </div>
  );
};

export default StudentAssessments;