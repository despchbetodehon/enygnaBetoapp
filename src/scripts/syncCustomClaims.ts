
import { setUserCustomClaims } from '@/utils/setCustomClaims';
import Colecao from '@/logic/firebase/db/Colecao';

async function syncAllUserClaims() {
  try {
    const colecao = new Colecao();
    const usuarios = await colecao.consultarTodos('usuarios');

    console.log(`📋 Sincronizando ${usuarios.length} usuários...`);

    for (const usuario of usuarios) {
      try {
        await setUserCustomClaims(usuario.email, usuario.permissao);
        console.log(`✅ ${usuario.email}: ${usuario.permissao}`);
      } catch (error) {
        console.error(`❌ Erro em ${usuario.email}:`, error);
      }
    }

    console.log('🎉 Sincronização concluída!');
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  }
}

syncAllUserClaims();
