import { IsNumberString, IsDateString } from 'class-validator';

export class GetMetricsByLastNMonthsParams {
  @IsNumberString()
  n: number;
}

export class GetMetricsByIntervalParams {
  @IsDateString()
  from: string;
  to: string;
}
