const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { protect } = require('../middleware/auth');

// @route   GET api/assessments/student/:studentId
// @desc    Get all assessments for a student
// @access  Private
router.get('/student/:studentId', protect, assessmentController.getAssessmentsByStudent);

// GET /api/assessments
router.get('/', protect, assessmentController.getAssessments);

// POST /api/assessments
router.post('/', protect, assessmentController.createAssessment);

module.exports = router; 