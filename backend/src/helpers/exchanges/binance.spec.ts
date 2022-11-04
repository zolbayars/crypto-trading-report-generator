import { mergeTrades } from '../../../src/helpers/exchanges/binance';
import { TradeDirection } from '@shared/types';
import {
  multipleExitTradesWithSomeZeroPnL,
  multipleSimpleTrades,
  multiExitMultiEntryTrade,
  skippedTrades,
} from '../../../test/mocks/binanceResponses';

describe('Binance helper', () => {
  describe('mergeTrades', () => {
    it('should work correctly when there are multiple exit trades and some of them have 0 PnL', () => {
      const result = mergeTrades(multipleExitTradesWithSomeZeroPnL);
      expect(result).toEqual([
        {
          direction: TradeDirection.LONG,
          entryDate: 1663068192304,
          entryPrice: 0.00525,
          entryTradeIds: [109711556],
          exitDate: 1663075435848,
          exitPrice: 0.005249,
          exitTradeIds: [110221250, 110221251],
          fee: 0.00018276000000000002,
          feeAsset: 'BNB',
          pnl: -0.005008,
          pnlPercentage: -0.000051576359118938196,
          size: 18495,
          symbol: 'REEFUSDT',
        },
      ]);
    });

    it('should work correctly when there are multiple simple trades and all of them have single entry and exit trades', () => {
      const result = mergeTrades(multipleSimpleTrades);
      expect(result).toEqual([
        {
          direction: TradeDirection.LONG,
          entryDate: 1664951496170,
          entryPrice: 0.4885,
          entryTradeIds: [963165212],
          exitDate: 1664952487063,
          exitPrice: 0.4886,
          exitTradeIds: [963192842],
          fee: 0.00012796,
          feeAsset: 'BNB',
          pnl: 0.02149,
          pnlPercentage: 0.00020470829068577277,
          size: 214.9,
          symbol: 'XRPUSDT',
        },
        {
          direction: 1,
          entryDate: 1664954443097,
          entryPrice: 0.4324,
          entryTradeIds: [818518277],
          exitDate: 1664957550994,
          exitPrice: 0.4305,
          exitTradeIds: [818526179],
          fee: 0.00012832,
          feeAsset: 'BNB',
          pnl: 0.4617,
          pnlPercentage: 0.0043940795559666975,
          size: 243,
          symbol: 'ADAUSDT',
        },
      ]);
    });

    it('should work correctly when there are numerous exit and entry trades with a same pair', () => {
      const result = mergeTrades(multiExitMultiEntryTrade);
      expect(result).toEqual([
        {
          direction: 0,
          entryDate: 1665547760219,
          entryPrice: 0.488,
          entryTradeIds: [972992022, 972992021, 972992020],
          exitDate: 1665551097728,
          exitPrice: 0.4868,
          exitTradeIds: [973019756, 973019757],
          fee: 0.0039108400000000005,
          feeAsset: 'BNB',
          pnl: -4.85364,
          pnlPercentage: -0.002459016393442623,
          size: 4044.7,
          symbol: 'XRPUSDT',
        },
        {
          direction: 1,
          entryDate: 1665545356037,
          entryPrice: 0.4844,
          entryTradeIds: [972968460, 972968459, 972968458],
          exitDate: 1665547714968,
          exitPrice: 0.4881,
          exitTradeIds: [
            972991566, 972991567, 972991568, 972991569, 972991570, 972991571,
            972991572, 972991573,
          ],
          fee: 0.00580377,
          feeAsset: 'BNB',
          pnl: -22.200000000000003,
          pnlPercentage: -0.007638315441783651,
          size: 6000,
          symbol: 'XRPUSDT',
        },
        {
          direction: 0,
          entryDate: 1665542046118,
          entryPrice: 0.4845,
          entryTradeIds: [972944785, 972943831],
          exitDate: 1665543865101,
          exitPrice: 0.4846,
          exitTradeIds: [972959853],
          fee: 0.00633136,
          feeAsset: 'BNB',
          pnl: 0.65763999,
          pnlPercentage: 0.00020639834567473937,
          size: 6576.4,
          symbol: 'XRPUSDT',
        },
        {
          direction: 1,
          entryDate: 1665483390119,
          entryPrice: 0.48,
          entryTradeIds: [971985953],
          exitDate: 1665497702075,
          exitPrice: 0.4931,
          exitTradeIds: [972254773],
          fee: 0.0017504499999999997,
          feeAsset: 'BNB',
          pnl: -23.58,
          pnlPercentage: -0.027291666666666665,
          size: 1800,
          symbol: 'XRPUSDT',
        },
      ]);
    });

    it('skippedTrades?', () => {
      const result = mergeTrades(skippedTrades);
      expect(result).toEqual([]);
    });
  });
});
