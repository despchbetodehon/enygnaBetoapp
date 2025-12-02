import Transacao from './Transacao'
import Usuario from '../usuario/Usuario'
import { TipoTransacao } from './TipoTransacao'

async function consultarPorMes(usuario: Usuario, data: Date): Promise<Transacao[]> {
  const ano = data.getFullYear()
  const mes = data.getMonth()

  return [
      {
          id: '1',
          descricao: 'Salário',
          valor: 5000,
          data: new Date(ano, mes, 5),
          tipo: TipoTransacao.RECEITA
        },
        {
          id: '2',
          descricao: 'Aluguel',
          valor: 1200,
          data: new Date(ano, mes, 10),
          tipo: TipoTransacao.DESPESA
        }
  ]
}

async function salvar(transacao: Transacao, usuario: Usuario): Promise<void> {
  console.log(`Salvando para ${usuario.nome}:`, transacao)
}

async function excluir(transacao: Transacao, usuario: Usuario): Promise<void> {
  console.log(`Excluindo transação ${transacao.id} de ${usuario.nome}`)
}

export default {
  consultarPorMes,
  salvar,
  excluir
}
