export interface StringMap {
  [key: string]: string;
}

export interface PnLMetrics {
  winners: number;
  losers: number;
  breakevens: number;
  winnersSum: number;
  losersSum: number;
  winrate: number;
  profitFactor: number;
  pnl: number;
}

export interface PnLMetricsByMonths {
  from: Date;
  to: Date;
  metrics: PnLMetrics;
}

export interface APIReturnType {
  errorMsg: string;
  [key: string]: any;
}
