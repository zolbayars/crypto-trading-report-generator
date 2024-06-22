-- CreateEnum
CREATE TYPE "merged_trade_direction" AS ENUM ('long', 'short');

-- CreateEnum
CREATE TYPE "trade_marketType" AS ENUM ('futures', 'spot');

-- CreateEnum
CREATE TYPE "trade_exchange" AS ENUM ('binance');

-- CreateTable
CREATE TABLE "merged_trade" (
    "id" SERIAL NOT NULL,
    "entryDate" TIMESTAMP(0) NOT NULL,
    "exitDate" TIMESTAMP(0) NOT NULL,
    "symbol" VARCHAR(255) NOT NULL,
    "direction" "merged_trade_direction" NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "exitPrice" DOUBLE PRECISION NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "pnl" DOUBLE PRECISION NOT NULL,
    "pnlPercentage" DOUBLE PRECISION NOT NULL,
    "fee" DOUBLE PRECISION NOT NULL,
    "feeAsset" VARCHAR(255) NOT NULL,
    "entryReason" VARCHAR(255),
    "exitReason" VARCHAR(255),
    "mistake" VARCHAR(255),
    "comment" VARCHAR(255),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "merged_trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade" (
    "id" SERIAL NOT NULL,
    "exchangeTradeId" TEXT NOT NULL,
    "exchangeOrderId" TEXT NOT NULL,
    "symbol" VARCHAR(255) NOT NULL,
    "side" VARCHAR(255) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "quoteQty" DOUBLE PRECISION NOT NULL,
    "realizedPnl" DOUBLE PRECISION NOT NULL,
    "marginAsset" VARCHAR(255) NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL,
    "commissionAsset" VARCHAR(255) NOT NULL,
    "exchangeCreatedAt" TIMESTAMP(0) NOT NULL,
    "positionSide" VARCHAR(255) NOT NULL,
    "isBuyer" SMALLINT NOT NULL,
    "isMaker" SMALLINT NOT NULL,
    "isEntryTrade" SMALLINT,
    "marketType" "trade_marketType" NOT NULL,
    "exchange" "trade_exchange" NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parentTradeId" INTEGER,

    CONSTRAINT "trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "merged_trade_entryDate_idx" ON "merged_trade"("entryDate");

-- CreateIndex
CREATE UNIQUE INDEX "merged_trade_symbol_entryDate_exitDate_key" ON "merged_trade"("symbol", "entryDate", "exitDate");

-- CreateIndex
CREATE INDEX "trade_parentTradeId_idx" ON "trade"("parentTradeId");

-- CreateIndex
CREATE INDEX "trade_exchangeTradeId_idx" ON "trade"("exchangeTradeId");

-- CreateIndex
CREATE UNIQUE INDEX "trade_exchange_exchangeTradeId_key" ON "trade"("exchange", "exchangeTradeId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
