const supabase = require('../config/supabaseClient');

// @desc    Fetch all exercises
// @route   GET /api/exercises
// @access  Private (for now, can be adjusted)
const getAllExercises = async (req, res) => {
  try {
    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching exercises:', error);
      return res.status(500).json({ message: 'Failed to fetch exercises', error: error.message });
    }

    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching exercises.', error: error.message });
  }
};

// @desc    Create a new exercise
// @route   POST /api/exercises
// @access  Private (e.g., only 'personal' users)
const createExercise = async (req, res) => {
  // Basic role check - this could be a separate middleware
  const { data: { user } } = await supabase.auth.getUser(req.headers.authorization.split(' ')[1]);
  const { data: userProfile } = await supabase.from('users').select('user_type').eq('id', user.id).single();
  
  // For now, let's assume any logged in user can create.
  // A proper implementation would check if userProfile.user_type === 'personal'
  
  const { name, muscle_group, difficulty, description, video_url } = req.body;

  if (!name || !muscle_group || !difficulty) {
    return res.status(400).json({ message: 'Please provide name, muscle group, and difficulty.' });
  }

  try {
    const { data: newExercise, error } = await supabase
      .from('exercises')
      .insert([
        { name, muscle_group, difficulty, description, video_url },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating exercise:', error);
      // Handle potential unique constraint violation (duplicate name)
      if (error.code === '23505') {
          return res.status(409).json({ message: 'An exercise with this name already exists.'});
      }
      return res.status(500).json({ message: 'Failed to create exercise', error: error.message });
    }

    res.status(201).json(newExercise);
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating exercise.', error: error.message });
  }
};

module.exports = {
  getAllExercises,
  createExercise,
}; 