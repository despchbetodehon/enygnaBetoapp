
import type { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';

// Tipos para as credenciais
interface FirebaseCredentials {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

interface MigrateRequest {
  useEnvCredentials?: boolean;
  sourceCredentials?: FirebaseCredentials;
  targetCredentials: FirebaseCredentials;
  collectionName: string;
  migrateStorage?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { useEnvCredentials, sourceCredentials, targetCredentials, collectionName, migrateStorage } = req.body as MigrateRequest;

    // Determinar credenciais de origem
    let finalSourceCredentials: FirebaseCredentials;

    if (useEnvCredentials) {
      // Usar variáveis de ambiente do servidor
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
      // Usar credenciais fornecidas manualmente
      if (!sourceCredentials?.projectId || !sourceCredentials?.clientEmail || !sourceCredentials?.privateKey) {
        return res.status(400).json({ error: 'Credenciais de origem incompletas' });
      }
      finalSourceCredentials = sourceCredentials;
    }

    if (!targetCredentials?.projectId || !targetCredentials?.clientEmail || !targetCredentials?.privateKey) {
      return res.status(400).json({ error: 'Credenciais de destino incompletas' });
    }

    if (!collectionName) {
      return res.status(400).json({ error: 'Nome da coleção é obrigatório' });
    }

    // Inicializar app de origem
    const sourceAppName = `source-${Date.now()}`;
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

    // Inicializar app de destino
    const targetAppName = `target-${Date.now()}`;
    let targetApp: admin.app.App;
    
    try {
      targetApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: targetCredentials.projectId,
          clientEmail: targetCredentials.clientEmail,
          privateKey: targetCredentials.privateKey.replace(/\\n/g, '\n'),
        }),
      }, targetAppName);
    } catch (error) {
      console.error('Erro ao inicializar app de destino:', error);
      // Limpar app de origem
      await sourceApp.delete();
      return res.status(500).json({ error: 'Erro ao conectar ao banco de destino' });
    }

    const sourceDb = sourceApp.firestore();
    const targetDb = targetApp.firestore();

    console.log(`🔄 Iniciando migração da coleção: ${collectionName}`);
    console.log(`✅ MODO SEGURO: Apenas LEITURA no banco de origem, ESCRITA no destino`);

    // Buscar todos os documentos da coleção de origem (SOMENTE LEITURA - não modifica nada)
    const snapshot = await sourceDb.collection(collectionName).get();

    if (snapshot.empty) {
      await sourceApp.delete();
      await targetApp.delete();
      return res.status(404).json({ error: `Coleção "${collectionName}" está vazia ou não existe` });
    }

    console.log(`📊 Encontrados ${snapshot.size} documentos para migrar`);

    let migrated = 0;
    let errors = 0;
    let convertedUsers = 0;
    const errorDetails: any[] = [];

    // Usar batch para melhor performance
    const batch = targetDb.batch();
    let batchCount = 0;
    const batchLimit = 500; // Limite do Firestore

    for (const docSnapshot of snapshot.docs) {
      try {
        let docData = docSnapshot.data();
        
        // 🔒 SEGURANÇA: Converter usuários automaticamente se for a coleção 'usuarios'
        if (collectionName === 'usuarios') {
          const isOldStructure = docData.senha && !docData.senhaHash && !docData.salt;
          
          if (isOldStructure) {
            console.log(`🔐 Convertendo usuário inseguro: ${docData.email}`);
            
            // Gerar salt e hash seguros
            const crypto = await import('crypto');
            const senhaOriginal = docData.senha || 'senhaTemporaria123!';
            const salt = crypto.randomUUID();
            const senhaComSalt = senhaOriginal + salt;
            const senhaHash = crypto.createHash('sha256').update(senhaComSalt).digest('hex');
            
            const now = admin.firestore.FieldValue.serverTimestamp();
            
            // Criar nova estrutura segura
            docData = {
              email: docData.email,
              nome: docData.nome || 'Usuário',
              senhaHash,
              salt,
              permissao: docData.permissao || 'Visualizador',
              ativo: docData.ativo !== undefined ? docData.ativo : true,
              imagemUrl: docData.imagemUrl || '/betologo.jpeg',
              aceitouTermos: true,
              consentimentoLGPD: true,
              dataCriacao: docData.dataCriacao || now,
              dataConsentimento: now,
              dataAtualizacao: docData.dataAtualizacao || now,
              ultimaAtualizacao: now,
            };
            
            convertedUsers++;
            console.log(`✅ Usuário ${docData.email} convertido para estrutura segura`);
          } else if (docData.senhaHash && docData.salt) {
            console.log(`✓ Usuário ${docData.email} já está na estrutura segura`);
          }
        }
        
        const docRef = targetDb.collection(collectionName).doc(docSnapshot.id);
        batch.set(docRef, docData);
        batchCount++;

        // Commit batch quando atingir o limite
        if (batchCount >= batchLimit) {
          await batch.commit();
          migrated += batchCount;
          batchCount = 0;
          console.log(`✅ Migrados ${migrated} documentos...`);
        }
      } catch (error: any) {
        errors++;
        errorDetails.push({
          documentId: docSnapshot.id,
          error: error.message
        });
        console.error(`❌ Erro ao migrar documento ${docSnapshot.id}:`, error);
      }
    }

    // Commit batch final
    if (batchCount > 0) {
      await batch.commit();
      migrated += batchCount;
    }

    // Migrar Storage se solicitado
    let storageFiles = 0;
    let storageErrors = 0;

    if (migrateStorage) {
      console.log('📦 Iniciando migração do Storage...');
      
      try {
        const sourceBucket = sourceApp.storage().bucket();
        const targetBucket = targetApp.storage().bucket();

        const [files] = await sourceBucket.getFiles();
        console.log(`📊 Encontrados ${files.length} arquivos no Storage`);

        for (const file of files) {
          try {
            const [fileContent] = await file.download();
            const [metadata] = await file.getMetadata();
            
            await targetBucket.file(file.name).save(fileContent, {
              metadata: metadata.metadata,
              contentType: metadata.contentType,
            });

            storageFiles++;
            console.log(`✅ Arquivo migrado: ${file.name}`);
          } catch (error: any) {
            storageErrors++;
            console.error(`❌ Erro ao migrar arquivo ${file.name}:`, error);
          }
        }
      } catch (error: any) {
        console.error('❌ Erro na migração do Storage:', error);
      }
    }

    console.log(`✅ Migração concluída. Banco de ORIGEM permanece INTACTO (nenhuma modificação foi feita)`);

    // Limpar apps temporários
    await sourceApp.delete();
    await targetApp.delete();

    const resultado = {
      success: true,
      collectionName,
      totalDocuments: snapshot.size,
      migrated,
      errors,
      errorDetails: errorDetails.length > 0 ? errorDetails : undefined,
      convertedUsers: collectionName === 'usuarios' ? convertedUsers : undefined,
      storage: migrateStorage ? {
        totalFiles: storageFiles + storageErrors,
        migrated: storageFiles,
        errors: storageErrors
      } : undefined
    };

    if (convertedUsers > 0) {
      console.log(`🔒 ${convertedUsers} usuários foram convertidos para estrutura segura (salt + hash SHA-256)`);
    }

    console.log('📊 Migração concluída:', resultado);

    return res.status(200).json(resultado);

  } catch (error: any) {
    console.error('❌ Erro crítico na migração:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao migrar coleção',
      details: error.message
    });
  }
}
