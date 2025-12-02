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
  crv: string
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
  nomeProprietario?: string
  cpfProprietario?: string
  rgProprietario?: string
  nacionalidadeProprietario?: string
  dataNascimentoProprietario?: string
  nomePaiProprietario?: string
  nomeMaeProprietario?: string
  enderecoProprietario?: string
  complementoProprietario?: string
  municipioProprietario?: string
  estadoProprietario?: string
  cepProprietario?: string

  // Procurador principal (sem sufixo para compatibilidade)
  nomeProcurador?: string
  cpfProcurador?: string
  rgProcurador?: string
  nacionalidadeProcurador?: string
  estadoCivilProcurador?: string
  profissaoProcurador?: string
  enderecoProcurador?: string
  complementoProcurador?: string
  municipioProcurador?: string
  estadoProcuradorEnd?: string
  cepProcurador?: string
  estadoCivilSocioAdministrador?: string
  profissaoSocioAdministrador?: string
  enderecoSocioAdministrador?: string
  complementoSocioAdministrador?: string
  municipioSocioAdministrador?: string
  estadoSocioAdministrador?: string
  cepSocioAdministrador?: string
  // Procuradores adicionais
  nomeProcurador1?: string
  cpfProcurador1?: string
  rgProcurador1?: string
  nacionalidadeProcurador1?: string
  estadoCivilProcurador1?: string
  profissaoProcurador1?: string
  enderecoProcurador1?: string
  complementoProcurador1?: string
  municipioProcurador1?: string
  estadoProcuradorEnd1?: string
  cepProcurador1?: string

  nomeProcurador2?: string
  cpfProcurador2?: string
  rgProcurador2?: string
  nacionalidadeProcurador2?: string
  estadoCivilProcurador2?: string
  profissaoProcurador2?: string
  enderecoProcurador2?: string
  complementoProcurador2?: string
  municipioProcurador2?: string
  estadoProcuradorEnd2?: string
  cepProcurador2?: string

  nomeProcurador3?: string
  cpfProcurador3?: string
  rgProcurador3?: string
  nacionalidadeProcurador3?: string
  estadoCivilProcurador3?: string
  profissaoProcurador3?: string
  enderecoProcurador3?: string
  complementoProcurador3?: string
  municipioProcurador3?: string
  estadoProcuradorEnd3?: string
  cepProcurador3?: string
    nregistro: string
  nregistroProcurador1?: string
    nregistroProcurador2?: string
    nregistroProcurador3?: string
     nregistroProcurador4?: string
    nregistroProcurador5?: string
    nregistroProcurador: string
  nomeProcurador4?: string
  cpfProcurador4?: string
  rgProcurador4?: string
  nacionalidadeProcurador4?: string
  estadoCivilProcurador4?: string
  profissaoProcurador4?: string
  enderecoProcurador4?: string
  complementoProcurador4?: string
  municipioProcurador4?: string
  estadoProcuradorEnd4?: string
  cepProcurador4?: string

  nomeProcurador5?: string
  cpfProcurador5?: string
  rgProcurador5?: string
  nacionalidadeProcurador5?: string
  estadoCivilProcurador5?: string
  profissaoProcurador5?: string
  enderecoProcurador5?: string
  complementoProcurador5?: string
  municipioProcurador5?: string
  estadoProcuradorEnd5?: string
  cepProcurador5?: string

  // Campos para modo jurídico (empresa)
  cnpjEmpresaJuridico?: string
  nomeEmpresaJuridico?: string
  enderecoEmpresaJuridico?: string
  bairroEmpresaJuridico?: string
  municipioEmpresaJuridico?: string
  estadoEmpresaJuridico?: string
  cepEmpresaJuridico?: string
  nomeSocioAdministrador?: string
  cpfSocioAdministrador?: string
  rgSocioAdministrador?: string
  nacionalidadeSocioAdministrador?: string
  dataNascimentoSocioAdministrador?: string
}
