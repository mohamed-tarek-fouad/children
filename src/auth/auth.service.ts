// import { Cron, CronExpression } from "@nestjs/schedule";
import {
  // CACHE_MANAGER,
  ForbiddenException,
  // Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './../utils/prisma.service';
import { CreateUserDto } from './dtos/createUser.dto';
import * as bcrypt from 'bcrypt';
import { HttpException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer/dist';
import { ForgetPasswordDto } from './dtos/forgetPassword.dto';
import { ResetPasswordDto } from './dtos/resetPassword.dto';
// import { Cache } from 'cache-manager';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { ConfigService } from '@nestjs/config';
import { AuthDto } from './dtos/auth.dto';
import { JwtPayload, Tokens } from './types';
@Injectable()
export class AuthService {
  constructor(
    private jwtServise: JwtService,
    private prisma: PrismaService,
    private mailerService: MailerService,
    private config: ConfigService, // @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async login(dto: AuthDto) {
    try {
      const user = await this.prisma.users.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (!user)
        throw new HttpException(
          'wrong email or password',
          HttpStatus.BAD_REQUEST,
        );

      const passwordMatches = await bcrypt.compare(dto.password, user.password);
      if (!passwordMatches) throw new ForbiddenException('Access Denied');

      const tokens = await this.getTokens(user.id, user.email, user.role);
      await this.updateRtHash(user.id, tokens.refresh_token);
      delete user.password;
      return { ...tokens, message: 'loged in successfully', user };
    } catch (err) {
      return err;
    }
  }
  async register(userDto: CreateUserDto) {
    try {
      const userExist = await this.prisma.users.findUnique({
        where: {
          email: userDto.email,
        },
      });
      if (userExist) {
        throw new HttpException('Email already exist', HttpStatus.BAD_REQUEST);
      }
      const saltOrRounds = 10;
      userDto.password = await bcrypt.hash(userDto.password, saltOrRounds);
      const user = await this.prisma.users.create({
        data: userDto,
      });
      // await this.cacheManager.del('users');
      const tokens = await this.getTokens(user.id, user.email, user.role);
      await this.updateRtHash(user.id, tokens.refresh_token);
      return {
        ...user,
        tokens,
        message: 'Account has been created successfully',
      };
    } catch (err) {
      return err;
    }
  }
  async logout(req) {
    try {
      await this.prisma.users.updateMany({
        where: {
          id: req.user.id,
          hashedRt: {
            not: null,
          },
        },
        data: {
          hashedRt: null,
        },
      });
      return { message: 'loged out successfully' };
    } catch (err) {
      return err;
    }
  }
  async refreshTokens(userId: string, rt: string): Promise<Tokens> {
    const user = await this.prisma.users.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');
    const rtMatches = await bcrypt.compare(rt, user.hashedRt);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }
  async updateRtHash(userId: string, rt: string): Promise<void> {
    const hash = await bcrypt.hash(rt, 10);
    await this.prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt: hash,
      },
    });
  }

  async getTokens(userId: string, email: string, userRole): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      id: userId,
      email: email,
      role: userRole,
    };

    const [at, rt] = await Promise.all([
      this.jwtServise.signAsync(jwtPayload, {
        secret: this.config.get<string>('AT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtServise.signAsync(jwtPayload, {
        secret: this.config.get<string>('RT_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
    try {
      const validateUser = await this.prisma.users.findUnique({
        where: {
          email: forgetPasswordDto.email,
        },
      });
      if (!validateUser) {
        throw new HttpException("email doesn't exist", HttpStatus.BAD_REQUEST);
      }

      const secret = process.env.ACCESS_SECRET + validateUser.password;
      const token = this.jwtServise.sign(
        { email: forgetPasswordDto.email, id: validateUser.id },
        {
          secret,
          expiresIn: 60 * 15,
        },
      );

      const url = `http://localhost:3001/api/auth/resetPassword/${validateUser.id}/${token}`;

      await this.mailerService.sendMail({
        to: forgetPasswordDto.email,
        from: process.env.EMAIL_USER,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: 'Reset Password Confirmation Email',
        //template: "./templates/confirmation", // `.hbs` extension is appended automatically
        context: {
          // ✏️ filling curly brackets with content
          name: validateUser.firstname,
          url,
        },

        text: url,
      });
      return { message: 'email sent successfully' };
    } catch (err) {
      return err;
    }
  }
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    id: string,
    token: string,
  ) {
    try {
      const validateUser = await this.prisma.users.findUnique({
        where: {
          id,
        },
      });
      if (!validateUser) {
        throw new HttpException("user doesn't exist", HttpStatus.BAD_REQUEST);
      }
      const secret = process.env.ACCESS_SECRET + validateUser.password;
      const payload = await this.jwtServise.verify(token, { secret });
      if (payload.id !== validateUser.id) {
        throw new HttpException("user doesn't exist", HttpStatus.BAD_REQUEST);
      }
      const saltOrRounds = 10;
      resetPasswordDto.password = await bcrypt.hash(
        resetPasswordDto.password,
        saltOrRounds,
      );
      const user = await this.prisma.users.update({
        where: { id },
        data: {
          password: resetPasswordDto.password,
        },
      });
      delete user.password;
      return { ...user, message: 'reset password successfully' };
    } catch (err) {
      return err;
    }
  }

  async updateUser(req, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.prisma.users.findUnique({
        where: {
          id: req.user.id,
        },
      });
      if (!user) {
        throw new HttpException("user doesn't exist", HttpStatus.BAD_REQUEST);
      }
      const updatedUser = await this.prisma.users.update({
        where: { id: req.user.id },
        data: updateUserDto,
      });
      // await this.cacheManager.del('users');
      // await this.cacheManager.del(`user${id}`);
      return { ...updatedUser, message: 'user updated successfully' };
    } catch (err) {
      return err;
    }
  }
  async googleLogin(req) {
    try {
      const { name, emails, photos } = await req.user;
      const email = emails[0].value;
      const user = await this.prisma.users.findUnique({
        where: {
          email,
        },
      });
      if (user) {
        const tokens = await this.getTokens(user.id, user.email, user.role);
        await this.updateRtHash(user.id, tokens.refresh_token);
        return {
          user,
          tokens,
        };
      } else {
        const newUserWitoutRt = await this.prisma.users.create({
          data: {
            email: emails[0].value,
            firstname: name.givenName,
            lastname: name.familyName,
            picture: photos[0].value,
            provider: 'google',
          },
        });
        const jwtPayload = {
          id: user.id,
          email: email,
          role: user.role,
        };
        const [at, rt] = await Promise.all([
          this.jwtServise.signAsync(jwtPayload, {
            secret: this.config.get<string>('AT_SECRET'),
            expiresIn: '15m',
          }),
          this.jwtServise.signAsync(jwtPayload, {
            secret: this.config.get<string>('RT_SECRET'),
            expiresIn: '7d',
          }),
        ]);

        const hashedRt = await bcrypt.hash(rt, 10);
        const newUser = await this.prisma.users.update({
          where: {
            id: newUserWitoutRt.id,
          },
          data: {
            hashedRt,
          },
        });
        return { newUser, accessToken: at, refreshToken: rt };
      }
    } catch (err) {
      return err;
    }
  }

  async facebookLogin(req) {
    try {
      const { name, emails, photos } = await req.user;
      const email = emails[0].value;
      const user = await this.prisma.users.findUnique({
        where: {
          email,
        },
      });
      if (user) {
        const tokens = await this.getTokens(user.id, user.email, user.role);
        await this.updateRtHash(user.id, tokens.refresh_token);
        return {
          user,
          tokens,
        };
      } else {
        const newUserWitoutRt = await this.prisma.users.create({
          data: {
            email: emails[0].value,
            firstname: name.givenName,
            lastname: name.familyName,
            picture: photos[0].value,
            provider: 'facebook',
          },
        });
        const jwtPayload = {
          id: user.id,
          email: email,
          role: user.role,
        };
        const [at, rt] = await Promise.all([
          this.jwtServise.signAsync(jwtPayload, {
            secret: this.config.get<string>('AT_SECRET'),
            expiresIn: '15m',
          }),
          this.jwtServise.signAsync(jwtPayload, {
            secret: this.config.get<string>('RT_SECRET'),
            expiresIn: '7d',
          }),
        ]);

        const hashedRt = await bcrypt.hash(rt, 10);
        const newUser = await this.prisma.users.update({
          where: {
            id: newUserWitoutRt.id,
          },
          data: {
            hashedRt,
          },
        });
        return { newUser, accessToken: at, refreshToken: rt };
      }
    } catch (err) {
      return err;
    }
  }
}
