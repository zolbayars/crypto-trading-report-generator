import React, { useState, useEffect } from 'react';

interface Trade {
  symbol: string;
  id: number;
  orderId: number;
  side: string;
  price: string;
  qty: string;
  realizedPnl: string;
  marginAsset: string;
  quoteQty: string;
  commission: string;
  commissionAsset: string;
  time: number;
  positionSide: string;
  buyer: boolean;
  maker: boolean;
}

function ReportTable() {

  const [trades, setTrades] = useState<Trade[]>([])

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/reports`);
      
      // @todo type
      const result = await response.json();
      console.log('result', result);

      if (!result.errorMsg) {
        setTrades(result.trades)    
      } 

    }
    fetchData();    
  });

  return (
    <table className="reports">
      {
          trades.map(trade => {
            return (
              <tr>
                <td>{trade.time}</td>
                <td>{trade.symbol}</td>
                <td>{trade.side}</td>
                <td>{trade.price}</td>
                <td>{trade.qty}</td>
                <td>{trade.realizedPnl}</td>
                <td>{trade.quoteQty}</td>
                <td>{trade.commission}</td>
                <td>{trade.commissionAsset}</td>
                <td>{trade.maker}</td>
              </tr>
            )
          })
      }
      
    </table>
  );
}

export default ReportTable;
