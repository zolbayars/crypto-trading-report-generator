import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { Trade as TradeEntity } from '../trades/trade.entity';
import { MergedTrade } from '../trades/mergedTrade.entity';
import { calcPnL } from './analyticsHelpers';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(TradeEntity)
    private tradesRepository: Repository<TradeEntity>,
    @InjectRepository(MergedTrade)
    private mergedTradesRepository: Repository<MergedTrade>,
    private dataSource: DataSource,
  ) {}

  // @todo specify return type
  async getAnalytics(from: Date, to: Date): Promise<object> {
    this.mergedTradesRepository.findBy({
      exitDate: Between(from, to),
    });

    const relevantTrades = await this.mergedTradesRepository
      .createQueryBuilder()
      .where('exitDate BETWEEN :from AND :to', { from, to })
      .getManyAndCount();

    const pnl = calcPnL(relevantTrades[0]);

    return {
      pnl,
    };
  }
}
