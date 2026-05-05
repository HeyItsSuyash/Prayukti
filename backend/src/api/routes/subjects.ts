import { Router } from 'express';
import { SubjectController } from '../controllers/SubjectController';
import { protect, authorize } from '../middleware/auth';

const router = Router();
const subjectController = new SubjectController();

router.get('/', protect, subjectController.getAll);
router.get('/:code', protect, subjectController.getByCode);
router.post('/', protect, authorize('ADMIN'), subjectController.create);

export default router;
