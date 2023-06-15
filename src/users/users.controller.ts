import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  Delete,
  Post,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { BabyDto } from './dtos/babydto';
import { UpdateBabyDto, UpdateBabyListDto } from './dtos/deleteUpdateBaby.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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
  @Post('addBaby')
  // @UseInterceptors(
  //   FilesInterceptor('images', 1, {
  //     preservePath: true,
  //     fileFilter(req, file, cb) {
  //       if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
  //         return cb(new Error('Only image files are allowed!'), false);
  //       }
  //       cb(null, true);
  //     },
  //     storage: diskStorage({
  //       destination: './uploads',
  //       filename: (req, file, cb) => {
  //         const randomName = Array(32)
  //           .fill(null)
  //           .map(() => Math.round(Math.random() * 16).toString(16))
  //           .join('');
  //         cb(null, `${randomName}${extname(file.originalname)}`);
  //       },
  //     }),
  //   }),
  // )
  addBaby(@Body() babyDto: BabyDto, @Req() req) {
    return this.usersService.addBaby(babyDto, req);
  }
  @Delete('deleteBaby')
  deleteBaby(@Body() babyDto: BabyDto, @Req() req) {
    return this.usersService.deleteBaby(babyDto, req);
  }
  @Patch('updateBaby')
  updateBaby(@Body() babyDto: UpdateBabyListDto, @Req() req) {
    return this.usersService.updateBaby(babyDto, req);
  }
}
