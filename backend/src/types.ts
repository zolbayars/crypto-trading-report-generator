export interface BinanceTrade {
  symbol: string;
  id: number;
  orderId: number;
  side: string;
  price: string;
  qty: string;
  realizedPnl: string;
  marginAsset: string;
  quoteQty: string;
  commission: string;
  commissionAsset: string;
  time: number;
  positionSide: string;
  buyer: boolean;
  maker: boolean;
}

export enum TradeDirection {
  'LONG',
  'SHORT',
}

export interface Trade {
  entryDate: number;
  exitDate: number;
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

export interface StringMap {
  [key: string]: string;
}

export interface RateAndFactorMetrics {
  winners: number;
  losers: number;
  breakevens: number;
  winnersSum: number;
  losersSum: number;
  winrate: number;
  profitFactor: number;
}
