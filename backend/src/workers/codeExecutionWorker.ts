import { Queue, Worker, Job } from 'bullmq';
import axios from 'axios';
import redis from '../core/config/redis';
import logger from '../core/config/logger';

export const codeQueue = new Queue('code-execution', { connection: redis });

export const codeWorker = new Worker(
  'code-execution',
  async (job: Job) => {
    const { code, language, input } = job.data;
    logger.info(`[WORKER] Processing job ${job.id} (${language})`);

    try {
      const response = await axios.post(
        'https://ce.judge0.com/submissions/?base64_encoded=false&wait=true',
        {
          source_code: code,
          language_id: language,
          stdin: input || "",
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      return response.data;
    } catch (err: any) {
      logger.error(`[WORKER] Job ${job.id} failed: ${err.message}`);
      throw err;
    }
  },
  { connection: redis }
);

codeWorker.on('completed', (job) => {
  logger.info(`[WORKER] Job ${job.id} completed successfully`);
});

codeWorker.on('failed', (job, err) => {
  logger.error(`[WORKER] Job ${job?.id} failed: ${err.message}`);
});
