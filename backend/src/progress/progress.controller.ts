import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProgressService } from './progress.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('progress')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post()
  @Roles('STUDENT')
  updateProgress(
    @Body() body: { lessonId: string; timeWatched: number; isCompleted: boolean },
    @Request() req: any
  ) {
    return this.progressService.upsertProgress(
      req.user.userId,
      body.lessonId,
      body.timeWatched,
      body.isCompleted
    );
  }

  @Get('me')
  @Roles('STUDENT')
  getMyProgress(@Request() req: any) {
    return this.progressService.getStudentProgress(req.user.userId);
  }
}
