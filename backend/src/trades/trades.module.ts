import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradesController } from './trades.controller';
import { TradesService } from './trades.service';
import { Trade } from './trade.entity';
import { MergedTrade } from './mergedTrade.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trade, MergedTrade])],
  controllers: [TradesController],
  providers: [TradesService],
})
export class TradesModule {}
