import { Client } from 'src/clients/entities/client.entity';
import { Lot } from 'src/lots/entities/lot.entity';
import { Product } from 'src/products/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Client, (client) => client.sales, { eager: true })
  client: Client;

  @ManyToOne(() => Product, (product) => product.sales, { eager: true })
  product: Product;

  @ManyToOne(() => Lot, (lot) => lot.sale, { eager: true })
  lot: Lot;

  @Column('integer', {
    unique: false,
    nullable: false,
    default: 0,
  })
  quantity: number;

  @Column('float', {
    unique: false,
    nullable: false,
    default: 0,
  })
  totalprice: number;

  @Column('boolean', {
    default: true,
  })
  status: boolean;

  @CreateDateColumn()
  createat: string;

  @UpdateDateColumn()
  updateAt: string;
}
