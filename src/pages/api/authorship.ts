
import type { NextApiRequest, NextApiResponse } from 'next';
import { AUTHORSHIP, SIGNATURE } from '@/metadata/authorship';

/**
 * API de Verificação de Autoria
 * 
 * Endpoint para validação de propriedade intelectual
 * Desenvolvido por: Gustavo de Aguiar Martins (EnygmaDevLab)
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    authorship: AUTHORSHIP,
    signature: SIGNATURE,
    verified: true,
    message: 'Sistema desenvolvido por Gustavo de Aguiar Martins (EnygmaDevLab)',
    legalNotice: 'Propriedade intelectual protegida por lei. Cliente possui apenas licença de uso.',
    timestamp: new Date().toISOString()
  });
}
