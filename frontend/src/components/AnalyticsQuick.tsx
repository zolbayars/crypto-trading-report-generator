import React, { useState, useEffect } from 'react';
import { PnLMetricsByMonths, APIReturnType } from '@shared/types';
import PnL from './PnL';

function AnalyticsQuick() {
  // @todo pass it from the parent component
  const DEFAULT_LAST_N_MONTHS_TO_FETCH = 4;
  const [metricsArr, setMetricsArr] = useState<PnLMetricsByMonths[]>()

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/analytics/metrics-last-n-months?n=${DEFAULT_LAST_N_MONTHS_TO_FETCH}`);
      
      // @todo type
      const result = (await response.json()) as APIReturnType;
      console.log('result', result);

      // @todo show error msg if there's one
      if (!result.errorMsg) {
        const { analyticsByIntervals } = result;
        setMetricsArr(analyticsByIntervals)
      } 
    }

    fetchData();    
  }, []);


  if (!metricsArr?.length) {
    return <b></b>
  }

  return (
    <PnL metrics={metricsArr[0].metrics} from={metricsArr[0].from} to={metricsArr[0].to}  />
  );
}

export default AnalyticsQuick;
