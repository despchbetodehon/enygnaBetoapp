import { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';
import crypto from 'crypto'; // Importar crypto para hashPasswordSecure

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// Hash seguro com salt
async function hashPasswordSecure(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const usedSalt = salt || crypto.randomUUID();
  const encoder = new TextEncoder();
  const data = encoder.encode(password + usedSalt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return { hash, salt: usedSalt };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Garantir Content-Type JSON
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' });
    }

    const { email, password } = req.body;

  if (!email || !password) {
    console.log('❌ Email ou senha não fornecidos');
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  console.log('🔐 Iniciando verificação de senha para:', email);

  try {
    const db = admin.firestore();
    
    // Aguardar um pouco para garantir que o usuário foi criado (se for novo)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Buscar pelo email exato como foi digitado
    const userDoc = await db.collection('usuarios').doc(email).get();

    console.log('🔍 Verificando login para:', email, '- Existe:', userDoc.exists, '- ID do documento:', userDoc.id);

    if (!userDoc.exists) {
      console.log('❌ Usuário não encontrado:', email);
      // Delay para prevenir enumeração de usuários
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.status(401).json({ error: 'Usuário não cadastrado. Por favor, entre em contato com o administrador.' });
    }

    const userData = userDoc.data()!;
    console.log('✅ Usuário encontrado:', { email, ativo: userData.ativo, temSalt: !!userData.salt, temHash: !!userData.senhaHash });

    // Verificar se o usuário está ativo
    if (userData.ativo === false) {
      console.log('❌ Usuário desativado:', email);
      return res.status(403).json({ error: 'Usuário desativado' });
    }

    // Verificar se tem salt - se não tiver, usuário não foi migrado corretamente
    if (!userData.salt) {
      console.log('⚠️ Usuário sem salt - necessita remigração:', email);
      return res.status(401).json({ error: 'Conta necessita atualização. Entre em contato com o suporte.' });
    }

    // Verificar senha com salt
    const { hash } = await hashPasswordSecure(password, userData.salt);

    console.log('🔐 Comparando hashes...');

    if (hash !== userData.senhaHash) {
      console.log('❌ Senha incorreta para:', email);
      // Delay para prevenir força bruta
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    console.log('✅ Senha correta para:', email);

    // Preparar dados completos do usuário
    const usuarioCompleto = {
        uid: userDoc.id,
        email: userData.email,
        nome: userData.nome,
        imagemUrl: userData.imagemUrl || '/betologo.jpeg',
        permissao: userData.permissao || 'Visualizador',
        ativo: userData.ativo !== undefined ? userData.ativo : true
    };

    // Criar token customizado do Firebase Auth com Custom Claims
    try {
        // Primeiro, definir as custom claims no usuário
        try {
            await admin.auth().setCustomUserClaims(email, {
                permissao: usuarioCompleto.permissao,
                email: usuarioCompleto.email,
                ativo: usuarioCompleto.ativo
            });
            console.log('✅ Custom claims definidas para:', email);
        } catch (claimsError) {
            console.warn('⚠️ Erro ao definir custom claims:', claimsError);
        }

        // Criar token customizado
        const customToken = await admin.auth().createCustomToken(email, {
            email: usuarioCompleto.email,
            permissao: usuarioCompleto.permissao,
            ativo: usuarioCompleto.ativo
        });

        console.log('✅ Token customizado criado para:', email);

        return res.status(200).json({
            success: true,
            customToken,
            user: usuarioCompleto
        });
    } catch (tokenError) {
        console.error('❌ Erro ao criar token customizado:', tokenError);
        // Retornar os dados do usuário mesmo se o token falhar
        return res.status(200).json({
            success: true,
            user: usuarioCompleto
        });
    }

  } catch (error: any) {
    console.error('Erro na verificação:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao processar autenticação',
      message: error?.message || 'Erro desconhecido'
    });
  } finally {
    // Garantir que sempre há resposta
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor' 
      });
    }
  }
}