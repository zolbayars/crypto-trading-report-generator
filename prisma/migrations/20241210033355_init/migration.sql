-- AddForeignKey
ALTER TABLE "trade" ADD CONSTRAINT "trade_parentTradeId_fkey" FOREIGN KEY ("parentTradeId") REFERENCES "merged_trade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
