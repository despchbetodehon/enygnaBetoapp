import { NextApiRequest, NextApiResponse } from 'next';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import crypto from 'crypto'; // Importar crypto para hashPasswordSecure

// Configuração do Firebase Client
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase apenas uma vez
let app: any;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

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
    // Log inicial
    console.log('🔐 API verify-password chamada');
    console.log('Método:', req.method);

    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      return res.status(200).json({ success: true });
    }

    if (req.method !== 'POST') {
      console.log('❌ Método não permitido:', req.method);
      return res.status(405).json({
        success: false,
        error: 'Método não permitido'
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Email ou senha não fornecidos');
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      });
    }

    console.log('🔐 Iniciando verificação de senha para:', email);

    // Aguardar um pouco para garantir que o usuário foi criado (se for novo)
    await new Promise(resolve => setTimeout(resolve, 100));

    // Buscar pelo email exato como foi digitado
    const userDocRef = doc(db, 'usuarios', email);
    const userDoc = await getDoc(userDocRef);

    console.log('🔍 Verificando login para:', email, '- Existe:', userDoc.exists(), '- ID do documento:', userDoc.id);

    if (!userDoc.exists()) {
      console.log('❌ Usuário não encontrado:', email);
      // Delay para prevenir enumeração de usuários
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.status(401).json({
        success: false,
        error: 'Usuário não cadastrado. Por favor, entre em contato com o administrador.'
      });
    }

    const userData = userDoc.data()!;
    console.log('✅ Usuário encontrado:', { email, ativo: userData.ativo, temSalt: !!userData.salt, temHash: !!userData.senhaHash });

    // Verificar se o usuário está ativo
    if (userData.ativo === false) {
      console.log('❌ Usuário desativado:', email);
      return res.status(403).json({
        success: false,
        error: 'Usuário desativado'
      });
    }

    // Verificar se tem salt - se não tiver, usuário não foi migrado corretamente
    if (!userData.salt) {
      console.log('⚠️ Usuário sem salt - necessita remigração:', email);
      return res.status(401).json({
        success: false,
        error: 'Conta necessita atualização. Entre em contato com o suporte.'
      });
    }

    // Verificar senha com salt
    const { hash } = await hashPasswordSecure(password, userData.salt);

    console.log('🔐 Comparando hashes...');

    if (hash !== userData.senhaHash) {
      console.log('❌ Senha incorreta para:', email);
      // Delay para prevenir força bruta
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    console.log('✅ Senha correta para:', email);

    // Preparar dados completos do usuário
    const usuarioCompleto = {
      uid: userDoc.id,
      email: userData.email,
      nome: userData.nome || '',
      imagemUrl: userData.imagemUrl || '/betologo.jpeg',
      permissao: userData.permissao || 'Visualizador',
      ativo: userData.ativo !== undefined ? userData.ativo : true,
      dataCriacao: userData.dataCriacao || new Date().toISOString(),
      id: userDoc.id
    };

    console.log('✅ Verificação de credenciais bem-sucedida via Firestore');
    console.log('📦 Retornando dados do usuário:', {
      email: usuarioCompleto.email,
      nome: usuarioCompleto.nome,
      permissao: usuarioCompleto.permissao
    });

    return res.status(200).json({
      success: true,
      user: usuarioCompleto
    });

  } catch (error: any) {
    console.error('Erro na verificação:', error);

    // Garantir que sempre retorna JSON
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao processar autenticação',
        message: error?.message || 'Erro desconhecido'
      });
    }
  }
}