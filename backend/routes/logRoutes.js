const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Teacher/Admin only routes
router.get('/', protect, authorize('teacher', 'admin'), logController.getLogs);
router.post('/', protect, authorize('admin'), logController.createLog);

module.exports = router;
