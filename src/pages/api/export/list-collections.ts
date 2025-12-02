
import type { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';

interface FirebaseCredentials {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

interface ListCollectionsRequest {
  useEnvCredentials?: boolean;
  sourceCredentials?: FirebaseCredentials;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { useEnvCredentials, sourceCredentials } = req.body as ListCollectionsRequest;

    let finalSourceCredentials: FirebaseCredentials;

    if (useEnvCredentials) {
      const envProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const envClientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
      const envPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

      if (!envProjectId || !envClientEmail || !envPrivateKey) {
        return res.status(400).json({ error: 'Credenciais de origem não encontradas no .env.local' });
      }

      finalSourceCredentials = {
        projectId: envProjectId,
        clientEmail: envClientEmail,
        privateKey: envPrivateKey,
      };
    } else {
      if (!sourceCredentials?.projectId || !sourceCredentials?.clientEmail || !sourceCredentials?.privateKey) {
        return res.status(400).json({ error: 'Credenciais de origem incompletas' });
      }
      finalSourceCredentials = sourceCredentials;
    }

    const sourceAppName = `list-${Date.now()}`;
    let sourceApp: admin.app.App;
    
    try {
      sourceApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: finalSourceCredentials.projectId,
          clientEmail: finalSourceCredentials.clientEmail,
          privateKey: finalSourceCredentials.privateKey.replace(/\\n/g, '\n'),
        }),
      }, sourceAppName);
    } catch (error) {
      console.error('Erro ao inicializar app de origem:', error);
      return res.status(500).json({ error: 'Erro ao conectar ao banco de origem' });
    }

    const sourceDb = sourceApp.firestore();
    const collections = await sourceDb.listCollections();
    const collectionNames = collections.map(col => col.id);

    await sourceApp.delete();

    return res.status(200).json({ collections: collectionNames });

  } catch (error: any) {
    console.error('❌ Erro ao listar coleções:', error);
    return res.status(500).json({
      error: 'Erro ao listar coleções',
      details: error.message
    });
  }
}
