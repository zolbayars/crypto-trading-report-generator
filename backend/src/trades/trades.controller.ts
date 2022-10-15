import { Controller, Get, Post } from '@nestjs/common';
import { DateTime } from 'luxon';
import { TradesService } from './trades.service';

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

  @Post('sync-trades')
  async syncTrades(): Promise<object> {
    let errorMsg = null;

    try {
      await this.tradesService.syncTrades();
    } catch (error) {
      errorMsg = error.message;
    }

    return {
      errorMsg,
    };
  }
}
