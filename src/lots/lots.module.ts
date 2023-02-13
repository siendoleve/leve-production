import { Module } from '@nestjs/common';
import { LotsService } from './lots.service';
import { LotsController } from './lots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lot } from './entities/lot.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [LotsController],
  providers: [LotsService],
  imports: [TypeOrmModule.forFeature([Lot]), UsersModule],
})
export class LotsModule {}
