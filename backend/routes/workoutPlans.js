const express = require('express');
const router = express.Router();
const workoutPlanController = require('../controllers/workoutPlanController');
const { protect } = require('../middleware/auth');

// GET /api/workout-plans
router.get('/', protect, workoutPlanController.getWorkoutPlans);

// POST /api/workout-plans
router.post('/', protect, workoutPlanController.createWorkoutPlan);

// DELETE /api/workout-plans/:id
router.delete('/:id', protect, workoutPlanController.deleteWorkoutPlan);

// PUT /api/workout-plans/:id
router.put('/:id', protect, workoutPlanController.updateWorkoutPlan);

// Listar todos os treinos disponíveis para vínculo
router.get('/available', protect, workoutPlanController.getAvailableForStudent);

// Vincular treino ao aluno
router.post('/:id/assign', protect, workoutPlanController.assignToStudent);

// Desvincular treino do aluno
router.patch('/:id/unassign', protect, workoutPlanController.unassignFromStudent);

module.exports = router; 