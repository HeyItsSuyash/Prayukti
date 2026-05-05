import { SubjectRepository } from '../repositories/SubjectRepository';
import { NotFoundError } from '../../core/errors/AppError';

export class SubjectService {
  private subjectRepository = new SubjectRepository();

  async getAllSubjects() {
    return this.subjectRepository.findAll();
  }

  async getSubjectByCode(code: string) {
    const subject = await this.subjectRepository.findByCode(code);
    if (!subject) {
      throw new NotFoundError(`Subject with code '${code}' not found`);
    }
    return subject;
  }

  async createSubject(data: any) {
    return this.subjectRepository.create(data);
  }
}
