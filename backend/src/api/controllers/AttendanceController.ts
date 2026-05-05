import { Request, Response } from 'express';
import { AttendanceService } from '../../domain/services/AttendanceService';
import { AnalyticsService } from '../../domain/services/AnalyticsService';
import logger from '../../core/config/logger';

export class AttendanceController {
  private attendanceService = new AttendanceService();
  private analyticsService = new AnalyticsService();

  startSession = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const session = await this.attendanceService.startSession(userId, req.body);
    logger.info(`[ATTENDANCE] Session started: ${userId}`);
    res.status(201).json({ status: 'success', data: { session } });
  };

  endSession = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const session = await this.attendanceService.endSession(userId);
    logger.info(`[ATTENDANCE] Session ended: ${userId}`);
    res.json({ status: 'success', data: { session } });
  };

  getRiskReport = async (req: Request, res: Response) => {
    const { branch } = req.query;
    const report = await this.analyticsService.getStudentRiskReport(branch as string);
    res.json({ status: 'success', data: { report } });
  };
}
