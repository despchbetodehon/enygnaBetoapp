
import type { NextApiRequest, NextApiResponse } from 'next';

export function withJsonResponse(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Garantir Content-Type JSON
    res.setHeader('Content-Type', 'application/json');

    try {
      await handler(req, res);
    } catch (error: any) {
      console.error('API Error:', error);
      
      // Garantir que sempre retorne JSON, mesmo em erro
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          error: 'Erro interno do servidor',
          message: error?.message || 'Erro desconhecido'
        });
      }
    }
  };
}
