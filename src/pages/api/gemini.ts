import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/logic/firebase/config/app';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Garantir Content-Type JSON
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ response: '', error: 'Método não permitido' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ response: 'Chave da IA não configurada.', error: 'GEMINI_API_KEY ausente' });
    }

    // 🔧 Coleções alvo
    const colecoes = [
      'leads',
      'clientes',
      'Betodespachanteintrncaodevendaoficial',
      'Betodespachanteintrncaodevendaoficialdigital',
      'pedidos',
      'pagamentos'
    ];

    const allData: Record<string, any[]> = {};

    for (const nome of colecoes) {
      const snap = await getDocs(collection(db, nome));
      const docs = snap.docs.slice(0, 20).map(doc => {
        const data = doc.data();
        // Remove campos longos
        for (const key in data) {
          if (typeof data[key] === 'string' && data[key].length > 300) {
            delete data[key];
          }
        }
        return { id: doc.id, ...data };
      });
      allData[nome] = docs;
    }

    const textoParaIA = `
Você é uma IA especialista em estratégias de vendas, marketing neurológico e automação empresarial.

Com base nos dados reais abaixo, analise e retorne:

1. **Padrões de comportamento e segmentações por perfil**
2. **Estratégias de vendas e campanhas promocionais eficazes**
3. **Tarefas diárias para a equipe seguir passo a passo**
4. **Ideias para automações de atendimento ou vendas**

DADOS (resumidos):
${JSON.stringify(allData, null, 2)}
`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: textoParaIA }] }],
          generationConfig: {
            temperature: 0.85,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 2048,
          }
        }),
      }
    );

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      throw new Error(`Erro na Gemini: ${geminiRes.status} - ${errorText}`);
    }

    const json = await geminiRes.json();
    const resposta = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!resposta) throw new Error('Resposta vazia da IA');

    return res.status(200).json({ response: resposta });
  } catch (err: any) {
    console.error('Erro na IA:', err);
    return res.status(500).json({
      response: 'Erro técnico. Tente novamente mais tarde.',
      error: err.message || 'Erro desconhecido',
    });
  } finally {
    if (!res.headersSent) {
      res.status(500).json({ 
        response: '',
        error: 'Resposta não enviada' 
      });
    }
  }
}
