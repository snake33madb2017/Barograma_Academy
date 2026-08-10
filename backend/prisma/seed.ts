import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create a Company (Restaurant)
  const company = await prisma.company.upsert({
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

  const admin = await prisma.user.upsert({
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

  const student = await prisma.user.upsert({
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

  // 3. Create a Course
  const course = await prisma.course.create({
    data: {
      title: 'Curso de Hostelería Barograma',
      description: 'Liderazgo y servicio al cliente.',
      modules: {
        create: {
          title: 'Módulo 1: Atención al Cliente Top',
          order: 1,
          lessons: {
            create: [
              {
                title: 'Lección 1: La regla de los 5 segundos',
                videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                order: 1,
              },
              {
                title: 'Lección 2: Upselling Efectivo',
                videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                order: 2,
              }
            ]
          },
          quiz: {
            create: {
              title: 'Quiz de Atención y Upselling',
              minScore: 100,
              questions: {
                create: [
                  {
                    text: '¿Cuál es el tiempo máximo para atender a un cliente que acaba de entrar?',
                    answers: {
                      create: [
                        { text: '1 minuto', isCorrect: false },
                        { text: '5 segundos', isCorrect: true },
                        { text: 'Cuando se siente', isCorrect: false },
                      ]
                    }
                  },
                  {
                    text: 'El upselling consiste en...',
                    answers: {
                      create: [
                        { text: 'Dar descuentos', isCorrect: false },
                        { text: 'Ofrecer alternativa de mayor valor', isCorrect: true },
                        { text: 'Regalar', isCorrect: false },
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

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
