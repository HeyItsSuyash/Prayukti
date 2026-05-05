import { AttendanceStatus } from '@prisma/client';
import prisma from '../../core/config/prisma';

export interface CreateAttendanceDTO {
  userId: string;
  subjectId?: string;
  labId?: string;
  ipAddress?: string;
}

export class AttendanceRepository {
  async create(data: CreateAttendanceDTO) {
    return prisma.attendanceLog.create({
      data,
    });
  }

  async findActiveSession(userId: string) {
    return prisma.attendanceLog.findFirst({
      where: {
        userId,
        status: 'IN_PROGRESS',
        logoutTime: null,
      },
      orderBy: { loginTime: 'desc' },
    });
  }

  async update(id: string, data: any) {
    return prisma.attendanceLog.update({
      where: { id },
      data,
    });
  }

  /**
   * Optimized Analytics: Get student risk data in a single query.
   * This replaces the N+1 loop in the legacy codebase.
   */
  async getStudentRiskAnalytics(branch?: string) {
    // We can use raw SQL for complex aggregations if needed, 
    // or Prisma's groupBy and include features.
    return prisma.user.findMany({
      where: {
        role: 'STUDENT',
        branch: branch || undefined,
      },
      select: {
        id: true,
        fullName: true,
        rollNo: true,
        attendanceLogs: {
          select: {
            status: true,
            sessionDuration: true,
            isSuspicious: true,
          },
        },
        activities: {
          select: {
            score: true,
          },
        },
      },
    });
  }

  async getDailyAttendance(date: Date = new Date()) {
    const start = new Date(date.setHours(0, 0, 0, 0));
    const end = new Date(date.setHours(23, 59, 59, 999));

    return prisma.attendanceLog.findMany({
      where: {
        loginTime: {
          gte: start,
          lte: end,
        },
      },
      include: {
        user: true,
        subject: true,
      },
    });
  }
}
