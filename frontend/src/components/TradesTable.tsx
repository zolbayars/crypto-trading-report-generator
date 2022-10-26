import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import { MergedTrade, NumericValuesInTrade, TradeNumbericMetrics } from '../types';
import TableCellPnL from './TableCellPnL';

interface TradesTableProps {
  fromId: number | null
}

const formatTimestamp = (dateTime: string) => {
  const date = DateTime.fromISO(dateTime);
  return `${date.toFormat('yyyy-MM-dd HH:mm:ss')}`
}

function TradesTable(props: TradesTableProps) {

  const [trades, setTrades] = useState<MergedTrade[]>([])
  const [tradeNumericMetrics, setTradeNumericMetrics] = useState<TradeNumbericMetrics>({
    maxPnL: 0,
    maxPnLPercentage: 0,
    minPnL: 0,
    minPnLPercentage: 0
  })

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/trades`);
      
      // @todo type
      const result = await response.json();
      console.log('result', result);

      if (!result.errorMsg) {
        const { trades } = result;
        setTrades(trades)
      } 
    }

    fetchData();    
  
  }, [props.fromId]);

  useEffect(() => {
    const getMaxValue = (propName: NumericValuesInTrade) => {
      let max = -Infinity;
      trades.forEach(trade => {
        max = Math.max(max, trade[propName] as number);
      });
  
      console.log('max', max)
      return max;
    }
  
    const getMinValue = (propName: NumericValuesInTrade) => {
      let min = +Infinity;
      trades.forEach(trade => {
        min = Math.min(min, trade[propName] as number);
      });
  
      return min;
    }

    setTradeNumericMetrics({
      maxPnL: getMaxValue(NumericValuesInTrade.pnl),
      minPnL: getMinValue(NumericValuesInTrade.pnl),
      maxPnLPercentage: getMaxValue(NumericValuesInTrade.pnlPercentage),
      minPnLPercentage: getMinValue(NumericValuesInTrade.pnlPercentage),
    })
  }, [trades]);

  return (
    <TableContainer sx={{ maxHeight: 800 }}>
      <Table size='small' stickyHeader aria-label="trades table">
        <TableHead>
          <TableRow>
            <TableCell>Entry</TableCell>
            <TableCell>Exit</TableCell>
            <TableCell>Symbol</TableCell>
            <TableCell>Side</TableCell>
            <TableCell>Entry</TableCell>
            <TableCell>Exit</TableCell>
            <TableCell>Size</TableCell>
            <TableCell>Fee</TableCell>
            <TableCell>PnL</TableCell>
            <TableCell>PnL %</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            trades.map(trade => {
              return (
                <TableRow key={trade.id}>
                  <TableCell>{formatTimestamp(trade.entryDate)}</TableCell>
                  <TableCell>{formatTimestamp(trade.exitDate)}</TableCell>
                  <TableCell>{trade.symbol}</TableCell>
                  <TableCell>{trade.direction === 0 ? "Long" : "Short"}</TableCell>
                  <TableCell>{trade.entryPrice}</TableCell>
                  <TableCell>{trade.exitPrice}</TableCell>
                  <TableCell>{trade.size.toPrecision(5)}</TableCell>
                  <TableCell>{trade.fee.toPrecision(5)} {trade.feeAsset}</TableCell>
                  <TableCellPnL numericValue={trade.pnl} numericValueType={NumericValuesInTrade.pnl} tradeNumericMetrics={tradeNumericMetrics}>{trade.pnl.toPrecision(5)}</TableCellPnL>
                  <TableCellPnL numericValue={trade.pnlPercentage} numericValueType={NumericValuesInTrade.pnlPercentage} tradeNumericMetrics={tradeNumericMetrics}>{`${trade.pnlPercentage.toPrecision(2)}%`}</TableCellPnL>
                </TableRow>
              )
            })
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TradesTable;
