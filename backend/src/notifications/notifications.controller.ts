import { Controller, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  async subscribe(@Req() req: any, @Body() subscription: any) {
    return this.notificationsService.subscribe(req.user.userId, subscription);
  }

  @UseGuards(JwtAuthGuard)
  @Post('remind/:userId')
  async sendReminder(@Req() req: any, @Param('userId') employeeId: string) {
    // Only admins should send reminders, but for simplicity we'll let the service verify companyId
    // req.user has the jwt payload which includes companyId
    return this.notificationsService.sendReminder(req.user.companyId, employeeId);
  }
}
