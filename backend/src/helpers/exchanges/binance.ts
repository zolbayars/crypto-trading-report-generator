import { BinanceTrade, Trade, TradeDirection } from '@shared/types';

interface RelatedTrades {
  [symbol: string]: BinanceTrade[];
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

const getTradeSize = (relatedTrades: BinanceTrade[]): number => {
  let sizeOfEntry = 0;
  let sizeOfExit = 0;

  for (const trade of relatedTrades) {
    const qty = parseFloat(trade.qty);
    if (trade.realizedPnl === '0') {
      sizeOfEntry += qty;
    } else {
      sizeOfExit += qty;
    }
  }

  if (sizeOfEntry !== sizeOfExit) {
    console.error('Discprenancy in exit and entry trade sizes:', relatedTrades);
    throw new Error('Discprenancy in exit and entry trade sizes!');
  }

  return sizeOfEntry;
};

const mergeRelatedTrades = (relatedTrades: BinanceTrade[]): Trade => {
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
      mergedTrade.exitDate = trade.time;
      mergedTrade.exitPrice = price;
      mergedTrade.feeAsset = trade.commissionAsset;
    } else if (i === relatedTrades.length - 1) {
      mergedTrade.entryDate = trade.time;
      mergedTrade.entryPrice = price;
    }

    if (trade.realizedPnl === '0') {
      mergedTrade.entryTradeIds.push(trade.id);
    } else {
      mergedTrade.exitTradeIds.push(trade.id);
    }
  }

  mergedTrade.size = getTradeSize(relatedTrades);

  return mergedTrade;
};

export const mergeTrades = (trades: BinanceTrade[]): Trade[] => {
  console.info('merged trades');
  const exitTrades = {};
  const relatedTrades: RelatedTrades = {};
  const mergedTrades: Trade[] = [];

  for (let i = 0; i < trades.length; i++) {
    const trade = trades[i];
    const qty = parseFloat(trade.qty);
    const { symbol } = trade;

    if (relatedTrades[symbol]) {
      relatedTrades[symbol].push(trade);
    } else {
      relatedTrades[symbol] = [];
      relatedTrades[symbol].push(trade);
    }

    // realizedPnl equals 0 when the trade is entry
    if (trade.realizedPnl !== '0') {
      // A structure like this: { 'XLMUSDT': 150 }
      exitTrades[symbol] = exitTrades[symbol] + qty || qty;
    } else if (exitTrades[trade.symbol] > 0) {
      exitTrades[symbol] -= qty;

      // Means we went through all the relevant entry trades of the exit trades we saved in exitTrades
      if (exitTrades[trade.symbol] === 0) {
        mergedTrades.push(mergeRelatedTrades(relatedTrades[symbol]));

        // Clean up, so we can process other trades with similar symbols as well
        delete exitTrades[trade.symbol];
        delete relatedTrades[symbol];
      }
    }
  }

  console.info('merged trades', mergedTrades);

  return mergedTrades;
};
