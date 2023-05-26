import { IsNotEmpty } from 'class-validator';
import { Baby } from '../types/baby.type';

export class DeleteBabyDto {
  @IsNotEmpty()
  baby: Baby;
}
