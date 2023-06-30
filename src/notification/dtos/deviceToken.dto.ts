import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class DeviceTokenDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  deviceType: string;

  @IsString()
  @IsNotEmpty()
  notificationToken: string;
}
