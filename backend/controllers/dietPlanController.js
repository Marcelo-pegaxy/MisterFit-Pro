const supabase = require('../config/supabaseClient');

exports.getDietPlans = async (req, res) => {
  try {
    console.log('Query recebida em getDietPlans:', req.query);
    const { personal_id, student_id, trainer_email } = req.query;
    const userPersonalId = req.user.id;

    let query = supabase
      .from('diets')
      .select('*')
      .order('created_at', { ascending: false });

    if (trainer_email) {
      query = query.eq('trainer_email', trainer_email);
    } else if (student_id) {
      // Buscar dietas vinculadas ao aluno (por aluno_id ou student_id)
      query = query.or(`aluno_id.eq.${student_id},student_id.eq.${student_id}`);
    } else if (personal_id) {
      query = query.eq('personal_id', personal_id);
    } else {
      query = query.eq('personal_id', userPersonalId);
    }

    const { data: diets, error } = await query;
    if (error) throw error;

    // Buscar refeições para cada dieta
    for (const diet of diets) {
      const { data: meals, error: mealsError } = await supabase
        .from('diet_meals')
        .select('*')
        .eq('diet_id', diet.id);
      if (meals) {
        for (const meal of meals) {
          const { data: foods, error: foodsError } = await supabase
            .from('meal_foods')
            .select('*')
            .eq('meal_id', meal.id);
          meal.foods = foods || [];
        }
      }
      diet.meals = meals || [];
    }

    res.json(diets);
  } catch (error) {
    console.error('Erro ao buscar dietas:', error);
    res.status(500).json({ message: 'Erro ao buscar dietas' });
  }
};

exports.createDietPlan = async (req, res) => {
  try {
    const { title, description, image_url, student_email, trainer_email } = req.body;
    // Buscar IDs do aluno e do personal pelo email
    let aluno_id = null;
    if (student_email) {
      const { data: aluno, error: alunoError } = await supabase
        .from('users')
        .select('id')
        .eq('email', student_email)
        .single();
      if (aluno && !alunoError) {
        aluno_id = aluno.id;
      }
    }
    let personal_id = null;
    if (trainer_email) {
      const { data: personal, error: personalError } = await supabase
        .from('users')
        .select('id')
        .eq('email', trainer_email)
        .single();
      if (personal && !personalError) {
        personal_id = personal.id;
      }
    }
    const insertObj = {
      title,
      description: description || '',
      image_url: image_url || '',
      aluno_id,
      personal_id,
      trainer_email
    };
    console.log('DEBUG - Criando dieta com:', insertObj);
    
    // Validar se personal_id foi encontrado
    if (!personal_id) {
      return res.status(400).json({ message: 'Personal não encontrado. Verifique se o email do personal está correto.' });
    }
    
    const { data: createdDiet, error: dietError } = await supabase
      .from('diets')
      .insert([insertObj])
      .select()
      .single();
    if (dietError) throw dietError;

    // Salvar refeições e alimentos
    if (req.body.meals && Array.isArray(req.body.meals)) {
      for (const meal of req.body.meals) {
        // Inserir meal
        const { data: createdMeal, error: mealError } = await supabase
          .from('diet_meals')
          .insert([{
            diet_id: createdDiet.id,
            meal_time: meal.time || null,
            description: meal.meal_name || '',
            calories: null // ou calcule a soma das calorias dos alimentos, se desejar
          }])
          .select()
          .single();
        if (mealError) throw mealError;
        // Inserir foods
        if (meal.foods && Array.isArray(meal.foods)) {
          for (const food of meal.foods) {
            await supabase
              .from('meal_foods')
              .insert([{
                meal_id: createdMeal.id,
                food_name: food.food_name || '',
                quantity: food.quantity || '',
                calories: food.calories || '',
                macros: food.macros || ''
              }]);
          }
        }
      }
    }

    res.status(201).json({ message: 'Dieta criada!', data: createdDiet });
  } catch (error) {
    console.error('Erro ao criar dieta:', error, error?.message, error?.details);
    res.status(500).json({ message: 'Erro ao criar dieta', error: error?.message, details: error?.details });
  }
};

exports.updateDietPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image_url, student_email, trainer_email } = req.body;
    // Buscar IDs do aluno e do personal pelo email
    let aluno_id = null;
    if (student_email) {
      const { data: aluno, error: alunoError } = await supabase
        .from('users')
        .select('id')
        .eq('email', student_email)
        .single();
      if (aluno && !alunoError) {
        aluno_id = aluno.id;
      }
    }
    let personal_id = null;
    if (trainer_email) {
      const { data: personal, error: personalError } = await supabase
        .from('users')
        .select('id')
        .eq('email', trainer_email)
        .single();
      if (personal && !personalError) {
        personal_id = personal.id;
      }
    }
    const updateObj = {
      title,
      description: description || '',
      image_url: image_url || '',
      aluno_id,
      personal_id,
      trainer_email
    };
    const { error } = await supabase
      .from('diets')
      .update(updateObj)
      .eq('id', id);
    if (error) throw error;

    // Remover refeições e alimentos antigos
    const { data: oldMeals } = await supabase.from('diet_meals').select('id').eq('diet_id', id);
    if (oldMeals && oldMeals.length > 0) {
      const mealIds = oldMeals.map(m => m.id);
      await supabase.from('meal_foods').delete().in('meal_id', mealIds);
      await supabase.from('diet_meals').delete().eq('diet_id', id);
    }

    // Inserir novas refeições e alimentos
    if (req.body.meals && Array.isArray(req.body.meals)) {
      for (const meal of req.body.meals) {
        const { data: createdMeal, error: mealError } = await supabase
          .from('diet_meals')
          .insert([{
            diet_id: id,
            meal_time: meal.time || null,
            description: meal.meal_name || '',
            calories: null
          }])
          .select()
          .single();
        if (mealError) throw mealError;
        if (meal.foods && Array.isArray(meal.foods)) {
          for (const food of meal.foods) {
            await supabase
              .from('meal_foods')
              .insert([{
                meal_id: createdMeal.id,
                food_name: food.food_name || '',
                quantity: food.quantity || '',
                calories: food.calories || '',
                macros: food.macros || ''
              }]);
          }
        }
      }
    }

    res.json({ message: 'Dieta atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar dieta:', error);
    res.status(500).json({ message: 'Erro ao atualizar dieta' });
  }
};

exports.deleteDietPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('diets').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Dieta excluída com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir dieta:', error);
    res.status(500).json({ message: 'Erro ao excluir dieta' });
  }
};

// Vincular dieta ao aluno
exports.assignToStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({ message: 'student_id é obrigatório' });
    }

    // Atualiza a coluna student_id na tabela diets
    const { data, error } = await supabase
      .from('diets')
      .update({ student_id })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Listar todas as dietas disponíveis para vínculo
exports.getAvailableForStudent = async (req, res) => {
  const { data, error } = await supabase
    .from('diets')
    .select('*');
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
};

exports.unassignFromStudent = async (req, res) => {
  try {
    const { id } = req.params;
    // Remove vínculo do aluno (seta aluno_id e student_id como null)
    const { error } = await supabase
      .from('diets')
      .update({ aluno_id: null, student_id: null })
      .eq('id', id);
    if (error) throw error;
    res.json({ message: 'Dieta desvinculada do aluno com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao desvincular dieta do aluno', error: error?.message });
  }
}; 