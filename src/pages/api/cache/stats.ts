
import type { NextApiRequest, NextApiResponse } from 'next';
import apiCache from '@/utils/apiCache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stats = apiCache.getStats();
  
  return res.status(200).json({
    success: true,
    cache: stats,
    message: `Cache contém ${stats.valid} entradas válidas e ${stats.expired} expiradas`
  });
}
