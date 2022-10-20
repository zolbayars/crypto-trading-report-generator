import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { TableCellProps } from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import { styled } from '@mui/material/styles';
import { MergedTrade } from '../types';

interface TradesTableProps {
  fromId: number | null
}

interface StyledTableCellProps extends TableCellProps {
  numericValue: number;
}

const StyledTableCell = styled(TableCell)<StyledTableCellProps>(({ theme, numericValue }) => ({
  ...(numericValue > 0 && {
    backgroundColor: 'rgba(52, 168, 83, .9)'
  }),
  ...(numericValue < 0 && {
    backgroundColor: 'rgba(234, 67, 53, .9)'
  })
}));

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
                  <StyledTableCell numericValue={trade.pnl}>{trade.pnl.toPrecision(5)}</StyledTableCell>
                  <StyledTableCell numericValue={trade.pnlPercentage}>{trade.pnlPercentage.toPrecision(2)}%</StyledTableCell>
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
