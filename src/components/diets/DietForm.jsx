import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, Upload } from 'lucide-react';
import { DietPlan } from '@/api/entities';
import { UploadFile } from '@/api/integrations';

const emptyFood = {
    food_name: '',
    quantity: '',
    calories: '',
    macros: '',
};

const emptyMeal = {
    meal_name: '',
    time: '',
    foods: [emptyFood],
};

export default function DietForm({ user, students, onFinished, existingDiet }) {
    const [plan, setPlan] = useState({ 
        name: '', 
        description: '', 
        image_url: '',
        student_email: '' // Added student_email to initial plan state
    });
    const [meals, setMeals] = useState([emptyMeal]);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Effect to load existing diet data or reset form
    useEffect(() => {
        if (existingDiet) {
            setPlan({
                name: existingDiet.title || '',
                description: existingDiet.description || '',
                image_url: existingDiet.image_url || '',
                student_email: existingDiet.student_email || ''
            });
            // Mapear refeições do backend para o formato do formulário
            const mapMealsFromBackend = (meals) => {
                return (meals || []).map(meal => ({
                    meal_name: meal.description || '',
                    time: meal.meal_time || '',
                    foods: meal.foods && meal.foods.length > 0 ? meal.foods : [{ ...emptyFood }]
                }));
            };
            setMeals(existingDiet.meals && existingDiet.meals.length > 0 ? mapMealsFromBackend(existingDiet.meals) : [emptyMeal]);
        } else {
            // Reset form for new diet
            setPlan({ name: '', description: '', image_url: '', student_email: '' });
            setMeals([emptyMeal]);
        }
    }, [existingDiet]); // Dependency array to re-run effect when existingDiet changes

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

    const handleMealChange = (mealIndex, field, value) => {
        const newMeals = [...meals];
        newMeals[mealIndex][field] = value;
        setMeals(newMeals);
    };

    const handleFoodChange = (mealIndex, foodIndex, field, value) => {
        const newMeals = [...meals];
        newMeals[mealIndex].foods[foodIndex][field] = value;
        setMeals(newMeals);
    };
    
    const addMeal = () => setMeals([...meals, { ...emptyMeal, foods: [{ ...emptyFood }] }]);
    const removeMeal = (index) => {
        if (meals.length === 1) { // Prevent removing the last meal
            setMeals([emptyMeal]); // Reset to one empty meal
        } else {
            setMeals(meals.filter((_, i) => i !== index));
        }
    };

    const addFood = (mealIndex) => {
        const newMeals = [...meals];
        newMeals[mealIndex].foods.push({ ...emptyFood });
        setMeals(newMeals);
    };

    const removeFood = (mealIndex, foodIndex) => {
        const newMeals = [...meals];
        if (newMeals[mealIndex].foods.length === 1) { // Prevent removing the last food item
            newMeals[mealIndex].foods = [{ ...emptyFood }]; // Reset to one empty food item
        } else {
            newMeals[mealIndex].foods = newMeals[mealIndex].foods.filter((_, i) => i !== foodIndex);
        }
        setMeals(newMeals);
    };

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
                title: plan.name,
                description: plan.description,
                image_url: plan.image_url,
                trainer_email: user.email,
                meals: meals,
            };
            if (plan.student_email) {
                fullPlanData.student_email = plan.student_email;
            }
            
            // Handle creating or updating based on existingDiet prop
            if (existingDiet) {
                await DietPlan.update(existingDiet.id, fullPlanData);
            } else {
                await DietPlan.create(fullPlanData);
            }
            onFinished();
        } catch (error) {
            console.error("Erro ao salvar plano alimentar:", error);
        }
        setIsSaving(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 mt-4 max-h-[70vh] overflow-y-auto pr-4">
            {/* Campos do Plano */}
            <div className="space-y-4">
                <div>
                    <Label htmlFor="plan-name">Nome da Dieta</Label>
                    <Input id="plan-name" value={plan.name} onChange={e => handlePlanChange('name', e.target.value)} required />
                </div>
                 {students && students.length > 0 && (
                     <div>
                        <Label>Atribuir para o aluno (Opcional)</Label>
                        <Select onValueChange={(value) => handlePlanChange('student_email', value === 'null' ? '' : value)} value={plan.student_email || ''}>
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
                    <Label>URL da Imagem (Opcional)</Label>
                    <div className="flex items-center gap-4">
                        <Input 
                            placeholder="https://placeholder.co/300x200.png" 
                            value={plan.image_url} 
                            onChange={e => handlePlanChange('image_url', e.target.value)} 
                            className="flex-grow" 
                        />
                        <Button type="button" variant="outline" asChild>
                            <Label htmlFor="file-upload" className="cursor-pointer">
                                {isUploading ? "Enviando..." : <><Upload className="w-4 h-4 mr-2" /> Upload</>}
                            </Label>
                        </Button>
                        <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                    </div>
                    {plan.image_url && <img src={plan.image_url} alt="Preview" className="mt-2 rounded-md max-h-40" />}
                </div>
            </div>

            {/* Seção de Refeições */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold border-t pt-4">Refeições</h3>
                {meals.map((meal, mealIndex) => (
                    <div key={mealIndex} className="border p-4 rounded-lg space-y-4 bg-gray-50/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Nome da Refeição</Label>
                                <Input 
                                    value={meal.meal_name} 
                                    onChange={e => handleMealChange(mealIndex, 'meal_name', e.target.value)} 
                                    placeholder="Ex: Café da Manhã"
                                />
                            </div>
                            <div>
                                <Label>Horário (opc.)</Label>
                                <Input 
                                    value={meal.time} 
                                    onChange={e => handleMealChange(mealIndex, 'time', e.target.value)} 
                                    placeholder="Ex: 08:00"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-medium">Alimentos</h4>
                            {meal.foods.map((food, foodIndex) => (
                                <div key={foodIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-white rounded border">
                                    <div>
                                        <Label>Alimento</Label>
                                        <Input 
                                            value={food.food_name} 
                                            onChange={e => handleFoodChange(mealIndex, foodIndex, 'food_name', e.target.value)} 
                                            placeholder="Novo Alimento"
                                        />
                                    </div>
                                    <div>
                                        <Label>Quantidade</Label>
                                        <Input 
                                            value={food.quantity} 
                                            onChange={e => handleFoodChange(mealIndex, foodIndex, 'quantity', e.target.value)} 
                                            placeholder="100g"
                                        />
                                    </div>
                                    <div>
                                        <Label>Calorias (opc.)</Label>
                                        <Input 
                                            value={food.calories} 
                                            onChange={e => handleFoodChange(mealIndex, foodIndex, 'calories', e.target.value)} 
                                            placeholder="Ex: 150 kcal"
                                        />
                                    </div>
                                    <div>
                                        <Label>Macros (opc.)</Label>
                                        <Input 
                                            value={food.macros} 
                                            onChange={e => handleFoodChange(mealIndex, foodIndex, 'macros', e.target.value)} 
                                            placeholder="P:10g C:20g G:5g"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Button 
                                            type="button" 
                                            variant="destructive" 
                                            size="sm" 
                                            onClick={() => removeFood(mealIndex, foodIndex)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />Remover Alimento
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => addFood(mealIndex)} 
                                className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                            >
                                <PlusCircle className="w-4 h-4 mr-2" />Adicionar Alimento
                            </Button>
                        </div>
                        
                        <Button 
                            type="button" 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => removeMeal(mealIndex)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />Remover Refeição
                        </Button>
                    </div>
                ))}
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addMeal} 
                    className="w-full border-orange-400 text-orange-600 hover:bg-orange-50"
                >
                    <PlusCircle className="w-4 h-4 mr-2" />Adicionar Refeição
                </Button>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={onFinished}>Cancelar</Button>
                <Button type="submit" disabled={isSaving || isUploading} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isSaving ? 'Salvando...' : existingDiet ? 'Salvar Alterações' : 'Criar Dieta'}
                </Button>
            </div>
        </form>
    );
}
