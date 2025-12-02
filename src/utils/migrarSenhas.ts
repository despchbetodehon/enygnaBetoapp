
/**
 * EXECUTAR UMA ÚNICA VEZ PARA MIGRAR SENHAS EXISTENTES
 * Este script deve ser executado pelo administrador
 */

import { getFirestore, collection, getDocs, doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '@/logic/firebase/config/app';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function migrarSenhasParaHash() {
  console.log('🔒 Iniciando migração de senhas para hash...');
  
  try {
    const usuariosRef = collection(db, 'usuarios');
    const snapshot = await getDocs(usuariosRef);
    
    let migrados = 0;
    let erros = 0;
    let jaConvertidos = 0;
    
    for (const docSnap of snapshot.docs) {
      const usuario = docSnap.data();
      
      // Se tem senha em texto plano
      if (usuario.senha && !usuario.senhaHash) {
        try {
          const senhaHash = await hashPassword(usuario.senha);
          
          const userDocRef = doc(db, 'usuarios', docSnap.id);
          await updateDoc(userDocRef, {
            senhaHash: senhaHash,
            senha: deleteField(), // Remove senha em texto plano
            consentimentoLGPD: usuario.consentimentoLGPD || false,
            dataConsentimento: usuario.dataConsentimento || new Date(),
            ultimaAtualizacao: new Date()
          });
          
          migrados++;
          console.log(`✅ Senha migrada para: ${usuario.email}`);
        } catch (error) {
          erros++;
          console.error(`❌ Erro ao migrar ${usuario.email}:`, error);
        }
      } else if (usuario.senhaHash) {
        jaConvertidos++;
        console.log(`ℹ️  Usuário já convertido: ${usuario.email}`);
      }
    }
    
    console.log(`\n📊 Migração concluída:`);
    console.log(`   ✅ Migrados: ${migrados}`);
    console.log(`   ✔️  Já convertidos: ${jaConvertidos}`);
    console.log(`   ❌ Erros: ${erros}`);
    console.log(`   📝 Total: ${snapshot.size}`);
    
    return { migrados, jaConvertidos, erros, total: snapshot.size };
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  }
}

// Função para executar a migração
if (typeof window !== 'undefined') {
  (window as any).migrarSenhas = migrarSenhasParaHash;
}
