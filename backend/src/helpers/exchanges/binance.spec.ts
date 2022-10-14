import { mergeTrades } from '../../../src/helpers/exchanges/binance';
import { TradeDirection } from '@shared/types';
import {
  multipleExitTradesWithSomeZeroPnL,
  multipleSimpleTrades,
  multiExitMultiEntryTrade,
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
          exitPrice: 0.00525,
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

    it.only('should work correctly when there are multiple exit and entry trades', () => {
      const result = mergeTrades(multiExitMultiEntryTrade);
      expect(result).toEqual([]);
    });
  });
});
