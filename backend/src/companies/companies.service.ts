import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.company.findMany({ include: { users: true } });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: { users: true },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async create(data: { name: string; slug: string }) {
    return this.prisma.company.create({ data });
  }

  // Create an employee for a specific company
  async addEmployee(companyId: string, employeeData: any) {
    const hashedPassword = await bcrypt.hash(employeeData.password, 10);
    return this.prisma.user.create({
      data: {
        ...employeeData,
        password: hashedPassword,
        companyId,
      },
    });
  }

  async getKpis(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            progress: true,
            quizAttempts: true,
          },
        },
      },
    });

    if (!company) throw new NotFoundException('Company not found');

    const activeStaff = company.users.filter(u => u.role === 'STUDENT').length;
    
    // Simplification for the demo: count passing quiz attempts as completed courses
    const allQuizAttempts = company.users.flatMap(u => u.quizAttempts);
    const completedCourses = allQuizAttempts.filter(qa => qa.passed).length;
    
    const averageScore = allQuizAttempts.length > 0
      ? allQuizAttempts.reduce((acc, curr) => acc + curr.score, 0) / allQuizAttempts.length
      : 0;

    return {
      activeStaff,
      completedCourses,
      averageScore: averageScore.toFixed(1),
      alerts: 2, // Mocked for demo
      weeklyData: [
        { name: 'Lun', finalizados: 4 },
        { name: 'Mar', finalizados: 3 },
        { name: 'Mie', finalizados: 7 },
        { name: 'Jue', finalizados: 5 },
        { name: 'Vie', finalizados: 2 },
        { name: 'Sab', finalizados: 8 },
        { name: 'Dom', finalizados: 9 },
      ]
    };
  }
}
