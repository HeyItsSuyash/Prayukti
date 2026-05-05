import { Router } from 'express';
import { ExamController } from '../controllers/ExamController';
import { protect, authorize } from '../middleware/auth';

const router = Router();
const examController = new ExamController();

router.post('/', protect, authorize('TEACHER', 'ADMIN'), examController.create);
router.get('/my-exams', protect, examController.getMyExams);
router.patch('/:id/status', protect, authorize('TEACHER', 'ADMIN'), examController.updateStatus);

export default router;
