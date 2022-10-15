import { Module } from '@nestjs/common';
import { TradesController } from './trades.controller';
import { TradesService } from './trades.service';

@Module({
  controllers: [TradesController],
  providers: [TradesService],
})
export class TradesModule {}
