import React, { useState, useEffect } from 'react';
import { DietPlan } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Utensils, Clock, Apple, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

const FoodItem = ({ food, index }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-xs">
                {index + 1}
            </div>
            <div>
                <p className="font-medium">{food.food_name}</p>
                {food.quantity && (
                    <p className="text-sm text-gray-600">Quantidade: {food.quantity}</p>
                )}
            </div>
        </div>
        <div className="text-right">
            {food.calories && (
                <p className="text-sm font-medium text-orange-600">{food.calories}</p>
            )}
            {food.macros && (
                <p className="text-xs text-gray-500">{food.macros}</p>
            )}
        </div>
    </div>
);

const MealCard = ({ meal, index }) => {
    const [isOpen, setIsOpen] = useState(index === 0); // Primeira refeição aberta por padrão
    
    const getMealIcon = (mealName) => {
        const name = mealName?.toLowerCase() || '';
        if (name.includes('café') || name.includes('manhã')) return '☕';
        if (name.includes('almoço')) return '🍽️';
        if (name.includes('lanche')) return '🍎';
        if (name.includes('jantar') || name.includes('janta')) return '🌙';
        if (name.includes('ceia')) return '🥛';
        return '🍴';
    };
    
    return (
        <Card className="mb-4">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">
                                    {getMealIcon(meal.meal_name)}
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{meal.meal_name}</CardTitle>
                                    {meal.time && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">{meal.time}</span>
                                        </div>
                                    )}
                                    <Badge variant="outline" className="text-xs mt-2">
                                        {(meal.foods || []).length} alimento{(meal.foods || []).length !== 1 ? 's' : ''}
                                    </Badge>
                                </div>
                            </div>
                            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                    <CardContent className="pt-0">
                        {meal.foods && meal.foods.length > 0 ? (
                            <div className="space-y-3">
                                {meal.foods.map((food, foodIndex) => (
                                    <FoodItem key={foodIndex} food={food} index={foodIndex} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">
                                Nenhum alimento cadastrado nesta refeição.
                            </p>
                        )}
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
};

const DietCard = ({ diet }) => {
    const totalMeals = (diet.meals || []).length;
    const totalFoods = (diet.meals || []).reduce((sum, meal) => sum + (meal.foods || []).length, 0);
    
    return (
        <Card className="mb-6">
            <CardHeader>
                {diet.image_url && (
                    <img 
                        src={diet.image_url} 
                        alt={diet.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                )}
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl mb-2">{diet.name}</CardTitle>
                        <CardDescription className="text-base">{diet.description}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Badge className="bg-green-100 text-green-800">
                            {totalMeals} refeições
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            {totalFoods} alimentos
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-3">
                    <Clock className="w-4 h-4" />
                    {diet.created_date
                        ? <>Criado {formatDistanceToNow(new Date(diet.created_date), { addSuffix: true, locale: ptBR })}</>
                        : <>Data de criação desconhecida</>
                    }
                </div>
            </CardHeader>
            
            <CardContent>
                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2 mb-4">
                        <Utensils className="w-5 h-5 text-green-500" />
                        Plano Alimentar
                    </h3>
                    
                    {diet.meals && diet.meals.length > 0 ? (
                        <div>
                            {diet.meals.map((meal, index) => (
                                <MealCard key={index} meal={meal} index={index} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">
                            Nenhuma refeição cadastrada nesta dieta ainda.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default function StudentDiet() {
    const [diets, setDiets] = useState([]);
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDiets = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }
            // Buscar dietas do aluno
            const userDiets = await DietPlan.filter(
                { student_id: user.id },
                '-created_date'
            );
            setDiets(userDiets);
            setIsLoading(false);
        };
        fetchDiets();
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
                    <Utensils className="w-8 h-8 text-green-500" />
                    Minha Dieta
                </h1>
                <p className="text-gray-500 mt-2">
                    {diets.length > 0 
                        ? `Você tem ${diets.length} plano${diets.length !== 1 ? 's' : ''} alimentar personalizado${diets.length !== 1 ? 's' : ''} disponível${diets.length !== 1 ? 'eis' : ''}.`
                        : 'Quando seu personal trainer criar dietas para você, elas aparecerão aqui.'
                    }
                </p>
            </div>

            {diets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {diets.map((diet) => (
                        <DietCard key={diet.id} diet={diet} />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="text-center py-16">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-gray-100 rounded-full">
                                <Utensils className="w-12 h-12 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                                    Nenhuma dieta disponível
                                </h3>
                                <p className="text-gray-500 max-w-md">
                                    Seus planos alimentares personalizados aparecerão aqui quando seu personal trainer os criar. 
                                    Entre em contato com ele para receber sua primeira dieta!
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}