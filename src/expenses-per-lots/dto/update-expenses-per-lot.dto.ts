import { PartialType } from '@nestjs/mapped-types';
import { CreateExpensesPerLotDto } from './create-expenses-per-lot.dto';

export class UpdateExpensesPerLotDto extends PartialType(CreateExpensesPerLotDto) {}
