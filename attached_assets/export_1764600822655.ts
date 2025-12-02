// pages/api/clone.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { initializeApp as initFirebaseApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore';

const firebaseOriginConfig = {
  apiKey: 'AIzaSyDnJvtiwAB0D_Ek4jt9ueHKxNxoxKQrG3w',
  authDomain: 'enygma-9a3c4.firebaseapp.com',
  projectId: 'enygma-9a3c4',
};

const firebaseDestConfig = {
  apiKey: 'AIzaSyDUG5YpHP1LTGHg86ANAcq7v7P6fe8q4Wo',
  authDomain: 'betoappoficial.firebaseapp.com',
  databaseURL: 'https://betoappoficial-default-rtdb.firebaseio.com',
  projectId: 'betoappoficial',
  storageBucket: 'betoappoficial.appspot.com',
  messagingSenderId: '488669216360',
  appId: '1:488669216360:web:66902a73b6e3fe3ec285dd',
  measurementId: 'G-QHLSC61Z4V',
};

const appOrigem = getApps().find(app => app.name === 'origem') || initFirebaseApp(firebaseOriginConfig, 'origem');
const appDestino = getApps().find(app => app.name === 'destino') || initFirebaseApp(firebaseDestConfig, 'destino');

const dbOrigem = getFirestore(appOrigem);
const dbDestino = getFirestore(appDestino); // ou use getDatabase se quiser Realtime DB

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const snapshot = await getDocs(collection(dbOrigem, 'CodigosDeAcesso'));

    const promises = snapshot.docs.map((docOrigem) => {
      return setDoc(doc(dbDestino, 'CodigosDeAcesso', docOrigem.id), docOrigem.data());
    });

    await Promise.all(promises);

    return res.status(200).json({ message: `✅ Clonados ${snapshot.size} doc com sucesso.` });
  } catch (err: any) {
    console.error('Erro ao clonar:', err);
    return res.status(500).json({ error: err.message });
  }
}
