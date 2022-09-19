import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import axios from 'axios';
import { signWithSha256 } from '../utils';

interface BinanceReq {
  [key: string]: string;
}

@Injectable()
export class ReportsService {
  async getReport(): Promise<string> {
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
    } catch (error) {
      console.error(error?.data);
    }

    return '';
  }
}
