import { Sale } from 'src/sales/entities/sale.entity';
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
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  title: string;

  @Column('text', {
    nullable: false,
  })
  code: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column('integer', {
    default: 0,
  })
  stock: number;

  @Column('float', {
    default: 0,
  })
  price: number;

  @Column('boolean', {
    default: true,
  })
  status: boolean;

  @CreateDateColumn()
  createAt: string;

  @UpdateDateColumn()
  updateAt: string;

  @OneToMany(() => Sale, (sale) => sale.product, {
    cascade: false,
  })
  sales?: Sale;

  @BeforeInsert()
  updateTitleInsert() {
    this.title = this.title.toLowerCase().trim();
  }

  @BeforeUpdate()
  updateTitleUpdate() {
    this.title = this.title.toLowerCase().trim();
  }
}
