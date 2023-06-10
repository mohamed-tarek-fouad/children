import {
  IsEnum,
  IsNotEmpty,
  Matches,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Baby } from '../types/baby.type';
import { Gender } from '@prisma/client';

export class DeleteBabyDto {
  @Matches(/^((0?[1-9])|(1[0-2]))\/((0?[1-9])|([1-2][0-9])|(3[0-1]))\/\d{4}$/)
  @IsNotEmpty()
  birthDate: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty()
  @MaxLength(30)
  @MinLength(3)
  @Matches(/^[a-zA-Z][a-zA-Z0-9]*$/)
  babyName: string;

  @IsNotEmpty()
  @Max(10)
  weight: number;
}
