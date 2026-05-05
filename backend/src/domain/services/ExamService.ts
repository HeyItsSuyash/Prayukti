import { ExamRepository } from '../repositories/ExamRepository';
import { BadRequestError, NotFoundError } from '../../core/errors/AppError';

export class ExamService {
  private examRepository = new ExamRepository();

  async createExam(data: any) {
    // Basic validation
    if (new Date(data.startTime) < new Date()) {
      throw new BadRequestError('Exam start time cannot be in the past');
    }
    
    return this.examRepository.create(data);
  }

  async getExamsForUser(userId: string, role: string) {
    if (role === 'TEACHER') {
      return this.examRepository.findByTeacher(userId);
    }
    return this.examRepository.findByStudent(userId);
  }

  async updateExamStatus(id: string, status: any) {
    return this.examRepository.updateStatus(id, status);
  }
}
