
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, filename = 'imagen.png' } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // Validação de segurança
    if (!url.includes('firebasestorage.googleapis.com') && !url.includes('storage.googleapis.com')) {
      return res.status(403).json({ error: 'Only Firebase Storage URLs are allowed' });
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type');

    // Se for uma imagem, definir headers apropriados
    if (contentType && contentType.startsWith('image/')) {
      res.setHeader('Content-Type', 'image/png');
    } else {
      res.setHeader('Content-Type', 'application/octet-stream');
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Length', buffer.byteLength.toString());
    
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      error: 'Failed to download image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
