
import { getAuth } from 'firebase-admin/auth';
import * as admin from 'firebase-admin';

// Inicializar Firebase Admin se ainda não foi inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function setUserCustomClaims(email: string, permissao: string) {
  try {
    const auth = getAuth();
    
    // Buscar usuário por email
    const user = await auth.getUserByEmail(email);
    
    // Definir custom claims
    await auth.setCustomUserClaims(user.uid, {
      permissao: permissao,
      email: email,
    });
    
    console.log(`✅ Custom claims configurados para ${email}: ${permissao}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao configurar custom claims:', error);
    throw error;
  }
}
