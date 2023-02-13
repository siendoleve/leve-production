import {
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  description: string;

  @IsNumber()
  @IsPositive()
  value: number;

  @IsString()
  type: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
