const express = require('express');
const router = express.Router();
const { gerarSugestaoTreino, gerarSugestaoDieta } = require('../controllers/iaController');

router.post('/treino', gerarSugestaoTreino);
router.post('/dieta', gerarSugestaoDieta);

module.exports = router; 