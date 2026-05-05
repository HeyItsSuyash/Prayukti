import { Role } from '@prisma/client';
import prisma from '../../core/config/prisma';

export interface CreateUserDTO {
  email: string;
  passwordHash: string;
  fullName: string;
  role?: Role;
  rollNo?: string;
  enrollmentNo?: string;
  branch?: string;
  year?: number;
  semester?: number;
  otp?: string;
  otpExpiry?: Date;
}

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        assignedSubjects: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        assignedSubjects: true,
      },
    });
  }

  async create(data: CreateUserDTO) {
    return prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Partial<CreateUserDTO> & { isVerified?: boolean }) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  async countStudents() {
    return prisma.user.count({
      where: { role: 'STUDENT' },
    });
  }
}
