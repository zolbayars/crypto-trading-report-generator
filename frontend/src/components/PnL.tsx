import * as React from 'react';
import Typography from '@mui/material/Typography';
import { PnLMetrics } from '../types';
import { DateTime } from 'luxon';

interface PnLProps {
  metrics: PnLMetrics;
  from: Date;
  to: Date;
}

export default function PnL(props: PnLProps) {
  return (
    <React.Fragment>
      <Typography component="p" variant="h4">
        { props.metrics.pnl }
      </Typography>
      <Typography color="text.secondary" sx={{ flex: 1 }}>
      {`From ${DateTime.fromJSDate(props.from)} to ${props.to}`}
      </Typography>
      {/* <div>
        <Link color="primary" href="#">
          View balance
        </Link>
      </div> */}
    </React.Fragment>
  );
}