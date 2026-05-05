import { ExamStatus } from '@prisma/client';
import prisma from '../../core/config/prisma';

export interface CreateExamDTO {
  title: string;
  subjectId: string;
  experimentId: string;
  teacherId: string;
  durationMinutes: number;
  startTime: Date;
  studentIds: string[];
}

export class ExamRepository {
  async create(data: CreateExamDTO) {
    const { studentIds, ...examData } = data;
    
    return prisma.exam.create({
      data: {
        ...examData,
        students: {
          connect: studentIds.map(id => ({ id })),
        },
      },
      include: {
        subject: true,
        experiment: true,
        teacher: true,
        students: true,
      },
    });
  }

  async findAll() {
    return prisma.exam.findMany({
      include: {
        subject: true,
        experiment: true,
        teacher: true,
      },
    });
  }

  async findByTeacher(teacherId: string) {
    return prisma.exam.findMany({
      where: { teacherId },
      include: {
        subject: true,
        experiment: true,
        students: true,
      },
    });
  }

  async findByStudent(studentId: string) {
    return prisma.exam.findMany({
      where: {
        students: {
          some: { id: studentId },
        },
      },
      include: {
        subject: true,
        experiment: true,
        teacher: true,
      },
    });
  }

  async updateStatus(id: string, status: ExamStatus) {
    return prisma.exam.update({
      where: { id },
      data: { status },
    });
  }
}
