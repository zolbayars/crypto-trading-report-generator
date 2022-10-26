
import React from 'react';
import TableCell, { TableCellProps } from '@mui/material/TableCell';
import { styled } from '@mui/material/styles';
import { TradeNumbericMetrics, NumericValuesInTrade } from '../types';

const getRelativePercentage = (value: number, absoluteValue: number) => (value / absoluteValue)

interface TableCellPnLProps {
  children: string
  numericValue: number;
  numericValueType: NumericValuesInTrade
  tradeNumericMetrics: TradeNumbericMetrics
}

export default function TableCellPnL(props: TableCellPnLProps) {
  const { numericValue, numericValueType, tradeNumericMetrics, children } = props;

  const { maxPnL, maxPnLPercentage, minPnL, minPnLPercentage } = tradeNumericMetrics

  // @todo might wanna pass only the props you're gonna use
  const StyledTableCell = styled(TableCell)<TableCellProps>(({ theme }) => {
    let positiveOpacity = 1
    let negativeOpacity = 0

    if (numericValueType === NumericValuesInTrade.pnl) {
      positiveOpacity = getRelativePercentage(numericValue, maxPnL)
      negativeOpacity = getRelativePercentage(numericValue, minPnL)
    } else if (numericValueType === NumericValuesInTrade.pnlPercentage) {
      positiveOpacity = getRelativePercentage(numericValue, maxPnLPercentage)
      negativeOpacity = getRelativePercentage(numericValue, minPnLPercentage)
    }

    return {
    ...(numericValue > 0 && {
      backgroundColor: `rgba(52, 168, 83, ${positiveOpacity})`
    }),
    ...(numericValue < 0 && {
      backgroundColor: `rgba(234, 67, 53, ${negativeOpacity})`
    })
  }});

  return <StyledTableCell>{children}</StyledTableCell>;
}
 