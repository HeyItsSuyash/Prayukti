import prisma from '../../core/config/prisma';

export interface CreateSubjectDTO {
  code: string;
  name: string;
  branch?: string;
}

export class SubjectRepository {
  async findAll() {
    return prisma.subject.findMany({
      include: {
        experiments: true,
      },
      orderBy: { code: 'asc' },
    });
  }

  async findByCode(code: string) {
    return prisma.subject.findUnique({
      where: { code },
      include: {
        experiments: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.subject.findUnique({
      where: { id },
      include: {
        experiments: true,
      },
    });
  }

  async create(data: CreateSubjectDTO) {
    return prisma.subject.create({
      data,
    });
  }

  async update(id: string, data: Partial<CreateSubjectDTO>) {
    return prisma.subject.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.subject.delete({
      where: { id },
    });
  }
}
