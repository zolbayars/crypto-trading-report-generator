import {
  TradeDirection,
  mergeTrades,
} from "../../../../lib/api/exchanges/binance";
import {
  multipleExitTradesWithSomeZeroPnL,
  multipleSimpleTrades,
  multiExitMultiEntryTrade,
  skippedTrades,
} from "../../../mocks/binanceResponses";

describe("Binance helper", () => {
  describe("mergeTrades", () => {
    describe("should work correctly", () => {
      test("when there are multiple exit trades and some of them have 0 PnL", () => {
        const result = mergeTrades(multipleExitTradesWithSomeZeroPnL);
        expect(result).toEqual([
          {
            direction: TradeDirection.LONG,
            entry_date: 1663068192304,
            entry_price: 0.00525,
            entryTradeIds: ["109711556"],
            exit_date: 1663075435848,
            exit_price: 0.005249,
            exitTradeIds: ["110221250", "110221251"],
            fee: 0.00018276,
            fee_asset: "BNB",
            pnl: -0.005008,
            pnl_percentage: -0.000051576359118938196,
            size: 18495,
            symbol: "REEFUSDT",
          },
        ]);
      });

      test("when there are multiple simple trades and all of them have single entry and exit trades", () => {
        const result = mergeTrades(multipleSimpleTrades);
        expect(result).toEqual([
          {
            direction: TradeDirection.LONG,
            entry_date: 1664951496170,
            entry_price: 0.4885,
            entryTradeIds: ["963165212"],
            exit_date: 1664952487063,
            exit_price: 0.4886,
            exitTradeIds: ["963192842"],
            fee: 0.00012796,
            fee_asset: "BNB",
            pnl: 0.02149,
            pnl_percentage: 0.00020470829068577277,
            size: 214.9,
            symbol: "XRPUSDT",
          },
          {
            direction: 1,
            entry_date: 1664954443097,
            entry_price: 0.4324,
            entryTradeIds: ["818518277"],
            exit_date: 1664957550994,
            exit_price: 0.4305,
            exitTradeIds: ["818526179"],
            fee: 0.00012832,
            fee_asset: "BNB",
            pnl: 0.4617,
            pnl_percentage: 0.0043940795559666975,
            size: 243,
            symbol: "ADAUSDT",
          },
        ]);
      });

      test("when there are numerous exit and entry trades with a same pair", () => {
        const result = mergeTrades(multiExitMultiEntryTrade);
        expect(result).toEqual([
          {
            direction: 0,
            entry_date: 1665542046118,
            entry_price: 0.4845,
            entryTradeIds: ["972943831", "972944785"],
            exit_date: 1665543865101,
            exit_price: 0.4846,
            exitTradeIds: ["972959853"],
            fee: 0.00633136,
            fee_asset: "BNB",
            pnl: 0.65763999,
            pnl_percentage: 0.00020639834567473937,
            size: 6576.4,
            symbol: "XRPUSDT",
          },
          {
            direction: 1,
            entry_date: 1665545356037,
            entry_price: 0.4844,
            entryTradeIds: ["972968458", "972968459", "972968460"],
            exit_date: 1665547714968,
            exit_price: 0.4881,
            exitTradeIds: [
              "972991566",
              "972991567",
              "972991568",
              "972991569",
              "972991570",
              "972991571",
              "972991572",
              "972991573",
            ],
            fee: 0.00580377,
            fee_asset: "BNB",
            pnl: -22.2,
            pnl_percentage: -0.007638315441783649,
            size: 6000,
            symbol: "XRPUSDT",
          },
          {
            direction: 0,
            entry_date: 1665547760219,
            entry_price: 0.488,
            entryTradeIds: ["972992020", "972992021", "972992022"],
            exit_date: 1665551097728,
            exit_price: 0.4868,
            exitTradeIds: ["973019756", "973019757"],
            fee: 0.00391084,
            fee_asset: "BNB",
            pnl: -4.85364,
            pnl_percentage: -0.002459016393442623,
            size: 4044.7,
            symbol: "XRPUSDT",
          },
        ]);
      });

      test("when the trade was skipped previously due to sorting issue", () => {
        const result = mergeTrades(skippedTrades);
        expect(result).toEqual([
          {
            direction: 0,
            entry_date: 1661397204673,
            entry_price: 1.676,
            entryTradeIds: ["456157119"],
            exit_date: 1661407279238,
            exit_price: 1.685,
            exitTradeIds: ["456221695", "456221696"],
            fee: 0.32980656,
            fee_asset: "USDT",
            pnl: 2.9412,
            pnl_percentage: 0.0053699284009546535,
            size: 326.8,
            symbol: "EOSUSDT",
          },
        ]);
      });
    });
  });
});
