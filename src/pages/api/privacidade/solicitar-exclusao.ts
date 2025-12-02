
import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/logic/firebase/config/app';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { email, cpf, motivo } = req.body;

    if (!email && !cpf) {
      return res.status(400).json({ 
        error: 'É necessário fornecer email ou CPF' 
      });
    }

    // Registrar solicitação de exclusão
    const solicitacaoRef = collection(db, 'solicitacoes_exclusao_lgpd');
    
    await getDocs(query(
      solicitacaoRef,
      where('email', '==', email)
    )).then(async (snapshot) => {
      if (!snapshot.empty) {
        return res.status(400).json({ 
          error: 'Já existe uma solicitação pendente para este email' 
        });
      }

      // Criar solicitação
      await getDocs(query(
        collection(db, 'solicitacoes_exclusao_lgpd')
      )).then(async () => {
        const docRef = doc(collection(db, 'solicitacoes_exclusao_lgpd'));
        
        await updateDoc(docRef, {
          email,
          cpf,
          motivo,
          status: 'pendente',
          dataSolicitacao: serverTimestamp(),
          prazoLegal: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 dias úteis
        });
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Solicitação registrada com sucesso. Você receberá uma resposta em até 15 dias úteis.',
      protocolo: Date.now().toString(36)
    });

  } catch (error: any) {
    console.error('Erro ao processar solicitação LGPD:', error);
    return res.status(500).json({ 
      error: 'Erro ao processar solicitação' 
    });
  }
}
