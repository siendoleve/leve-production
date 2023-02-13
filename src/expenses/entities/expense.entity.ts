import { ExpensesPerLot } from 'src/expenses-per-lots/entities/expenses-per-lot.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Expense {
  //OPERATIVO - NOMINA - PUBLICIDAD - OTROS
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
    nullable: false,
  })
  description: string;

  @Column('float', {
    default: 0,
    nullable: false,
  })
  value: number;

  @Column('text', {
    nullable: false,
  })
  type: string;

  @Column('boolean', {
    default: true,
  })
  status: boolean;

  @CreateDateColumn()
  createat: string;

  @UpdateDateColumn()
  updateAt: string;

  @OneToMany(() => ExpensesPerLot, (expensesPerLot) => expensesPerLot.expense, {
    cascade: false,
    onUpdate: 'NO ACTION',
  })
  expensesPerLot: ExpensesPerLot;

  @BeforeInsert()
  updateTitleInsert() {
    this.description = this.description.toLowerCase().trim();
  }

  @BeforeUpdate()
  updatedescriptionUpdate() {
    this.description = this.description.toLowerCase().trim();
  }
}
