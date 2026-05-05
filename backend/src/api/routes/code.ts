import { Router } from 'express';
import { CodeController } from '../controllers/CodeController';
import { protect } from '../middleware/auth';

const router = Router();
const codeController = new CodeController();

router.post('/run', protect, codeController.runCodeAsync);
router.get('/status/:jobId', protect, codeController.getJobStatus);

export default router;
