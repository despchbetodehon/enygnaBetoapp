import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/logic/firebase/config/app';

const API_KEY = "Nl8lhjWpE4efMw24Rd_FbHD6e1dBvi6bpc8DxBY3-P0";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');

  const key = req.headers['authorization'];
  if (key !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ error: true, message: 'Não autorizado. Token inválido ou ausente.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: true, message: 'Método não permitido. Use POST.' });
  }

  const { id } = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: true, message: 'ID inválido ou ausente no corpo da requisição.' });
  }

  try {
    const ref = doc(db, 'OrdensDeServicoBludata', id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return res.status(404).json({ error: true, message: 'ATPV não encontrada.' });
    }

    const data = snap.data() || {};
    return res.status(200).json({ atpv: { id: snap.id, ...data } });

  } catch (error) {
    console.error('Erro ao buscar ATPV por ID:', error);
    return res.status(500).json({ error: true, message: 'Erro interno ao obter ATPV.' });
  }
}
