const express = require('express');
const router = express.Router();
const { getStudentById, getLinkedStudents } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Rota para buscar todos os alunos vinculados ao treinador logado
router.get('/students/linked', protect, getLinkedStudents);
// Rota para buscar aluno por ID
router.get('/students/:id', getStudentById);

module.exports = router; 