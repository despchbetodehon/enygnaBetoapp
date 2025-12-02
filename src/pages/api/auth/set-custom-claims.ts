
import type { NextApiRequest, NextApiResponse } from 'next';
import { setUserCustomClaims } from '@/utils/setCustomClaims';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, permissao } = req.body;

    if (!email || !permissao) {
      return res.status(400).json({ error: 'Email e permissão são obrigatórios' });
    }

    await setUserCustomClaims(email, permissao);

    res.status(200).json({ 
      success: true, 
      message: 'Custom claims configurados com sucesso' 
    });
  } catch (error: any) {
    console.error('Erro ao configurar custom claims:', error);
    res.status(500).json({ 
      error: 'Erro ao configurar custom claims',
      details: error.message 
    });
  }
}
