import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
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
    unique: true,
    nullable: false,
  })
  dni: string;

  @Column('text', {
    unique: true,
    nullable: false,
  })
  email: string;

  @Column('text', {
    unique: false,
    nullable: false,
    select: false,
  })
  password: string;

  @Column('text', {
    unique: false,
    nullable: false,
  })
  address: string;

  @Column('text', {
    unique: false,
    default: 'user',
  })
  role: string;

  @Column('boolean', {
    default: true,
  })
  status: boolean;

  @CreateDateColumn()
  createAt: string;

  @UpdateDateColumn()
  updateAt: string;

  @BeforeInsert()
  convertDataCreate() {
    this.name = this.name.toLowerCase().trim();
    this.surname = this.surname.toLowerCase().trim();
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  convertDataUpdate() {
    this.name = this.name.toLowerCase().trim();
    this.surname = this.surname.toLowerCase().trim();
    this.email = this.email.toLowerCase().trim();
  }
}
