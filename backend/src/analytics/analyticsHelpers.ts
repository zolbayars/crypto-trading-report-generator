import { add, divide, bignumber, number } from 'mathjs';
import { PnLMetrics } from '../types';
import { MergedTrade } from '../trades/mergedTrade.entity';

export const getPnLMetrics = (trades: MergedTrade[]): PnLMetrics => {
  let winners = 0;
  let losers = 0;
  let breakevens = 0;

  let winnersSum = 0;
  let losersSum = 0;
  let pnl = 0;

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

    pnl = number(add(bignumber(pnl), bignumber(trade.pnl as number)));
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
    pnl,
  };
};
