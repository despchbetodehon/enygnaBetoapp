import { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';
import crypto from 'crypto';

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!privateKey || !clientEmail || !projectId) {
      console.error('❌ Variáveis de ambiente do Firebase Admin não configuradas');
      throw new Error('Firebase Admin credentials not configured');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    console.log('✅ Firebase Admin SDK inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase Admin:', error);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Garantir Content-Type JSON
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' });
    }

  const { criarUsuario, usuario } = req.body;

  // Se for requisição para criar usuário
  if (criarUsuario && usuario) {
    try {
      const emailNormalizado = usuario.email.trim().toLowerCase();
      console.log('👤 Criando novo usuário:', emailNormalizado);

      const db = admin.firestore();
      const usuariosRef = db.collection('usuarios');

      // Verificar se usuário já existe
      const usuarioExistente = await usuariosRef.doc(emailNormalizado).get();
      if (usuarioExistente.exists) {
        console.log('⚠️ Usuário já existe:', emailNormalizado);
        return res.status(400).json({ 
          error: 'Usuário já existe com este email',
          email: emailNormalizado
        });
      }

      // Gerar salt e hash com salt
      const salt = crypto.randomUUID();
      const encoder = new TextEncoder();
      const data = encoder.encode(usuario.senha + salt);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const senhaHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Criar usuário completo com todos os campos LGPD e timestamps
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const novoUsuario = {
        aceitouTermos: usuario.aceitouTermos !== undefined ? usuario.aceitouTermos : true,
        ativo: usuario.ativo !== undefined ? usuario.ativo : true,
        consentimentoLGPD: usuario.consentimentoLGPD !== undefined ? usuario.consentimentoLGPD : true,
        dataAtualizacao: timestamp,
        dataConsentimento: timestamp,
        dataCriacao: timestamp,
        email: emailNormalizado,
        imagemUrl: usuario.imagemUrl || '/betologo.jpeg',
        nome: usuario.nome,
        permissao: usuario.permissao || 'Visualizador',
        salt: salt,
        senhaHash: senhaHash,
        ultimaAtualizacao: timestamp
      };

      await usuariosRef.doc(emailNormalizado).set(novoUsuario);
      console.log('✅ Usuário criado com sucesso:', emailNormalizado);

      return res.status(200).json({
        sucesso: true,
        email: emailNormalizado,
        mensagem: 'Usuário criado com sucesso',
        usuario: {
          email: emailNormalizado,
          nome: novoUsuario.nome,
          permissao: novoUsuario.permissao,
          ativo: novoUsuario.ativo,
          lgpdCompliant: true
        }
      });

    } catch (error: any) {
      console.error('❌ Erro ao criar usuário:', error);
      return res.status(500).json({
        sucesso: false,
        error: 'Erro ao criar usuário',
        detalhes: error.message || 'Erro desconhecido'
      });
    }
  }

  // Se for atualização de senha de usuário existente
  if (req.body.atualizarSenha && req.body.email && req.body.senha) {
    try {
      const emailNormalizado = req.body.email.trim().toLowerCase();
      const novaSenha = req.body.senha.trim();

      console.log('🔐 Atualizando senha para:', emailNormalizado);

      const db = admin.firestore();
      const userDocRef = db.collection('usuarios').doc(emailNormalizado);
      const userDoc = await userDocRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({
          sucesso: false,
          error: 'Usuário não encontrado'
        });
      }

      // Gerar novo salt e hash
      const salt = crypto.randomUUID();
      const encoder = new TextEncoder();
      const data = encoder.encode(novaSenha + salt);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const senhaHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Atualizar senha
      await userDocRef.update({
        salt: salt,
        senhaHash: senhaHash,
        ultimaAtualizacao: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log('✅ Senha atualizada com sucesso para:', emailNormalizado);

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Senha atualizada com sucesso'
      });

    } catch (error: any) {
      console.error('❌ Erro ao atualizar senha:', error);
      return res.status(500).json({
        sucesso: false,
        error: 'Erro ao atualizar senha',
        detalhes: error.message || 'Erro desconhecido'
      });
    }
  }

  return res.status(400).json({ 
    error: 'Requisição inválida. Forneça criarUsuario=true e dados do usuário, ou atualizarSenha=true com email e senha.' 
  });
  } catch (globalError: any) {
    console.error('❌ Erro global na API:', globalError);
    return res.status(500).json({
      sucesso: false,
      error: 'Erro interno do servidor',
      detalhes: globalError?.message || 'Erro desconhecido'
    });
  } finally {
    // Garantir que sempre há resposta JSON
    if (!res.headersSent) {
      res.status(500).json({ 
        sucesso: false,
        error: 'Erro interno do servidor' 
      });
    }
  }
}