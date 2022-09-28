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
              const entryDate = new Date(trade.entryDate);
              const exitDate = new Date(trade.exitDate);
              return (
                <tr>
                  <td>{entryDate.toLocaleString()}</td>
                  <td>{exitDate.toLocaleString()}</td>
                  <td>{trade.symbol}</td>
                  <td>{trade.direction === 0 ? "Long" : "Short"}</td>
                  <td>{trade.entryPrice}</td>
                  <td>{trade.exitPrice}</td>
                  <td>{trade.size}</td>
                  <td>{trade.fee}</td>
                  <td>{trade.feeAsset}</td>
                  <td>{trade.pnl}</td>
                </tr>
              )
            })
        }
      </tbody>
    </table>
  );
}

export default ReportTable;
