
import type { NextApiRequest, NextApiResponse } from 'next';
import { getDocs, collection, addDoc } from 'firebase/firestore';
import { db } from '@/logic/firebase/config/app';

const API_KEY = process.env.BLUDATA_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const key = req.headers['authorization'];

  if (key !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  if (req.method === 'GET') {
    try {
      const colecao1 = await getDocs(collection(db, 'Betodespachanteintrncaodevendaoficial'));
      const colecao2 = await getDocs(collection(db, 'Betodespachanteintrncaodevendaoficialdigital'));

      const dados1 = colecao1.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const dados2 = colecao2.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return res.status(200).json({ dados1, dados2 });
    } catch (error: any) {
      return res.status(500).json({ message: 'Erro ao buscar dados', error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;

      // Salva localmente no Firestore
      const novaOS = await addDoc(collection(db, 'OrdensDeServicoBludata'), body);

      return res.status(200).json({
        message: 'Ordem salva no Firestore',
        firestoreId: novaOS.id
      });
    } catch (error: any) {
      return res.status(500).json({
        message: 'Erro ao salvar dados',
        error: error.message
      });
    }
  }

  return res.status(405).json({ message: 'Método não permitido' });
}
