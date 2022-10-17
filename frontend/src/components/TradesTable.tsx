import React, { useState, useEffect } from 'react';
import { MergedTrade } from '../types';
import { DateTime } from 'luxon';

interface TradesTableProps {
  fromId: number | null
}

const formatTimestamp = (dateTime: string) => {
  const date = DateTime.fromISO(dateTime);
  return `${date.toFormat('yyyy-MM-dd HH:mm:ss')}`
}

function TradesTable(props: TradesTableProps) {

  const [trades, setTrades] = useState<MergedTrade[]>([])

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/trades`);
      
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
    <table className="trades">
      <tbody>
        {
            trades.map(trade => {
              return (
                <tr>
                  <td>{formatTimestamp(trade.entryDate)}</td>
                  <td>{formatTimestamp(trade.exitDate)}</td>
                  <td>{trade.symbol}</td>
                  <td>{trade.direction === 0 ? "Long" : "Short"}</td>
                  <td>{trade.entryPrice}</td>
                  <td>{trade.exitPrice}</td>
                  <td>{trade.size.toPrecision(5)}</td>
                  <td>{trade.fee.toPrecision(5)}</td>
                  <td>{trade.feeAsset}</td>
                  <td>{trade.pnl.toPrecision(5)}</td>
                  <td>{trade.pnlPercentage.toPrecision(2)}%</td>
                </tr>
              )
            })
        }
      </tbody>
    </table>
  );
}

export default TradesTable;
