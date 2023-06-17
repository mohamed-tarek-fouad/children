import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from './../utils/prisma.service';
import { GoogleStrategy } from 'src/auth/strategies/google.strategy';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, GoogleStrategy, PrismaService],
})
export class UsersModule {}
