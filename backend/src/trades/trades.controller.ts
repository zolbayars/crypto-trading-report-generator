import { Controller, Get, Post, Body } from '@nestjs/common';
import { DateTime } from 'luxon';
import { TradesService } from './trades.service';

interface BodySyncTrades {
  'earlist-week-to-get': number;
}

@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Get()
  async getTrades(): Promise<object> {
    let trades = [];
    let errorMsg = null;

    // @todo type
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
  async syncTrades(@Body() body: BodySyncTrades): Promise<object> {
    let errorMsg = null;

    try {
      await this.tradesService.syncTrades(body['earlist-week-to-get']);
    } catch (error) {
      errorMsg = error.message;
    }

    return {
      errorMsg,
    };
  }
}
