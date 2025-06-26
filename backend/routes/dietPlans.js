const express = require('express');
const router = express.Router();
const dietPlanController = require('../controllers/dietPlanController');
const { protect } = require('../middleware/auth');

// GET /api/diet-plans
router.get('/', protect, dietPlanController.getDietPlans);

// POST /api/diet-plans
router.post('/', protect, dietPlanController.createDietPlan);

// PUT /api/diet-plans/:id
router.put('/:id', protect, dietPlanController.updateDietPlan);

// DELETE /api/diet-plans/:id
router.delete('/:id', protect, dietPlanController.deleteDietPlan);

// Listar todas as dietas disponíveis para vínculo
router.get('/available', dietPlanController.getAvailableForStudent);

// Vincular dieta ao aluno
router.post('/:id/assign', protect, dietPlanController.assignToStudent);

// Desvincular dieta do aluno
router.patch('/:id/unassign', protect, dietPlanController.unassignFromStudent);

module.exports = router; 