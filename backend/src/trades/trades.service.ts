import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { BinanceTrade, StringMap, Trade } from '@shared/types';
import { mergeTrades, binanceGet } from '../helpers/exchanges/binance';
import { Trade as TradeEntity, MarketType, Exchange } from './trade.entity';
import { MergedTrade as MergedTradeEntity } from './mergedTrade.entity';
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

  // The parameter fromId cannot be sent with startTime or endTime
  // @see https://binance-docs.github.io/apidocs/futures/en/#account-trade-list-user_data
  async getIndividualTrades(
    startTime: DateTime,
    endTime: DateTime,
    fromId: number = null,
  ): Promise<BinanceTrade[]> {
    let paramsObj: StringMap;

    if (fromId) {
      paramsObj = {
        fromId: fromId + '',
      };
    } else {
      paramsObj = {
        startTime: startTime.toMillis().toString(),
        endTime: endTime.toMillis().toString(),
      };
    }

    const result = await binanceGet('fapi/v1/userTrades', paramsObj);
    const trades = result as BinanceTrade[];
    return trades;
  }

  async saveTrades(trades: BinanceTrade[]): Promise<string | null> {
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

    return error;
  }

  async saveMergedTrades(trades: Trade[]): Promise<string | null> {
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

    return error;
  }

  async getTrades(
    startTime: DateTime,
    endTime: DateTime,
  ): Promise<MergedTradeEntity[]> {
    const latestTrade = await this.tradesRepository
      .createQueryBuilder()
      .orderBy('exchangeTradeId', 'DESC')
      .getOne();

    console.log('The latest trade is: ', latestTrade.exchangeTradeId);
    console.log('Syncing the trades');

    // Because Binance returns the trade with the given id as well
    const nonInclusiveLatestId = latestTrade.exchangeTradeId + 1;

    await this.syncTrades(1, nonInclusiveLatestId);

    const mergedTrades = await this.mergedTradesRepository.findAndCountBy({});
    console.log(`Fetched ${mergedTrades[1]} trades from db`);

    return mergedTrades[0];
  }

  async syncTrades(
    earliestWeekToGet = 1,
    fromId: number = null,
  ): Promise<void> {
    const allTrades: BinanceTrade[] = [];

    for (let i = earliestWeekToGet; i >= 1; i--) {
      const trades = await this.getIndividualTrades(
        DateTime.now().minus({ weeks: i }),
        DateTime.now().minus({ weeks: i - 1 }),
        fromId,
      );

      allTrades.push(...trades);
    }

    console.log(`Syncing ${allTrades.length} trades`);

    const errorWhileSaving = await this.saveTrades(allTrades);

    if (errorWhileSaving) {
      throw new Error(errorWhileSaving);
    } else {
      console.info('Individual trades are synced');
    }

    // Sorting because Binance sends the oldest trades at the beginning of the array
    allTrades.sort((a, b) => b.time - a.time);

    const draftMergedTrades = mergeTrades(allTrades);

    console.log(`Saving ${draftMergedTrades.length} merged trades`);

    const error = await this.saveMergedTrades(draftMergedTrades);

    if (error) {
      throw new Error(errorWhileSaving);
    } else {
      console.info('Saved merged trades');
    }
  }
}
