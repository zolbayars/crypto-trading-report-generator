import { Controller, Get, Req } from '@nestjs/common';
import { DateTime } from 'luxon';
import { Request } from 'express';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('profit')
  async getTrades(@Req() request: Request): Promise<object> {
    let analytics = {};
    let errorMsg = null;

    const { from, to } = request.query;

    try {
      analytics = await this.analyticsService.getAnalytics(
        DateTime.fromISO(from.toString()).toJSDate(),
        DateTime.fromISO(to.toString()).toJSDate(),
      );
    } catch (error) {
      errorMsg = error.message;
    }

    return {
      analytics,
      errorMsg,
    };
  }
}
