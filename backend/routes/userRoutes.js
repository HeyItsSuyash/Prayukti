const express = require('express');
const router = express.Router();
const { getUsers, createUser, deleteUser, updateUser, sendMailToUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All user management routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/:id')
    .delete(deleteUser)
    .put(updateUser);

router.post('/send-email', sendMailToUser);

module.exports = router;
