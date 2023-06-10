import { DateTime } from "luxon";
import { add, divide, bignumber, number } from "mathjs";
import { PrismaClient, merged_trade } from "@prisma/client";
import { PnLMetrics } from "@/lib/types";

const prisma = new PrismaClient();

export const getPnLMetrics = (trades: merged_trade[]): PnLMetrics => {
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
        add(bignumber(trade.pnl as number), bignumber(winnersSum))
      );
    } else if (trade.pnl === 0) {
      breakevens++;
    } else {
      losers++;
      losersSum = number(
        add(bignumber(trade.pnl as number), bignumber(losersSum))
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

export const getAnalytics = async (
  from: DateTime,
  to: DateTime
): Promise<PnLMetrics> => {
  console.log(
    `Calculating analytics for trades from ${from.toISO()} to ${to.toISO()}`
  );

  const relevantTrades = await prisma.merged_trade.findMany({
    where: {
      exitDate: { gt: from.toJSDate(), lte: to.toJSDate() },
    },
  });

  console.log(`There are ${relevantTrades.length} relevant trades`);

  const pnlMetrics = getPnLMetrics(relevantTrades);

  return pnlMetrics;
};
