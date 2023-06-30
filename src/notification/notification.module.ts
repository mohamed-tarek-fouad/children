import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/app.service';
import { FirebaseModule } from 'nestjs-firebase';
import * as admin from 'firebase-admin';
@Module({
  imports: [
    FirebaseModule.forRootAsync({
      useFactory: () => ({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
        databaseURL: process.env.DATABASE_URL,
      }),
    }),
  ],

  controllers: [NotificationController],
  providers: [NotificationService, PrismaService, EventEmitter2],
  exports: [NotificationService],
})
export class NotificationModule {}
