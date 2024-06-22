import { BinanceTrade } from "@/lib/api/exchanges/binance";

export const skippedTrades: BinanceTrade[] = [
  {
    symbol: "EOSUSDT",
    id: 456157119,
    orderId: 15890362726,
    side: "BUY",
    price: "1.676",
    qty: "326.8",
    realizedPnl: "0",
    marginAsset: "USDT",
    quoteQty: "547.7168",
    commission: "0.10954336",
    commissionAsset: "USDT",
    time: 1661397204673,
    positionSide: "BOTH",
    buyer: true,
    maker: true,
  },
  {
    symbol: "EOSUSDT",
    id: 456221695,
    orderId: 15892599987,
    side: "SELL",
    price: "1.685",
    qty: "197.6",
    realizedPnl: "1.77840000",
    marginAsset: "USDT",
    quoteQty: "332.9560",
    commission: "0.13318240",
    commissionAsset: "USDT",
    time: 1661407279238,
    positionSide: "BOTH",
    buyer: false,
    maker: false,
  },
  {
    symbol: "EOSUSDT",
    id: 456221696,
    orderId: 15892599987,
    side: "SELL",
    price: "1.685",
    qty: "129.2",
    realizedPnl: "1.16280000",
    marginAsset: "USDT",
    quoteQty: "217.7020",
    commission: "0.08708080",
    commissionAsset: "USDT",
    time: 1661407279238,
    positionSide: "BOTH",
    buyer: false,
    maker: false,
  },
];

export const multipleExitTradesWithSomeZeroPnL: BinanceTrade[] = [
  {
    symbol: "REEFUSDT",
    id: 109711556,
    orderId: 2622002193,
    side: "BUY",
    price: "0.005250",
    qty: "18495",
    realizedPnl: "0",
    marginAsset: "USDT",
    quoteQty: "97.098750",
    commission: "0.00005899",
    commissionAsset: "BNB",
    time: 1663068192304,
    positionSide: "BOTH",
    buyer: true,
    maker: true,
  },
  {
    symbol: "REEFUSDT",
    id: 110221250,
    orderId: 2625200119,
    side: "SELL",
    price: "0.005250",
    qty: "13487",
    realizedPnl: "0",
    marginAsset: "USDT",
    quoteQty: "70.806750",
    commission: "0.00009026",
    commissionAsset: "BNB",
    time: 1663075435848,
    positionSide: "BOTH",
    buyer: false,
    maker: false,
  },
  {
    symbol: "REEFUSDT",
    id: 110221251,
    orderId: 2625200119,
    side: "SELL",
    price: "0.005249",
    qty: "5008",
    realizedPnl: "-0.00500800",
    marginAsset: "USDT",
    quoteQty: "26.286992",
    commission: "0.00003351",
    commissionAsset: "BNB",
    time: 1663075435848,
    positionSide: "BOTH",
    buyer: false,
    maker: false,
  },
];

export const multipleSimpleTrades: BinanceTrade[] = [
  {
    symbol: "XRPUSDT",
    id: 963165212,
    orderId: 24104717729,
    side: "BUY",
    price: "0.4885",
    qty: "214.9",
    realizedPnl: "0",
    marginAsset: "USDT",
    quoteQty: "104.97865",
    commission: "0.00006397",
    commissionAsset: "BNB",
    time: 1664951496170,
    positionSide: "BOTH",
    buyer: true,
    maker: true,
  },
  {
    symbol: "XRPUSDT",
    id: 963192842,
    orderId: 24105450137,
    side: "SELL",
    price: "0.4886",
    qty: "214.9",
    realizedPnl: "0.02149000",
    marginAsset: "USDT",
    quoteQty: "105.00014",
    commission: "0.00006399",
    commissionAsset: "BNB",
    time: 1664952487063,
    positionSide: "BOTH",
    buyer: false,
    maker: true,
  },
  {
    symbol: "ADAUSDT",
    id: 818518277,
    orderId: 25449014780,
    side: "SELL",
    price: "0.43240",
    qty: "243",
    realizedPnl: "0",
    marginAsset: "USDT",
    quoteQty: "105.07320",
    commission: "0.00006408",
    commissionAsset: "BNB",
    time: 1664954443097,
    positionSide: "BOTH",
    buyer: false,
    maker: true,
  },
  {
    symbol: "ADAUSDT",
    id: 818526179,
    orderId: 25449032849,
    side: "BUY",
    price: "0.43050",
    qty: "243",
    realizedPnl: "0.46170000",
    marginAsset: "USDT",
    quoteQty: "104.61150",
    commission: "0.00006424",
    commissionAsset: "BNB",
    time: 1664957550994,
    positionSide: "BOTH",
    buyer: true,
    maker: true,
  },
];

