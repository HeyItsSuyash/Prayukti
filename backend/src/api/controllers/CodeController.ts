import { Request, Response } from 'express';
import { codeQueue } from '../../workers/codeExecutionWorker';
import logger from '../../core/config/logger';

export class CodeController {
  runCodeAsync = async (req: Request, res: Response) => {
    const { code, language, input } = req.body;
    
    const job = await codeQueue.add('execute', { code, language, input });
    
    logger.info(`[CODE] Job added to queue: ${job.id}`);
    res.json({ 
      status: 'success', 
      message: 'Code execution started', 
      data: { jobId: job.id } 
    });
  };

  getJobStatus = async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const job = await codeQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const state = await job.getState();
    res.json({ 
      status: 'success', 
      data: { 
        id: job.id, 
        state, 
        result: job.returnvalue,
        error: job.failedReason
      } 
    });
  };
}
