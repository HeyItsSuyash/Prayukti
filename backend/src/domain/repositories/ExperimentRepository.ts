import prisma from '../../core/config/prisma';

export interface CreateExperimentDTO {
  slug: string;
  title: string;
  description?: string;
  subjectId: string;
}

export class ExperimentRepository {
  async findAll() {
    return prisma.experiment.findMany({
      include: {
        subject: true,
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.experiment.findUnique({
      where: { slug },
      include: {
        subject: true,
      },
    });
  }

  async findBySubject(subjectId: string) {
    return prisma.experiment.findMany({
      where: { subjectId },
    });
  }

  async create(data: CreateExperimentDTO) {
    return prisma.experiment.create({
      data,
    });
  }

  async update(id: string, data: Partial<CreateExperimentDTO>) {
    return prisma.experiment.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.experiment.delete({
      where: { id },
    });
  }
}