export const multiExitMultiEntryTrade: BinanceTrade[] = [
  {
    symbol: "XRPUSDT",
    id: 972943831,
    orderId: 24507757761,
    side: "BUY",
    price: "0.4845",
    qty: "1176.4",
    realizedPnl: "0",
    marginAsset: "USDT",
    quoteQty: "569.96580",
    commission: "0.00037760",
    commissionAsset: "BNB",
    time: 1665542046118,
    positionSide: "BOTH",
    buyer: true,
    maker: true,
  },
  {
    symbol: "XRPUSDT",
    id: 972944785,
    orderId: 24507864529,
    side: "BUY",
    price: "0.4845",
    qty: "5400",
    realizedPnl: "0",
    marginAsset: "USDT",
    quoteQty: "2616.30000",
    commission: "0.00173325",
    commissionAsset: "BNB",
    time: 1665542160745,
    positionSide: "BOTH",
    buyer: true,
    maker: true,
  },
  {
    symbol: "XRPUSDT",
    id: 972959853,
    orderId: 24508446129,
    side: "SELL",
    price: "0.4846",
    qty: "6576.4",
    realizedPnl: "0.65763999",
    marginAsset: "USDT",
    quoteQty: "3186.92344",
    commission: "0.00422051",
    commissionAsset: "BNB",
    time: 1665543865101,
    positionSide: "BOTH",
    buyer: false,
    maker: false,
  },
  {
    symbol: "XRPUSDT",
    id: 972968458,
    orderId: 24510227230,
    side: "SELL",
    price: "0.4844",
    qty: "3397.3",
    realizedPnl: "0",
    marginAsset: "USDT",
    quoteQty: "1645.65212",
    commission: "0.00109045",
    commissionAsset: "BNB",
    time: 1665545356037,
    positionSide: "BOTH",
    buyer: false,
    maker: true,
  },
  {
    symbol: "XRPUSDT",
    id: 972968459,
    orderId: 24510227230,
    side: "SELL",
    price: "0.4844",
    qty: "994.5",
    realizedPnl: "0",
    marginAsset: "USDT",
    quoteQty: "481.73580",
    commission: "0.00031921",
    commissionAsset: "BNB",
    time: 1665545357630,
    positionSide: "BOTH",
    buyer: false,
    maker: true,
  },
  {
    symbol: "XRPUSDT",
    id: 972968460,
    orderId: 24510227230,
    side: "SELL",
    price: "0.4844",
    qty: "1608.2",
    realizedPnl: "0",
    marginAsset: "USDT",
    quoteQty: "779.01208",
    commission: "0.00051619",
    commissionAsset: "BNB",
    time: 1665545359179,
    positionSide: "BOTH",
    buyer: false,
    maker: true,
  },
  {
    symbol: "XRPUSDT",
    id: 972991566,
    orderId: 24511947261,
    side: "BUY",
    price: "0.4881",
    qty: "5025",
    realizedPnl: "-18.59250000",
    marginAsset: "USDT",
    quoteQty: "2452.70250",
    commission: "0.00324779",
    commissionAsset: "BNB",
    time: 1665547714968,
    positionSide: "BOTH",
    buyer: true,
    maker: false,
  },
  {
    symbol: "XRPUSDT",
    id: 972991567,
    orderId: 24511947261,
    side: "BUY",
    price: "0.4881",
    qty: "20.5",
    realizedPnl: "-0.07585000",
    marginAsset: "USDT",
    quoteQty: "10.00605",
    commission: "0.00001324",
    commissionAsset: "BNB",
    time: 1665547714968,
    positionSide: "BOTH",
    buyer: true,
    maker: false,
  },
  {
    symbol: "XRPUSDT",
    id: 972991568,
    orderId: 24511947261,
    side: "BUY",
    price: "0.4881",
    qty: "45.6",
    realizedPnl: "-0.16872000",
    marginAsset: "USDT",
    quoteQty: "22.25736",
    commission: "0.00002947",
    commissionAsset: "BNB",
    time: 1665547714968,
    positionSide: "BOTH",
    buyer: true,
    maker: false,
  },
  {
    symbol: "XRPUSDT",
    id: 972991569,
    orderId: 24511947261,
    side: "BUY",
    price: "0.4881",
    qty: "61.9",
    realizedPnl: "-0.22903000",
    marginAsset: "USDT",
    quoteQty: "30.21339",
    commission: "0.00004000",
    commissionAsset: "BNB",
    time: 1665547714968,
    positionSide: "BOTH",
    buyer: true,
    maker: false,
  },
  {
    symbol: "XRPUSDT",
    id: 972991570,
    orderId: 24511947261,
    side: "BUY",
    price: "0.4881",
    qty: "15.4",
    realizedPnl: "-0.05698000",
    marginAsset: "USDT",
    quoteQty: "7.51674",
    commission: "0.00000995",
    commissionAsset: "BNB",
    time: 1665547714968,
    positionSide: "BOTH",
    buyer: true,
    maker: false,
  },
  {
    symbol: "XRPUSDT",
    id: 972991571,
    orderId: 24511947261,
    side: "BUY",
    price: "0.4881",
    qty: "15.4",
    realizedPnl: "-0.05698000",
    marginAsset: "USDT",
    quoteQty: "7.51674",
    commission: "0.00000995",
    commissionAsset: "BNB",
    time: 1665547714968,
    positionSide: "BOTH",
    buyer: true,
    maker: false,
  },
  {
    symbol: "XRPUSDT",
    id: 972991572,
    orderId: 24511947261,
    side: "BUY",
    price: "0.4881",
    qty: "592",
    realizedPnl: "-2.19040000",
    marginAsset: "USDT",
    quoteQty: "288.95520",
    commission: "0.00038262",
    commissionAsset: "BNB",
    time: 1665547714968,
    positionSide: "BOTH",
    buyer: true,
    maker: false,
  },
  {
    symbol: "XRPUSDT",
    id: 972991573,
    orderId: 24511947261,
    side: "BUY",
    price: "0.4881",
    qty: "224.2",
    realizedPnl: "-0.82954000",
    marginAsset: "USDT",
    quoteQty: "109.43202",
    commission: "0.00014490",
    commissionAsset: "BNB",
    time: 1665547714968,
    positionSide: "BOTH",
    buyer: true,
    maker: false,
  },
  {
    symbol: "XRPUSDT",
    id: 972992020,
    orderId: 24511977791,
    side: "BUY",
    price: "0.4880",
    qty: "1609.7",
    realizedPnl: "0",
    marginAsset: "USDT",
    quoteQty: "785.53360",
    commission: "0.00052003",
    commissionAsset: "BNB",
    time: 1665547760219,
    positionSide: "BOTH",
    buyer: true,
    maker: true,
  },
  {
    symbol: "XRPUSDT",
    id: 972992021,
    orderId: 24511977791,
    side: "BUY",
    price: "0.4880",
    qty: "162",
    realizedPnl: "0",
    marginAsset: "USDT",
    quoteQty: "79.05600",
    commission: "0.00005233",
    commissionAsset: "BNB",
    time: 1665547760380,
    positionSide: "BOTH",
    buyer: true,
    maker: true,
  },
  {
    symbol: "XRPUSDT",
    id: 972992022,
    orderId: 24511977791,
    side: "BUY",
    price: "0.4880",
    qty: "2273",
    realizedPnl: "0",
    marginAsset: "USDT",
    quoteQty: "1109.22400",
    commission: "0.00073432",
    commissionAsset: "BNB",
    time: 1665547762053,
    positionSide: "BOTH",
    buyer: true,
    maker: true,
  },
  {
    symbol: "XRPUSDT",
    id: 973019756,
    orderId: 24514421282,
    side: "SELL",
    price: "0.4868",
    qty: "1806.2",
    realizedPnl: "-2.16744000",
    marginAsset: "USDT",
    quoteQty: "879.25816",
    commission: "0.00116291",
    commissionAsset: "BNB",
    time: 1665551097728,
    positionSide: "BOTH",
    buyer: false,
    maker: false,
  },
  {
    symbol: "XRPUSDT",
    id: 973019757,
    orderId: 24514421282,
    side: "SELL",
    price: "0.4868",
    qty: "2238.5",
    realizedPnl: "-2.68620000",
    marginAsset: "USDT",
    quoteQty: "1089.70180",
    commission: "0.00144125",
    commissionAsset: "BNB",
    time: 1665551097728,
    positionSide: "BOTH",
    buyer: false,
    maker: false,
  },
  {
    symbol: "XRPUSDT",
    id: 973034997,
    orderId: 24515837106,
    side: "SELL",
    price: "0.4871",
    qty: "3367.8",
    realizedPnl: "0",
    marginAsset: "USDT",
    quoteQty: "1640.45538",
    commission: "0.00108752",
    commissionAsset: "BNB",
    time: 1665553166753,
    positionSide: "BOTH",
    buyer: false,
    maker: true,
  },
  {
    symbol: "XRPUSDT",
    id: 973045326,
    orderId: 24516409667,
    side: "BUY",
    price: "0.4893",
    qty: "2511.4",
    realizedPnl: "0",
    marginAsset: "USDT",
    quoteQty: "1228.82802",
    commission: "0.00081283",
    commissionAsset: "BNB",
    time: 1665553880301,
    positionSide: "BOTH",
    buyer: true,
    maker: true,
  },
  {
    symbol: "XRPUSDT",
    id: 973218582,
    orderId: 24530856664,
    side: "SELL",
    price: "0.4886",
    qty: "839.7",
    realizedPnl: "-0.58779000",
    marginAsset: "USDT",
    quoteQty: "410.27742",
    commission: "0.00054316",
    commissionAsset: "BNB",
    time: 1665573771390,
    positionSide: "BOTH",
    buyer: false,
    maker: false,
  },
  {
    symbol: "XRPUSDT",
    id: 973218583,
    orderId: 24530856664,
    side: "SELL",
    price: "0.4886",
    qty: "1671.7",
    realizedPnl: "-1.17019000",
    marginAsset: "USDT",
    quoteQty: "816.79262",
    commission: "0.00108134",
    commissionAsset: "BNB",
    time: 1665573771390,
    positionSide: "BOTH",
    buyer: false,
    maker: false,
  },
];