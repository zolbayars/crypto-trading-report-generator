import axios from 'axios';
import { DateTime } from 'luxon';
import { BinanceTrade, Trade, TradeDirection, StringMap } from '@shared/types';
import { signWithSha256 } from '../../utils';

enum TradeExitTypes {
  BUY = 'BUY',
  SELL = 'SELL',
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
    (trade.side === 'BUY' && pnl !== 0) ||
    (trade.side === 'SELL' && pnl === 0)
  ) {
    return TradeDirection.SHORT;
  } else if (
    (trade.side === 'SELL' && pnl !== 0) ||
    (trade.side === 'BUY' && pnl === 0)
  ) {
    return TradeDirection.LONG;
  } else {
    console.error('Invalid trade direction for trade:', trade);
    throw new Error('Invalid trade direction is detected!');
  }
};

const getTradeSize = (
  relatedTrades: BinanceTrade[],
  exitType: TradeExitTypes,
): number => {
  let sizeOfEntry = 0;
  let sizeOfExit = 0;

  for (const trade of relatedTrades) {
    const qty = parseFloat(trade.qty);
    if (trade.side === exitType) {
      sizeOfExit += qty;
    } else {
      sizeOfEntry += qty;
    }
  }

  if (
    sizeOfExit > 0 &&
    sizeOfEntry.toPrecision(5) !== sizeOfExit.toPrecision(5)
  ) {
    console.error(
      'Discprenancy in exit and entry trade sizes:',
      sizeOfEntry,
      sizeOfExit,
      relatedTrades,
    );
    throw new Error('Discprenancy in exit and entry trade sizes!');
  }

  return sizeOfEntry;
};

const mergeRelatedTrades = (
  relatedTrades: BinanceTrade[],
  exitType: TradeExitTypes,
): Trade => {
  const mergedTrade = {
    entryTradeIds: [],
    exitTradeIds: [],
    fee: 0,
    pnl: 0,
  } as Trade;

  for (let i = 0; i < relatedTrades.length; i++) {
    const trade = relatedTrades[i];
    const price = parseFloat(trade.price);

    mergedTrade.symbol = trade.symbol;
    mergedTrade.direction = getTradeDirection(trade);
    mergedTrade.fee += parseFloat(trade.commission);
    mergedTrade.pnl += parseFloat(trade.realizedPnl);

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
      mergedTrade.entryTradeIds[mergedTrade.entryTradeIds.length - 1],
    );
  }

  const tradeSize = getTradeSize(relatedTrades, exitType);
  mergedTrade.size = tradeSize;

  // @todo Deduct the fee
  mergedTrade.pnlPercentage =
    mergedTrade.pnl / (tradeSize * mergedTrade.entryPrice);

  return mergedTrade;
};

export const mergeTrades = (trades: BinanceTrade[]): Trade[] => {
  const entryTrades = {};
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
          trade.side === 'BUY' ? TradeExitTypes.SELL : TradeExitTypes.BUY,
      };
    } else {
      relatedTrades[symbol].trades.push(trade);
    }

    const isEntryTrade = trade.side !== relatedTrades[symbol].exitType;
    // const isBreakevenExitTrade = isExitTrade && trade.realizedPnl === '0';

    // Please note: this logic assumes the trades are prcessed in LIFO order!
    // realizedPnl equals 0 when the trade is entry or when the trade is exited with breakeven
    if (isEntryTrade) {
      // A structure like this: { 'XLMUSDT': 150 }
      const accumulatedQty = entryTrades[symbol] + qty || qty;
      entryTrades[symbol] = accumulatedQty;
    } else {
      const subtractedQty = (entryTrades[symbol] - qty).toPrecision(5);
      entryTrades[symbol] = subtractedQty;

      // Means we went through all the relevant entry trades of the exit trades we saved in exitTrades
      if (parseFloat(entryTrades[symbol]) === 0) {
        mergedTrades.push(
          mergeRelatedTrades(
            relatedTrades[symbol].trades,
            relatedTrades[symbol].exitType,
          ),
        );

        // Clean up, so we can process other trades with similar symbols as well
        delete entryTrades[symbol];
        delete relatedTrades[symbol];
      }
    }

    console.dir(entryTrades);
  }

  console.info('merged trades', mergedTrades.length);

  return mergedTrades;
};

const getBinanceClient = () => {
  const binanceClient = axios.create({
    baseURL: 'https://fapi.binance.com/',
    timeout: 3000,
    headers: { 'X-MBX-APIKEY': process.env.BINANCE_API_KEY },
  });

  return binanceClient;
};

export const binanceGet = async (url: string, params: StringMap) => {
  const binanceClient = getBinanceClient();

  console.info(`Calling binance with`, url, params);

  params.timestamp = DateTime.now().toMillis().toString();
  const queryString = new URLSearchParams(params).toString();
  params.signature = signWithSha256(queryString, process.env.BINANCE_SECRET);

  try {
    const res = await binanceClient.get(url, { params });

    console.log('Result from Binance', res.status, res.statusText);

    return res.data;
  } catch (error) {
    console.error(`Error while getting ${url} from Binance`, { params }, error);

    throw new Error(error.message);
  }
};
