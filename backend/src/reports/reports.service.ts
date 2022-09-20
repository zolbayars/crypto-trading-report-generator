import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import axios from 'axios';
import { signWithSha256 } from '../utils';

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

      console.log('res', res.data);

      return res.data;
    } catch (error) {
      console.error(error?.data);

      throw new Error(
        `Could not get the users's trades due to ${error.message}`,
      );
    }
  }
}
