import { Request, Response } from 'express';
import { ExamService } from '../../domain/services/ExamService';
import logger from '../../core/config/logger';

export class ExamController {
  private examService = new ExamService();

  create = async (req: Request, res: Response) => {
    const teacherId = req.user!.id;
    const exam = await this.examService.createExam({
      ...req.body,
      teacherId,
    });
    logger.info(`[EXAM] Created: ${exam.title} by ${teacherId}`);
    res.status(201).json({ status: 'success', data: { exam } });
  };

  getMyExams = async (req: Request, res: Response) => {
    const { id, role } = req.user!;
    const exams = await this.examService.getExamsForUser(id, role);
    res.json({ status: 'success', data: { exams } });
  };

  updateStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const exam = await this.examService.updateExamStatus(id, status);
    res.json({ status: 'success', data: { exam } });
  };
}
