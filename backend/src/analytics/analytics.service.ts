import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { Trade as TradeEntity } from '../trades/trade.entity';
import { MergedTrade } from '../trades/mergedTrade.entity';
import { getPnLMetrics } from './analyticsHelpers';
import { PnLMetrics, PnLMetricsByMonths } from '@shared/types';
import { DateTime } from 'luxon';

interface Interval {
  from: DateTime;
  to: DateTime;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(TradeEntity)
    private tradesRepository: Repository<TradeEntity>,
    @InjectRepository(MergedTrade)
    private mergedTradesRepository: Repository<MergedTrade>,
    private dataSource: DataSource,
  ) {}

  async getAnalytics(from: DateTime, to: DateTime): Promise<PnLMetrics> {
    console.log(
      `Calculating analytics for trades from ${from.toISO()} to ${to.toISO()}`,
    );

    const relevantTrades = await this.mergedTradesRepository.findBy({
      exitDate: Between(from.toJSDate(), to.toJSDate()),
    });

    console.log(`There are ${relevantTrades.length} relevant trades`);

    const pnlMetrics = getPnLMetrics(relevantTrades);

    return pnlMetrics;
  }

  async getAnalyticsFromLastNMonths(n: number): Promise<PnLMetricsByMonths[]> {
    console.log(`Calculating analytics for the last ${n} months`);

    const result: PnLMetricsByMonths[] = [];
    const thisMonth = DateTime.now().startOf('month');

    const intervals: Interval[] = [];

    for (let i = 0; i < n; i++) {
      let from = thisMonth.minus({ month: i });
      let to = thisMonth.minus({ month: i - 1 });

      if (i === 0) {
        from = thisMonth;
        to = thisMonth.plus({ month: 1 });
      }

      intervals.push({
        from,
        to,
      });
    }

    for (const { from, to } of intervals) {
      const metrics = await this.getAnalytics(from, to);

      result.push({
        from: from.toJSDate(),
        to: to.toJSDate(),
        metrics,
      });
    }

    return result;
  }
}
