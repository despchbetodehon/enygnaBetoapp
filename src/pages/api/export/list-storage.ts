
import type { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';

interface FirebaseCredentials {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

interface ListStorageRequest {
  useEnvCredentials?: boolean;
  sourceCredentials?: FirebaseCredentials;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  let sourceApp: admin.app.App | null = null;

  try {
    const { useEnvCredentials, sourceCredentials } = req.body as ListStorageRequest;

    let finalSourceCredentials: FirebaseCredentials;

    if (useEnvCredentials) {
      const envProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const envClientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
      const envPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

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

    const sourceAppName = `list-storage-${Date.now()}`;
    sourceApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: finalSourceCredentials.projectId,
        clientEmail: finalSourceCredentials.clientEmail,
        privateKey: finalSourceCredentials.privateKey.replace(/\\n/g, '\n'),
      }),
    }, sourceAppName);

    // Tentar múltiplos formatos de bucket
    let sourceBucket;
    let files: any[] = [];
    
    const bucketFormats = [
      `${finalSourceCredentials.projectId}.appspot.com`,
      `${finalSourceCredentials.projectId}.firebasestorage.app`,
      finalSourceCredentials.projectId
    ];

    let bucketFound = false;
    for (const bucketName of bucketFormats) {
      try {
        console.log(`🔍 Tentando bucket: ${bucketName}`);
        sourceBucket = sourceApp.storage().bucket(bucketName);
        const [bucketFiles] = await sourceBucket.getFiles();
        files = bucketFiles;
        bucketFound = true;
        console.log(`✅ Bucket encontrado: ${bucketName} com ${files.length} arquivos`);
        break;
      } catch (error: any) {
        console.log(`❌ Bucket ${bucketName} não encontrado: ${error.message}`);
      }
    }

    if (!bucketFound) {
      await sourceApp.delete();
      return res.status(200).json({ 
        folders: [],
        totalFiles: 0,
        message: 'Nenhum bucket de storage encontrado para este projeto'
      });
    }

    // Extrair pastas únicas dos caminhos de arquivos
    const foldersSet = new Set<string>();
    files.forEach(file => {
      const parts = file.name.split('/');
      if (parts.length > 1) {
        foldersSet.add(parts[0] + '/');
      }
    });

    const folders = Array.from(foldersSet).sort();

    await sourceApp.delete();

    return res.status(200).json({ 
      folders,
      totalFiles: files.length 
    });

  } catch (error: any) {
    console.error('❌ Erro ao listar Storage:', error);
    
    if (sourceApp) await sourceApp.delete().catch(() => {});

    return res.status(500).json({
      error: 'Erro ao listar pastas do Storage',
      details: error.message
    });
  }
}
