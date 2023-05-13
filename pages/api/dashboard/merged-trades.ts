import { NextApiRequest, NextApiResponse } from "next";
import { getTrades } from "@/lib/trades";

const handler = async (request: NextApiRequest, response: NextApiResponse) => {
  console.log("request query", request.query);

  let skip = parseInt((request.query.start || 0) as string);
  let take = parseInt((request.query.size || 100) as string);

  const filters = JSON.parse(request.query.filters as string);
  const sorting = JSON.parse(request.query.sorting as string);
  const queries = {
    filters,
    sorting,
  };

  try {
    const result = await getTrades(queries, skip, take);

    const mergedTrades = result?.mergedTrades || [];
    let count = result?.count || 0;

    return response.status(200).json({
      error: null,
      data: mergedTrades,
      meta: { totalRowCount: count },
    });
  } catch (error: unknown) {
    console.error("Error while getting merged trades:", error);

    return response.status(500).json({ error: (error as Error).message });
  }
};

export default handler;
