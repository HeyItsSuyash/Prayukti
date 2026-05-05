import { Request, Response } from 'express';
import { SubjectService } from '../../domain/services/SubjectService';
import logger from '../../core/config/logger';

export class SubjectController {
  private subjectService = new SubjectService();

  getAll = async (req: Request, res: Response) => {
    const subjects = await this.subjectService.getAllSubjects();
    res.json({ status: 'success', data: { subjects } });
  };

  getByCode = async (req: Request, res: Response) => {
    const { code } = req.params;
    const subject = await this.subjectService.getSubjectByCode(code);
    res.json({ status: 'success', data: { subject } });
  };

  create = async (req: Request, res: Response) => {
    const subject = await this.subjectService.createSubject(req.body);
    logger.info(`[SUBJECT] Created: ${subject.code}`);
    res.status(201).json({ status: 'success', data: { subject } });
  };
}
