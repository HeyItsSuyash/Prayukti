import { Router } from 'express';
import { AttendanceController } from '../controllers/AttendanceController';
import { protect, authorize } from '../middleware/auth';

const router = Router();
const attendanceController = new AttendanceController();

router.post('/start', protect, attendanceController.startSession);
router.post('/end', protect, attendanceController.endSession);
router.get('/analytics/risk', protect, authorize('TEACHER', 'ADMIN'), attendanceController.getRiskReport);

export default router;
