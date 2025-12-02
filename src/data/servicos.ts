export interface Servico {
  id: number;
  nome: string;
  categoria: string;
  icone: string;
  descricao: string;
  documentos: string[];
  valor: string;
  tipo: 'TAXAS' | 'OUTRAS DESPESAS';
}

export const servicos: Servico[] = [
  {
    id: 2001,
    nome: "ALTERAÇÃO DE DADOS",
    categoria: "Transferências",
    icone: "Edit",
    descricao: "Detran: R$183,12 + honorário: R$185,88 = R$369,00",
    documentos: [
      "CRV (Certificado de Registro do Veículo)",
      "Documento de identificação do proprietário",
      "Comprovante de residência",
      "Procuração (se necessário)"
    ],
    valor: "369,00",
    tipo: "TAXAS"
  },
  {
    id: 2002,
    nome: "ANTT (Pessoa Física ou Jurídica)",
    categoria: "Serviços de ANTT e Transporte",
    icone: "LocalShipping",
    descricao: "Pessoa Física: R$900,00 | Pessoa Jurídica: R$1.200,00",
    documentos: [
      "CNH do proprietário",
      "Comprovante de residência",
      "CRLV do veículo",
      "CNPJ ou CPF",
      "Contrato social (PJ)"
    ],
    valor: "900,00 - 1.200,00",
    tipo: "OUTRAS DESPESAS"
  },
  {
    id: 2003,
    nome: "ATPVE + ASSINATURA + COMUNICAÇÃO DE VENDA",
    categoria: "Transferências",
    icone: "Receipt",
    descricao: "Valor total: R$46,00",
    documentos: [
      "CRV assinado",
      "Documento de identificação do vendedor",
      "CPF/CNPJ do comprador"
    ],
    valor: "46,00",
    tipo: "TAXAS"
  },
  {
    id: 2004,
    nome: "AUTORIZAÇÃO DE ESTAMPAGEM",
    categoria: "Documentos Veiculares",
    icone: "ConfirmationNumber",
    descricao: "R$60,00 + R$100,00 (por placa) = R$160,00",
    documentos: [
      "Laudo de vistoria",
      "Documento do veículo (CRLV)",
      "Documento de identificação"
    ],
    valor: "160,00",
    tipo: "TAXAS"
  },
  {
    id: 2005,
    nome: "BAIXA DA RESTRIÇÃO ADMINISTRATIVA",
    categoria: "Documentos Veiculares",
    icone: "Block",
    descricao: "Valor total: R$120,00",
    documentos: [
      "Documento do veículo",
      "Documento de identificação do proprietário",
      "Comprovante da quitação da restrição"
    ],
    valor: "120,00",
    tipo: "TAXAS"
  },
  {
    id: 2006,
    nome: "BAIXA DE VEÍCULO",
    categoria: "Documentos Veiculares",
    icone: "Delete",
    descricao: "Tubarão: Detran: R$183,12 + honorário: R$185,88 = R$369,00",
    documentos: [
      "Documento do veículo",
      "Documento de identificação",
      "Comprovante de baixa do motor (se aplicável)"
    ],
    valor: "369,00",
    tipo: "TAXAS"
  },
  {
    id: 2007,
    nome: "CERTIFICADO DIGITAL",
    categoria: "Assinatura e Certificação",
    icone: "VerifiedUser",
    descricao: "Valor total: R$145,00",
    documentos: [
      "Documento de identificação com foto",
      "CPF",
      "Comprovante de endereço"
    ],
    valor: "145,00",
    tipo: "OUTRAS DESPESAS"
  },
  {
    id: 2008,
    nome: "EMISSÃO DE LICENCIAMENTO",
    categoria: "Licenciamento",
    icone: "Description",
    descricao: "Valor total: R$50,00",
    documentos: [
      "CRV ou CRLV",
      "Comprovante de pagamento do IPVA",
      "Comprovante do DPVAT (quando exigido)"
    ],
    valor: "50,00",
    tipo: "TAXAS"
  },
  {
    id: 2009,
    nome: "EMISSÃO DE LICENCIAMENTO DE FORA",
    categoria: "Licenciamento",
    icone: "FileCopy",
    descricao: "Valor total: R$134,00",
    documentos: [
      "Comprovante de pagamento do IPVA e taxa de licenciamento",
      "Documento anterior",
      "Documento de identificação"
    ],
    valor: "134,00",
    tipo: "TAXAS"
  },
  {
    id: 2010,
    nome: "INDICAÇÃO DE CONDUTOR",
    categoria: "CNH e Habilitação",
    icone: "PersonAdd",
    descricao: "Valor total: R$39,00",
    documentos: [
      "Formulário de indicação preenchido",
      "Documento do infrator e do condutor indicado",
      "CNH do condutor"
    ],
    valor: "39,00",
    tipo: "TAXAS"
  },
  {
    id: 2011,
    nome: "LICENCIAMENTO (Tubarão)",
    categoria: "Licenciamento",
    icone: "Description",
    descricao: "À vista: R$77,00 | Cartão: R$124,00",
    documentos: [
      "Documento do veículo",
      "IPVA quitado",
      "DPVAT quitado"
    ],
    valor: "77,00 - 124,00",
    tipo: "TAXAS"
  },
  {
    id: 2012,
    nome: "PRIMEIRO EMPLACAMENTO",
    categoria: "Licenciamento",
    icone: "DirectionsCar",
    descricao: "Tubarão: Detran: R$183,12 + honorário: R$185,88 = R$369,00",
    documentos: [
      "Nota fiscal do veículo",
      "Documento de identificação do comprador",
      "Comprovante de residência",
      "Declaração de procedência"
    ],
    valor: "369,00",
    tipo: "TAXAS"
  },
  {
    id: 2013,
    nome: "PROCURAÇÃO ELETRÔNICA",
    categoria: "Documentos Veiculares",
    icone: "Assignment",
    descricao: "Valor total: R$90,00",
    documentos: [
      "Documento de identificação de ambas as partes",
      "Dados do veículo (CRLV ou CRV)",
      "CPF/CNPJ de quem receberá poderes"
    ],
    valor: "90,00",
    tipo: "TAXAS"
  },
  {
    id: 2014,
    nome: "REMARCAÇÃO DE CHASSI",
    categoria: "Documentos Veiculares",
    icone: "Settings",
    descricao: "Detran: R$183,12 + honorário: R$185,88 = R$369,00",
    documentos: [
      "Laudo pericial de necessidade de remarcação",
      "Documento do veículo",
      "Documento de identificação"
    ],
    valor: "369,00",
    tipo: "TAXAS"
  },
  {
    id: 2015,
    nome: "RESTAURAÇÃO DE HODÔMETRO",
    categoria: "Documentos Veiculares",
    icone: "Build",
    descricao: "Valor total: R$120,00",
    documentos: [
      "Laudo técnico da oficina",
      "Documento do veículo",
      "Documento do proprietário"
    ],
    valor: "120,00",
    tipo: "TAXAS"
  },
  {
    id: 2016,
    nome: "SEGUNDA VIA CRV",
    categoria: "Documentos Veiculares",
    icone: "FileCopy",
    descricao: "Tubarão: Detran: R$444,00 + honorário: R$185,00 = R$629,00",
    documentos: [
      "Boletim de ocorrência (perda, roubo, etc.)",
      "CRLV (se houver)",
      "Documento de identificação",
      "Procuração (se necessário)"
    ],
    valor: "629,00",
    tipo: "TAXAS"
  },
  {
    id: 2017,
    nome: "TRANSFERÊNCIA",
    categoria: "Transferências",
    icone: "SyncAlt",
    descricao: "Detran: R$183,12 + honorário: R$185,88 = R$369,00",
    documentos: [
      "CRV preenchido e assinado",
      "Documento de identificação das partes",
      "Comprovante de endereço",
      "Laudo de vistoria veicular"
    ],
    valor: "369,00",
    tipo: "TAXAS"
  },
  {
    id: 2018,
    nome: "TRANSFERÊNCIA COM ALTERAÇÃO",
    categoria: "Transferências",
    icone: "CompareArrows",
    descricao: "Detran: R$366,24 (2 taxas de R$183,12) + honorário: R$185,88 = R$553,00",
    documentos: [
      "CRV preenchido e assinado",
      "Documento de identificação",
      "Comprovante de endereço",
      "Laudo de vistoria",
      "Documentos referentes à alteração"
    ],
    valor: "553,00",
    tipo: "TAXAS"
  },
  {
    id: 2018,
    nome: "Parcelamento Até 18x no cartão",
    categoria: "Parcelamento",
    icone: "CompareArrows",
    descricao: "Taxas",
    documentos: [
     
      "Documento de identificação",
      "Comprovante de endereço"
     
    ],
    valor: "Negociar",
    tipo: "TAXAS"
  }
];

export const categorias = [
  "Todos",
  "Transferências",
  "Serviços de ANTT e Transporte",
  "Licenciamento",
  "CNH e Habilitação",
  "Documentos Veiculares",
  "Assinatura e Certificação"
];
