import { PrismaService } from '.././utils/prisma.service';
import {
  Injectable,
  HttpException,
  HttpStatus,
  // Inject,
  // CACHE_MANAGER,
} from '@nestjs/common';
import { BabyDto } from './dtos/babydto';
import { DeleteBabyDto, DeleteBabyListDto } from './dtos/deleteUpdateBaby.dto';
// import { Cache } from 'cache-manager';
@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService, // @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async allUsers() {
    // const isCached = await this.cacheManager.get('users');
    // if (isCached) {
    //   return { isCached, message: 'fetched all users successfully' };
    // }
    const user = await this.prisma.users.findMany({});
    if (user.length === 0) {
      throw new HttpException('there is no users', HttpStatus.BAD_REQUEST);
    }
    // await this.cacheManager.set('users', user);
    return { ...user, message: 'fetched all users successfully' };
  }

  async userById(id: string) {
    // const isCached = await this.cacheManager.get(`user${id}`);
    // if (isCached) {
    //   return { isCached, message: 'fetched all users successfully' };
    // }
    const user = await this.prisma.users.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      throw new HttpException(
        "this user does'nt exist",
        HttpStatus.BAD_REQUEST,
      );
    }
    delete user.password;
    // await this.cacheManager.set(`user${id}`, {
    //   ...user,
    // });
    return { ...user, message: 'user fetched successfully' };
  }
  async addBaby(baby: BabyDto, req) {
    const user = await this.prisma.users.update({
      where: { id: req.user.id },
      data: {
        baby: {
          push: baby,
        },
      },
    });
    return { user, message: 'updated babies successfully' };
  }
  async deleteBaby(baby: DeleteBabyDto, req) {
    const userById = await this.prisma.users.findUnique({
      where: { id: req.user.id },
      select: { baby: true },
    });
    const newArray = userById.baby.filter((b) => {
      if (
        b.babyName !== baby.babyName ||
        b.birthDate !== baby.birthDate ||
        b.gender != baby.gender
      ) {
        return b;
      }
    });
    const user = await this.prisma.users.update({
      where: {
        id: req.user.id,
      },
      data: {
        baby: newArray,
      },
    });
    return { user, message: 'deleted baby successfully' };
  }
  async updateBaby(baby: DeleteBabyListDto, req) {
    const user = await this.prisma.users.update({
      where: {
        id: req.user.id,
      },
      data: {
        baby: baby.baby,
      },
    });
    return { user, message: 'updated babies successfully' };
  }
}
