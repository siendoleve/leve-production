import { Module } from '@nestjs/common';
import { ExpensesPerLotsService } from './expenses-per-lots.service';
import { ExpensesPerLotsController } from './expenses-per-lots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensesPerLot } from './entities/expenses-per-lot.entity';
import { UsersModule } from 'src/users/users.module';
import { Lot } from 'src/lots/entities/lot.entity';
import { Expense } from 'src/expenses/entities/expense.entity';

@Module({
  controllers: [ExpensesPerLotsController],
  providers: [ExpensesPerLotsService],
  imports: [
    TypeOrmModule.forFeature([ExpensesPerLot, Lot, Expense]),
    UsersModule,
  ],
})
export class ExpensesPerLotsModule {}
