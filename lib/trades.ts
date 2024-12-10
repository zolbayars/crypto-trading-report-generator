import { DateTime } from "luxon";
import {
  mergeTrades,
  binanceGet,
  BinanceTrade,
  Trade,
  formatExchangeNumber,
  TradeDirection,
} from "@/lib/api/exchanges/binance";
import { PrismaClient, Prisma } from "@prisma/client";
import { FrontEndTableQuery } from "@/lib/types";

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

const saveMergedTrades = async (
  trades: Trade[],
  rawTrades: BinanceTrade[]
): Promise<void> => {
  const rawTradesToSave: Prisma.Enumerable<Prisma.tradeCreateManyInput> = [];

  for (const rawTrade of rawTrades) {
    rawTradesToSave.push({
      exchange_trade_id: `${rawTrade.id}`,
      exchange_order_id: `${rawTrade.orderId}`,
      symbol: rawTrade.symbol,
      side: rawTrade.side,
      price: formatExchangeNumber(rawTrade.price),
      qty: formatExchangeNumber(rawTrade.qty),
      quote_qty: formatExchangeNumber(rawTrade.quoteQty),
      realized_pnl: formatExchangeNumber(rawTrade.realizedPnl),
      margin_asset: rawTrade.marginAsset,
      commission: formatExchangeNumber(rawTrade.commission),
      commission_asset: rawTrade.commissionAsset,
      exchange_created_at: new Date(rawTrade.time),
      position_side: rawTrade.positionSide,
      is_buyer: rawTrade.buyer ? 1 : 0,
      is_maker: rawTrade.maker ? 1 : 0,
      market_type: "futures",
      exchange: "binance",
    });
  }

  let successfulSaves = 0;
  let erroredSaves = 0;
  let skippedDuplicates = 0;

  for (const trade of trades) {
    const relatedRawTrades: Prisma.Enumerable<Prisma.tradeCreateManyInput> = [];
    rawTradesToSave.forEach((rawTrade, index) => {
      if (trade.entryTradeIds.includes(rawTrade.exchange_trade_id)) {
        rawTradesToSave[index].is_entry_trade = 1;
        relatedRawTrades.push(rawTradesToSave[index]);
      } else if (trade.exitTradeIds.includes(rawTrade.exchange_trade_id)) {
        rawTradesToSave[index].is_entry_trade = 0;
        relatedRawTrades.push(rawTradesToSave[index]);
      }
    });

    // Can't use createMany because we need to create the related raw trades as well
    // @see https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#create-multiple-records-and-multiple-related-records
    try {
      await prisma.merged_trade.create({
        data: {
          entry_date: new Date(trade.entry_date as number),
          exit_date: new Date(trade.exit_date as number),
          symbol: trade.symbol as string,
          direction: trade.direction === TradeDirection.LONG ? "long" : "short",
          entry_price: trade.entry_price as number,
          exit_price: trade.exit_price as number,
          size: trade.size as number,
          pnl: trade.pnl,
          pnl_percentage: trade.pnl_percentage as number,
          fee: trade.fee,
          fee_asset: trade.fee_asset as string,
          trades: {
            createMany: {
              data: relatedRawTrades,
            },
          },
        },
      });

      successfulSaves++;
    } catch (error: any) {
      console.error(error);

      if (error.code === "P2002") {
        skippedDuplicates++;
      }

      erroredSaves++;
    }
  }

  console.log("saveMergedTrades result", {
    successfulSaves,
    skippedDuplicates,
    erroredSaves,
  });
};

// @to-do filter by the query
export const getTrades = async (
  query: FrontEndTableQuery,
  skip = 0,
  take = 1000
) => {
  let latestTradeWithoutParent = await prisma.trade.findFirst({
    select: { exchange_created_at: true },
    where: { parent_trade_id: null }, // we should get the latest trade without a parent
    orderBy: { exchange_created_at: "desc" },
  });

  let latestTrade = latestTradeWithoutParent;

  // If a trade without parent wasn't found, we're gonna just get the latest trade
  if (!latestTradeWithoutParent) {
    latestTrade = await prisma.trade.findFirst({
      select: { exchange_created_at: true },
      orderBy: { exchange_created_at: "desc" },
    });
  }

  const fromDate = !!latestTrade?.exchange_created_at
    ? DateTime.fromJSDate(latestTrade?.exchange_created_at)
    : DateTime.now().minus({ week: 1 });

  console.log("Gonna sync the trades made since ", fromDate.toLocaleString());

  // Addition of 1s (1000 millis) is necessary here to prevent re-fetching the last trade
  const { rawTradesCount, mergedTradesCount } = await syncTrades(
    fromDate.toMillis() + 1000
  );

  // There are raw trades, but we're not able merge them - means we've skipped some trades
  if (rawTradesCount > 0 && mergedTradesCount === 0) {
    await syncTrades(DateTime.now().minus({ day: 1 }).toMillis());
  }

  const mergedTrades = await prisma.merged_trade.findMany({
    orderBy: {
      entry_date: "desc",
    },
    skip,
    take,
  });

  const count = await prisma.merged_trade.count({});

  return { mergedTrades, count };
};

export const syncTrades = async (
  sinceXMilliseconds: number,
  tillXMilliseconds?: number
) => {
  const allTrades: BinanceTrade[] = [];

  const fromDate = DateTime.fromMillis(sinceXMilliseconds);

  let startDate = fromDate;

  const tillDate = tillXMilliseconds
    ? DateTime.fromMillis(tillXMilliseconds)
    : DateTime.now();

  console.log(
    `Syncing the trades from ${fromDate.toLocaleString()} till ${tillDate.toLocaleString()}`
  );

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
    return {
      rawTradesCount: 0,
      mergedTradesCount: 0,
    };
  }

  console.log(`${allTrades.length} raw trades found`);

  const draftMergedTrades = mergeTrades(allTrades);
  const onlyClosedTrades = draftMergedTrades.filter(
    (trade) => !!trade.exitTradeIds.length
  );

  console.log(
    `${draftMergedTrades.length} merged trades. ${onlyClosedTrades.length} of them were closed`
  );

  await saveMergedTrades(onlyClosedTrades, allTrades);

  console.log(`Sync is completed`);

  return {
    rawTradesCount: allTrades.length,
    mergedTradesCount: draftMergedTrades.length,
  };
};
