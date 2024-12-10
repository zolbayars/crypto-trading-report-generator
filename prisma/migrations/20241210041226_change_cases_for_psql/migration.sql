/*
  Warnings:

  - You are about to drop the column `createdAt` on the `merged_trade` table. All the data in the column will be lost.
  - You are about to drop the column `entryDate` on the `merged_trade` table. All the data in the column will be lost.
  - You are about to drop the column `entryPrice` on the `merged_trade` table. All the data in the column will be lost.
  - You are about to drop the column `entryReason` on the `merged_trade` table. All the data in the column will be lost.
  - You are about to drop the column `exitDate` on the `merged_trade` table. All the data in the column will be lost.
  - You are about to drop the column `exitPrice` on the `merged_trade` table. All the data in the column will be lost.
  - You are about to drop the column `exitReason` on the `merged_trade` table. All the data in the column will be lost.
  - You are about to drop the column `feeAsset` on the `merged_trade` table. All the data in the column will be lost.
  - You are about to drop the column `pnlPercentage` on the `merged_trade` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `merged_trade` table. All the data in the column will be lost.
  - You are about to drop the column `commissionAsset` on the `trade` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `trade` table. All the data in the column will be lost.
  - You are about to drop the column `exchangeCreatedAt` on the `trade` table. All the data in the column will be lost.
  - You are about to drop the column `exchangeOrderId` on the `trade` table. All the data in the column will be lost.
  - You are about to drop the column `exchangeTradeId` on the `trade` table. All the data in the column will be lost.
  - You are about to drop the column `isBuyer` on the `trade` table. All the data in the column will be lost.
  - You are about to drop the column `isEntryTrade` on the `trade` table. All the data in the column will be lost.
  - You are about to drop the column `isMaker` on the `trade` table. All the data in the column will be lost.
  - You are about to drop the column `marginAsset` on the `trade` table. All the data in the column will be lost.
  - You are about to drop the column `marketType` on the `trade` table. All the data in the column will be lost.
  - You are about to drop the column `parentTradeId` on the `trade` table. All the data in the column will be lost.
  - You are about to drop the column `positionSide` on the `trade` table. All the data in the column will be lost.
  - You are about to drop the column `quoteQty` on the `trade` table. All the data in the column will be lost.
  - You are about to drop the column `realizedPnl` on the `trade` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `trade` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[symbol,entry_date,exit_date]` on the table `merged_trade` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[exchange,exchange_trade_id]` on the table `trade` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `entry_date` to the `merged_trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entry_price` to the `merged_trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exit_date` to the `merged_trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exit_price` to the `merged_trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fee_asset` to the `merged_trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pnl_percentage` to the `merged_trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commission_asset` to the `trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exchange_created_at` to the `trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exchange_order_id` to the `trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exchange_trade_id` to the `trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_buyer` to the `trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_maker` to the `trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `margin_asset` to the `trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `market_type` to the `trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position_side` to the `trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quote_qty` to the `trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `realized_pnl` to the `trade` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "trade" DROP CONSTRAINT "trade_parentTradeId_fkey";

-- DropIndex
DROP INDEX "merged_trade_entryDate_idx";

-- DropIndex
DROP INDEX "merged_trade_symbol_entryDate_exitDate_key";

-- DropIndex
DROP INDEX "trade_exchangeTradeId_idx";

-- DropIndex
DROP INDEX "trade_exchange_exchangeTradeId_key";

-- DropIndex
DROP INDEX "trade_parentTradeId_idx";

-- AlterTable
ALTER TABLE "merged_trade" DROP COLUMN "createdAt",
DROP COLUMN "entryDate",
DROP COLUMN "entryPrice",
DROP COLUMN "entryReason",
DROP COLUMN "exitDate",
DROP COLUMN "exitPrice",
DROP COLUMN "exitReason",
DROP COLUMN "feeAsset",
DROP COLUMN "pnlPercentage",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "entry_date" TIMESTAMP(0) NOT NULL,
ADD COLUMN     "entry_price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "entry_reason" VARCHAR(255),
ADD COLUMN     "exit_date" TIMESTAMP(0) NOT NULL,
ADD COLUMN     "exit_price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "exit_reason" VARCHAR(255),
ADD COLUMN     "fee_asset" VARCHAR(255) NOT NULL,
ADD COLUMN     "pnl_percentage" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "trade" DROP COLUMN "commissionAsset",
DROP COLUMN "createdAt",
DROP COLUMN "exchangeCreatedAt",
DROP COLUMN "exchangeOrderId",
DROP COLUMN "exchangeTradeId",
DROP COLUMN "isBuyer",
DROP COLUMN "isEntryTrade",
DROP COLUMN "isMaker",
DROP COLUMN "marginAsset",
DROP COLUMN "marketType",
DROP COLUMN "parentTradeId",
DROP COLUMN "positionSide",
DROP COLUMN "quoteQty",
DROP COLUMN "realizedPnl",
DROP COLUMN "updatedAt",
ADD COLUMN     "commission_asset" VARCHAR(255) NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "exchange_created_at" TIMESTAMP(0) NOT NULL,
ADD COLUMN     "exchange_order_id" TEXT NOT NULL,
ADD COLUMN     "exchange_trade_id" TEXT NOT NULL,
ADD COLUMN     "is_buyer" SMALLINT NOT NULL,
ADD COLUMN     "is_entry_trade" SMALLINT,
ADD COLUMN     "is_maker" SMALLINT NOT NULL,
ADD COLUMN     "margin_asset" VARCHAR(255) NOT NULL,
ADD COLUMN     "market_type" "trade_marketType" NOT NULL,
ADD COLUMN     "parent_trade_id" INTEGER,
ADD COLUMN     "position_side" VARCHAR(255) NOT NULL,
ADD COLUMN     "quote_qty" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "realized_pnl" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "merged_trade_entry_date_idx" ON "merged_trade"("entry_date");

-- CreateIndex
CREATE UNIQUE INDEX "merged_trade_symbol_entry_date_exit_date_key" ON "merged_trade"("symbol", "entry_date", "exit_date");

-- CreateIndex
CREATE INDEX "trade_parent_trade_id_idx" ON "trade"("parent_trade_id");

-- CreateIndex
CREATE INDEX "trade_exchange_trade_id_idx" ON "trade"("exchange_trade_id");

-- CreateIndex
CREATE UNIQUE INDEX "trade_exchange_exchange_trade_id_key" ON "trade"("exchange", "exchange_trade_id");

-- AddForeignKey
ALTER TABLE "trade" ADD CONSTRAINT "trade_parent_trade_id_fkey" FOREIGN KEY ("parent_trade_id") REFERENCES "merged_trade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
