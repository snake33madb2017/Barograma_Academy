import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) {}

  async submitQuiz(userId: string, quizId: string, answers: { questionId: string; answerId: string }[]) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { include: { answers: true } }, module: { include: { course: true } } },
    });

    if (!quiz) throw new BadRequestException('Quiz not found');

    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    for (const submitted of answers) {
      const question = quiz.questions.find((q) => q.id === submitted.questionId);
      if (question) {
        const selectedAnswer = question.answers.find((a) => a.id === submitted.answerId);
        if (selectedAnswer && selectedAnswer.isCorrect) {
          correctAnswers++;
        }
      }
    }

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= quiz.minScore;

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        passed,
      },
    });

    // If passed and it's the final module quiz, we might generate a certificate.
    // For now, let's just return the result.
    if (passed) {
      // Logic for Certification generation (PDFKit) could go here
    }

    return { score, passed, attemptId: attempt.id };
  }
}
