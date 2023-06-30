import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/app.service';
import * as admin from 'firebase-admin';
import { DeviceTokenDto } from './dtos/deviceToken.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  sendNotification(data: any) {
    this.eventEmitter.emit('notification', data);
  }

  async registerDeviceToken(deviceTokenDto: DeviceTokenDto, req) {
    await this.prisma.notificationToken.updateMany({
      where: { usersId: req.user.id },
      data: {
        status: 'inactive',
      },
    });

    const notificationToken = this.prisma.notificationToken.create({
      data: {
        usersId: req.user.id,
        deviceType: deviceTokenDto.deviceType,
        notificationToken: deviceTokenDto.notificationToken,
      },
    });

    return {
      message: 'registered notification successfully',
      notificationToken,
    };
  }

  async sendPushNotification(userId: string, message: string) {
    const user = await this.prisma.notificationToken.findUnique({
      where: { id: userId },
    });
    if (!user?.notificationToken) {
      throw new Error(`User ${userId} does not have a Notification Token.`);
    }

    const payload = {
      title: 'New message',
      body: message,
    };
    await this.prisma.notification.create({
      data: {
        title: payload.title,
        body: payload.body,
        notificationTokenId: user.id,
      },
    });
    const messagDevice = {
      data: payload,
      token: user.notificationToken,
    };
    const messaging = admin.messaging();
    await messaging.send(messagDevice);
  }
  async inActivateNotification(id: string, req) {
    await this.prisma.notificationToken.updateMany({
      where: { id, usersId: req.user.id },
      data: { status: 'inactive' },
    });
    return { message: 'inactivated notification successfully' };
  }
}
