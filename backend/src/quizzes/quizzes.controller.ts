import { Controller, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuizzesService } from './quizzes.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('quizzes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post(':id/submit')
  @Roles('STUDENT')
  submitQuiz(
    @Param('id') quizId: string,
    @Body() body: { answers: { questionId: string; answerId: string }[] },
    @Request() req: any
  ) {
    return this.quizzesService.submitQuiz(req.user.userId, quizId, body.answers);
  }
}
