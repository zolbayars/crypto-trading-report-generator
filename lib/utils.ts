import { createHmac } from "crypto";

export const signWithSha256 = (queryString: string, apiSecret: string) =>
  createHmac("sha256", apiSecret).update(queryString).digest("hex");
