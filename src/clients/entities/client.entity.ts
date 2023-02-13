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
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: false,
    nullable: false,
  })
  name: string;

  @Column('text', {
    unique: false,
    nullable: false,
  })
  surname: string;

  @Column('text', {
    unique: false,
    nullable: false,
  })
  dni: string;

  @Column('text', {
    unique: false,
    nullable: false,
  })
  phone: string;

  @Column('text', {
    unique: true,
    nullable: false,
  })
  email: string;

  @Column('text', {
    unique: false,
    nullable: false,
  })
  address: string;

  @Column('text', {
    unique: false,
    nullable: false,
  })
  city: string;

  @Column('boolean', {
    default: true,
  })
  status: boolean;

  @CreateDateColumn()
  createAt: string;

  @UpdateDateColumn()
  updateAt: string;

  @OneToMany(() => Sale, (sale) => sale.client, { cascade: false })
  sales?: Sale;

  @BeforeInsert()
  convertDataCreate() {
    this.name = this.name.toLowerCase();
    this.surname = this.surname.toLowerCase();
    this.email = this.email.toLowerCase();
  }

  @BeforeUpdate()
  convertDataUpdate() {
    this.name = this.name.toLowerCase();
    this.surname = this.surname.toLowerCase();
    this.email = this.email.toLowerCase();
  }
}
