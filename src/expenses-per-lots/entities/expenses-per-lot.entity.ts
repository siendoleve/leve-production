import { Expense } from 'src/expenses/entities/expense.entity';
import { Lot } from 'src/lots/entities/lot.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ExpensesPerLot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Lot, (lot) => lot.expensesPerLot)
  lot: Lot;

  @ManyToOne(() => Expense, (expense) => expense.expensesPerLot)
  expense: Expense;

  @Column('float', {
    nullable: false,
  })
  value: number;

  @Column('boolean', {
    default: true,
  })
  status: boolean;

  @CreateDateColumn()
  createat: string;

  @UpdateDateColumn()
  updateAt: string;
}
