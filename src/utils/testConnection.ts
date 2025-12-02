
export const testFirebaseAuth = async (email: string, senha: string) => {
  try {
    console.log('🧪 Iniciando teste de conexão Firebase...');
    
    const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
    const { app } = await import('../logic/firebase/config/app');
    
    const db = getFirestore(app);
    console.log('✅ Firebase inicializado');
    
    // Testar acesso à coleção
    const usuariosRef = collection(db, 'usuarios');
    console.log('✅ Referência da coleção criada');
    
    // Testar consulta
    const q = query(usuariosRef, where('email', '==', email));
    console.log('✅ Query criada');
    
    const querySnapshot = await getDocs(q);
    console.log('✅ Query executada, documentos encontrados:', querySnapshot.size);
    
    if (!querySnapshot.empty) {
      const usuarioDoc = querySnapshot.docs[0];
      const usuarioDados = usuarioDoc.data();
      console.log('📋 Dados do usuário:', {
        id: usuarioDoc.id,
        email: usuarioDados.email,
        nome: usuarioDados.nome,
        ativo: usuarioDados.ativo,
        temSenha: !!usuarioDados.senha
      });
      
      return {
        success: true,
        found: true,
        data: usuarioDados,
        passwordMatch: usuarioDados.senha === senha
      };
    } else {
      return {
        success: true,
        found: false,
        message: 'Usuário não encontrado'
      };
    }
    
  } catch (error: any) {
    console.error('❌ Erro no teste:', error);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};
