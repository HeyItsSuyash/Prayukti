import { AttendanceRepository } from '../repositories/AttendanceRepository';
import { BadRequestError, NotFoundError } from '../../core/errors/AppError';

export class AttendanceService {
  private attendanceRepository = new AttendanceRepository();

  async startSession(userId: string, data: any) {
    const active = await this.attendanceRepository.findActiveSession(userId);
    if (active) {
      throw new BadRequestError('User already has an active lab session');
    }

    return this.attendanceRepository.create({
      userId,
      subjectId: data.subjectId,
      labId: data.labId,
      ipAddress: data.ipAddress,
    });
  }

  async endSession(userId: string) {
    const active = await this.attendanceRepository.findActiveSession(userId);
    if (!active) {
      throw new NotFoundError('No active session found for this user');
    }

    const logoutTime = new Date();
    const loginTime = active.loginTime;
    const durationMinutes = Math.floor((logoutTime.getTime() - loginTime.getTime()) / 1000 / 60);

    return this.attendanceRepository.update(active.id, {
      logoutTime,
      sessionDuration: durationMinutes,
      status: 'PRESENT',
    });
  }

  async getDailyLogs() {
    return this.attendanceRepository.getDailyAttendance();
  }
}
