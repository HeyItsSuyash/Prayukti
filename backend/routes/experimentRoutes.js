const express = require('express');
const router = express.Router();
const experimentController = require('../controllers/experimentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes - read-only
router.get('/', experimentController.getExperiments);
router.get('/:experimentId', experimentController.getExperimentById);
router.get('/subject/:subjectId', experimentController.getExperimentsBySubject);

// Admin only routes
router.post('/', protect, authorize('admin'), experimentController.createExperiment);
router.post('/create', protect, authorize('admin'), experimentController.createExperiment);
router.post('/seed', protect, authorize('admin'), experimentController.seedExperiments);
router.put('/:id', protect, authorize('admin'), experimentController.updateExperiment);
router.delete('/:id', protect, authorize('admin'), experimentController.deleteExperiment);

module.exports = router;
