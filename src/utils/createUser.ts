import { db } from '@/logic/firebase/config/app';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';

export interface CreateUserData {
  nome: string;
  email: string;
  senha: string;
  permissao: 'cliente' | 'empresa' | 'colaborador' | 'administrador' | 'Visualizador' | 'Operador' | 'Administrador' | 'CEO' | 'EnygmaDeveloper';
}

export const createUserInFirestore = async (userData: CreateUserData) => {
  try {
    console.log('🔄 Criando usuário no Firestore:', userData.email);

    const usuarioCompleto = {
      email: userData.email,
      nome: userData.nome,
      senha: userData.senha, // Em produção, isso deveria ser hash
      permissao: userData.permissao,
      ativo: true,
      dataCriacao: new Date(),
      imagemUrl: '/betologo.jpeg'
    };

    // Usar email como ID do documento
    const docRef = doc(db, 'usuarios', userData.email);
    await setDoc(docRef, usuarioCompleto);

    console.log('✅ Usuário criado com sucesso:', userData.email);
    return { ...usuarioCompleto, id: userData.email };

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    throw error;
  }
};

export const createTestUser = async (
  nome: string = 'Usuário Teste',
  email: string = 'teste@example.com',
  permissao: 'Visualizador' | 'Operador' | 'Administrador' | 'CEO' | 'EnygmaDeveloper' = 'Visualizador'
) => {
  return createUserInFirestore({
    nome,
    email,
    senha: '123456', // Senha padrão para teste
    permissao
  });
};

export const createEnygnaUser = async () => {
  try {
    console.log('🔄 Criando usuário Enygna...');

    // Verificar se o usuário já existe
    const { db } = await import('@/logic/firebase/config/app');
    const { doc, getDoc } = await import('firebase/firestore');

    const userDocRef = doc(db, 'usuarios', 'enygna@gmail.com');
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      console.log('⚠️ Usuário já existe');
      return {
        success: false,
        message: 'Usuário beto já existe no banco de dados',
        error: 'USER_ALREADY_EXISTS'
      };
    }

    const userData = {
      nome: 'enygna Admin',
      email: 'enygna@gmail.com',
      senha: 'enygna',
      permissao: 'Administrador' as const
    };

    console.log('🔄 Criando novo usuário com dados:', userData);
    const result = await createUserInFirestore(userData);
    console.log('✅ Usuário criado com resultado:', result);

    return {
      success: true,
      message: 'Usuário Enygna criado com sucesso! Você já pode fazer login.',
      userId: result.id,
      userData: result
    };

  } catch (error) {
    console.error('❌ Erro ao criar usuário Gustavo:', error);

    let errorMessage = 'Erro ao criar usuário Gustavo';
    let errorDetails = 'Erro desconhecido';

    if (error instanceof Error) {
      errorDetails = error.message;

      if (error.message.includes('permission-denied')) {
        errorMessage = 'Erro de permissão no banco de dados';
      } else if (error.message.includes('network')) {
        errorMessage = 'Erro de conexão com o banco de dados';
      } else if (error.message.includes('already exists')) {
        errorMessage = 'Usuário já existe';
      }
    }

    return {
      success: false,
      message: errorMessage,
      error: errorDetails
    };
  }
};

// Função utilitária para criar usuário faltante automaticamente
export const createMissingUser = async (email: string, nome?: string, permissao: 'cliente' | 'empresa' | 'colaborador' | 'administrador' | 'Visualizador' | 'Operador' | 'Administrador' | 'CEO' | 'EnygmaDeveloper' = 'Visualizador') => {
  try {
    console.log(`🔄 Criando usuário faltante: ${email}`);

    const userData = {
      nome: nome || email.split('@')[0],
      email: email,
      senha: 'temp123', // Senha temporária
      permissao: permissao
    };

    const result = await createUserInFirestore(userData);

    return {
      success: true,
      message: `Usuário ${email} criado com sucesso!`,
      userId: result.id,
      userData: result
    };

  } catch (error) {
    console.error(`❌ Erro ao criar usuário ${email}:`, error);
    return {
      success: false,
      message: `Erro ao criar usuário ${email}`,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};