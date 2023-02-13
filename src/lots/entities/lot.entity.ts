import { ExpensesPerLot } from 'src/expenses-per-lots/entities/expenses-per-lot.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Lot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('float', {
    default: 0,
  })
  quantityLiters: number;

  @Column('text', {
    unique: true,
    nullable: false,
  })
  code: string;

  @Column('float', {
    default: 0,
  })
  discount: number;

  @Column('text', {
    unique: false,
    nullable: true,
  })
  discountReason: string;

  @Column('text', {
    unique: false,
    nullable: true,
  })
  typeLot: string;

  @Column('float', {
    default: 0,
  })
  costLiter: number;

  @Column('integer', {
    default: 0,
  })
  reusedBottles: number;

  @Column('float', {
    default: 0,
  })
  lotTotalCost: number;

  @Column('boolean', {
    default: true,
  })
  status: boolean;

  @OneToMany(() => Sale, (sale) => sale.lot, { cascade: false })
  sale: Sale;

  @OneToMany(() => ExpensesPerLot, (expensesPerLot) => expensesPerLot.lot, {
    cascade: false,
    eager: true,
  })
  expensesPerLot: ExpensesPerLot;

  @CreateDateColumn()
  createAt: string;

  @UpdateDateColumn()
  updateAt: string;
}
