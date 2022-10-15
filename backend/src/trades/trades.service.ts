import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BinanceTrade, StringMap, Trade } from '@shared/types';
import { mergeTrades, binanceGet } from '../helpers/exchanges/binance';
import { Trade as TradeEntity } from './trade.entity';

@Injectable()
export class TradesService {
  constructor(
    @InjectRepository(TradeEntity)
    private tradesRepository: Repository<TradeEntity>,
    private dataSource: DataSource,
  ) {}

  async getIndividualTrades(
    startTime: DateTime,
    endTime: DateTime,
  ): Promise<BinanceTrade[]> {
    const paramsObj: StringMap = {
      startTime: startTime.toMillis().toString(),
      endTime: endTime.toMillis().toString(),
    };

    const result = await binanceGet('fapi/v1/userTrades', paramsObj);
    const trades = result as BinanceTrade[];
    return trades;
  }

  async saveTrades(trades: BinanceTrade[]): Promise<string | null> {
    let error = null;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const trade of trades) {
        await queryRunner.manager.save({
          exchangeTradeId: trade.id,
          exchangeOrderId: trade.orderId,
          symbol: trade.symbol,
          side: trade.side,
          price: trade.price,
          qty: trade.qty,
          quoteQty: trade.quoteQty,
          realizedPnl: trade.realizedPnl,
          marginAsset: trade.marginAsset,
          commission: trade.commission,
          commissionAsset: trade.commissionAsset,
          exchangeCreatedAt: trade.time,
          positionSide: trade.positionSide,
          isBuyer: trade.buyer,
          isMaker: trade.maker,
          marketType: 'futures',
          exchange: 'binance',
        });
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      console.error('Error while saving trades. Rolling back', err);

      error = err.message;

      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return error;
  }

  async getTrades(startTime: DateTime, endTime: DateTime): Promise<Trade[]> {
    try {
      const trades = await this.getIndividualTrades(startTime, endTime);

      // Sorting because Binance sends the oldest trades at the beginning of the array
      trades.sort((a, b) => b.time - a.time);

      console.log(`Fetched ${trades.length} trades`);

      return mergeTrades(trades);
    } catch (error) {
      throw new Error(
        `Could not get the users's trades due to ${error.message}`,
      );
    }
  }

  async syncTrades(): Promise<void> {
    // @todo get this as an interval from front-end
    const LAST_N_WEEKS_TO_SYNC = 15;
    const allTrades = [];

    for (let i = LAST_N_WEEKS_TO_SYNC; i >= 1; i--) {
      const trades = await this.getIndividualTrades(
        DateTime.now().minus({ weeks: i }),
        DateTime.now().minus({ weeks: i - 1 }),
      );

      allTrades.push(...trades);
    }

    console.log('All trades: ' + allTrades.length);
    console.log('First', allTrades[0]);
    console.log('Last', allTrades[allTrades.length - 1]);
  }
}
