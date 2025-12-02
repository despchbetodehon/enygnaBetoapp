import { getFirestore, collection, doc, setDoc, getDoc, deleteDoc, query, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { app } from '../config/app';
import { getAuth } from 'firebase/auth';

export default class Colecao {
    private _db = getFirestore(app);
    private _auth = getAuth(app);

    async salvar(nomeColecao: string, dados: any, docId?: string) {
        try {
            if (docId) {
                const docRef = doc(this._db, nomeColecao, docId);
                await setDoc(docRef, dados, { merge: true });
                return { ...dados, id: docId };
            } else {
                const docRef = await addDoc(collection(this._db, nomeColecao), dados);
                return { ...dados, id: docRef.id };
            }
        } catch (error) {
            console.error(`Erro ao salvar em ${nomeColecao}:`, error);
            throw error;
        }
    }

    async consultarPorId(nomeColecao: string, docId: string) {
        try {
            console.log(`🔍 Buscando documento: ${nomeColecao}/${docId}`)
            const docRef = doc(this._db, nomeColecao, docId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                console.log(`✅ Documento encontrado: ${nomeColecao}/${docId}`)
                return { id: docSnap.id, ...docSnap.data() }
            } else {
                console.log(`❌ Documento não existe: ${nomeColecao}/${docId}`)
                return null
            }
        } catch (error) {
            console.error(`❌ Erro ao buscar documento ${nomeColecao}/${docId}:`, error)
            throw error
        }
    }

    async excluir(nomeColecao: string, id: string) {
        try {
            // Verificar autenticação antes de excluir
            const user = this._auth.currentUser;

            if (!user) {
                console.error('❌ Usuário não autenticado ao tentar excluir');
                throw new Error('Usuário não autenticado');
            }

            console.log('✅ Usuário autenticado:', user.email);
            console.log('✅ UID do usuário:', user.uid);
            
            // Tentar obter o token de autenticação
            const token = await user.getIdToken();
            console.log('✅ Token obtido com sucesso');

            const docRef = doc(this._db, nomeColecao, id);
            console.log(`🔄 Tentando excluir: ${nomeColecao}/${id}`);
            
            await deleteDoc(docRef);
            
            console.log(`✅ Documento excluído com sucesso: ${nomeColecao}/${id}`);
            return true;
        } catch (error: any) {
            console.error(`❌ Erro ao excluir de ${nomeColecao}:`, error);
            console.error(`❌ Código do erro: ${error?.code}`);
            console.error(`❌ Mensagem do erro: ${error?.message}`);
            throw error;
        }
    }

    async consultar(nomeColecao: string, campoOrdenacao?: string) {
        try {
            const colecaoRef = collection(this._db, nomeColecao);

            let q;
            if (campoOrdenacao) {
                q = query(colecaoRef, orderBy(campoOrdenacao));
            } else {
                q = query(colecaoRef);
            }

            const querySnapshot = await getDocs(q);
            const resultados: any[] = [];

            querySnapshot.forEach((doc) => {
                resultados.push({ id: doc.id, ...doc.data() });
            });

            return resultados;
        } catch (error) {
            console.error(`Erro ao consultar ${nomeColecao}:`, error);
            return [];
        }
    }

    async consultarTodos(nomeColecao: string) {
        try {
            const colecaoRef = collection(this._db, nomeColecao);
            const querySnapshot = await getDocs(colecaoRef);
            const resultados: any[] = [];

            querySnapshot.forEach((doc) => {
                resultados.push({ 
                    id: doc.id, 
                    ...doc.data() 
                });
            });

            console.log(`📊 Consultando todos de ${nomeColecao}:`, resultados);
            return resultados;
        } catch (error) {
            console.error(`Erro ao consultar todos de ${nomeColecao}:`, error);
            return [];
        }
    }
}