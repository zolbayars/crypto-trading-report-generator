import { Controller, Get, Req } from '@nestjs/common';
import { DateTime } from 'luxon';
import { AnalyticsService } from './analytics.service';
import {
  GetMetricsByIntervalParams,
  GetMetricsByLastNMonthsParams,
} from './analytics.dto';
import { Param, Query } from '@nestjs/common/decorators';
import { APIReturnType } from '../types';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('metrics')
  async getMetricsByInterval(
    @Query() request: GetMetricsByIntervalParams,
  ): Promise<APIReturnType> {
    let analytics = {};
    let errorMsg = null;

    const { from, to } = request;

    try {
      analytics = await this.analyticsService.getAnalytics(
        DateTime.fromISO(from.toString()),
        DateTime.fromISO(to.toString()),
      );
    } catch (error) {
      errorMsg = error.message;
    }

    return {
      analytics,
      errorMsg,
    };
  }

  @Get('metrics-last-n-months')
  async getMetricsByLastNMonths(
    @Query() request: GetMetricsByLastNMonthsParams,
  ): Promise<APIReturnType> {
    let metricsByIntervals = [];
    let errorMsg = null;

    // @todo put limit here
    const { n } = request;

    try {
      metricsByIntervals =
        await this.analyticsService.getAnalyticsFromLastNMonths(n);
    } catch (error) {
      errorMsg = error.message;
    }

    return {
      analyticsByIntervals: metricsByIntervals,
      errorMsg,
    };
  }
}
