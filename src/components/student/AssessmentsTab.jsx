import React, { useState, useEffect } from 'react';
import { Assessment } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Activity, TrendingUp, Calendar, Weight, Ruler } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import AssessmentForm from '@/components/assessments/AssessmentForm';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ProgressChart = ({ assessments }) => {
  if (!assessments || assessments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Sem dados suficientes para gerar gráfico</p>
          <p className="text-sm text-gray-400">É necessário pelo menos 2 avaliações</p>
        </CardContent>
      </Card>
    );
  }

  // Preparar dados para o gráfico
  const chartData = assessments
    .filter(a => a.weight || a.body_fat_percentage || a.bmi)
    .sort((a, b) => new Date(a.assessment_date) - new Date(b.assessment_date))
    .map(assessment => ({
      date: format(parseISO(assessment.assessment_date), 'dd/MM/yy'),
      fullDate: assessment.assessment_date,
      peso: assessment.weight || null,
      gordura: assessment.body_fat_percentage || null,
      imc: assessment.bmi || null,
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Nenhum dado físico registrado nas avaliações</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Evolução Física
        </CardTitle>
        <CardDescription>Acompanhe o progresso ao longo do tempo</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                labelFormatter={(value, payload) => {
                  const item = payload?.[0]?.payload;
                  return item ? format(parseISO(item.fullDate), 'dd/MM/yyyy') : value;
                }}
              />
              <Legend />
              {chartData.some(d => d.peso) && (
                <Line 
                  type="monotone" 
                  dataKey="peso" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Peso (kg)"
                  connectNulls={false}
                />
              )}
              {chartData.some(d => d.gordura) && (
                <Line 
                  type="monotone" 
                  dataKey="gordura" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="% Gordura"
                  connectNulls={false}
                />
              )}
              {chartData.some(d => d.imc) && (
                <Line 
                  type="monotone" 
                  dataKey="imc" 
                  stroke="#ffc658" 
                  strokeWidth={2}
                  name="IMC"
                  connectNulls={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const AssessmentCard = ({ assessment, isLatest }) => {
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className={`${isLatest ? 'ring-2 ring-orange-200' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(assessment.assessment_date)}
              {isLatest && <Badge className="bg-orange-100 text-orange-600">Mais Recente</Badge>}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Dados Físicos */}
        {(assessment.weight || assessment.height || assessment.bmi) && (
          <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
            {assessment.weight && (
              <div className="text-center">
                <Weight className="w-4 h-4 mx-auto text-gray-500 mb-1" />
                <p className="text-sm text-gray-600">Peso</p>
                <p className="font-semibold">{assessment.weight}kg</p>
              </div>
            )}
            {assessment.height && (
              <div className="text-center">
                <Ruler className="w-4 h-4 mx-auto text-gray-500 mb-1" />
                <p className="text-sm text-gray-600">Altura</p>
                <p className="font-semibold">{assessment.height}m</p>
              </div>
            )}
            {assessment.bmi && (
              <div className="text-center">
                <Activity className="w-4 h-4 mx-auto text-gray-500 mb-1" />
                <p className="text-sm text-gray-600">IMC</p>
                <p className="font-semibold">{assessment.bmi}</p>
              </div>
            )}
          </div>
        )}

        {/* Outros dados importantes */}
        {assessment.body_fat_percentage && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">% Gordura Corporal:</span>
            <Badge variant="secondary">{assessment.body_fat_percentage}%</Badge>
          </div>
        )}

        {assessment.specific_objectives && (
          <div>
            <p className="text-sm text-gray-600 font-medium mb-1">Objetivos:</p>
            <p className="text-sm text-gray-800 line-clamp-2">{assessment.specific_objectives}</p>
          </div>
        )}

        {assessment.physical_limitations && (
          <div>
            <p className="text-sm text-gray-600 font-medium mb-1">Limitações:</p>
            <p className="text-sm text-gray-800 line-clamp-2">{assessment.physical_limitations}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function AssessmentsTab({ student, trainer }) {
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchAssessments = async () => {
    setIsLoading(true);
    try {
      const studentAssessments = await Assessment.filter(
        { student_id: student.id },
        '-assessment_date'
      );
      setAssessments(studentAssessments);
    } catch (error) {
      console.error("Erro ao buscar avaliações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [student.id]);

  const handleAssessmentAdded = () => {
    setIsFormOpen(false);
    fetchAssessments();
  };

  const latestAssessment = assessments[0]; // Já ordenado por data desc

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Avaliações de {student.full_name}</h3>
          <p className="text-sm text-gray-500">
            {assessments.length > 0 
              ? `${assessments.length} avaliação${assessments.length > 1 ? 'ões' : ''} registrada${assessments.length > 1 ? 's' : ''}`
              : 'Nenhuma avaliação registrada'
            }
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <PlusCircle className="w-4 h-4 mr-2" />
              Nova Avaliação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Nova Avaliação para {student.full_name}</DialogTitle>
              <DialogDescription>
                Registre uma nova avaliação física e anamnese completa.
              </DialogDescription>
            </DialogHeader>
            <AssessmentForm 
              user={trainer} 
              students={[student]} 
              onFinished={handleAssessmentAdded} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      ) : assessments.length > 0 ? (
        <Tabs defaultValue="evolution" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="evolution">Evolução</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="evolution" className="space-y-6">
            <ProgressChart assessments={assessments} />
            
            {latestAssessment && (
              <div>
                <h4 className="text-lg font-semibold mb-4">Última Avaliação</h4>
                <AssessmentCard assessment={latestAssessment} isLatest={true} />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessments.map((assessment, index) => (
                <AssessmentCard 
                  key={assessment.id} 
                  assessment={assessment} 
                  isLatest={index === 0}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma Avaliação Registrada</h3>
            <p className="text-gray-500 mb-4">
              Registre a primeira avaliação física do aluno para começar o acompanhamento.
            </p>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Primeira Avaliação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Primeira Avaliação para {student.full_name}</DialogTitle>
                  <DialogDescription>
                    Registre a avaliação física inicial e anamnese completa.
                  </DialogDescription>
                </DialogHeader>
                <AssessmentForm 
                  user={trainer} 
                  students={[student]} 
                  onFinished={handleAssessmentAdded} 
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}