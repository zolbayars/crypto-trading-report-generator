import { Controller, Get, Post, Body } from '@nestjs/common';
import { DateTime } from 'luxon';
import { APIReturnType } from '../types';
import { TradesService } from './trades.service';

interface BodySyncTrades {
  from: string;
  to: string;
}

@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Get()
  async getTrades(): Promise<APIReturnType> {
    let trades = [];
    let errorMsg = null;

    try {
      // @todo get this from front-end
      trades = await this.tradesService.getTrades(
        DateTime.now().minus({ weeks: 1 }),
        DateTime.now().minus({ weeks: 0 }),
      );
    } catch (error) {
      errorMsg = error.message;
    }

    return {
      trades,
      errorMsg,
    };
  }

  //@todo validate the body
  @Post('sync-trades')
  async syncTrades(@Body() body: BodySyncTrades): Promise<APIReturnType> {
    let errorMsg = null;

    const { from, to } = body;

    try {
      await this.tradesService.syncTrades(
        DateTime.fromISO(from).toMillis(),
        !!to ? DateTime.fromISO(to).toMillis() : null,
      );
    } catch (error) {
      errorMsg = error.message;
    }

    return {
      errorMsg,
    };
  }
}
