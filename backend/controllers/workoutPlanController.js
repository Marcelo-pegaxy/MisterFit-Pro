const supabase = require('../config/supabaseClient');

exports.createWorkoutPlan = async (req, res) => {
  try {
    console.log('REQ.BODY:', req.body);
    const { name, description, student_email, trainer_email, exercises } = req.body;
    // Buscar ID do personal pelo email
    const { data: personal, error: personalError } = await supabase
      .from('users')
      .select('id')
      .eq('email', trainer_email)
      .single();
    if (personalError || !personal) {
      return res.status(400).json({ message: 'Personal não encontrado. Verifique se o email do personal está correto.' });
    }
    // Buscar ID do aluno se informado
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
    // Inserir treino na tabela workouts
    const insertObj = {
      personal_id: personal.id,
      title: name,
      description: description || '',
      image_url: req.body.image_url || '',
      trainer_email: trainer_email
    };
    if (aluno_id) insertObj.aluno_id = aluno_id;
    const { data: workoutData, error } = await supabase
      .from('workouts')
      .insert([insertObj])
      .select()
      .single();
    if (error) throw error;
    // Se houver exercícios, inserir na tabela workout_exercises
    if (Array.isArray(exercises) && exercises.length > 0) {
      const workout_id = workoutData.id;
      for (const ex of exercises) {
        if (!ex.exercise_name) continue;
        // Buscar exercise_id pelo nome
        let { data: exercise, error: exError } = await supabase
          .from('exercises')
          .select('id')
          .eq('name', ex.exercise_name)
          .single();
        if (exError || !exercise) {
          // Se não existir, cria o exercício
          const { data: newEx, error: newExError } = await supabase
            .from('exercises')
            .insert([{ name: ex.exercise_name }])
            .select()
            .single();
          if (newExError || !newEx) continue;
          exercise = newEx;
        }
        await supabase
          .from('workout_exercises')
          .insert([
            {
              workout_id,
              exercise_id: exercise.id,
              sets: ex.sets ? parseInt(ex.sets) : null,
              reps: ex.reps || null,
              rest_period: ex.rest_interval || null,
              notes: ex.execution_notes || null,
              video_url: ex.video_url || null
            }
          ]);
      }
    }
    res.status(201).json({ message: 'Plano de treino criado!', data: workoutData });
  } catch (error) {
    console.error('Erro ao criar plano de treino:', error, error?.message, error?.details);
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkoutPlans = async (req, res) => {
  try {
    console.log('Query recebida em getWorkoutPlans:', req.query);
    const { personal_id, student_id, trainer_email } = req.query;
    const userPersonalId = req.user.id;

    let query = supabase
      .from('workouts')
      .select('*, workout_exercises(*, exercise:exercise_id(name))')
      .order('created_at', { ascending: false });

    if (trainer_email) {
      query = query.eq('trainer_email', trainer_email);
    } else if (student_id) {
      // Buscar treinos vinculados ao aluno (por student_id ou aluno_id)
      query = query.or(`student_id.eq.${student_id},aluno_id.eq.${student_id}`);
    } else if (personal_id) {
      query = query.eq('personal_id', personal_id);
    } else {
      query = query.eq('personal_id', userPersonalId);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar planos de treino:', error);
    res.status(500).json({ message: 'Erro ao buscar planos de treino' });
  }
};

exports.deleteWorkoutPlan = async (req, res) => {
  try {
    const { id } = req.params;
    // Exclui os exercícios associados primeiro (para evitar erro de FK)
    await supabase.from('workout_exercises').delete().eq('workout_id', id);
    // Exclui o treino
    const { error } = await supabase.from('workouts').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Plano de treino excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir plano de treino:', error);
    res.status(500).json({ message: 'Erro ao excluir plano de treino' });
  }
};

exports.updateWorkoutPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, student_email, trainer_email, exercises } = req.body;

    // Buscar ID do personal pelo email
    const { data: personal, error: personalError } = await supabase
      .from('users')
      .select('id')
      .eq('email', trainer_email)
      .single();
    if (personalError || !personal) {
      return res.status(400).json({ message: 'Personal não encontrado.' });
    }

    // Buscar ID do aluno se informado
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

    // Atualizar treino na tabela workouts
    const updateObj = {
      personal_id: personal.id,
      title: name,
      description: description || '',
      image_url: req.body.image_url || '',
      trainer_email: trainer_email
    };
    if (aluno_id) updateObj.aluno_id = aluno_id;

    const { error } = await supabase
      .from('workouts')
      .update(updateObj)
      .eq('id', id);

    if (error) throw error;

    // Atualizar exercícios associados: remover todos e inserir novamente
    await supabase.from('workout_exercises').delete().eq('workout_id', id);
    if (Array.isArray(exercises) && exercises.length > 0) {
      for (const ex of exercises) {
        if (!ex.exercise_name) continue;
        // Buscar ou criar exercício
        let { data: exercise, error: exError } = await supabase
          .from('exercises')
          .select('id')
          .eq('name', ex.exercise_name)
          .single();
        if (exError || !exercise) {
          const { data: newEx, error: newExError } = await supabase
            .from('exercises')
            .insert([{ name: ex.exercise_name }])
            .select()
            .single();
          if (newExError || !newEx) continue;
          exercise = newEx;
        }
        await supabase
          .from('workout_exercises')
          .insert([{
            workout_id: id,
            exercise_id: exercise.id,
            sets: ex.sets ? parseInt(ex.sets) : null,
            reps: ex.reps || null,
            rest_period: ex.rest_interval || null,
            notes: ex.execution_notes || null,
            video_url: ex.video_url || null
          }]);
      }
    }

    res.json({ message: 'Plano de treino atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar plano de treino:', error);
    res.status(500).json({ message: 'Erro ao atualizar plano de treino' });
  }
};

// Vincular treino ao aluno
exports.assignToStudent = async (req, res) => {
  try {
    console.log('=== ASSIGN WORKOUT TO STUDENT ===');
    const { id } = req.params;
    const { student_id } = req.body;
    
    console.log('Workout ID:', id);
    console.log('Student ID:', student_id);
    console.log('Request body:', req.body);
    
    if (!student_id) {
      return res.status(400).json({ message: 'student_id é obrigatório' });
    }
    
    const { data, error } = await supabase
      .from('workouts')
      .update({ student_id })
      .eq('id', id)
      .select();
      
    if (error) {
      console.error('Erro ao vincular treino:', error);
      return res.status(500).json({ message: error.message });
    }
    
    console.log('Treino vinculado com sucesso:', data);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro no assignToStudent:', error);
    res.status(500).json({ message: error.message });
  }
};

// Listar todos os treinos disponíveis para vínculo
exports.getAvailableForStudent = async (req, res) => {
  try {
    const { trainer_email } = req.query;
    let query = supabase
      .from('workouts')
      .select('*')
      .is('student_id', null);

    if (trainer_email) {
      query = query.eq('trainer_email', trainer_email);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Desvincular treino do aluno
exports.unassignFromStudent = async (req, res) => {
  const { id } = req.params;
  try {
    // Atualiza os campos student_id e aluno_id para NULL
    const { error } = await supabase
      .from('workouts')
      .update({ student_id: null, aluno_id: null })
      .eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Treino desvinculado com sucesso.' });
  } catch (error) {
    console.error('Erro ao desvincular treino:', error);
    res.status(500).json({ success: false, message: 'Erro ao desvincular treino.' });
  }
}; 