const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public read for settings, admin only for write
router.get('/', settingController.getSettings);
router.post('/', protect, authorize('admin'), settingController.upsertSetting);

module.exports = router;
