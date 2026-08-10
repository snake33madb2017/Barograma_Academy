import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.course.findMany({
      include: { 
        modules: { 
          include: { 
            lessons: true,
            quiz: { include: { questions: { include: { answers: true } } } }
          } 
        } 
      },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { 
        modules: { 
          include: { 
            lessons: true,
            quiz: { include: { questions: { include: { answers: true } } } }
          } 
        } 
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async create(data: { title: string; description?: string; thumbnail?: string }) {
    return this.prisma.course.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.course.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.course.delete({ where: { id } });
  }
}
