const supabase = require('../config/supabaseClient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../config.env' });

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { name, email, password, user_type } = req.body;

  if (!name || !email || !password || !user_type) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  try {
    // Gerar hash da senha
    const password_hash = await bcrypt.hash(password, 10);

    // Inserir usuário na tabela 'users'
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        { name, email, user_type, password: password_hash, password_hash }
      ]);

    if (profileError) {
      return res.status(500).json({ message: profileError.message });
    }

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    // Buscar usuário pelo email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Usuário não encontrado.' });
    }

    // Comparar senha usando bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Senha incorreta.' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, user_type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Buscar perfil do usuário (sem o hash da senha)
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, full_name, name, email, user_type, unique_share_id, phone, birthdate, gender, city, bio, profile_photo, linked_trainer_email, is_active, created_at')
      .eq('id', user.id)
      .single();

    if(profileError || !userProfile) {
        return res.status(404).json({ message: "User profile not found." });
    }

    res.json({
      token,
      user: userProfile
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    // req.user is populated by the auth middleware
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('id, full_name, name, email, user_type, unique_share_id, phone, birthdate, gender, city, bio, profile_photo, linked_trainer_email, is_active, created_at')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

const generateUniqueId = () => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    // Pegue todos os campos que podem ser atualizados
    const {
      full_name, // ou name
      phone,
      birthdate,
      gender,
      city,
      bio,
      profile_photo,
      role // para user_type
    } = req.body;

    // Buscar o usuário atual para ver se já tem unique_share_id
    const { data: user, error: fetchUserError } = await supabase
      .from('users')
      .select('unique_share_id')
      .eq('id', req.user.id)
      .single();

    if (fetchUserError) {
      return res.status(500).json({ message: 'Erro ao buscar usuário.', error: fetchUserError.message });
    }

    // Montar objeto de atualização
    let updateFields = {
      full_name,
      phone,
      birthdate,
      gender,
      city,
      bio,
      profile_photo,
      user_type: role === 'student' ? 'aluno' : role === 'trainer' ? 'personal' : role
    };

    // Gerar unique_share_id se não existir
    if (!user.unique_share_id) {
      updateFields.unique_share_id = generateUniqueId();
    }

    // Remover campos undefined
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    // Atualizar usuário
    const { error } = await supabase
      .from('users')
      .update(updateFields)
      .eq('id', req.user.id);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    // Buscar o usuário atualizado
    const { data: updatedUser, error: fetchError } = await supabase
      .from('users')
      .select('id, full_name, name, email, user_type, unique_share_id, phone, birthdate, gender, city, bio, profile_photo, is_active, created_at')
      .eq('id', req.user.id)
      .single();

    if (fetchError) {
      return res.status(500).json({ message: 'Perfil atualizado, mas erro ao buscar usuário.', error: fetchError.message });
    }

    res.json({ message: 'Perfil atualizado com sucesso!', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar perfil.', error: error.message });
  }
};

// @desc    Get student by ID
// @route   GET /api/users/students/:id
// @access  Private (ou Public, conforme necessidade)
const getStudentById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, name, email, user_type, unique_share_id, phone, birthdate, gender, city, bio, profile_photo, is_active, created_at')
      .eq('id', id)
      .eq('user_type', 'aluno')
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Aluno não encontrado' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar aluno', error: error.message });
  }
};

// Listar todos os alunos vinculados ao treinador logado
const getLinkedStudents = async (req, res) => {
  try {
    const trainerEmail = req.user.email;
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, name, email, user_type, unique_share_id, phone, birthdate, gender, city, bio, profile_photo, is_active, created_at')
      .eq('user_type', 'aluno')
      .eq('linked_trainer_email', trainerEmail)
      .eq('is_active', true);
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar alunos vinculados', error: error?.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getStudentById,
  getLinkedStudents,
}; 