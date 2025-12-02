
import type { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';

interface FirebaseCredentials {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

interface MigrateStorageRequest {
  useEnvCredentials?: boolean;
  sourceCredentials?: FirebaseCredentials;
  targetCredentials: FirebaseCredentials;
  selectedFolders?: string[];
  migrateAll?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  let sourceApp: admin.app.App | null = null;
  let targetApp: admin.app.App | null = null;

  try {
    const { useEnvCredentials, sourceCredentials, targetCredentials, selectedFolders, migrateAll } = req.body as MigrateStorageRequest;

    // Determinar credenciais de origem
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

    if (!targetCredentials?.projectId || !targetCredentials?.clientEmail || !targetCredentials?.privateKey) {
      return res.status(400).json({ error: 'Credenciais de destino incompletas' });
    }

    // Inicializar apps
    const sourceAppName = `source-storage-${Date.now()}`;
    sourceApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: finalSourceCredentials.projectId,
        clientEmail: finalSourceCredentials.clientEmail,
        privateKey: finalSourceCredentials.privateKey.replace(/\\n/g, '\n'),
      }),
    }, sourceAppName);

    const targetAppName = `target-storage-${Date.now()}`;
    targetApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: targetCredentials.projectId,
        clientEmail: targetCredentials.clientEmail,
        privateKey: targetCredentials.privateKey.replace(/\\n/g, '\n'),
      }),
    }, targetAppName);

    console.log('📦 Iniciando migração do Storage...');

    // Tentar múltiplos formatos de bucket para origem
    const sourceBucketFormats = [
      `${finalSourceCredentials.projectId}.appspot.com`,
      `${finalSourceCredentials.projectId}.firebasestorage.app`,
      finalSourceCredentials.projectId
    ];

    let sourceBucket;
    let files: any[] = [];
    for (const bucketName of sourceBucketFormats) {
      try {
        console.log(`🔍 Tentando bucket origem: ${bucketName}`);
        sourceBucket = sourceApp.storage().bucket(bucketName);
        const [bucketFiles] = await sourceBucket.getFiles();
        files = bucketFiles;
        console.log(`✅ Bucket origem encontrado: ${bucketName}`);
        break;
      } catch (error: any) {
        console.log(`❌ Bucket origem ${bucketName} não encontrado`);
      }
    }

    if (!sourceBucket || files.length === 0) {
      await sourceApp.delete();
      await targetApp.delete();
      return res.status(400).json({
        success: false,
        error: 'Bucket de origem não encontrado ou vazio'
      });
    }

    // Tentar múltiplos formatos de bucket para destino
    const targetBucketFormats = [
      `${targetCredentials.projectId}.appspot.com`,
      `${targetCredentials.projectId}.firebasestorage.app`,
      targetCredentials.projectId
    ];

    let targetBucket;
    for (const bucketName of targetBucketFormats) {
      try {
        console.log(`🔍 Tentando bucket destino: ${bucketName}`);
        targetBucket = targetApp.storage().bucket(bucketName);
        await targetBucket.exists();
        console.log(`✅ Bucket destino encontrado: ${bucketName}`);
        break;
      } catch (error: any) {
        console.log(`❌ Bucket destino ${bucketName} não encontrado`);
      }
    }

    if (!targetBucket) {
      await sourceApp.delete();
      await targetApp.delete();
      return res.status(400).json({
        success: false,
        error: 'Bucket de destino não encontrado'
      });
    }
    console.log(`📊 Encontrados ${files.length} arquivos no Storage`);

    let filesToMigrate = files;

    // Filtrar por pastas selecionadas se não for "migrar tudo"
    if (!migrateAll && selectedFolders && selectedFolders.length > 0) {
      filesToMigrate = files.filter(file => {
        return selectedFolders.some(folder => file.name.startsWith(folder));
      });
      console.log(`📂 Filtrando para ${filesToMigrate.length} arquivos das pastas selecionadas`);
    }

    let migrated = 0;
    let errors = 0;

    for (const file of filesToMigrate) {
      try {
        const [fileContent] = await file.download();
        const [metadata] = await file.getMetadata();

        await targetBucket.file(file.name).save(fileContent, {
          metadata: metadata.metadata,
          contentType: metadata.contentType,
        });

        migrated++;
        console.log(`✅ Arquivo migrado: ${file.name}`);
      } catch (error: any) {
        errors++;
        console.error(`❌ Erro ao migrar arquivo ${file.name}:`, error);
      }
    }

    await sourceApp.delete();
    await targetApp.delete();

    return res.status(200).json({
      success: true,
      totalFiles: filesToMigrate.length,
      migrated,
      errors,
    });

  } catch (error: any) {
    console.error('❌ Erro na migração do Storage:', error);
    
    if (sourceApp) await sourceApp.delete().catch(() => {});
    if (targetApp) await targetApp.delete().catch(() => {});

    return res.status(500).json({
      success: false,
      error: 'Erro ao migrar Storage',
      details: error.message,
    });
  }
}
