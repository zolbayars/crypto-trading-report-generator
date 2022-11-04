import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { BinanceTrade, Trade } from '@shared/types';
import { mergeTrades, binanceGet } from '../helpers/exchanges/binance';
import { Trade as TradeEntity, MarketType, Exchange } from './trade.entity';
import {
  MergedTrade,
  MergedTrade as MergedTradeEntity,
} from './mergedTrade.entity';
import { formatExchangeNumber } from '../utils';

@Injectable()
export class TradesService {
  constructor(
    @InjectRepository(TradeEntity)
    private tradesRepository: Repository<TradeEntity>,
    @InjectRepository(MergedTradeEntity)
    private mergedTradesRepository: Repository<MergedTradeEntity>,
    private dataSource: DataSource,
  ) {}

  async getIndividualTrades(
    startTime: DateTime,
    endTime: DateTime,
  ): Promise<BinanceTrade[]> {
    const paramsObj = {
      startTime: startTime.toMillis().toString(),
      endTime: endTime.toMillis().toString(),
    };

    const result = await binanceGet('fapi/v1/userTrades', paramsObj);
    const trades = result as BinanceTrade[];
    return trades;
  }

  async saveTrades(trades: BinanceTrade[]): Promise<void> {
    let error = null;
    const queryRunner = this.dataSource.createQueryRunner();
    const tradesToSave: TradeEntity[] = [];

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const trade of trades) {
        const tradeEntity = new TradeEntity();
        tradeEntity.exchangeTradeId = trade.id;
        tradeEntity.exchangeOrderId = trade.orderId;
        tradeEntity.symbol = trade.symbol;
        tradeEntity.side = trade.side;
        tradeEntity.price = formatExchangeNumber(trade.price);
        tradeEntity.qty = formatExchangeNumber(trade.qty);
        tradeEntity.quoteQty = formatExchangeNumber(trade.quoteQty);
        tradeEntity.realizedPnl = formatExchangeNumber(trade.realizedPnl);
        tradeEntity.marginAsset = trade.marginAsset;
        tradeEntity.commission = formatExchangeNumber(trade.commission);
        tradeEntity.commissionAsset = trade.commissionAsset;
        tradeEntity.exchangeCreatedAt = new Date(trade.time);
        tradeEntity.positionSide = trade.positionSide;
        tradeEntity.isBuyer = trade.buyer;
        tradeEntity.isMaker = trade.maker;
        tradeEntity.marketType = MarketType.FUTURES;
        tradeEntity.exchange = Exchange.BINANCE;

        tradesToSave.push(tradeEntity);
      }

      await queryRunner.manager.save(tradesToSave);
      await queryRunner.commitTransaction();
    } catch (err) {
      console.error('Error while saving trades. Rolling back', err);

      error = err.message;

      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    if (error) {
      throw new Error(error);
    }
  }

  async saveMergedTrades(trades: Trade[]): Promise<void> {
    let error = null;
    const queryRunner = this.dataSource.createQueryRunner();
    const mergedTradesToSave: MergedTradeEntity[] = [];

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const trade of trades) {
        const entryTrades = await this.tradesRepository.findBy({
          exchangeTradeId: In(trade.entryTradeIds),
        });

        const exitTrades = await this.tradesRepository.findBy({
          exchangeTradeId: In(trade.exitTradeIds),
        });

        const mergedTradeEntity = new MergedTradeEntity();
        mergedTradeEntity.entryDate = new Date(trade.entryDate);
        mergedTradeEntity.exitDate = new Date(trade.exitDate);
        mergedTradeEntity.symbol = trade.symbol;
        mergedTradeEntity.direction = trade.direction;
        mergedTradeEntity.entryPrice = trade.entryPrice;
        mergedTradeEntity.exitPrice = trade.exitPrice;
        mergedTradeEntity.size = trade.size;
        mergedTradeEntity.pnl = trade.pnl;
        mergedTradeEntity.pnlPercentage = trade.pnlPercentage;
        mergedTradeEntity.fee = trade.fee;
        mergedTradeEntity.feeAsset = trade.feeAsset;
        mergedTradeEntity.entryTrades = entryTrades;
        mergedTradeEntity.exitTrades = exitTrades;

        mergedTradesToSave.push(mergedTradeEntity);
      }

      await queryRunner.manager.save(mergedTradesToSave);
      await queryRunner.commitTransaction();
    } catch (err) {
      console.error('Error while saving trades. Rolling back', err);

      error = err.message;

      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    if (error) {
      throw new Error(error);
    }
  }

  async getTrades(
    startTime: DateTime,
    endTime: DateTime,
  ): Promise<MergedTradeEntity[]> {
    const latestTrade = await this.tradesRepository
      .createQueryBuilder()
      .orderBy('exchangeCreatedAt', 'DESC')
      .getOne();

    console.log(
      'The latest trade was made at: ',
      latestTrade?.exchangeCreatedAt,
    );

    const fromDate = !!latestTrade?.exchangeCreatedAt
      ? DateTime.fromJSDate(latestTrade?.exchangeCreatedAt)
      : startTime;

    // Addition of 1s (1000 millis) is necessary here to prevent re-fetching the last trade
    await this.syncTrades(fromDate.toMillis() + 1000);

    const mergedTrades = await this.mergedTradesRepository
      .createQueryBuilder()
      .orderBy('exitDate', 'DESC')
      .getManyAndCount();

    console.log(`Fetched ${mergedTrades[1]} trades from db`);

    return mergedTrades[0];
  }

  async syncTrades(
    sinceXMilliseconds: number,
    tillXMilliseconds?: number,
  ): Promise<void> {
    const allTrades: BinanceTrade[] = [];

    const fromDate = DateTime.fromMillis(sinceXMilliseconds);

    let startDate = fromDate;

    const tillDate = tillXMilliseconds
      ? DateTime.fromMillis(tillXMilliseconds)
      : DateTime.now();

    console.log(`Syncing the trades from ${fromDate} till ${tillDate}`);

    const dateDiff = tillDate.diff(startDate, ['weeks']);

    // Binance restricts the filter by 1 week
    if (dateDiff.weeks < 1) {
      const trades = await this.getIndividualTrades(startDate, tillDate);
      allTrades.push(...trades);
    } else {
      while (startDate < tillDate) {
        let endDate = startDate.plus({ weeks: 1 });

        if (endDate > DateTime.now()) {
          endDate = DateTime.now();
        }

        const trades = await this.getIndividualTrades(startDate, endDate);
        allTrades.push(...trades);

        startDate = startDate.plus({ weeks: 1 });
      }
    }

    if (!allTrades.length) {
      console.log(`No new trades to sync`);
      return;
    }

    console.log(`Saving ${allTrades.length} trades`);
    console.log(allTrades);

    await this.saveTrades(allTrades);

    const draftMergedTrades = mergeTrades(allTrades);
    const onlyClosedTrades = draftMergedTrades.filter(
      (trade) => !!trade.exitTradeIds.length,
    );

    console.log(
      `There are ${draftMergedTrades.length} merged trades. ${onlyClosedTrades.length} of them were closed`,
    );

    await this.saveMergedTrades(onlyClosedTrades);

    console.log(`Sync is completed`);
  }
}
