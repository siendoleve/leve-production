import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { UsersModule } from 'src/users/users.module';
import { Lot } from 'src/lots/entities/lot.entity';
import { Product } from 'src/products/entities/product.entity';
import { Client } from 'src/clients/entities/client.entity';
import { Expense } from 'src/expenses/entities/expense.entity';
import { ExpensesPerLot } from 'src/expenses-per-lots/entities/expenses-per-lot.entity';

@Module({
  controllers: [SalesController],
  providers: [SalesService],
  imports: [
    TypeOrmModule.forFeature([
      Sale,
      Lot,
      Product,
      Client,
      Expense,
      ExpensesPerLot,
    ]),
    UsersModule,
  ],
})
export class SalesModule {}
