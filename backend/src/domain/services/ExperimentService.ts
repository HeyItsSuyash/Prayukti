import { ExperimentRepository } from '../repositories/ExperimentRepository';
import { NotFoundError } from '../../core/errors/AppError';

export class ExperimentService {
  private experimentRepository = new ExperimentRepository();

  async getAllExperiments() {
    return this.experimentRepository.findAll();
  }

  async getExperimentBySlug(slug: string) {
    const experiment = await this.experimentRepository.findBySlug(slug);
    if (!experiment) {
      throw new NotFoundError(`Experiment with slug '${slug}' not found`);
    }
    return experiment;
  }

  async getExperimentsBySubject(subjectId: string) {
    return this.experimentRepository.findBySubject(subjectId);
  }

  async createExperiment(data: any) {
    return this.experimentRepository.create(data);
  }
}
