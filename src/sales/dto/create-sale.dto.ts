import {
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateSaleDto {
  @IsString()
  clientId: string;

  @IsString()
  productId: string;

  @IsString()
  lotId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  totalprice: number;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
