import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateExpensesPerLotDto {
  @IsString()
  lotId: string;

  @IsString()
  expenseId: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
