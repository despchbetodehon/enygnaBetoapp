import { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Erro ao inicializar Firebase Admin:', error);
  }
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { criarUsuario, usuario } = req.body;

  // Se for requisição para criar usuário
  if (criarUsuario && usuario) {
    try {
      const emailNormalizado = usuario.email.toLowerCase(); // Normaliza o email
      console.log('👤 Criando novo usuário:', emailNormalizado);

      const db = admin.firestore();
      const usuariosRef = db.collection('usuarios');

      // Verificar se usuário já existe
      const usuarioExistente = await usuariosRef.doc(emailNormalizado).get();
      if (usuarioExistente.exists) {
        return res.status(400).json({ error: 'Usuário já existe com este email' });
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
        detalhes: error.message
      });
    }
  }

  // Se for atualização de senha de usuário existente
  if (req.body.atualizarSenha && req.body.email && req.body.senha) {
    try {
      const emailNormalizado = req.body.email.trim().toLowerCase();
      const novaSenha = req.body.senha.trim();
      const dadosAdicionais = req.body.dadosAdicionais || {};

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

      // Atualizar usuário com nova senha e dados adicionais
      const dadosAtualizacao: any = {
        senhaHash: senhaHash,
        salt: salt,
        senha: admin.firestore.FieldValue.delete(),
        ultimaAtualizacao: admin.firestore.FieldValue.serverTimestamp()
      };

      // Adicionar dados adicionais se fornecidos
      if (dadosAdicionais.nome) dadosAtualizacao.nome = dadosAdicionais.nome;
      if (dadosAdicionais.permissao) dadosAtualizacao.permissao = dadosAdicionais.permissao;
      if (dadosAdicionais.ativo !== undefined) dadosAtualizacao.ativo = dadosAdicionais.ativo;

      await userDocRef.update(dadosAtualizacao);

      console.log('✅ Senha atualizada com sucesso para:', emailNormalizado);

      return res.status(200).json({
        sucesso: true,
        email: emailNormalizado,
        mensagem: 'Senha atualizada com sucesso',
        usuario: {
          email: emailNormalizado,
          salt: salt,
          senhaHash: senhaHash,
          lgpdCompliant: true
        }
      });

    } catch (error: any) {
      console.error('❌ Erro ao atualizar senha:', error);
      return res.status(500).json({
        sucesso: false,
        error: 'Erro ao atualizar senha',
        detalhes: error.message
      });
    }
  }

  // Caso contrário, executar migração normal
  try {
    console.log('🔒 Iniciando migração de senhas com Admin SDK...');

    const db = admin.firestore();
    const usuariosRef = db.collection('usuarios');
    const snapshot = await usuariosRef.get();

    let migrados = 0;
    let erros = 0;
    let jaConvertidos = 0;
    const errosDetalhados: any[] = [];

    const batch = db.batch();
    let batchCount = 0;

    for (const doc of snapshot.docs) {
      const usuario = doc.data();

      // Migrar usuários com senha em texto plano OU usuários com hash mas sem salt
      if ((usuario.senha && !usuario.senhaHash) || (usuario.senhaHash && !usuario.salt)) {
        try {
          const senhaOriginal = usuario.senha || '';

          if (!senhaOriginal) {
            console.log(`⚠️ Usuário ${usuario.email} não tem senha original, pulando...`);
            erros++;
            errosDetalhados.push({
              email: usuario.email,
              erro: 'Senha original não encontrada - usuário precisa redefinir senha'
            });
            continue;
          }

          // Gerar salt e hash com salt
          const salt = crypto.randomUUID();
          const encoder = new TextEncoder();
          const data = encoder.encode(senhaOriginal + salt);
          const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const senhaHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

          // Usar batch para melhor performance
          const docRef = usuariosRef.doc(doc.id);
          batch.update(docRef, {
            senhaHash: senhaHash,
            salt: salt,
            senha: admin.firestore.FieldValue.delete(),
            consentimentoLGPD: true,
            aceitouTermos: true,
            dataConsentimento: usuario.dataConsentimento || admin.firestore.FieldValue.serverTimestamp(),
            ultimaAtualizacao: admin.firestore.FieldValue.serverTimestamp()
          });

          batchCount++;
          migrados++;

          // Commit batch a cada 500 operações (limite do Firestore)
          if (batchCount >= 500) {
            await batch.commit();
            batchCount = 0;
          }

          console.log(`✅ Senha migrada com salt para: ${usuario.email}`);
        } catch (error: any) {
          erros++;
          errosDetalhados.push({
            email: usuario.email,
            erro: error.message
          });
          console.error(`❌ Erro ao migrar ${usuario.email}:`, error);
        }
      } else if (usuario.senhaHash && usuario.salt) {
        jaConvertidos++;
      }
    }

    // Commit batch final
    if (batchCount > 0) {
      await batch.commit();
    }

    const resultado = {
      sucesso: true,
      migrados,
      jaConvertidos,
      erros,
      total: snapshot.size,
      errosDetalhados: errosDetalhados.length > 0 ? errosDetalhados : undefined
    };

    console.log('📊 Migração concluída:', resultado);

    return res.status(200).json(resultado);

  } catch (error: any) {
    console.error('❌ Erro crítico na migração:', error);
    return res.status(500).json({
      sucesso: false,
      error: 'Erro ao migrar contas',
      detalhes: error.message
    });
  }
}