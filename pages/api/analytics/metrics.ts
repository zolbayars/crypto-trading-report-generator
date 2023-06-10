import { NextApiRequest, NextApiResponse } from "next";
import { getAnalytics } from "@/lib/analytics";
import { PnLMetricsByMonths } from "@/lib/types";
import { DateTime } from "luxon";

interface Interval {
  from: DateTime;
  to: DateTime;
}

const getLastNMonthsAnalytics = async (lastNMonths: number) => {
  const result: PnLMetricsByMonths[] = [];
  const thisMonth = DateTime.now().startOf("month");

  const intervals: Interval[] = [];

  for (let i = 0; i < lastNMonths; i++) {
    let from = thisMonth.minus({ month: i });
    let to = thisMonth.minus({ month: i - 1 });

    if (i === 0) {
      from = thisMonth;
      to = thisMonth.plus({ month: 1 });
    }

    intervals.push({
      from,
      to,
    });
  }

  for (const { from, to } of intervals) {
    const metrics = await getAnalytics(from, to);

    result.push({
      from: from.toJSDate(),
      to: to.toJSDate(),
      metrics,
    });
  }

  return result;
};

const handler = async (request: NextApiRequest, response: NextApiResponse) => {
  console.log("request query", request.query);

  const lastNMonths = parseInt((request.query.last_n_months || 0) as string);
  const { from, to } = request.query;

  try {
    let result: PnLMetricsByMonths[] = [];

    if (lastNMonths) {
      result = await getLastNMonthsAnalytics(lastNMonths);
    } else if (from && to) {
      const fromDate = DateTime.fromISO(from as string);
      const toDate = DateTime.fromISO(to as string);

      const metrics = await getAnalytics(fromDate, toDate);

      result.push({
        from: fromDate.toJSDate(),
        to: toDate.toJSDate(),
        metrics,
      });
    } else {
      return response.status(400).json({
        error:
          "Required parameters were not passed: from and to OR lastNMonths",
      });
    }

    return response.status(200).json({
      error: null,
      data: result,
    });
  } catch (error: unknown) {
    console.error("Error while getting merged trades:", error);

    return response.status(500).json({ error: (error as Error).message });
  }
};

export default handler;
