import { NextApiRequest, NextApiResponse } from "next";
import { getBestDaysPnLBeforeThisWeek } from "@/lib/analytics";

const handler = async (request: NextApiRequest, response: NextApiResponse) => {
  try {
    const bestRecentPnl = await getBestDaysPnLBeforeThisWeek();

    return response.status(200).json({
      error: null,
      data: {
        bestRecentPnl
      },
    });
  } catch (error: unknown) {
    console.error("Error while getting the best recent pnl:", error);

    return response.status(500).json({ error: (error as Error).message });
  }
};

export default handler;
