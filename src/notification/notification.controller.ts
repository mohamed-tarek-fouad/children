import { Controller, Post, Body, Req, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { DeviceTokenDto } from './dtos/deviceToken.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('notification')
export class NotificationController {
  constructor(
    private notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  @Post('registerToken')
  async registerDeviceToken(
    @Body() deviceTokenDto: DeviceTokenDto,
    @Req() req,
  ) {
    return this.notificationService.registerDeviceToken(deviceTokenDto, req);
  }
  @Post('inactivateNotification')
  async inactivateNotification(@Body() id: string, @Req() req) {
    return this.notificationService.inActivateNotification(id, req);
  }
  @Get()
  sendNotification() {
    const message = 'Hello, client!';
    this.eventEmitter.emit('notification', message);
    return 'Notification sent';
  }
  //   const eventSource = new EventSource('/notifications');
  // eventSource.addEventListener('notification', (event) => {
  //   const data = JSON.parse(event.data);
  //   console.log('Received notification:', data.message);
  // });
}
