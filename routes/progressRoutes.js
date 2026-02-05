const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const verifyToken = require('../middleware/authMiddleware');

// All routes here should be protected
router.post('/mark', verifyToken, progressController.markQuestionSolved);
router.get('/:studentId', verifyToken, progressController.getSolvedQuestions);
router.get('/stats/:studentId', verifyToken, progressController.getStudentStats);

module.exports = router;
