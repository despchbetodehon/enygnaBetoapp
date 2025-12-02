import Usuario from "@/logic/core/usuario/Usuario";
import {
    Auth,
    getAuth,
    GoogleAuthProvider,
    onIdTokenChanged,
    signInWithPopup,
    signOut,
    User
} from "firebase/auth";
import { app } from "../config/app";

export type MonitorarUsuario = (usuario: Usuario | null) => void;
export type CancelarMonitoramento = () => void;

// Função de hash simples para senhas (em produção, use bcrypt no backend)
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default class Autenticacao {
    private _auth: Auth | null = null;

    private get auth(): Auth {
        if (!this._auth) {
            this._auth = getAuth(app);
        }
        return this._auth;
    }

    async loginGoogle(): Promise<Usuario | null> {
        const resp = await signInWithPopup(this.auth, new GoogleAuthProvider());
        return await this.converterParaUsuario(resp.user);
    }

    

    logout(): Promise<void> {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('usuarioAutenticado');
        }
        return signOut(this.auth);
    }

    static async obterUsuario(): Promise<Usuario | null> {
        const auth = new Autenticacao();
        return auth.obterUsuarioLogado();
    }

    monitorar(notificar: MonitorarUsuario): CancelarMonitoramento {
        return onIdTokenChanged(this.auth, async (usuarioFirebase) => {
            const usuario = await this.converterParaUsuario(usuarioFirebase);
            notificar(usuario);
        });
    }

    async obterUsuarioLogado(): Promise<Usuario | null> {
        if (typeof window === 'undefined') {
            return null;
        }

        const usuarioFirebase = this.auth.currentUser;
        if (usuarioFirebase) {
            return await this.converterParaUsuario(usuarioFirebase);
        }

        try {
            const usuarioSalvo = localStorage.getItem('_s');
            if (usuarioSalvo) {
                // Decrypt data before parsing
                try {
                    const { decrypt } = await import('@/utils/crypto');
                    const decrypted = await decrypt(usuarioSalvo);
                    const dadosUsuario = JSON.parse(decrypted);

                    // Verificar se a sessão não expirou (8 horas para maior segurança)
                    const agora = Date.now();
                    const tempoSessao = 8 * 60 * 60 * 1000;

                    if (agora - dadosUsuario.timestamp < tempoSessao) {
                        return {
                            uid: dadosUsuario.uid,
                            id: dadosUsuario.id || dadosUsuario.email,
                            email: dadosUsuario.email,
                            nome: dadosUsuario.nome,
                            imagemUrl: dadosUsuario.imagemUrl,
                            permissao: dadosUsuario.permissao
                        };
                    } else {
                        localStorage.removeItem('_s');
                    }
                } catch (error) {
                    console.error('Erro ao descriptografar ou parsear dados da sessão:', error);
                    localStorage.removeItem('_s');
                }
            }
        } catch (error) {
            localStorage.removeItem('_s');
        }

        return null;
    }

    private async converterParaUsuario(firebaseUser: any): Promise<Usuario | null> {
        if (!firebaseUser) return null;

        // Buscar permissão do Firestore
        let permissao = firebaseUser.permissao;
        
        try {
            const { default: Colecao } = await import('../db/Colecao');
            const colecao = new Colecao();
            const usuarioDoc = await colecao.consultarPorId('usuarios', firebaseUser.email);
            
            if (usuarioDoc) {
                permissao = (usuarioDoc as any).permissao || permissao;
            }
        } catch (error) {
            console.warn('⚠️ Não foi possível buscar permissão do Firestore:', error);
        }

        return {
            uid: firebaseUser.uid,
            id: firebaseUser.uid || firebaseUser.email,
            email: firebaseUser.email,
            nome: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
            imagemUrl: firebaseUser.photoURL,
            provedor: firebaseUser.providerData?.[0]?.providerId,
            permissao: permissao
        }
    }
}