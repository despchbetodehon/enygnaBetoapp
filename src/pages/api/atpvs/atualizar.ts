import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/logic/firebase/config/app';

const API_KEY = "Nl8lhjWpE4efMw24Rd_FbHD6e1dBvi6bpc8DxBY3-P0";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');

  const key = req.headers['authorization'];
  if (key !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ error: true, message: 'Não autorizado. Token inválido ou ausente.' });
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: true, message: 'Método não permitido. Use PUT.' });
  }

  const { id, status, errorCod, errorStr, pdfUrl } = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: true, message: 'ID da ATPV não fornecido no corpo da requisição.' });
  }

  try {
    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (errorCod !== undefined) updates.errorCod = errorCod;
    if (errorStr !== undefined) updates.errorStr = errorStr;
    if (pdfUrl !== undefined) updates.pdfUrl = pdfUrl;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: true, message: 'Nenhum campo válido enviado para atualização.' });
    }

    await updateDoc(doc(db, 'OrdensDeServicoBludata', id), updates);
    return res.status(200).json({
      success: true,
      message: 'ATPV atualizada com sucesso',
      id,
      updates
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: true, message: 'Erro ao atualizar ATPV.' });
  }
}
