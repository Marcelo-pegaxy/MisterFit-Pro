const { body, validationResult } = require('express-validator');

// Middleware para verificar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
};

// Validações para registro
const validateRegister = [
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nome deve ter entre 2 e 255 caracteres'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'),
  
  body('role')
    .isIn(['student', 'trainer'])
    .withMessage('Role deve ser student ou trainer'),
  
  handleValidationErrors
];

// Validações para login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
  
  handleValidationErrors
];

// Validações para atualização de perfil
const validateUpdateProfile = [
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nome deve ter entre 2 e 255 caracteres'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Telefone inválido'),
  
  body('bio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Bio deve ter no máximo 1000 caracteres'),
  
  handleValidationErrors
];

// Validações para criação de plano de treino
const validateWorkoutPlan = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Título deve ter entre 3 e 255 caracteres'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres'),
  
  body('difficulty_level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Nível de dificuldade inválido'),
  
  body('duration_weeks')
    .optional()
    .isInt({ min: 1, max: 52 })
    .withMessage('Duração deve ser entre 1 e 52 semanas'),
  
  handleValidationErrors
];

// Validações para criação de plano de dieta
const validateDietPlan = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Título deve ter entre 3 e 255 caracteres'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres'),
  
  body('daily_calories')
    .optional()
    .isInt({ min: 500, max: 10000 })
    .withMessage('Calorias diárias devem ser entre 500 e 10000'),
  
  handleValidationErrors
];

// Validações para avaliação física
const validateAssessment = [
  body('assessment_date')
    .isISO8601()
    .withMessage('Data de avaliação inválida'),
  
  body('weight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Peso deve ser entre 20 e 500 kg'),
  
  body('height')
    .optional()
    .isFloat({ min: 100, max: 250 })
    .withMessage('Altura deve ser entre 100 e 250 cm'),
  
  body('body_fat_percentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Percentual de gordura deve ser entre 0 e 100'),
  
  handleValidationErrors
];

// Validações para mensagem do chat
const validateChatMessage = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Mensagem deve ter entre 1 e 1000 caracteres'),
  
  body('receiver_id')
    .isUUID()
    .withMessage('ID do destinatário inválido'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateWorkoutPlan,
  validateDietPlan,
  validateAssessment,
  validateChatMessage
}; 