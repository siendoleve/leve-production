import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { ClientsModule } from './clients/clients.module';
import { UsersModule } from './users/users.module';
import { SalesModule } from './sales/sales.module';
import { LotsModule } from './lots/lots.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ExpensesPerLotsModule } from './expenses-per-lots/expenses-per-lots.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      ssl: process.env.STAGE === 'prod',
      extra: {
        ssl:
          process.env.STAGE === 'prod' ? { rejectUnauthorized: false } : null,
      },

      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),

    ProductsModule,

    CommonModule,

    ClientsModule,

    UsersModule,

    SalesModule,

    LotsModule,

    ExpensesModule,

    ExpensesPerLotsModule,
  ],
})
export class AppModule {}
