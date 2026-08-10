import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async upsertProgress(userId: string, lessonId: string, timeWatched: number, isCompleted: boolean) {
    return this.prisma.progress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      update: {
        timeWatched,
        isCompleted,
      },
      create: {
        userId,
        lessonId,
        timeWatched,
        isCompleted,
      },
    });
  }

  async getStudentProgress(userId: string) {
    return this.prisma.progress.findMany({
      where: { userId },
      include: { lesson: true },
    });
  }
}
