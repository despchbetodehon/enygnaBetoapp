import { Timestamp } from 'firebase/firestore';

export default interface Item {
  id: string
  cliente: string
  status: string
  quantidade: number
  imagemUrls: string[]
  concluido: boolean
  placa: string
  renavam: string
  descricao: string
  valordevenda: string
  nomevendedor: string
  cpfvendedor: string
  enderecovendedor: string
  complementovendedor: string
  municipiovendedor: string
  emailvendedor: string
  bairrocomprador: string
  nomecomprador: string
  cpfcomprador: string
  enderecocomprador: string
  complementocomprador: string
  municipiocomprador: string
  emailcomprador: string
  celtelcomprador: string
  cepvendedor: string
  cepcomprador: string
  tipo: string
  cnpjempresa: string
  nomeempresa: string
  dataCriacao: any
  celtelvendedor: string
  signature: string

  // Campos do veículo para procuração
  chassi?: string
  modelo?: string
  anoFabricacao?: string
  anoModelo?: string
  cor?: string
  combustivel?: string

  // Campos do proprietário
  nomeEmpresa?: string
  cpfEmpresa?: string
  rgEmpresa?: string
  nacionalidadeEmpresa?: string
  dataNascimentoEmpresa?: string
  nomePaiEmpresa?: string
  nomeMaeEmpresa?: string
  enderecoEmpresa?: string
  complementoEmpresa?: string
  municipioEmpresa?: string
  estadoEmpresa?: string
  cepEmpresa?: string

  // Socio principal (sem sufixo para compatibilidade)
  nomeSocio?: string
  cpfSocio?: string
  rgSocio?: string
  nacionalidadeSocio?: string
  estadoCivilSocio?: string
  profissaoSocio?: string
  enderecoSocio?: string
  complementoSocio?: string
  municipioSocio?: string
  estadoSocioEnd?: string
  cepSocio?: string

  // Socioes adicionais
  nomeSocio1?: string
  cpfSocio1?: string
  rgSocio1?: string
  nacionalidadeSocio1?: string
  estadoCivilSocio1?: string
  profissaoSocio1?: string
  enderecoSocio1?: string
  complementoSocio1?: string
  municipioSocio1?: string
  estadoSocioEnd1?: string
  cepSocio1?: string

  nomeSocio2?: string
  cpfSocio2?: string
  rgSocio2?: string
  nacionalidadeSocio2?: string
  estadoCivilSocio2?: string
  profissaoSocio2?: string
  enderecoSocio2?: string
  complementoSocio2?: string
  municipioSocio2?: string
  estadoSocioEnd2?: string
  cepSocio2?: string

  nomeSocio3?: string
  cpfSocio3?: string
  rgSocio3?: string
  nacionalidadeSocio3?: string
  estadoCivilSocio3?: string
  profissaoSocio3?: string
  enderecoSocio3?: string
  complementoSocio3?: string
  municipioSocio3?: string
  estadoSocioEnd3?: string
  cepSocio3?: string

  nomeSocio4?: string
  cpfSocio4?: string
  rgSocio4?: string
  nacionalidadeSocio4?: string
  estadoCivilSocio4?: string
  profissaoSocio4?: string
  enderecoSocio4?: string
  complementoSocio4?: string
  municipioSocio4?: string
  estadoSocioEnd4?: string
  cepSocio4?: string

  nomeSocio5?: string
  cpfSocio5?: string
  rgSocio5?: string
  nacionalidadeSocio5?: string
  estadoCivilSocio5?: string
  profissaoSocio5?: string
  enderecoSocio5?: string
  complementoSocio5?: string
  municipioSocio5?: string
  estadoSocioEnd5?: string
  cepSocio5?: string
}
