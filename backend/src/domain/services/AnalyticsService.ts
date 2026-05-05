import { AttendanceRepository } from '../repositories/AttendanceRepository';

export class AnalyticsService {
  private attendanceRepository = new AttendanceRepository();

  async getStudentRiskReport(branch?: string) {
    const rawData = await this.attendanceRepository.getStudentRiskAnalytics(branch);

    return rawData.map(student => {
      const logs = student.attendanceLogs;
      const scores = student.activities.map(a => a.score || 0);
      
      const attendanceCount = logs.length;
      const suspiciousCount = logs.filter(l => l.isSuspicious).length;
      const avgDuration = logs.length > 0 
        ? logs.reduce((acc, curr) => acc + (curr.sessionDuration || 0), 0) / logs.length 
        : 0;
      
      const avgScore = scores.length > 0 
        ? scores.reduce((a, b) => a + b, 0) / scores.length 
        : 0;

      // Logic for Risk Calculation (Consolidated)
      let riskLevel = 'LOW';
      if (attendanceCount < 5 || avgScore < 40 || suspiciousCount > 2) {
        riskLevel = 'HIGH';
      } else if (attendanceCount < 10 || avgScore < 60) {
        riskLevel = 'MEDIUM';
      }

      return {
        id: student.id,
        fullName: student.fullName,
        rollNo: student.rollNo,
        riskLevel,
        metrics: {
          attendanceCount,
          suspiciousCount,
          avgDuration: Math.round(avgDuration),
          avgScore: Math.round(avgScore),
        }
      };
    });
  }
}
