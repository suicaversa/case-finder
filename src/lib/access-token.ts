import { createHmac } from 'crypto';

const SECRET = process.env.ACCESS_TOKEN_SECRET || 'helpyou-case-finder-default-secret';

export function generateAccessToken(inquiryId: string): string {
  const hmac = createHmac('sha256', SECRET).update(inquiryId).digest('hex');
  return `${inquiryId}:${hmac}`;
}

export function verifyAccessToken(token: string, inquiryId: string): boolean {
  const [tokenId, hmac] = token.split(':');
  if (tokenId !== inquiryId || !hmac) return false;
  const expected = createHmac('sha256', SECRET).update(inquiryId).digest('hex');
  return hmac === expected;
}
