/* eslint-disable prettier/prettier */
import {
  Controller,
  UseGuards,
  Post,
  Req,
  Body,
  Param,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/createUser.dto';
import { ForgetPasswordDto } from './dtos/forgetPassword.dto';
import { ResetPasswordDto } from './dtos/resetPassword.dto';
import { Patch } from '@nestjs/common';
import { UpdateUserDto } from './dtos/updateUser.dto';
import {
  GetCurrentUserId,
  GetCurrentUser,
  Public,
} from 'src/common/decorators/index';
import { RtGuard } from 'src/common/guards';
import { AuthDto } from './dtos/auth.dto';
import { AuthGuard } from '@nestjs/passport';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Public()
  @Post('login')
  login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }
  @Public()
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
  @Post('logout')
  logout(@Req() req) {
    return this.authService.logout(req);
  }
  @Public()
  @Post('forgetPassword')
  forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.authService.forgetPassword(forgetPasswordDto);
  }
  @Public()
  @Post('verifyResetMessage/:id/:token')
  verifyResetMessage(@Param('token') token: string, @Param('id') id: string) {
    return this.authService.verifyResetMessage(token, id);
  }
  @Public()
  @Post('resetPassword/:id/:token')
  resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Param('id') id: string,
    @Param('token') token: string,
  ) {
    return this.authService.resetPassword(resetPasswordDto, id, token);
  }
  @Patch()
  updateUser(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.updateUser(req, updateUserDto);
  }
  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  refreshTokens(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req);
  }
  @Get('facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  facebookAuthRedirect(@Req() req) {
    return this.authService.facebookLogin(req);
  }
}
