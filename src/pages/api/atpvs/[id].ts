import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/logic/firebase/config/app';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const API_KEY = 'Nl8lhjWpE4efMw24Rd_FbHD6e1dBvi6bpc8DxBY3-P0';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');

  const apiKey = req.headers.authorization;
  if (apiKey !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ error: true, message: 'Não autorizado' });
  }

  // Corrigido para funcionar com rota dinâmica [id].ts
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: true, message: 'ID da ATPV não fornecido' });
  }

  const ref = doc(db, 'OrdensDeServicoBludata', id);

  if (req.method === 'GET') {
    try {
      const docSnap = await getDoc(ref);
      if (!docSnap.exists()) {
        return res.status(404).json({ error: true, message: 'ATPV não encontrada' });
      }
      return res.status(200).json({ atpv: { id: docSnap.id, ...docSnap.data() } });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: true, message: 'Erro ao obter ATPV' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { status, errorCod, errorStr, pdfUrl } = req.body;

      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (errorCod !== undefined) updateData.errorCod = errorCod;
      if (errorStr !== undefined) updateData.errorStr = errorStr;
      if (pdfUrl !== undefined) updateData.pdfUrl = pdfUrl;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: true, message: 'Nenhum dado para atualizar' });
      }

      await updateDoc(ref, updateData);
      const updatedSnap = await getDoc(ref);

      return res.status(200).json({
        success: true,
        message: 'ATPV atualizada com sucesso',
        atpv: { id: updatedSnap.id, ...updatedSnap.data() }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: true, message: 'Erro ao atualizar ATPV' });
    }
  }

  return res.status(405).json({ error: true, message: 'Método não permitido' });
}
