import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { BinanceTrade, StringMap, Trade } from '@shared/types';
import { mergeTrades, binanceGet } from '../helpers/exchanges/binance';

@Injectable()
export class ReportsService {
  async getTrades(
    startTime: DateTime,
    endTime: DateTime,
    reverseOrder = true,
  ): Promise<Trade[]> {
    const paramsObj: StringMap = {
      startTime: startTime.toMillis().toString(),
      endTime: endTime.toMillis().toString(),
    };

    try {
      const result = await binanceGet('fapi/v1/userTrades', paramsObj);
      const trades = result as BinanceTrade[];

      if (reverseOrder) {
        // Sorting because Binance sends the oldest trades at the beginning of the array
        trades.sort((a, b) => b.time - a.time);
      }

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
      const trades = await this.getTrades(
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
