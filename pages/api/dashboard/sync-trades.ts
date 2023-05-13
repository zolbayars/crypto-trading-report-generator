import { NextApiRequest, NextApiResponse } from "next";
import { syncTrades } from "@/lib/trades";
import { DateTime } from "luxon";

const handler = async (request: NextApiRequest, response: NextApiResponse) => {
  console.log("request body", request.body);

  const { from, to } = request.body;

  try {
    await syncTrades(
      DateTime.fromISO(from).toMillis(),
      DateTime.fromISO(to).toMillis()
    );

    return response.status(200).json({
      error: null,
    });
  } catch (error: unknown) {
    console.error("Error while getting merged trades:", error);

    return response.status(500).json({ error: (error as Error).message });
  }
};

export default handler;
