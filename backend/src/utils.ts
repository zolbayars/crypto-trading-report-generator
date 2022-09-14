import { createHmac } from 'crypto';

export const signWithSha256 = (queryString, apiSecret) =>
  createHmac('sha256', apiSecret).update(queryString).digest('hex');
