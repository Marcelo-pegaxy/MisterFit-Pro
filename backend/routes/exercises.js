const express = require('express');
const router = express.Router();
const { getAllExercises, createExercise } = require('../controllers/exerciseController');
const { protect } = require('../middleware/auth');

// @route   GET /api/exercises
// @desc    Get all exercises
// @access  Private
router.get('/', protect, getAllExercises);

// @route   POST /api/exercises
// @desc    Create an exercise
// @access  Private
router.post('/', protect, createExercise);

module.exports = router; 