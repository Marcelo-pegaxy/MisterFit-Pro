import { useState, useEffect } from 'react';

// Hook para gerenciar dados locais (substituindo a API Base44)
export const useLocalData = () => {
  const [data, setData] = useState({
    workoutPlans: [],
    dietPlans: [],
    assessments: [],
    chatMessages: [],
    students: [],
    payments: []
  });

  // Carregar dados do localStorage
  const loadData = () => {
    try {
      const workoutPlans = JSON.parse(localStorage.getItem('misterfit_workout_plans') || '[]');
      const dietPlans = JSON.parse(localStorage.getItem('misterfit_diet_plans') || '[]');
      const assessments = JSON.parse(localStorage.getItem('misterfit_assessments') || '[]');
      const chatMessages = JSON.parse(localStorage.getItem('misterfit_chat_messages') || '[]');
      const students = JSON.parse(localStorage.getItem('misterfit_students') || '[]');
      const payments = JSON.parse(localStorage.getItem('misterfit_payments') || '[]');

      setData({
        workoutPlans,
        dietPlans,
        assessments,
        chatMessages,
        students,
        payments
      });
    } catch (error) {
      console.error('Erro ao carregar dados locais:', error);
    }
  };

  // Salvar dados no localStorage
  const saveData = (key, newData) => {
    try {
      localStorage.setItem(`misterfit_${key}`, JSON.stringify(newData));
      setData(prev => ({ ...prev, [key]: newData }));
    } catch (error) {
      console.error(`Erro ao salvar ${key}:`, error);
    }
  };

  // Adicionar novo item
  const addItem = (key, item) => {
    const currentData = data[key] || [];
    const newData = [...currentData, { ...item, id: Date.now().toString() }];
    saveData(key, newData);
    return newData;
  };

  // Atualizar item
  const updateItem = (key, id, updates) => {
    const currentData = data[key] || [];
    const newData = currentData.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    saveData(key, newData);
    return newData;
  };

  // Remover item
  const removeItem = (key, id) => {
    const currentData = data[key] || [];
    const newData = currentData.filter(item => item.id !== id);
    saveData(key, newData);
    return newData;
  };

  // Buscar por ID
  const getById = (key, id) => {
    return data[key]?.find(item => item.id === id);
  };

  // Buscar por filtros
  const getByFilter = (key, filterFn) => {
    return data[key]?.filter(filterFn) || [];
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    loadData,
    saveData,
    addItem,
    updateItem,
    removeItem,
    getById,
    getByFilter
  };
};

// Hook específico para WorkoutPlans
export const useWorkoutPlans = () => {
  const { data, addItem, updateItem, removeItem, getById, getByFilter } = useLocalData();
  
  return {
    workoutPlans: data.workoutPlans,
    addWorkoutPlan: (plan) => addItem('workoutPlans', plan),
    updateWorkoutPlan: (id, updates) => updateItem('workoutPlans', id, updates),
    removeWorkoutPlan: (id) => removeItem('workoutPlans', id),
    getWorkoutPlanById: (id) => getById('workoutPlans', id),
    getWorkoutPlansByFilter: (filterFn) => getByFilter('workoutPlans', filterFn)
  };
};

// Hook específico para DietPlans
export const useDietPlans = () => {
  const { data, addItem, updateItem, removeItem, getById, getByFilter } = useLocalData();
  
  return {
    dietPlans: data.dietPlans,
    addDietPlan: (plan) => addItem('dietPlans', plan),
    updateDietPlan: (id, updates) => updateItem('dietPlans', id, updates),
    removeDietPlan: (id) => removeItem('dietPlans', id),
    getDietPlanById: (id) => getById('dietPlans', id),
    getDietPlansByFilter: (filterFn) => getByFilter('dietPlans', filterFn)
  };
};

// Hook específico para Assessments
export const useAssessments = () => {
  const { data, addItem, updateItem, removeItem, getById, getByFilter } = useLocalData();
  
  return {
    assessments: data.assessments,
    addAssessment: (assessment) => addItem('assessments', assessment),
    updateAssessment: (id, updates) => updateItem('assessments', id, updates),
    removeAssessment: (id) => removeItem('assessments', id),
    getAssessmentById: (id) => getById('assessments', id),
    getAssessmentsByFilter: (filterFn) => getByFilter('assessments', filterFn)
  };
};

// Hook específico para ChatMessages
export const useChatMessages = () => {
  const { data, addItem, updateItem, removeItem, getById, getByFilter } = useLocalData();
  
  return {
    chatMessages: data.chatMessages,
    addChatMessage: (message) => addItem('chatMessages', message),
    updateChatMessage: (id, updates) => updateItem('chatMessages', id, updates),
    removeChatMessage: (id) => removeItem('chatMessages', id),
    getChatMessageById: (id) => getById('chatMessages', id),
    getChatMessagesByFilter: (filterFn) => getByFilter('chatMessages', filterFn)
  };
}; 