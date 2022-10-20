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
