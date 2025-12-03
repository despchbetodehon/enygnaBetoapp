
import type { NextApiRequest, NextApiResponse } from 'next';
import apiCache from '@/utils/apiCache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Garantir Content-Type JSON
  res.setHeader('Content-Type', 'application/json');
  
  const { cpf } = req.query;

  if (!cpf || typeof cpf !== 'string' || !/^\d{11}$/.test(cpf)) {
    return res.status(400).json({ 
      success: false,
      error: 'CPF inválido. Deve conter exatamente 11 dígitos numéricos.' 
    });
  }

  // Verificar cache primeiro
  const cacheKey = `cpf:${cpf}`;
  const cachedData = apiCache.get(cacheKey);
  
  if (cachedData) {
    console.log(`✅ Cache hit para CPF: ${cpf.substring(0, 3)}***`);
    return res.status(200).json({
      ...cachedData,
      cached: true
    });
  }

  console.log(`🔍 Cache miss para CPF: ${cpf.substring(0, 3)}*** - Consultando API`);

  const apiKey = process.env.APICPF_TOKEN;
  if (!apiKey) {
    return res.status(500).json({ 
      success: false,
      error: 'Token da API do apicpf.com não configurado no ambiente' 
    });
  }

  const apiUrl = `https://apicpf.com/api/consulta?cpf=${cpf}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro na consulta da API CPF:', errorData);

      return res.status(response.status).json({
        success: false,
        error: errorData.message || 'Erro ao consultar CPF',
        code: errorData.code || response.status
      });
    }

    const data = await response.json();

    if (data.code === 200 && data.data) {
      // Mapear campos da resposta
      const responseData = {
        success: true,
        nome: data.data.nome || data.data.name || null,
        genero: data.data.genero || data.data.gender || null,
        nascimento: data.data.data_nascimento || data.data.nascimento || data.data.birth_date || null,
        cpf: data.data.cpf || null,
        nomePai: data.data.nome_pai || data.data.pai || data.data.father_name || data.data.nomePai || null,
        nomeMae: data.data.nome_mae || data.data.mae || data.data.mother_name || data.data.nomeMae || null,
        rg: data.data.rg || data.data.documento || data.data.document || null
      };
      
      // Armazenar no cache por 24 horas
      apiCache.set(cacheKey, responseData, 24 * 60 * 60 * 1000);
      console.log(`💾 CPF ${cpf.substring(0, 3)}*** armazenado em cache`);
      
      return res.status(200).json(responseData);
    } else {
      return res.status(404).json({
        success: false,
        error: 'CPF não encontrado'
      });
    }
  } catch (error) {
    console.error('Erro interno ao consultar CPF:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro interno ao consultar CPF', 
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
