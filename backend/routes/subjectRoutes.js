const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', subjectController.getSubjects);

// Admin only routes
router.post('/', protect, authorize('admin'), subjectController.createSubject);
router.post('/create', protect, authorize('admin'), subjectController.createSubject);
router.post('/seed', protect, authorize('admin'), subjectController.seedSubjects);
router.put('/:id', protect, authorize('admin'), subjectController.updateSubject);
router.delete('/:id', protect, authorize('admin'), subjectController.deleteSubject);

module.exports = router;
