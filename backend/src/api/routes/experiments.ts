import { Router } from 'express';
import { ExperimentController } from '../controllers/ExperimentController';
import { protect, authorize } from '../middleware/auth';

const router = Router();
const experimentController = new ExperimentController();

router.get('/', protect, experimentController.getAll);
router.get('/:slug', protect, experimentController.getBySlug);
router.post('/', protect, authorize('ADMIN', 'TEACHER'), experimentController.create);

export default router;
