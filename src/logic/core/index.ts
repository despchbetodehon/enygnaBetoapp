import ServicosUsuario from './usuario/ServicosUsuario'
import Usuario from './usuario/Usuario'
import ServicosTransacao from './financas/ServicosTransacao'

export default {
  usuario: new ServicosUsuario(),
  transacao: ServicosTransacao
}
