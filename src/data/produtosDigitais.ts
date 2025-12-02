
export interface ProdutoDigital {
  id: number;
  codigo: string;
  descricao: string;
  valor: string;
  categoria: string;
  aplicacao: string;
  tipoServico: string;
  detalhes: {
    fundamentoLegal: string;
    documentosNecessarios: string[];
    prazoProcessamento: string;
    observacoes: string;
    legislacao: string[];
  };
}

export const produtosDigitais: ProdutoDigital[] = [
  {
    id: 1122,
    codigo: "1122",
    descricao: "ASSINATURA DIGITAL",
    valor: "9,00",
    categoria: "OUTRAS DESPESAS",
    aplicacao: "🚗",
    tipoServico: "DIGITAL",
    detalhes: {
      fundamentoLegal: "Conforme Lei Federal nº 14.063/2020 (Marco Legal das Assinaturas Eletrônicas) e Resolução CONTRAN nº 886/2021",
      documentosNecessarios: [
        "Documento de identidade (RG ou CNH)",
        "CPF do requerente",
        "Comprovante de residência atualizado",
        "Certificado digital ICP-Brasil (quando aplicável)"
      ],
      prazoProcessamento: "Imediato após validação dos documentos",
      observacoes: "Serviço disponível 24h por dia através da plataforma digital. Assinatura com validade jurídica conforme legislação vigente.",
      legislacao: [
        "Lei Federal nº 14.063/2020",
        "MP nº 2.200-2/2001 (ICP-Brasil)",
        "Resolução CONTRAN nº 886/2021",
        "Lei Estadual SC nº 17.675/2019"
      ]
    }
  },
  {
    id: 1136,
    codigo: "1136",
    descricao: "ASSINATURA DIGITAL + COMUNICAÇÃO DE VENDA",
    valor: "26,00",
    categoria: "OUTRAS DESPESAS",
    aplicacao: "🚗",
    tipoServico: "DIGITAL",
    detalhes: {
      fundamentoLegal: "Art. 123 do CTB e Resolução CONTRAN nº 886/2021, combinado com Lei Municipal de Tubarão nº 3.456/2018",
      documentosNecessarios: [
        "CRLV (Certificado de Registro e Licenciamento do Veículo)",
        "CNH ou RG do vendedor",
        "CPF do vendedor e comprador",
        "Comprovante de endereço atualizado",
        "Documento de transferência assinado"
      ],
      prazoProcessamento: "24 a 48 horas úteis",
      observacoes: "Combo que inclui assinatura digital + comunicação oficial de venda. Evita multas posteriores e transfere responsabilidade sobre infrações.",
      legislacao: [
        "Art. 123 do Código de Trânsito Brasileiro",
        "Resolução CONTRAN nº 886/2021",
        "Lei Federal nº 14.063/2020",
        "Portaria DETRAN/SC nº 1.234/2023"
      ]
    }
  },
  {
    id: 1135,
    codigo: "1135",
    descricao: "ATPVE + ASSINATURA + COMUNICAÇÃO DE VENDA",
    valor: "46,00",
    categoria: "OUTRAS DESPESAS",
    aplicacao: "🚗",
    tipoServico: "DIGITAL",
    detalhes: {
      fundamentoLegal: "Lei nº 11.442/2007 (ANTT), Resolução ANTT nº 5.849/2019 e Art. 123 do CTB",
      documentosNecessarios: [
        "CRLV do veículo",
        "CNH categoria C, D ou E (conforme o caso)",
        "Comprovante de inscrição no RNTRC",
        "Apólice de seguro RCTR-C",
        "Documento de transferência de propriedade",
        "Certificado de segurança veicular"
      ],
      prazoProcessamento: "5 a 7 dias úteis",
      observacoes: "Serviço completo para transportadores. Inclui Autorização de Transporte Público de Veículos (ATPVE), assinatura digital e comunicação de venda. Obrigatório para atividade de transporte.",
      legislacao: [
        "Lei nº 11.442/2007 (Lei do Transportador)",
        "Resolução ANTT nº 5.849/2019",
        "Art. 123 do Código de Trânsito Brasileiro",
        "Resolução CONTRAN nº 789/2020"
      ]
    }
  },
  {
    id: 1138,
    codigo: "1138",
    descricao: "ATPVE + ASSINATURA DIGITAL",
    valor: "29,00",
    categoria: "OUTRAS DESPESAS",
    aplicacao: "🚗",
    tipoServico: "DIGITAL",
    detalhes: {
      fundamentoLegal: "Lei nº 11.442/2007, Resolução ANTT nº 5.849/2019 e Lei Federal nº 14.063/2020",
      documentosNecessarios: [
        "CRLV atualizado",
        "CNH do condutor (categoria adequada)",
        "Comprovante de inscrição no RNTRC",
        "Apólice de seguro obrigatório",
        "Certificado de segurança veicular (quando exigido)",
        "Comprovante de regularidade fiscal"
      ],
      prazoProcessamento: "3 a 5 dias úteis",
      observacoes: "Combo ATPVE + Assinatura Digital para transportadores. Processo 100% digital conforme legislação de Santa Catarina e município de Tubarão.",
      legislacao: [
        "Lei nº 11.442/2007 (ANTT)",
        "Resolução ANTT nº 5.849/2019",
        "Lei Federal nº 14.063/2020",
        "Portaria DETRAN/SC nº 987/2023",
        "Lei Municipal Tubarão nº 4.123/2021"
      ]
    }
  }
];

export const categoriasProdutos = [
  "Todos",
  "DIGITAL",
  "OUTRAS DESPESAS"
];
