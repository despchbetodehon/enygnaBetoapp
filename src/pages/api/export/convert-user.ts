
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

interface OldUserStructure {
  email: string;
  nome: string;
  senha?: string; // Senha em texto plano (insegura)
  permissao?: string;
  ativo?: boolean;
  imagemUrl?: string;
  dataCriacao?: any;
  dataAtualizacao?: any;
}

interface NewUserStructure {
  email: string;
  nome: string;
  senhaHash: string;
  salt: string;
  permissao: string;
  ativo: boolean;
  imagemUrl: string;
  aceitouTermos: boolean;
  consentimentoLGPD: boolean;
  dataCriacao: any;
  dataConsentimento: any;
  dataAtualizacao: any;
  ultimaAtualizacao: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { usuario } = req.body as { usuario: OldUserStructure };

    if (!usuario || !usuario.email) {
      return res.status(400).json({ error: 'Usuário inválido' });
    }

    // Verificar se já está na estrutura segura
    const isSecure = (usuario as any).senhaHash && (usuario as any).salt;

    if (isSecure) {
      // Já está seguro, retornar como está
      return res.status(200).json({ 
        converted: false, 
        usuario,
        message: 'Usuário já está na estrutura segura'
      });
    }

    // Converter para estrutura segura
    const senhaOriginal = usuario.senha || 'senhaTemporaria123!'; // Senha padrão se não existir
    
    // Gerar salt único
    const salt = crypto.randomUUID();
    
    // Gerar hash SHA-256 com salt
    const senhaComSalt = senhaOriginal + salt;
    const senhaHash = crypto.createHash('sha256').update(senhaComSalt).digest('hex');

    const now = new Date();

    const usuarioConvertido: NewUserStructure = {
      email: usuario.email,
      nome: usuario.nome || 'Usuário',
      senhaHash,
      salt,
      permissao: usuario.permissao || 'Visualizador',
      ativo: usuario.ativo !== undefined ? usuario.ativo : true,
      imagemUrl: usuario.imagemUrl || '/betologo.jpeg',
      aceitouTermos: true,
      consentimentoLGPD: true,
      dataCriacao: usuario.dataCriacao || now,
      dataConsentimento: now,
      dataAtualizacao: usuario.dataAtualizacao || now,
      ultimaAtualizacao: now,
    };

    console.log(`✅ Usuário convertido: ${usuario.email} (tinha senha em texto plano: ${!!usuario.senha})`);

    return res.status(200).json({
      converted: true,
      usuario: usuarioConvertido,
      message: 'Usuário convertido para estrutura segura',
      hadPlainPassword: !!usuario.senha
    });

  } catch (error: any) {
    console.error('❌ Erro ao converter usuário:', error);
    return res.status(500).json({
      error: 'Erro ao converter usuário',
      details: error.message
    });
  }
}
