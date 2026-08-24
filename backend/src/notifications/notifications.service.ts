import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as webpush from 'web-push';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {
    // Configurar VAPID (usar variables de entorno)
    webpush.setVapidDetails(
      'mailto:tu-email@barograma.com',
      process.env.VAPID_PUBLIC_KEY || '',
      process.env.VAPID_PRIVATE_KEY || ''
    );
  }

  async saveSubscription(userId: string, subscription: any) {
    await this.prisma.pushSubscription.upsert({
      where: { userId },
      update: { subscription: JSON.stringify(subscription) },
      create: {
        userId,
        subscription: JSON.stringify(subscription),
      },
    });
    return { success: true };
  }

  async sendNotification(userId: string, title: string, body: string) {
    const userSubscription = await this.prisma.pushSubscription.findUnique({
      where: { userId },
    });

    if (!userSubscription) throw new Error('Usuario no suscrito');

    const subscription = JSON.parse(userSubscription.subscription);
    const payload = JSON.stringify({ title, body });
    
    await webpush.sendNotification(subscription, payload);
  }
}
