const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public read-only route
router.get('/', resourceController.getResources);

// Admin only routes
router.post('/', protect, authorize('admin'), resourceController.createResource);
router.delete('/:id', protect, authorize('admin'), resourceController.deleteResource);

module.exports = router;
