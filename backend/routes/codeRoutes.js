const express = require('express');
const router = express.Router();
const codeController = require('../controllers/codeController');
const experimentActivityMiddleware = require('../middleware/experimentActivityMiddleware');
const { protect } = require('../middleware/authMiddleware');

// POST /api/code/run - Execute user code with activity tracking (requires authentication)
router.use('/run', protect, experimentActivityMiddleware.trackExperimentRun);
router.post('/run', protect, codeController.runCode);

// POST /api/code/complexity - Analyze time complexity (requires authentication)
router.post('/complexity', protect, codeController.analyzeComplexity);

module.exports = router;
