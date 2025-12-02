import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL inválida' });
  }

  try {
    // Headers para a requisição ao Firebase
    const headers: Record<string, string> = {};

    // Suporte a range requests (importante para PDFs)
    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`Erro ao buscar arquivo: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    // Headers CORS permissivos
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    // Importante para PDFs
    res.setHeader('Accept-Ranges', 'bytes');

    // Se foi range request, manter o status code
    if (response.status === 206) {
      res.status(206);
      const contentRange = response.headers.get('content-range');
      if (contentRange) {
        res.setHeader('Content-Range', contentRange);
      }
    }

    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Erro no proxy de arquivo:', error);
    res.status(500).json({ error: 'Erro ao processar arquivo' });
  }
}