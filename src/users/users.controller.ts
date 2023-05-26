import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { BabyDto } from './dtos/babydto';
import { DeleteBabyDto } from './dtos/deleteUpdateBaby.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Get('')
  allUsers() {
    return this.usersService.allUsers();
  }
  @Get(':id')
  userById(@Param('id') id: string) {
    return this.usersService.userById(id);
  }
  @Patch('addBaby')
  addBaby(@Body() babyDto: BabyDto, @Req() req) {
    return this.usersService.addBaby(babyDto, req);
  }
  @Delete('deleteBaby')
  deleteBaby(@Body() babyDto: DeleteBabyDto, @Req() req) {
    return this.usersService.deleteBaby(babyDto, req);
  }
  @Patch('updateBaby')
  updateBaby(@Body() babyDto: BabyDto, @Req() req) {
    return this.usersService.updateBaby(babyDto, req);
  }
}
