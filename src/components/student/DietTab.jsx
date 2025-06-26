import React, { useState, useEffect } from 'react';
import { DietPlan } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Utensils, Clock, MoreHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const AssignDietDialog = ({ trainer, student, onDietAssigned }) => {
  const [availableDiets, setAvailableDiets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    const fetchAvailableDiets = async () => {
      setIsLoading(true);
      try {
        // Buscar dietas do personal que não estão atribuídas a nenhum aluno
        const allDiets = await DietPlan.filter({ trainer_email: trainer.email });
        const unassignedDiets = allDiets.filter(d => !d.student_email || d.student_email === '');
        setAvailableDiets(unassignedDiets);
      } catch (error) {
        console.error("Erro ao buscar dietas:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailableDiets();
  }, [trainer.email]);

  const handleAssignDiet = async (diet) => {
    setIsAssigning(true);
    try {
      await DietPlan.update(diet.id, { student_email: student.email });
      onDietAssigned();
    } catch (error) {
      console.error("Erro ao atribuir dieta:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Atribuir Dieta para {student.full_name}</DialogTitle>
        <DialogDescription>
          Selecione uma dieta da sua biblioteca para atribuir ao aluno.
        </DialogDescription>
      </DialogHeader>
      
      <div className="max-h-96 overflow-y-auto space-y-3 p-1">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : availableDiets.length > 0 ? (
          availableDiets.map(diet => (
            <Card key={diet.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{diet.name}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">{diet.description}</CardDescription>
                  </div>
                  <Button 
                    onClick={() => handleAssignDiet(diet)}
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
                    {(diet.meals || []).length} refeições
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma dieta disponível para atribuir.</p>
            <p className="text-sm text-gray-400 mt-1">Crie dietas na aba "Criar Dietas" primeiro.</p>
          </div>
        )}
      </div>
    </DialogContent>
  );
};

export default function DietTab({ student, trainer }) {
  const [studentDiets, setStudentDiets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudentDiets = async () => {
    setIsLoading(true);
    try {
      // Buscar dietas atribuídas especificamente a este aluno
      const diets = await DietPlan.filter({ student_email: student.email });
      console.log('Dietas encontradas para o aluno:', diets);
      setStudentDiets(diets);
    } catch (error) {
      console.error("Erro ao buscar dietas do aluno:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDiets();
  }, [student.email]);

  // Log para debug: mostrar dietas atribuídas antes de renderizar
  console.log('Dietas atribuídas para o aluno (render):', studentDiets);

  const handleDietAssigned = () => {
    fetchStudentDiets(); // Recarregar a lista
  };

  const handleRemoveDiet = async (dietId) => {
    try {
      // Remove a atribuição da dieta (limpa o student_email)
      await DietPlan.update(dietId, { student_email: null });
      fetchStudentDiets();
    } catch (error) {
      console.error("Erro ao remover dieta:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Dietas Atribuídas</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <PlusCircle className="w-4 h-4 mr-2" />
              Atribuir Dieta
            </Button>
          </DialogTrigger>
          <AssignDietDialog 
            trainer={trainer} 
            student={student} 
            onDietAssigned={handleDietAssigned}
          />
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
        ) : studentDiets.length > 0 ? (
          studentDiets.map(diet => (
            <Card key={diet.id} className="hover:shadow-md transition-shadow">
              {diet.image_url && (
                <img src={diet.image_url} alt={diet.name} className="w-full h-40 object-cover rounded-t-lg" />
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{diet.name}</CardTitle>
                    <CardDescription className="mt-1">{diet.description}</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemoveDiet(diet.id)}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap mb-4">
                  <Badge variant="outline">
                    <Utensils className="w-3 h-3 mr-1" />
                    {(diet.meals || []).length} refeições
                  </Badge>
                </div>
                
                {/* Lista de refeições */}
                {diet.meals && diet.meals.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Refeições:</h4>
                    <div className="space-y-1">
                      {diet.meals.slice(0, 3).map((meal, index) => (
                        <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <strong>{meal.meal_name}</strong>
                          {meal.time && <span className="ml-2">- {meal.time}</span>}
                          <div className="text-xs text-gray-500 mt-1">
                            {(meal.foods || []).length} alimentos
                          </div>
                        </div>
                      ))}
                      {diet.meals.length > 3 && (
                        <p className="text-xs text-gray-500">+ {diet.meals.length - 3} refeições</p>
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
              <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma Dieta Atribuída</h3>
              <p className="text-gray-500 mb-4">Este aluno ainda não possui dietas atribuídas.</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Atribuir Primeira Dieta
                  </Button>
                </DialogTrigger>
                <AssignDietDialog 
                  trainer={trainer} 
                  student={student} 
                  onDietAssigned={handleDietAssigned}
                />
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}