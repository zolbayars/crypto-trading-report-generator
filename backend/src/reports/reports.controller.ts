import { Controller, Get } from '@nestjs/common';
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
      trades = await this.reportService.getTrades();
    } catch (error) {
      errorMsg = error.message;
    }

    return {
      trades,
      errorMsg,
    };
  }
}
