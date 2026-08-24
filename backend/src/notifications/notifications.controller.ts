import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  async subscribe(@Body() subscription: any, @Req() req: any) {
    const userId = req.user.id || req.user.userId;
    return this.notificationsService.saveSubscription(userId, subscription);
  }
}
