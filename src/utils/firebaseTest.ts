
import { db } from '@/logic/firebase/config/app';
import { collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testando conexão Firebase...');
    
    // Teste de leitura
    const testCollection = collection(db, 'test');
    const snapshot = await getDocs(testCollection);
    console.log('✅ Conexão de leitura OK. Documentos encontrados:', snapshot.size);
    
    // Teste de escrita
    const testDoc = {
      timestamp: new Date(),
      message: 'Teste de conexão',
      environment: process.env.NODE_ENV
    };
    
    const docRef = await addDoc(collection(db, 'test'), testDoc);
    console.log('✅ Conexão de escrita OK. Documento criado:', docRef.id);
    
    return {
      success: true,
      message: 'Firebase conectado com sucesso',
      documentsCount: snapshot.size,
      newDocId: docRef.id
    };
  } catch (error) {
    console.error('❌ Erro na conexão Firebase:', error);
    return {
      success: false,
      message: 'Erro na conexão Firebase',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};

export const testAllAPIs = async () => {
  const results = {
    firebase: await testFirebaseConnection(),
    apis: {
      bludata: !!process.env.BLUDATA_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      cnpja: !!process.env.CNPJA_API_TOKEN,
      apicpf: !!process.env.APICPF_TOKEN,
      digisac: !!process.env.NEXT_PUBLIC_DIGISAC_TOKEN
    }
  };
  
  console.log('🔧 Status das APIs:', results.apis);
  return results;
};
