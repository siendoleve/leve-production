import { IsString, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class CreateLotDto {
  @IsString()
  code: string;

  @IsNumber()
  @IsPositive()
  quantityLiters: number;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsString()
  @IsOptional()
  discountReason?: string;

  @IsString()
  typeLot: string;

  @IsNumber()
  costLiter: number;

  @IsNumber()
  @IsOptional()
  reusedBottles?: number;

  @IsNumber()
  lotTotalCost: number;
}
