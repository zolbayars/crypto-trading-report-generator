import { BinanceTrade, Trade, TradeDirection } from '@shared/types';

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
      mergedTrade.exitDate = trade.time;
      mergedTrade.exitPrice = price;
      mergedTrade.feeAsset = trade.commissionAsset;
    } else if (i === relatedTrades.length - 1) {
      mergedTrade.entryDate = trade.time;
      mergedTrade.entryPrice = price;
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
    // The first trade pushed to the entryTradeIds should be the latest trade (the exit trade)
    mergedTrade.exitTradeIds.push(mergedTrade.entryTradeIds[0]);
  }

  const tradeSize = getTradeSize(relatedTrades, exitType);
  mergedTrade.size = tradeSize;
  mergedTrade.pnlPercentage =
    (mergedTrade.pnl - mergedTrade.fee * 100) /
    (tradeSize * mergedTrade.entryPrice);

  return mergedTrade;
};

export const mergeTrades = (trades: BinanceTrade[]): Trade[] => {
  const exitTrades = {};
  const relatedTrades: RelatedTrades = {};
  const mergedTrades: Trade[] = [];

  for (let i = 0; i < trades.length; i++) {
    const trade = trades[i];
    const qty = parseFloat(trade.qty);
    const { symbol } = trade;

    if (!relatedTrades[symbol]) {
      // the first trade of a batch of related trades is the exit one (or one of the exit trades)
      relatedTrades[symbol] = {
        trades: [trade],
        exitType:
          trade.side === 'BUY' ? TradeExitTypes.BUY : TradeExitTypes.SELL,
      };
    } else {
      relatedTrades[symbol].trades.push(trade);
    }

    // realizedPnl equals 0 when the trade is entry or when the trade is exited with breakeven
    if (trade.realizedPnl !== '0') {
      // A structure like this: { 'XLMUSDT': 150 }
      exitTrades[symbol] = exitTrades[symbol] + qty || qty;
      // breakeven trade
    } else if (!exitTrades[trade.symbol]) {
      exitTrades[symbol] = qty;
    } else if (exitTrades[trade.symbol] > 0) {
      exitTrades[symbol] -= qty;

      // Means we went through all the relevant entry trades of the exit trades we saved in exitTrades
      if (exitTrades[trade.symbol] === 0) {
        mergedTrades.push(
          mergeRelatedTrades(
            relatedTrades[symbol].trades,
            relatedTrades[symbol].exitType,
          ),
        );

        // Clean up, so we can process other trades with similar symbols as well
        delete exitTrades[trade.symbol];
        delete relatedTrades[symbol];
      }
    }
  }

  console.info('merged trades', mergedTrades.length);

  return mergedTrades;
};
