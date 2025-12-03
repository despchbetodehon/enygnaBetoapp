import type { NextApiRequest, NextApiResponse } from 'next';
import apiCache from '@/utils/apiCache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Garantir Content-Type JSON
  res.setHeader('Content-Type', 'application/json');
  
  const { cnpj } = req.query;

  if (!cnpj || typeof cnpj !== 'string' || !/^\d{14}$/.test(cnpj)) {
    return res.status(400).json({
      success: false,
      error: 'CNPJ inválido. Deve conter exatamente 14 dígitos numéricos.'
    });
  }

  // Verificar cache primeiro
  const cacheKey = `cnpj:${cnpj}`;
  const cachedData = apiCache.get(cacheKey);

  if (cachedData) {
    console.log(`✅ Cache hit para CNPJ: ${cnpj.substring(0, 4)}***`);
    return res.status(200).json({
      ...cachedData,
      cached: true
    });
  }

  console.log(`🔍 Cache miss para CNPJ: ${cnpj.substring(0, 4)}*** - Consultando API`);

  const apiKey = process.env.BLUDATA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: 'Token da API não configurado no ambiente'
    });
  }

  try {
    const response = await fetch(`https://api.cnpja.com/office/${cnpj}`, {
      headers: {
        'Authorization': apiKey
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro na consulta da API CNPJ:', errorData);

      return res.status(response.status).json({
        success: false,
        error: errorData.message || 'Erro ao consultar CNPJ',
        code: errorData.code || response.status
      });
    }

    const data = await response.json();

    if (data && data.company) {
      const responseData = {
        success: true,
        nome: data.alias || data.company?.name || null,
        razaoSocial: data.company?.name || null,
        nomeFantasia: data.alias || null,
        cnpj: data.taxId || cnpj,
        situacao: data.status?.text || null,
        dataAbertura: data.founded || null,
        naturezaJuridica: data.company?.nature?.text || null,
        endereco: data.address ? {
          logradouro: data.address.street || null,
          numero: data.address.number || null,
          complemento: data.address.details || null,
          bairro: data.address.district || null,
          cidade: data.address.city || null,
          uf: data.address.state || null,
          cep: data.address.zip || null
        } : null,
        telefone: data.phones?.[0]?.number || null,
        email: data.emails?.[0]?.address || null,
        atividadePrincipal: data.mainActivity?.text || null
      };

      // Armazenar no cache por 24 horas
      apiCache.set(cacheKey, responseData, 24 * 60 * 60 * 1000);
      console.log(`💾 CNPJ ${cnpj.substring(0, 4)}*** armazenado em cache`);

      return res.status(200).json(responseData);
    } else {
      return res.status(404).json({
        success: false,
        error: 'CNPJ não encontrado'
      });
    }
  } catch (error) {
    console.error('Erro interno ao consultar CNPJ:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao consultar CNPJ',
      details: (error as Error).message
    });
  } finally {
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false,
        error: 'Resposta não enviada' 
      });
    }
  }
}