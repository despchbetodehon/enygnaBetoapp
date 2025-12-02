
import type { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';

// Inicializar Firebase Admin se ainda não foi inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { email, permissao, ativo } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    // Buscar usuário no Firestore
    const db = admin.firestore();
    const userDoc = await db.collection('usuarios').doc(email).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const userData = userDoc.data();

    // Definir Custom Claims
    await admin.auth().setCustomUserClaims(email, {
      permissao: permissao || userData?.permissao || 'Visualizador',
      email: email,
      ativo: ativo !== undefined ? ativo : (userData?.ativo || true)
    });

    console.log('✅ Custom claims atualizadas para:', email);

    return res.status(200).json({
      success: true,
      message: 'Custom claims atualizadas com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao atualizar custom claims:', error);
    return res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  }
}
