export enum TradeDirection {
  "LONG",
  "SHORT",
}

export interface MergedTrade {
  id: number;
  entryDate: string;
  exitDate: string;
  symbol: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  size: number;
  fee: number;
  feeAsset: string;
  pnl: number;
  pnlPercentage: number;
  exitTradeIds: number[];
  entryTradeIds: number[];
}

export enum NumericValuesInTrade {
  pnl = "pnl",
  pnlPercentage = "pnlPercentage",
}

export interface TradeNumbericMetrics {
  maxPnL: number;
  maxPnLPercentage: number;
  minPnL: number;
  minPnLPercentage: number;
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
