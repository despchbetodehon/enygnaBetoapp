
import type { NextApiRequest, NextApiResponse } from 'next';
import apiCache from '@/utils/apiCache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Aqui você pode adicionar autenticação/autorização
  // para garantir que apenas admins possam limpar o cache

  const statsBefore = apiCache.getStats();
  apiCache.clear();
  
  return res.status(200).json({
    success: true,
    message: 'Cache limpo com sucesso',
    entriesRemoved: statsBefore.total
  });
}
