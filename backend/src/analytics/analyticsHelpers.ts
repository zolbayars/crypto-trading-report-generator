import { add, divide, bignumber, number } from 'mathjs';
import { RateAndFactorMetrics } from '@shared/types';
import { MergedTrade } from '../trades/mergedTrade.entity';

export const calcPnL = (trades: MergedTrade[]) =>
  trades.reduce((accumulatedSum, trade) => {
    return number(
      add(bignumber(accumulatedSum as number), bignumber(trade.pnl as number)),
    );
  }, 0);

export const getRateAndFactorMetrics = (
  trades: MergedTrade[],
): RateAndFactorMetrics => {
  let winners = 0;
  let losers = 0;
  let breakevens = 0;

  let winnersSum = 0;
  let losersSum = 0;

  trades.forEach((trade) => {
    if (trade.pnl > 0) {
      winners++;
      winnersSum = number(
        add(bignumber(trade.pnl as number), bignumber(winnersSum)),
      );
    } else if (trade.pnl === 0) {
      breakevens++;
    } else {
      losers++;
      losersSum = number(
        add(bignumber(trade.pnl as number), bignumber(losersSum)),
      );
    }
  });

  const winrate = divide(winners, winners + losers);
  const profitFactor = divide(winnersSum, Math.abs(losersSum));

  return {
    winners,
    losers,
    breakevens,
    winnersSum,
    losersSum,
    winrate,
    profitFactor,
  };
};
