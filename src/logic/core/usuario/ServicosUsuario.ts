import Autenticacao, { CancelarMonitoramento, MonitorarUsuario } from "@/logic/firebase/auth/Autenticacao"
import Colecao from "@/logic/firebase/db/Colecao"
import Usuario from "./Usuario"

export default class ServicosUsuario {
    private _autenticacao = new Autenticacao()
    private _colecao = new Colecao()

    monitorarAutenticacao(observador: MonitorarUsuario): CancelarMonitoramento {
        return this._autenticacao.monitorar(async usuario => {
            observador(usuario ? {
                ...usuario,
                ...await this.consultar(usuario.email)
            } : null)
        })
    }

    async loginGoogle(): Promise<Usuario | null> {
        try {
            const usuario = await this._autenticacao.loginGoogle()
            if (!usuario) return null

            let usuarioDoBanco = await this.consultar(usuario.email)
            if (!usuarioDoBanco) {
                // Cria novo usuário com a estrutura correta
                const novoUsuario = {
                    email: usuario.email,
                    nome: usuario.nome,
                    imagemUrl: usuario.imagemUrl,
                    id: usuario.uid || usuario.email
                }
                usuarioDoBanco = await this.salvar(novoUsuario)
            }

            return { ...usuario, ...usuarioDoBanco }
        } catch (error) {
            console.error('Erro no login:', error)
            return null
        }
    }

    async loginEmailSenha(email: string, senha: string): Promise<Usuario | null> {
        try {
            console.log('🔐 Tentando autenticar:', email);
            
            // Validar credenciais via API
            const response = await fetch('/api/auth/verify-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password: senha })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Erro na API de autenticação:', errorData);
                throw new Error(errorData.error || 'Email ou senha incorretos');
            }

            const responseData = await response.json();
            console.log('✅ Resposta da API:', responseData);
            
            const { user } = responseData;

            if (!user) {
                console.error('❌ API retornou resposta sem dados de usuário');
                throw new Error('Erro ao processar autenticação');
            }

            // A API já retorna os dados completos do usuário do Firestore
            // Apenas normalizar e retornar
            const usuarioCompleto: Usuario = {
                uid: user.uid || user.email,
                email: user.email,
                nome: user.nome || '',
                imagemUrl: user.imagemUrl || '/betologo.jpeg',
                permissao: user.permissao || 'Visualizador',
                id: user.email
            } as Usuario;

            console.log('✅ Usuário autenticado com sucesso:', usuarioCompleto.email);
            return usuarioCompleto;
        } catch (error: any) {
            console.error('❌ Erro ao logar com email e senha:', error);
            throw error;
        }
    }

    logout(): Promise<void> {
        return this._autenticacao.logout()
    }

    async salvar(usuario: Usuario) {
        try {
            // Estrutura completa do usuário conforme especificado
            const usuarioCompleto = {
                email: usuario.email,
                nome: usuario.nome,
                imagemUrl: usuario.imagemUrl || '/betologo.jpg',
                permissao: (usuario as any).permissao || 'Visualizador',
                ativo: (usuario as any).ativo !== undefined ? (usuario as any).ativo : true,
                dataCriacao: (usuario as any).dataCriacao || new Date(),
                id: usuario.uid || usuario.email
            };

            // Usa o email como ID do documento para manter consistência
            return await this._colecao.salvar(
                'usuarios', 
                usuarioCompleto, 
                usuario.email
            )
        } catch (error) {
            console.error('Erro ao salvar usuário:', error)
            throw error
        }
    }

    async consultar(email: string) {
        try {
            console.log('🔍 Consultando usuário:', email)
            const usuario = await this._colecao.consultarPorId('usuarios', email)
            console.log('📄 Usuário encontrado:', !!usuario)
            return usuario
        } catch (error) {
            console.error('❌ Erro ao consultar usuário:', error)
            // Tentar buscar diretamente do Firestore como fallback
            try {
                const { getFirestore, doc, getDoc } = await import('firebase/firestore')
                const { db } = await import('@/logic/firebase/config/app')
                
                const userDoc = await getDoc(doc(db, 'usuarios', email))
                
                if (userDoc.exists()) {
                    console.log('✅ Usuário encontrado via fallback')
                    return { id: userDoc.id, ...userDoc.data() }
                }
                
                console.log('❌ Usuário não encontrado via fallback')
                return null
            } catch (fallbackError) {
                console.error('❌ Erro no fallback:', fallbackError)
                return null
            }
        }
    }

    async obterTodos(): Promise<Usuario[]> {
        const usuarios = await this._colecao.consultarTodos('usuarios')
        return usuarios.map(usuario => {
            return {
                ...usuario,
                permissao: (usuario as any).permissao || 'Visualizador',
                ativo: (usuario as any).ativo !== undefined ? (usuario as any).ativo : true,
                dataCriacao: (usuario as any).dataCriacao || new Date(),
                id: usuario.uid || usuario.email
            };

        })
    }

    async obterUsuario(identificador: string): Promise<Usuario | null> {
        try {
            console.log('🔍 Obtendo usuário:', identificador)
            
            // Buscar diretamente usando o identificador (que geralmente é o email)
            let usuario = await this.consultar(identificador)

            if (usuario) {
                const usuarioCompleto = usuario as any;
                const usuarioFormatado = {
                    ...usuarioCompleto,
                    email: usuarioCompleto.email,
                    nome: usuarioCompleto.nome,
                    permissao: usuarioCompleto.permissao || 'Visualizador',
                    ativo: usuarioCompleto.ativo !== undefined ? usuarioCompleto.ativo : true,
                    dataCriacao: usuarioCompleto.dataCriacao || new Date(),
                    id: usuarioCompleto.email || identificador,
                    uid: usuarioCompleto.uid || usuarioCompleto.email
                }
                
                console.log('✅ Usuário obtido com sucesso:', usuarioFormatado.email)
                return usuarioFormatado
            }

            console.log('❌ Usuário não encontrado:', identificador)
            return null
        } catch (error) {
            console.error('❌ Erro ao buscar usuário:', error)
            return null
        }
    }
}