import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import axios from 'axios';
import { Trade } from '@shared/types';
import { signWithSha256 } from '../utils';

interface BinanceReq {
  [key: string]: string;
}

const formatTrades = (trades: Trade[]) => {
  return [{}];
};

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

      const trades = res.data as Trade[];

      // Sorting because Binance sends the oldest trades at the beginning of the array
      trades.sort((a, b) => b.time - a.time);

      console.log(`Fetched ${trades.length} trades`);

      return trades;
    } catch (error) {
      console.error('Error while fetching user trades from exchange', error);

      throw new Error(
        `Could not get the users's trades due to ${error.message}`,
      );
    }
  }
}
