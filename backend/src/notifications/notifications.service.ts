import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as webpush from 'web-push';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {
    webpush.setVapidDetails(
      'mailto:admin@barograma.com',
      process.env.VAPID_PUBLIC_KEY || '',
      process.env.VAPID_PRIVATE_KEY || ''
    );
  }

  async subscribe(userId: string, subscription: any) {
    const { endpoint, keys } = subscription;
    
    // Check if subscription already exists
    const existing = await this.prisma.pushSubscription.findUnique({
      where: { endpoint }
    });

    if (existing) {
      if (existing.userId !== userId) {
        // Update user if endpoint is the same but user changed
        await this.prisma.pushSubscription.update({
          where: { endpoint },
          data: { userId }
        });
      }
      return { success: true, message: 'Already subscribed' };
    }

    // Create new subscription
    await this.prisma.pushSubscription.create({
      data: {
        userId,
        endpoint,
        auth: keys.auth,
        p256dh: keys.p256dh,
      }
    });

    return { success: true, message: 'Subscribed successfully' };
  }

  async sendReminder(adminCompanyId: string, employeeId: string) {
    // Verify employee belongs to company
    const employee = await this.prisma.user.findFirst({
      where: { id: employeeId, companyId: adminCompanyId }
    });

    if (!employee) {
      throw new Error('Employee not found or unauthorized');
    }

    // Get subscriptions
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId: employeeId }
    });

    if (subscriptions.length === 0) {
      return { success: false, message: 'User has no push subscriptions' };
    }

    const payload = JSON.stringify({
      title: 'Barograma Academy',
      body: '¡Hola! Recuerda que tienes una capacitación pendiente de completar. ¡Entra ahora y avanza!',
      icon: '/icons/icon-192x192.png',
      url: '/dashboard'
    });

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: {
            auth: sub.auth,
            p256dh: sub.p256dh
          }
        }, payload);
        sent++;
      } catch (e: any) {
        if (e.statusCode === 404 || e.statusCode === 410) {
          // Subscription expired or removed
          await this.prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          this.logger.error('Failed to send push notification', e);
        }
        failed++;
      }
    }

    return { success: true, sent, failed };
  }
}
