import { IsNotEmpty } from 'class-validator';
import { Baby } from '../types/baby.type';

export class BabyDto {
  @IsNotEmpty()
  baby: Baby[];
}
