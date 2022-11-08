import { MergedTrade } from '../trades/mergedTrade.entity';

export const calcPnL = (trades: MergedTrade[]) =>
  trades.reduce((accumulatedSum, trade) => {
    return (accumulatedSum as number) + (trade.pnl as number);
  }, 0);
