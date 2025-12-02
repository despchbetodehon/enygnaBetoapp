export default interface Usuario {
    uid?: string
    id: string
    email: string
    nome: string
    imagemUrl?: string | null
    provedor?: string
    permissao?: string
    ativo?: boolean
    dataCriacao?: Date
    cpf?: string
    telefone?: string
}