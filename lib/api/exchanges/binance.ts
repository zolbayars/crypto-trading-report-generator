import axios from "axios";
import { DateTime } from "luxon";
import { add, subtract, bignumber, number, BigNumber } from "mathjs";
import { StringMap } from "../../types";
import { signWithSha256 } from "../../utils";

export interface BinanceTrade {
  symbol: string;
  id: BigInt;
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
  "LONG",
  "SHORT",
}

export interface Trade {
  entryDate?: number;
  exitDate?: number;
  symbol?: string;
  direction?: TradeDirection;
  entryPrice?: number;
  exitPrice?: number;
  size?: number;
  fee: number;
  feeAsset?: string;
  pnl: number;
  pnlPercentage?: number;
  exitTradeIds: BigInt[];
  entryTradeIds: BigInt[];
}

export const formatExchangeNumber = (numberInStrFormat: string) =>
  parseFloat(numberInStrFormat);

enum TradeExitTypes {
  BUY = "BUY",
  SELL = "SELL",
}

interface RelatedTrades {
  [symbol: string]: {
    trades: BinanceTrade[];
    exitType: TradeExitTypes;
  };
}

const getTradeDirection = (trade: BinanceTrade): TradeDirection => {
  const pnl = parseFloat(trade.realizedPnl);

  if (
    (trade.side === "BUY" && pnl !== 0) ||
    (trade.side === "SELL" && pnl === 0)
  ) {
    return TradeDirection.SHORT;
  } else if (
    (trade.side === "SELL" && pnl !== 0) ||
    (trade.side === "BUY" && pnl === 0)
  ) {
    return TradeDirection.LONG;
  } else {
    console.error("Invalid trade direction for trade:", trade);
    throw new Error("Invalid trade direction is detected!");
  }
};

const getTradeSize = (
  relatedTrades: BinanceTrade[],
  exitType: TradeExitTypes
): number => {
  let sizeOfEntry = 0;
  let sizeOfExit = 0;

  for (const trade of relatedTrades) {
    const qty = parseFloat(trade.qty);
    if (trade.side === exitType) {
      sizeOfExit = number(add(bignumber(sizeOfExit), bignumber(qty)));
    } else {
      sizeOfEntry = number(add(bignumber(sizeOfEntry), bignumber(qty)));
    }
  }

  // Strict equality is not used here because compare() returns BigInteger and we have no other way to check if it's not 0
  if (sizeOfExit > 0 && sizeOfEntry !== sizeOfExit) {
    console.error(
      "Discprenancy in exit and entry trade sizes:",
      sizeOfEntry,
      sizeOfExit,
      relatedTrades
    );

    throw new Error("Discprenancy in exit and entry trade sizes!");
  }

  return sizeOfEntry;
};

const mergeRelatedTrades = (
  relatedTrades: BinanceTrade[],
  exitType: TradeExitTypes
): Trade => {
  const mergedTrade: Trade = {
    entryTradeIds: [],
    exitTradeIds: [],
    fee: 0,
    pnl: 0,
  };

  for (let i = 0; i < relatedTrades.length; i++) {
    const trade = relatedTrades[i];
    const price = parseFloat(trade.price);

    mergedTrade.symbol = trade.symbol;
    mergedTrade.direction = getTradeDirection(trade);
    mergedTrade.fee = number(
      add(bignumber(mergedTrade.fee), bignumber(trade.commission))
    );
    mergedTrade.pnl = number(
      add(bignumber(mergedTrade.pnl), bignumber(trade.realizedPnl))
    );

    if (i === 0) {
      mergedTrade.entryDate = trade.time;
      mergedTrade.entryPrice = price;
    } else if (i === relatedTrades.length - 1) {
      mergedTrade.exitDate = trade.time;
      mergedTrade.exitPrice = price;
      mergedTrade.feeAsset = trade.commissionAsset;
    }

    if (trade.side === exitType) {
      mergedTrade.exitTradeIds.push(trade.id);
    } else {
      mergedTrade.entryTradeIds.push(trade.id);
    }
  }

  const isBreakeven =
    !mergedTrade.exitTradeIds.length && !!mergedTrade.entryTradeIds.length;

  if (isBreakeven) {
    // The last trade pushed to the entryTradeIds should be the latest trade (the exit trade)
    mergedTrade.exitTradeIds.push(
      mergedTrade.entryTradeIds[mergedTrade.entryTradeIds.length - 1]
    );
  }

  const tradeSize = getTradeSize(relatedTrades, exitType);
  mergedTrade.size = tradeSize;

  // @todo Deduct the fee
  mergedTrade.pnlPercentage =
    mergedTrade.pnl / (tradeSize * (mergedTrade.entryPrice as number));

  return mergedTrade;
};

export const mergeTrades = (trades: BinanceTrade[]): Trade[] => {
  const entryTrades: { [key: string]: number | BigNumber } = {}; // A structure like this: { 'XLMUSDT': 150 }
  const relatedTrades: RelatedTrades = {};
  const mergedTrades: Trade[] = [];

  for (let i = 0; i < trades.length; i++) {
    const trade = trades[i];
    const qty = parseFloat(trade.qty);
    const { symbol } = trade;

    if (!relatedTrades[symbol]) {
      // the first trade of a batch of related trades is the entry one (or one of the entry trades)
      relatedTrades[symbol] = {
        trades: [trade],
        exitType:
          trade.side === "BUY" ? TradeExitTypes.SELL : TradeExitTypes.BUY,
      };
    } else {
      relatedTrades[symbol].trades.push(trade);
    }

    const isEntryTrade = trade.side !== relatedTrades[symbol].exitType;
    // const isBreakevenExitTrade = isExitTrade && trade.realizedPnl === '0';

    // Please note: this logic assumes the trades are processed in LIFO order!
    // realizedPnl equals 0 when the trade is entry or when the trade is exited with breakeven
    if (isEntryTrade) {
      const accumulatedQty = entryTrades[symbol]
        ? add(bignumber(entryTrades[symbol]), bignumber(qty))
        : bignumber(qty);
      entryTrades[symbol] = accumulatedQty;
    } else {
      entryTrades[symbol] = subtract(
        bignumber(entryTrades[symbol]),
        bignumber(qty)
      );

      // Means we went through all the relevant entry trades of the exit trades we saved in exitTrades
      if (entryTrades[symbol] == 0) {
        mergedTrades.push(
          mergeRelatedTrades(
            relatedTrades[symbol].trades,
            relatedTrades[symbol].exitType
          )
        );

        // Clean up, so we can process other trades with similar symbols as well
        delete entryTrades[symbol];
        delete relatedTrades[symbol];
      }
    }
  }

  console.info("merged trades", mergedTrades.length);

  return mergedTrades;
};

const getBinanceClient = () => {
  const binanceClient = axios.create({
    baseURL: "https://fapi.binance.com/",
    timeout: 3000,
    headers: { "X-MBX-APIKEY": process.env.BINANCE_API_KEY },
  });

  return binanceClient;
};

export const binanceGet = async (url: string, params: StringMap) => {
  const binanceClient = getBinanceClient();

  console.info(`Calling binance with`, url, params);

  params.timestamp = DateTime.now().toMillis().toString();
  const queryString = new URLSearchParams(params).toString();
  params.signature = signWithSha256(
    queryString,
    process.env.BINANCE_SECRET as string
  );

  try {
    const res = await binanceClient.get(url, { params });

    console.log("Result from Binance", res.status, res.statusText);

    return res.data;
  } catch (error) {
    console.error(`Error while getting ${url} from Binance`, { params }, error);

    throw new Error((error as Error).message);
  }
};
