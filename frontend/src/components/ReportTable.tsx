import React, { useState, useEffect } from 'react';
import { Trade } from '@shared/types';

interface ReportTableProps {
  fromId: number | null
}

function ReportTable(props: ReportTableProps) {

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
  }, [props.fromId]);

  return (
    <table className="reports">
      <tbody>
        {
            trades.map(trade => {
              const tradeDate = new Date(trade.time);
              return (
                <tr key={trade.id}>
                  <td>{tradeDate.toLocaleString()}</td>
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
      </tbody>
    </table>
  );
}

export default ReportTable;
