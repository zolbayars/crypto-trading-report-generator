import { Controller, Get, Post } from '@nestjs/common';
import { DateTime } from 'luxon';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportService: ReportsService) {}

  @Get()
  async getReport(): Promise<object> {
    let trades = [];
    let errorMsg = null;

    // @todo type
    try {
      // @todo get this from front-end
      trades = await this.reportService.getTrades(
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
      await this.reportService.syncTrades();
    } catch (error) {
      errorMsg = error.message;
    }

    return {
      errorMsg,
    };
  }
}
