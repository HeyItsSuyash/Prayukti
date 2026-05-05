import { Request, Response } from 'express';
import { ExperimentService } from '../../domain/services/ExperimentService';
import logger from '../../core/config/logger';

export class ExperimentController {
  private experimentService = new ExperimentService();

  getAll = async (req: Request, res: Response) => {
    const experiments = await this.experimentService.getAllExperiments();
    res.json({ status: 'success', data: { experiments } });
  };

  getBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const experiment = await this.experimentService.getExperimentBySlug(slug);
    res.json({ status: 'success', data: { experiment } });
  };

  create = async (req: Request, res: Response) => {
    const experiment = await this.experimentService.createExperiment(req.body);
    logger.info(`[EXPERIMENT] Created: ${experiment.slug}`);
    res.status(201).json({ status: 'success', data: { experiment } });
  };
}
