import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { Trade as TradeEntity } from '../trades/trade.entity';
import { MergedTrade } from '../trades/mergedTrade.entity';
import { calcPnL, getRateAndFactorMetrics } from './analyticsHelpers';

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
    console.log(
      `Calculating analytics for  trades from ${from.toISOString()} to ${to.toISOString()}`,
    );

    const relevantTrades = await this.mergedTradesRepository.findBy({
      exitDate: Between(from, to),
    });

    console.log(`There are ${relevantTrades.length} relevant trades`);

    const pnl = calcPnL(relevantTrades);
    const ratesAndFactors = getRateAndFactorMetrics(relevantTrades);

    return {
      pnl,
      ...ratesAndFactors,
    };
  }
}
