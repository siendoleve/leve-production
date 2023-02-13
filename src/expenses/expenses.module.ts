import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [ExpensesController],
  providers: [ExpensesService],
  imports: [TypeOrmModule.forFeature([Expense]), UsersModule],
})
export class ExpensesModule {}
