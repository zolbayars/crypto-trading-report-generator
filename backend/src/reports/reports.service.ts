import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import axios from 'axios';
import { BinanceTrade } from '@shared/types';
import { signWithSha256 } from '../utils';
import { mergeTrades } from '../helpers/exchanges/binance';

interface BinanceReq {
  [key: string]: string;
}

@Injectable()
export class ReportsService {
  async getTrades(): Promise<object[]> {
    const binanceClient = axios.create({
      baseURL: 'https://fapi.binance.com/',
      timeout: 3000,
      headers: { 'X-MBX-APIKEY': process.env.BINANCE_API_KEY },
    });

    const paramsObj: BinanceReq = {
      timestamp: DateTime.now().toMillis().toString(),
      // @todo get this from front-end
      startTime: DateTime.now().minus({ weeks: 1 }).toMillis().toString(),
      endTime: DateTime.now().minus({ weeks: 0 }).toMillis().toString(),
    };

    const queryString = new URLSearchParams(paramsObj).toString();

    paramsObj.signature = signWithSha256(
      queryString,
      process.env.BINANCE_SECRET,
    );

    try {
      const res = await binanceClient.get('fapi/v1/userTrades', {
        params: paramsObj,
      });

      console.log('Result from exchange', res.status, res.statusText);

      const trades = res.data as BinanceTrade[];

      // Sorting because Binance sends the oldest trades at the beginning of the array
      trades.sort((a, b) => b.time - a.time);

      console.log(`Fetched ${trades.length} trades`);

      return mergeTrades(trades);
    } catch (error) {
      console.error('Error while fetching user trades from exchange', error);

      throw new Error(
        `Could not get the users's trades due to ${error.message}`,
      );
    }
  }
}
