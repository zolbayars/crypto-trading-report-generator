import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  getReport(): string {
    return 'The report should be here';
  }
}
