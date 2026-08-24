import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async seedDemo() {
    console.log('Seeding database from endpoint...');

    // 1. Create a Company (Restaurant)
    const company = await this.prisma.company.upsert({
      where: { slug: 'la-esquina' },
      update: {},
      create: {
        name: 'Restaurante La Esquina',
        slug: 'la-esquina',
      },
    });

    // 2. Create Admin and Student Users
    const passwordAdmin = await bcrypt.hash('admin123', 10);
    const passwordStudent = await bcrypt.hash('student123', 10);

    await this.prisma.user.upsert({
      where: { email: 'admin@laesquina.com' },
      update: {},
      create: {
        email: 'admin@laesquina.com',
        password: passwordAdmin,
        name: 'Carlos (Dueño)',
        role: 'ADMIN',
        companyId: company.id,
      },
    });

    await this.prisma.user.upsert({
      where: { email: 'juan@laesquina.com' },
      update: {},
      create: {
        email: 'juan@laesquina.com',
        password: passwordStudent,
        name: 'Juan (Camarero)',
        role: 'STUDENT',
        companyId: company.id,
      },
    });

    // 3. Clean up the old course
    const oldCourse = await this.prisma.course.findFirst({
      where: { title: 'Curso de Hostelería Barograma' }
    });
    if (oldCourse) {
      // Find modules to delete quizzes and lessons first
      // Delete certifications related to the course
      await this.prisma.certification.deleteMany({ where: { courseId: oldCourse.id } });

      const modules = await this.prisma.module.findMany({ where: { courseId: oldCourse.id } });
      for (const mod of modules) {
        // Delete lessons and their progress
        const lessons = await this.prisma.lesson.findMany({ where: { moduleId: mod.id } });
        for (const lesson of lessons) {
          await this.prisma.progress.deleteMany({ where: { lessonId: lesson.id } });
        }
        await this.prisma.lesson.deleteMany({ where: { moduleId: mod.id } });
        
        // Delete quizzes and their attempts
        const quizzes = await this.prisma.quiz.findMany({ where: { moduleId: mod.id } });
        for (const q of quizzes) {
          await this.prisma.quizAttempt.deleteMany({ where: { quizId: q.id } });
          const questions = await this.prisma.question.findMany({ where: { quizId: q.id } });
          for (const quest of questions) {
            await this.prisma.answer.deleteMany({ where: { questionId: quest.id } });
          }
          await this.prisma.question.deleteMany({ where: { quizId: q.id } });
        }
        await this.prisma.quiz.deleteMany({ where: { moduleId: mod.id } });
      }
      // Delete modules
      await this.prisma.module.deleteMany({ where: { courseId: oldCourse.id } });
      // Delete course
      await this.prisma.course.delete({ where: { id: oldCourse.id } });
    }

    // 4. Create the new ITA 1 Demo Course
    let course = await this.prisma.course.findFirst({
      where: { title: 'Manual de Liderazgo del ITA: El Líder ITA 1' }
    });

    if (!course) {
      course = await this.prisma.course.create({
        data: {
          title: 'Manual de Liderazgo del ITA: El Líder ITA 1',
          description: 'Aprende a gestionar la autoexigencia y el perfeccionismo en la hostelería. Descubre cómo liderar desde el ejemplo sin caer en la microgestión.',
          modules: {
            create: {
              title: 'Módulo 1: Conociendo al Líder ITA 1',
              order: 1,
              lessons: {
                create: [
                  {
                    title: 'Lección 1: ¿Quién es el Líder ITA 1?',
                    videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    order: 1,
                  },
                  {
                    title: 'Lección 2: La trampa de la Microgestión',
                    videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    order: 2,
                  },
                  {
                    title: 'Lección 3: Cómo dar Feedback Constructivo',
                    videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    order: 3,
                  }
                ]
              },
              quiz: {
                create: {
                  title: 'Evaluación: Liderazgo ITA 1',
                  minScore: 100,
                  questions: {
                    create: [
                      {
                        text: '¿Cuál es el principal riesgo de un líder ITA 1 durante un servicio (pase) de alto volumen?',
                        answers: {
                          create: [
                            { text: 'Despreocuparse y perder el control de la sala', isCorrect: false },
                            { text: 'Caer en la microgestión y querer hacer el trabajo de los demás', isCorrect: true },
                            { text: 'Ignorar los estándares de calidad del restaurante', isCorrect: false },
                          ]
                        }
                      },
                      {
                        text: 'Para que el equipo crezca y gane autonomía, el ITA 1 debe...',
                        answers: {
                          create: [
                            { text: 'Marcar estándares claros y confiar en el proceso del equipo', isCorrect: true },
                            { text: 'Supervisar por encima del hombro cada movimiento del camarero', isCorrect: false },
                            { text: 'Hacer el trabajo él mismo porque nadie lo hará tan bien', isCorrect: false },
                          ]
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      });
    }

    console.log('Seeding finished.');
    return { success: true, message: 'Demo course generated successfully!', courseId: course.id };
  }
}
