import { DateTime } from "luxon";
import { NextApiRequest, NextApiResponse } from "next";
import {
  mergeTrades,
  binanceGet,
  BinanceTrade,
  Trade,
  formatExchangeNumber,
  TradeDirection,
} from "@/lib/api/exchanges/binance";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const getIndividualTrades = async (
  startTime: DateTime,
  endTime: DateTime
): Promise<BinanceTrade[]> => {
  const paramsObj = {
    startTime: startTime.toMillis().toString(),
    endTime: endTime.toMillis().toString(),
  };

  const result = await binanceGet("fapi/v1/userTrades", paramsObj);
  const trades = result as BinanceTrade[];
  return trades;
};

const saveTrades = async (trades: BinanceTrade[]): Promise<void> => {
  const tradesToSave: Prisma.Enumerable<Prisma.tradeCreateManyInput> = [];

  for (const trade of trades) {
    tradesToSave.push({
      exchangeTradeId: trade.id,
      exchangeOrderId: trade.orderId,
      symbol: trade.symbol,
      side: trade.side,
      price: formatExchangeNumber(trade.price),
      qty: formatExchangeNumber(trade.qty),
      quoteQty: formatExchangeNumber(trade.quoteQty),
      realizedPnl: formatExchangeNumber(trade.realizedPnl),
      marginAsset: trade.marginAsset,
      commission: formatExchangeNumber(trade.commission),
      commissionAsset: trade.commissionAsset,
      exchangeCreatedAt: new Date(trade.time),
      positionSide: trade.positionSide,
      isBuyer: trade.buyer ? 1 : 0,
      isMaker: trade.maker ? 1 : 0,
      marketType: "futures",
      exchange: "binance",
    });
  }

  const result = await prisma.trade.createMany({
    data: tradesToSave,
    skipDuplicates: true,
  });

  console.log("saveTrades result", result);
};

const saveMergedTrades = async (trades: Trade[]): Promise<void> => {
  const mergedTradesToSave: Prisma.Enumerable<Prisma.merged_tradeCreateManyInput> =
    [];

  for (const trade of trades) {
    // @todo save entry and exit trades here
    // const entryTrades = await prisma.trade.findMany({
    //   where: {
    //     exchangeTradeId: {
    //       in: trade.entryTradeIds,
    //     },
    //   },
    // });
    // const exitTrades = await prisma.trade.findMany({
    //   where: {
    //     exchangeTradeId: {
    //       in: trade.exitTradeIds,
    //     },
    //   },
    // });

    mergedTradesToSave.push({
      entryDate: new Date(trade.entryDate as number),
      exitDate: new Date(trade.exitDate as number),
      symbol: trade.symbol as string,
      direction: trade.direction === TradeDirection.LONG ? "long" : "short",
      entryPrice: trade.entryPrice as number,
      exitPrice: trade.exitPrice as number,
      size: trade.size as number,
      pnl: trade.pnl,
      pnlPercentage: trade.pnlPercentage as number,
      fee: trade.fee,
      feeAsset: trade.feeAsset as string,
    });

    const result = await prisma.merged_trade.createMany({
      data: mergedTradesToSave,
      skipDuplicates: true,
    });

    console.log("saveMergedTrades result", result);
  }
};

const getTrades = async (startTime: DateTime, endTime: DateTime) => {
  const latestTrade = await prisma.trade.findFirst({
    select: { exchangeCreatedAt: true },
    orderBy: { exchangeCreatedAt: "desc" },
  });

  console.log("The latest trade was made at: ", latestTrade?.exchangeCreatedAt);

  const fromDate = !!latestTrade?.exchangeCreatedAt
    ? DateTime.fromJSDate(latestTrade?.exchangeCreatedAt)
    : startTime;

  // Addition of 1s (1000 millis) is necessary here to prevent re-fetching the last trade
  await syncTrades(fromDate.toMillis() + 1000);

  // @todo pagination
  const mergedTrades = await prisma.merged_trade.findMany({
    orderBy: {
      entryDate: "desc",
    },
  });

  return mergedTrades;
};

const syncTrades = async (
  sinceXMilliseconds: number,
  tillXMilliseconds?: number
): Promise<void> => {
  const allTrades: BinanceTrade[] = [];

  const fromDate = DateTime.fromMillis(sinceXMilliseconds);

  let startDate = fromDate;

  const tillDate = tillXMilliseconds
    ? DateTime.fromMillis(tillXMilliseconds)
    : DateTime.now();

  console.log(`Syncing the trades from ${fromDate} till ${tillDate}`);

  const dateDiff = tillDate.diff(startDate, ["weeks"]);

  // Binance restricts the filter by 1 week
  if (dateDiff.weeks < 1) {
    const trades = await getIndividualTrades(startDate, tillDate);
    allTrades.push(...trades);
  } else {
    while (startDate < tillDate) {
      let endDate = startDate.plus({ weeks: 1 });

      if (endDate > DateTime.now()) {
        endDate = DateTime.now();
      }

      const trades = await getIndividualTrades(startDate, endDate);
      allTrades.push(...trades);

      startDate = startDate.plus({ weeks: 1 });
    }
  }

  if (!allTrades.length) {
    console.log(`No new trades to sync`);
    return;
  }

  console.log(`Saving ${allTrades.length} trades`);
  console.log(allTrades);

  await saveTrades(allTrades);

  const draftMergedTrades = mergeTrades(allTrades);
  const onlyClosedTrades = draftMergedTrades.filter(
    (trade) => !!trade.exitTradeIds.length
  );

  console.log(
    `There are ${draftMergedTrades.length} merged trades. ${onlyClosedTrades.length} of them were closed`
  );

  await saveMergedTrades(onlyClosedTrades);

  console.log(`Sync is completed`);
};

// @todo
const handler = async (
  request: NextApiRequest,
  response: NextApiResponse
) => {};
