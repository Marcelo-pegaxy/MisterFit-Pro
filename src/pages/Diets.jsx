import React, { useState, useEffect } from 'react';
import { DietPlan } from '@/api/entities';
import { User } from '@/api/entities'; // Changed from UserAccount to User
import { Button } from '@/components/ui/button';
import { PlusCircle, Utensils, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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
import DietForm from '@/components/diets/DietForm';
import { useAuth } from '@/contexts/AuthContext';

const DietList = ({ plans, students, onEdit, onDelete }) => {
    const getStudentName = (email) => {
        if (!email) return "Não atribuído";
        const student = students.find(s => s.email === email);
        return student ? student.full_name : email;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {plans.map(plan => (
                <Card key={plan.id} className="hover:shadow-lg transition-shadow flex flex-col h-full p-2">
                    {plan.image_url && (
                        <img src={plan.image_url} alt={plan.name} className="w-full h-32 object-cover rounded-lg mb-2" />
                    )}
                    <CardHeader>
                        <div className="flex justify-between items-start">
                           <CardTitle>{plan.title}</CardTitle>
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
                        <p className="text-sm text-gray-500 mt-2">{(plan.meals || []).length} refeições</p>
                        {plan.meals && plan.meals.length > 0 && (
                          <ul className="mt-2 text-xs text-gray-700 space-y-2">
                            {plan.meals.map((meal, idx) => (
                              <li key={meal.id || idx} className="bg-gray-50 rounded p-2">
                                <div className="flex flex-wrap gap-2 items-center mb-1">
                                  <span className="font-semibold">🍽️ {meal.description}</span>
                                  {meal.meal_time && <Badge variant="outline" className="text-xs">{meal.meal_time}</Badge>}
                                </div>
                                {meal.foods && meal.foods.length > 0 && (
                                  <ul className="ml-2 list-disc space-y-1">
                                    {meal.foods.map((food, fidx) => (
                                      <li key={food.id || fidx} className="flex flex-wrap gap-2 items-center">
                                        <span>🥗 <b>{food.food_name}</b></span>
                                        {food.quantity && <Badge variant="outline" className="text-xs">{food.quantity}</Badge>}
                                        {food.calories && <Badge variant="outline" className="text-xs">{food.calories} kcal</Badge>}
                                        {food.macros && <Badge variant="outline" className="text-xs">{food.macros}</Badge>}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

const EmptyState = ({ onNewDiet }) => (
    <Card>
        <div className="text-center py-16 px-4 flex flex-col items-center">
            <div className="p-4 bg-gray-100 rounded-full">
                <Utensils className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-gray-800">Nenhuma dieta criada ainda</h2>
            <p className="mt-2 text-sm text-gray-500">Comece adicionando seu primeiro plano alimentar.</p>
            <Button onClick={onNewDiet} className="mt-6 bg-orange-500 hover:bg-orange-600 text-white">
                <PlusCircle className="mr-2 h-4 w-4" /> Criar Nova Dieta
            </Button>
        </div>
    </Card>
);

export default function Diets() {
    const { user } = useAuth();
    const [dietPlans, setDietPlans] = useState([]);
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDiet, setEditingDiet] = useState(null);

    const fetchData = async (currentUser) => {
        if (!currentUser) return;
        setIsLoading(true);
        try {
            let plans = [];
            if (currentUser.user_type === 'personal') {
                plans = await DietPlan.filter({ trainer_email: currentUser.email });
            } else if (currentUser.user_type === 'aluno' || currentUser.user_type === 'student') {
                plans = await DietPlan.filter({ student_id: currentUser.id }, '-created_date');
            }
            const allUsers = await User.list();
            // Filter students based on role and linked_trainer_email
            const studs = allUsers.filter(u => (u.role === 'student' || u.user_type === 'student') && (currentUser.role === 'admin' || currentUser.user_type === 'admin' || u.linked_trainer_email === currentUser.email));
            setDietPlans(plans);
            setStudents(studs);
        } catch (error) {
            console.error("Error fetching diet data:", error);
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
        setEditingDiet(null);
        fetchData(user);
    };

    const handleNewDiet = () => {
        setEditingDiet(null);
        setIsFormOpen(true);
    };

    const handleEditDiet = (diet) => {
        setEditingDiet(diet);
        setIsFormOpen(true);
    };

    const handleDeleteDiet = async (dietId) => {
        if (window.confirm("Tem certeza que deseja excluir esta dieta? Esta ação não pode ser desfeita.")) {
            try {
                await DietPlan.delete(dietId);
                fetchData(user);
            } catch (error) {
                console.error("Erro ao excluir dieta:", error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Criar Dietas</h1>
                    <p className="text-gray-500">Elabore planos alimentares sob medida para seus alunos.</p>
                </div>
                 <Button onClick={handleNewDiet} className="bg-orange-500 hover:bg-orange-600 text-white">
                     <PlusCircle className="mr-2 h-4 w-4" /> Criar Nova Dieta
                 </Button>
            </div>

            <div>
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-lg" />)}
                    </div>
                ) : dietPlans.length > 0 ? (
                    <DietList plans={dietPlans} students={students} onEdit={handleEditDiet} onDelete={handleDeleteDiet} />
                ) : (
                    <EmptyState onNewDiet={handleNewDiet} />
                )}
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                     <DialogHeader>
                        <DialogTitle>{editingDiet ? 'Editar Dieta' : 'Criar Nova Dieta'}</DialogTitle>
                        <DialogDescription>
                           {editingDiet ? 'Altere os detalhes da dieta abaixo.' : 'Preencha os detalhes da nova dieta.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DietForm user={user} students={students} onFinished={handleFormFinished} existingDiet={editingDiet} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
