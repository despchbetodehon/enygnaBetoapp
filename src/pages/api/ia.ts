// pages/api/ia.ts
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Formato base da resposta em Markdown simples.
 */
function formatResponse(
  titulo: string,
  descricao: string,
  documentos: string[],
  importantes?: string[],
): string {
  const docs = documentos.map((d) => `✅ ${d}`).join('\n');
  const infos = (importantes && importantes.length)
    ? importantes.map((i, idx) => `${idx + 1}. ${i}`).join('\n')
    : [
        'Conferir se os documentos estão corretos e legíveis.',
        'Realizar vistoria quando exigida pelo procedimento.',
        'Abrir o processo no portal do DETRAN/SC (DetranNet) ou via atendimento do despachante.',
        'Acompanhar taxas, prazos e exigências complementares pelo sistema.',
      ].map((i, idx) => `${idx + 1}. ${i}`).join('\n');

  return [
    `### 📋 ${titulo}`,
    ``,
    `**📝 Descrição do serviço:**`,
    `${descricao}`,
    ``,
    `**📄 Documentos obrigatórios:**`,
    docs,
    ``,
    `**⚠️ Procedimentos importantes:**`,
    infos,
    ``,
    `**💬 Precisa de ajuda especializada?**`,
    `WhatsApp: **(48) 3255-0606**`,
    ``,
    `*✨ Atendimento profissional com 20+ anos de experiência*`,
  ].join('\n');
}

/**
 * Chave de API do serviço (carregada de variável de ambiente)
 * Para configurar: adicione IA_SERVICE_API_KEY nas Secrets do Replit
 * IMPORTANTE: Nunca hardcode chaves de API aqui - sempre use process.env
 */
const API_KEY = process.env.GEMINI_API_KEY || '';

/**
 * Tabela de serviços com descrições e documentos.
 * (Baseado na lista fornecida por você)
 */
const SERVICES: Record<
  string,
  {
    aliases: string[];
    descricao: string;
    documentos: string[];
    importantes?: string[];
  }
> = {
  // Transferências
  'transferencia_compra_venda': {
    aliases: [
      'transferência de veículo (compra e venda)',
      'transferencia compra e venda',
      'transferir veículo',
      'transferir carro',
      'passar carro para meu nome',
      'transferência compra e venda',
      'compra e venda de veículo',
    ],
    descricao: 'Processo completo para transferir a propriedade do veículo após compra e venda, regularizando toda documentação junto ao DETRAN/SC.',
    documentos: [
      'CRV/ATPV-e preenchido e assinado (documento de transferência)',
      'CRLV (Certificado de Registro e Licenciamento) atual',
      'CNH do vendedor e do comprador (documentos válidos)',
      'Comprovante de residência atualizado (até 90 dias)',
      'Laudo de vistoria aprovada (obrigatório)',
      'Comprovante de quitação de débitos do veículo',
      'Procuração (quando necessário para representação)',
    ],
    importantes: [
      'Verifique se todos os campos do CRV/ATPV-e estão preenchidos corretamente.',
      'Confirme que não há débitos pendentes (IPVA, multas, taxas).',
      'A vistoria é obrigatória e deve estar aprovada antes do protocolo.',
      'O processo pode ser feito 100% digital através do DetranNet/SC.',
      'Prazo de 30 dias a partir da data da venda para evitar multas.',
      'Valor total: DETRAN R$183,12 + Honorários R$185,88 = R$369,00.',
      'Parcelamos em até 18x no cartão sem juros.',
    ],
  },
  'indicacao_condutor': {
    aliases: ['indicação de condutor', 'indicar condutor', 'multa indicação de condutor'],
    descricao: 'Indicar quem dirigia no momento da infração.',
    documentos: ['Requerimento assinado', 'CNH do proprietário', 'CNH do infrator'],
    importantes: [
      'Observe o prazo limite indicado na notificação.',
      'Assinaturas devem seguir as orientações do órgão autuador.',
      'Envie pelo canal oficial indicado (on-line ou presencial).',
    ],
  },
  'transferencia_heranca': {
    aliases: [
      'transferência de veículo (herança/inventário)',
      'transferencia herança',
      'transferência inventário',
      'transferência por herança',
    ],
    descricao: 'Transferir veículo aos herdeiros.',
    documentos: [
      'Formal de partilha/Sentença judicial ou Inventário autenticado (cartório)',
      'CNH dos herdeiros',
      'Comprovante de residência dos herdeiros',
      'CRV (ou solicitar número)',
      'Vistoria aprovada',
    ],
  },
  'segunda_via_crv': {
    aliases: ['2ª via do crv', 'segunda via crv', 'segunda via do documento de propriedade'],
    descricao: 'Emitir segunda via do documento de propriedade.',
    documentos: ['CNH', 'Requerimento assinado', 'CRLV', '(Opcional) Comprovante de residência'],
  },

  // Placas / Documentos
  'placa_mercosul': {
    aliases: ['troca de placa para mercosul', 'placa mercosul', 'trocar placa mercosul'],
    descricao: 'Atualizar para o padrão de placa Mercosul.',
    documentos: ['CRV', 'CRLV', 'CNH', 'Comprovante de residência', 'Requerimento assinado', 'Vistoria (aprovada)'],
  },
  'inclusao_alienacao': {
    aliases: ['inclusão de alienação', 'incluir alienação', 'gravame financiamento'],
    descricao: 'Registrar financiamento/gravame do veículo.',
    documentos: ['CRV', 'CRLV', 'CNH', 'Comprovante de residência'],
  },

  // Emplacamento e Licenciamento
  'primeiro_emplacamento': {
    aliases: ['primeiro emplacamento', 'emplacamento zero', 'emplacar veículo zero'],
    descricao: 'Emplacar veículo zero ou recém-regularizado.',
    documentos: [
      'Nota fiscal',
      'CNH',
      'Comprovante de residência',
      'Foto do motor e do chassi',
      '(Reboque) CAT e foto do reboque',
      '(Empresa) Contrato social e CNPJ',
    ],
  },
  'licenciamento_anual': {
    aliases: ['licenciamento anual', 'renovar licenciamento', 'pagar licenciamento'],
    descricao: 'Renovar o licenciamento do veículo.',
    documentos: ['CNH do proprietário'],
  },

  // Baixas e Sinistro
  'baixa_sinistro': {
    aliases: [
      'baixa de sinistro',
      'sinistro média monta',
      'regularizar sinistro',
      'baixa sinistro',
      'como fazer baixa sinistro',
      'baixa média monta',
      'sinistro',
      'documentos sinistro',
      'regularizar veículo sinistro'
    ],
    descricao: 'Processo completo para regularizar e dar baixa em veículo classificado como sinistro de média ou alta monta, permitindo que o veículo volte à circulação após os devidos reparos e aprovações técnicas.',
    documentos: [
      'Boletim de Ocorrência do sinistro (original ou cópia autenticada)',
      'CRV (Certificado de Registro de Veículo) original',
      'CRLV (Certificado de Registro e Licenciamento) atual',
      'CNH do proprietário (válida)',
      'Comprovante de residência atualizado (até 90 dias)',
      'Notas fiscais de todos os consertos e reparos realizados',
      'Termo de Ciência de CSV (Certificado de Segurança Veicular)',
      'Documentos e certificações do INMETRO dos componentes substituídos',
      'Laudo de vistoria aprovada pelo DETRAN (obrigatório)',
      'Declaração da seguradora (quando aplicável)',
      'Fotos do veículo antes e depois dos reparos',
    ],
    importantes: [
      'O veículo deve estar completamente reparado antes da vistoria.',
      'Todos os componentes de segurança devem ter certificação INMETRO.',
      'A vistoria é obrigatória e rigorosa - prepare toda documentação.',
      'Mantenha todas as notas fiscais dos reparos organizadas por data.',
      'O processo pode levar de 30 a 60 dias dependendo da complexidade.',
      'Veículo não pode circular até a conclusão do processo.',
      'Valor estimado: DETRAN R$150,00 + Honorários R$280,00 = R$430,00.',
      'Parcelamos em até 18x no cartão sem juros.',
      'Acompanhamento completo do processo até a liberação final.',
    ],
  },

  // Modificações / Remarcações
  'remarcacao_motor': {
    aliases: ['remarcação de motor', 'regularizar motor remarcado'],
    descricao: 'Regularizar numeração do motor após remarcação.',
    documentos: [
      'CRV',
      'CRLV',
      'CNH',
      'Comprovante de residência',
      'Requerimento assinado',
      'Vistoria reprovada (que motivou o processo)',
      'Laudo e Nota fiscal da remarcação',
    ],
  },
  'inclusao_gnv': {
    aliases: [
      'inclusão de gnv',
      'instalar gnv',
      'regularizar gnv',
      'incluir gnv',
      'como incluir gnv',
      'documentos gnv',
      'etapas gnv',
      'kit gnv'
    ],
    descricao: 'Processo completo para registrar a instalação do kit GNV (Gás Natural Veicular) no documento do veículo junto ao DETRAN/SC, conforme normas técnicas e de segurança.',
    documentos: [
      'CRV (Certificado de Registro de Veículo) original',
      'CRLV (Certificado de Registro e Licenciamento) atual',
      'CNH do proprietário (válida)',
      'Comprovante de residência atualizado (até 90 dias)',
      'Requerimento específico preenchido e assinado',
      'Nota fiscal da instalação do kit GNV (empresa credenciada)',
      'Atestado de qualidade e conformidade do kit',
      'Certificado do INMETRO do equipamento instalado',
      'Laudo de vistoria aprovada pelo DETRAN',
      'Certificado de capacitação do instalador (quando exigido)',
    ],
    importantes: [
      'A instalação deve ser feita APENAS por empresa credenciada e certificada.',
      'O kit GNV deve ter certificação INMETRO obrigatória.',
      'A vistoria é obrigatória e deve comprovar a instalação correta.',
      'Mantenha todos os certificados de qualidade em dia.',
      'O processo altera a categoria do combustível no documento.',
      'Prazo para regularização: 30 dias após a instalação.',
      'Valor total: DETRAN R$97,20 + Honorários R$185,88 = R$283,08.',
      'Parcelamos em até 18x no cartão sem juros.',
    ],
  },
  'alteracao_carroceria': {
    aliases: [
      'alteração de carroceria',
      'mudar carroceria',
      'alterar carroceria',
      'como alterar carroceria',
      'documentos carroceria',
      'mudança de carroceria',
      'troca de carroceria'
    ],
    descricao: 'Processo para regularizar a mudança ou alteração da carroceria do veículo junto ao DETRAN/SC, registrando oficialmente a modificação estrutural realizada.',
    documentos: [
      'CRV (Certificado de Registro de Veículo) original',
      'CRLV (Certificado de Registro e Licenciamento) atual',
      'CNH do proprietário (válida)',
      'Comprovante de residência atualizado (até 90 dias)',
      'Requerimento específico preenchido e assinado',
      'Nota fiscal da nova carroceria (obrigatória)',
      'CAT (Código de Autenticação Tributária) - para notas pós-2002',
      'Certificação INMETRO da carroceria (quando aplicável)',
      'Laudo de vistoria aprovada pelo DETRAN (obrigatório)',
      'Projeto técnico da modificação (quando exigido)',
    ],
    importantes: [
      'A alteração deve ser feita antes da vistoria obrigatória.',
      'A nota fiscal deve conter especificações técnicas completas da carroceria.',
      'Certificação INMETRO é obrigatória para componentes de segurança.',
      'A vistoria verificará conformidade técnica e segurança da modificação.',
      'Alterações estruturais podem exigir projeto técnico específico.',
      'O processo altera as características do veículo no documento.',
      'Valor estimado: DETRAN R$140,00 + Honorários R$250,00 = R$390,00.',
      'Parcelamos em até 18x no cartão sem juros.',
      'Acompanhamento completo até a aprovação final.',
    ],
  },
  'alteracao_motor': {
    aliases: [
      'alteração de motor',
      'troca de motor',
      'motor substituído',
      'alterar motor',
      'como alterar motor',
      'documentos motor',
      'trocar motor',
      'motor novo',
      'nota motor'
    ],
    descricao: 'Processo completo para registrar a troca ou alteração do motor do veículo junto ao DETRAN/SC, atualizando todas as especificações técnicas no documento.',
    documentos: [
      'CRV (Certificado de Registro de Veículo) original',
      'CRLV (Certificado de Registro e Licenciamento) atual',
      'CNH do proprietário (válida)',
      'Comprovante de residência atualizado (até 90 dias)',
      'Requerimento específico autenticado em cartório',
      'Nota fiscal do motor (com especificações técnicas completas)',
      'Laudo de vistoria aprovada pelo DETRAN (obrigatório)',
      'Declaração de origem do motor (quando usado)',
    ],
    importantes: [
      'A nota fiscal DEVE conter obrigatoriamente: número do motor, potência, cilindrada, combustível e marca.',
      'Para motor usado: necessária placa de origem ou cadeia completa de notas até o proprietário atual.',
      'O requerimento deve ser autenticado em cartório (não basta assinatura simples).',
      'A vistoria é obrigatória e verificará a compatibilidade técnica do motor.',
      'Alteração de potência pode exigir documentação adicional de segurança.',
      'Motor deve estar corretamente instalado antes da vistoria.',
      'Processo altera características técnicas no documento do veículo.',
      'Valor estimado: DETRAN R$160,00 + Honorários R$280,00 = R$440,00.',
      'Parcelamos em até 18x no cartão sem juros.',
      'Acompanhamento técnico completo do processo.',
    ],
  },
  'reinicio_hodometro': {
    aliases: ['reinício de hodômetro', 'reset hodômetro', 'zerar hodometro legalmente'],
    descricao: 'Declarar e registrar reinício do hodômetro.',
    documentos: [
      'CRV',
      'CRLV',
      'CNH do vendedor',
      'CNH do comprador',
      'Comprovante de residência',
      'Declaração assinada pelo vendedor',
    ],
  },
  'restauracao_hodometro': {
    aliases: ['restauração de hodômetro', 'conserto hodômetro'],
    descricao: 'Regularizar restauração do hodômetro.',
    documentos: ['CRV', 'CRLV', 'CNH', 'Comprovante de residência', 'Requerimento assinado', 'Nota fiscal', 'Laudo de restauração'],
  },
  'autorizacao_estampagem': {
    aliases: ['autorização de estampagem', 'estampar placa', 'autorização placa'],
    descricao: 'Autorizar confecção/substituição de placa.',
    documentos: [
      'CRV',
      'CRLV',
      'CNH',
      'Comprovante de residência',
      'Requerimento assinado (informar dianteira/traseira)',
      'BO (perda) ou foto (má conservação)',
    ],
  },

  // Baixas e restrições
  'baixa_art_270': {
    aliases: ['baixa do artigo 270', 'baixa art 270', 'remover restrição art 270', 'como pedir baixa do art 270'],
    descricao: 'Processo para regularizar e dar baixa em restrição administrativa do Artigo 270 do CTB (veículo com irregularidade que impede a circulação).',
    documentos: [
      'CRV (Certificado de Registro de Veículo)',
      'CRLV (Certificado de Registro e Licenciamento)',
      'CNH do proprietário (válida)',
      'Comprovante de residência atualizado (até 90 dias)',
      'Requerimento detalhado explicando o motivo da restrição',
      'Vistoria aprovada pelo DETRAN',
      'Nota fiscal do item administrativo que causou a restrição',
      'Laudo técnico (quando aplicável)',
    ],
    importantes: [
      'Identifique primeiro qual foi o motivo da aplicação da restrição Art. 270.',
      'A vistoria é obrigatória e deve ser aprovada antes do protocolo.',
      'Prepare toda documentação que comprove a regularização da irregularidade.',
      'O processo deve ser protocolado no DetranNet/SC ou presencialmente.',
      'Acompanhe o andamento pelo sistema até a baixa definitiva da restrição.',
      'Taxas específicas serão cobradas conforme o tipo de irregularidade.',
    ],
  },
  'baixa_veiculo': {
    aliases: [
      'baixa de veículo',
      'baixa definitiva veículo',
      'baixa definitiva do veículo',
      'como dar baixa definitiva',
      'baixa permanente',
      'baixa definitiva',
      'como dar baixa definitiva do veículo',
      'documentos baixa definitiva',
      'baixa de veículo definitiva',
      'como fazer baixa definitiva'
    ],
    descricao: 'Processo para dar baixa definitiva e permanente no veículo junto ao DETRAN/SC, retirando-o definitivamente de circulação. Este procedimento é irreversível e impede que o veículo volte a circular.',
    documentos: [
      'CRV (Certificado de Registro de Veículo) original',
      'CNH do proprietário (válida)',
      'Comprovante de residência atualizado (até 90 dias)',
      'Requerimento específico de baixa definitiva preenchido e assinado',
      'Recorte físico do chassi do veículo (obrigatório)',
      'Par de placas do veículo (ambas as placas)',
      'Comprovante de quitação de débitos (IPVA, multas, taxas)',
      'Procuração (quando necessário para representação)',
    ],
    importantes: [
      'A baixa definitiva é IRREVERSÍVEL - o veículo não poderá voltar a circular.',
      'O recorte do chassi deve ser feito por empresa credenciada pelo DETRAN.',
      'É obrigatório apresentar ambas as placas do veículo.',
      'Todos os débitos do veículo devem estar quitados antes do processo.',
      'O procedimento retira definitivamente o veículo do sistema RENAVAM.',
      'Ideal para veículos sinistrados irreparáveis ou sucateamento.',
      'Valor total: DETRAN R$183,12 + Honorários R$185,88 = R$369,00.',
      'Parcelamos em até 18x no cartão sem juros.',
      'Processo definitivo - analise bem antes de decidir.',
    ],
  },

  // Chassi / Etiquetas
  'remarcacao_chassi': {
    aliases: ['remarcação de chassi', 'regularizar chassi remarcado'],
    descricao: 'Regularizar numeração do chassi após remarcação.',
    documentos: [
      'CRV',
      'CRLV',
      'CNH',
      'Comprovante de residência',
      'Requerimento assinado',
      'Vistoria reprovada (que motivou o processo)',
      'Nota fiscal e Laudo da remarcação',
    ],
  },
  'segunda_via_etiqueta': {
    aliases: ['segunda via de etiqueta', 'etiqueta de identificação', 'nova etiqueta do veículo'],
    descricao: 'Emitir nova etiqueta de identificação.',
    documentos: ['CRV', 'CRLV', 'CNH', 'Comprovante de residência', 'Requerimento assinado', 'Vistoria reprovada'],
  },

  // Estruturais / Pesados
  'alongamento_chassi': {
    aliases: ['alongamento de chassi', 'alongar chassi'],
    descricao: 'Regularizar alongamento do chassi.',
    documentos: ['CRV', 'CRLV', 'CNH', 'Comprovante de residência', 'Requerimento assinado', 'Vistoria aprovada', 'CSV', 'Nota fiscal'],
  },
  'segundo_eixo_direcional': {
    aliases: [
      'inclusão de segundo eixo direcional',
      'segundo eixo direcional',
      'incluir 2º eixo direcional',
    ],
    descricao: 'Registrar inclusão de eixo direcional.',
    documentos: ['CRV', 'CRLV', 'CNH', 'Comprovante de residência', 'Requerimento assinado', 'Vistoria aprovada', 'CSV', 'Nota fiscal'],
  },

  // Transporte Escolar
  'autorizacao_condutor_escolar': {
    aliases: [
      'autorização de condutor (transporte escolar)',
      'condutor escolar',
      'autorização condutor escolar',
      'documentos condutor escolar',
      'como condutor escolar',
      'habilitar condutor escolar',
      'transporte escolar condutor',
      'documentos para condutor transporte escolar',
      'quais documentos condutor escolar'
    ],
    descricao: 'Processo completo para habilitar e autorizar condutor profissional para transporte escolar, conforme regulamentação do DETRAN/SC e exigências municipais de segurança.',
    documentos: [
      'CRV (Certificado de Registro de Veículo) do veículo escolar',
      'CNH categoria D ou E válida (conforme o veículo)',
      'Comprovante de residência atualizado (até 90 dias)',
      'Certidão de antecedentes criminais (Polícia Civil e Federal)',
      'Termo de autorização da Prefeitura do município',
      'CSIVE - Certificado de Segurança do Veículo Escolar (válido)',
      'Requerimento específico preenchido e assinado',
      'Contrato social da empresa (quando aplicável)',
      'CNPJ ativo da empresa de transporte',
      'Alvará de funcionamento municipal',
      'Certificado de instalação do cronotacógrafo',
      'Certificados de capacitação dos condutores',
      'Consulta de infrações de trânsito (sem penalidades graves)',
      'DARE quitado (receita 2135 / classe 2433)',
    ],
    importantes: [
      'O condutor deve ter CNH categoria D ou E válida e sem suspensão.',
      'Antecedentes criminais não podem ter registros de crimes contra a vida ou dignidade.',
      'O CSIVE deve estar válido e dentro do prazo semestral.',
      'Autorização municipal é obrigatória antes do protocolo no DETRAN.',
      'Cronotacógrafo deve estar instalado e certificado.',
      'Condutores devem passar por curso específico de transporte escolar.',
      'Consulta de infrações de trânsito (sem penalidades graves)',
      'DARE quitado (receita 2135 / classe 2433)',
    ],
  },
  'transporte_escolar_veiculo': {
    aliases: [
      'transporte escolar (veículo)',
      'regularizar veículo transporte escolar',
      'veículo escolar',
    ],
    descricao: 'Regularizar o veículo para transporte escolar.',
    documentos: [
      'CRV',
      'CRLV',
      'Contrato social',
      'CNPJ',
      'CNH de quem assina pela empresa',
      'Laudo de Transporte Escolar (LTE/inspeção)',
      'Autorização de funcionamento da Prefeitura do município do emplacamento',
    ],
  },
};

/**
 * Intents rápidas para multas (parcelamento e base legal),
 * em formato simples e direto.
 */
function answerParcelarMulta(): string {
  return formatResponse(
    'Parcelamento de multas (SC)',
    'Como parcelar multas estaduais em Santa Catarina.',
    [
      'Documento de identificação (CNH ou RG)',
      'Dados do veículo (placa/RENAVAM)',
      'Cartão/conta para pagamento (conforme meios aceitos)',
    ],
    [
      'Verifique no portal do estado/DETRAN se o parcelamento está habilitado para a multa desejada.',
      'Escolha o número de parcelas disponível e confirme as taxas/juros.',
      'Emita o boleto/autorize o débito e acompanhe a compensação.',
      'Multas federais/municipais podem ter regras próprias; verifique o órgão autuador.',
    ],
  );
}

function answerLeiMultas(): string {
  // Mantemos simples e didático, sem citar artigos específicos (evita divergências entre estados/órgãos).
  return [
    `### Lei de multas (entenda de forma simples)`,
    `**Descrição:** Base legal para autuação, notificação, defesa e penalidades de trânsito no Brasil.`,
    ``,
    `**O que você precisa saber:**`,
    `- Multas seguem o Código de Trânsito Brasileiro (CTB) e normas do CONTRAN.`,
    `- Há etapas: autuação, notificação, defesa/recursos e aplicação da penalidade.`,
    `- Valores e prazos variam conforme natureza da infração (leve, média, grave, gravíssima).`,
    ``,
    `**Informações importantes:**`,
    `1. Sempre confira prazos na notificação (defesa/indicação de condutor/recurso).`,
    `2. O órgão autuador (estadual, municipal ou federal) define o canal de protocolo.`,
    `3. Em caso de dúvida, guarde o AR/recibo do envio e acompanhe o processo no portal do órgão.`,
    ``,
  ].join('\n');
}

function answerLeiTransferencia(): string {
  return [
    `### Lei de Transferência de Veículos - Manual DETRAN/SC`,
    `**Base Legal:** Código de Trânsito Brasileiro (CTB) - Lei 9.503/97`,
    ``,
    `**Artigos principais:**`,
    `• **Art. 123** - Obrigatoriedade de registro do veículo`,
    `• **Art. 134** - Prazo de 30 dias para transferência após compra`,
    `• **Resolução CONTRAN 809/20** - Procedimentos para ATPV-e (eletrônico)`,
    ``,
    `**Pontos importantes da legislação:**`,
    `1. A transferência é **OBRIGATÓRIA** em 30 dias corridos da data da venda`,
    `2. Multa por atraso: R$ 293,47 (infração grave - 5 pontos na CNH)`,
    `3. Vistoria obrigatória conforme Resolução CONTRAN 231/07`,
    `4. ATPV-e substitui o antigo DUT desde 2021`,
    ``,
    `**WhatsApp para orientação:** (48) 3255-0606`,
    `*Manual DETRAN/SC 2024 - Atualizado com últimas resoluções*`,
  ].join('\n');
}

function answerLeiIPVA(): string {
  return [
    `### Lei do IPVA - Santa Catarina`,
    `**Base Legal:** Lei Estadual SC nº 7.543/88 e Decreto SC nº 2.870/01`,
    ``,
    `**Principais dispositivos:**`,
    `• **Art. 2º** - Fato gerador: propriedade do veículo em 1º de janeiro`,
    `• **Art. 6º** - Isenções legais (deficientes, taxi, etc.)`,
    `• **Art. 8º** - Prazos de pagamento e calendário anual`,
    ``,
    `**Informações importantes:**`,
    `1. **Vencimento:** Conforme final da placa (janeiro a outubro)`,
    `2. **Multa:** 0,33% ao dia sobre valor do imposto`,
    `3. **Parcelamento:** Até 10x sem juros (conforme legislação vigente)`,
    `4. **Licenciamento:** Só é liberado com IPVA quitado`,
    ``,
    `**Dica importante:** Veículos novos pagam IPVA proporcional aos meses restantes do ano`,
    ``,
    `**WhatsApp para dúvidas:** (48) 3255-0606`,
    `*Legislação SC atualizada 2024*`,
  ].join('\n');
}

function answerLeiLicenciamento(): string {
  return [
    `### Lei de Licenciamento Anual - Manual DETRAN/SC`,
    `**Base Legal:** CTB Art. 131 e Resolução CONTRAN 789/20`,
    ``,
    `**Dispositivos legais:**`,
    `• **Art. 131 CTB** - Obrigatoriedade do licenciamento anual`,
    `• **Art. 230 CTB** - Dirigir sem licenciamento: Infração grave`,
    `• **Resolução 789/20** - Procedimentos para CRLV-e digital`,
    ``,
    `**Principais obrigações:**`,
    `1. **Renovação anual obrigatória** conforme mês de aniversário da placa`,
    `2. **Multa por atraso:** R$ 293,47 + R$ 127,69 (taxa DETRAN)`,
    `3. **Documentos:** IPVA quitado + Seguro DPVAT + taxas`,
    `4. **CRLV-e:** Documento digital válido nacionalmente`,
    ``,
    `**Calendário 2024:** Renovação conforme final da placa`,
    `• Finais 1-2: Janeiro/Fevereiro • Finais 3-4: Março/Abril`,
    `• E assim sucessivamente...`,
    ``,
    `**WhatsApp:** (48) 3255-0606`,
  ].join('\n');
}

/**
 * Busca serviço por mensagem, considerando aliases.
 */
function findServiceFromMessage(message: string) {
  const txt = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const key of Object.keys(SERVICES)) {
    const service = SERVICES[key];
    for (const aliasRaw of service.aliases) {
      const alias = aliasRaw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (txt.includes(alias)) return { key, service };
    }
  }

  // Heurísticas curtas
  if (/parcel(a|e)r.*multa/.test(txt)) return { key: 'parcelar_multa', service: null as any };
  if (/lei.*multa/.test(txt) || /qual.*lei.*multa/.test(txt)) return { key: 'lei_multas', service: null as any };
  if (/lei.*transfer/.test(txt) || /legisla.*transfer/.test(txt)) return { key: 'lei_transferencia', service: null as any };
  if (/lei.*ipva/.test(txt) || /legisla.*ipva/.test(txt)) return { key: 'lei_ipva', service: null as any };
  if (/lei.*licenciamento/.test(txt) || /legisla.*licenciamento/.test(txt)) return { key: 'lei_licenciamento', service: null as any };

  // Mapeamento específico para baixa do Art. 270
  if (/(baixa.*art.*270|baixa.*artigo.*270|remover.*restricao.*270|art.*270)/.test(txt)) {
    return { key: 'baixa_art_270', service: SERVICES['baixa_art_270'] };
  }

  // Mapeamentos específicos para transferência
  if (/(transfer(.*)compra|passar.*carro|transferir.*veiculo|transferir.*carro|transfer.*veiculo|transfer.*carro)/.test(txt)) {
    return { key: 'transferencia_compra_venda', service: SERVICES['transferencia_compra_venda'] };
  }

  // Mapeamento específico para GNV
  if (/(inclus.*gnv|instalar.*gnv|regularizar.*gnv|incluir.*gnv|como.*gnv|gnv)/.test(txt)) {
    return { key: 'inclusao_gnv', service: SERVICES['inclusao_gnv'] };
  }

  // Mapeamento específico para baixa de sinistro
  if (/(baixa.*sinistro|sinistro.*media.*monta|regularizar.*sinistro|como.*fazer.*baixa.*sinistro|baixa.*media.*monta|sinistro)/.test(txt)) {
    return { key: 'baixa_sinistro', service: SERVICES['baixa_sinistro'] };
  }

  // Mapeamento específico para baixa definitiva de veículo
  if (/(baixa.*definitiva.*veiculo|como.*dar.*baixa.*definitiva|baixa.*permanente|baixa.*definitiva|como.*fazer.*baixa.*definitiva)/.test(txt)) {
    return { key: 'baixa_veiculo', service: SERVICES['baixa_veiculo'] };
  }

  // Mapeamento específico para autorização de condutor escolar
  if (/(autorizacao.*condutor.*escolar|condutor.*escolar|autorizar.*condutor.*escolar|documentos.*condutor.*escolar|condutor.*transporte.*escolar|como.*condutor.*escolar|habilitar.*condutor.*escolar|quais.*documentos.*condutor.*escolar)/.test(txt)) {
    return { key: 'autorizacao_condutor_escolar', service: SERVICES['autorizacao_condutor_escolar'] };
  }

  // Mapeamento específico para veículo transporte escolar
  if (/(veiculo.*transporte.*escolar|tornar.*transporte.*escolar|regularizar.*veiculo.*escolar|transformar.*transporte.*escolar|como.*veiculo.*escolar|documentos.*veiculo.*escolar|adaptar.*transporte.*escolar|habilitar.*veiculo.*escolar|veiculo.*se.*tornar.*escolar|se.*tornar.*transporte.*escolar|veiculo.*virar.*escolar)/.test(txt)) {
    return { key: 'transporte_escolar_veiculo', service: SERVICES['transporte_escolar_veiculo'] };
  }

  // Mapeamento específico para alteração de carroceria
  if (/(alterar.*carroceria|alteracao.*carroceria|mudar.*carroceria|como.*alterar.*carroceria|documentos.*carroceria)/.test(txt)) {
    return { key: 'alteracao_carroceria', service: SERVICES['alteracao_carroceria'] };
  }

  // Mapeamento específico para alteração de motor
  if (/(alterar.*motor|alteracao.*motor|trocar.*motor|troca.*motor|como.*alterar.*motor|documentos.*motor|motor.*substituido|nota.*motor)/.test(txt)) {
    return { key: 'alteracao_motor', service: SERVICES['alteracao_motor'] };
  }

  if (/(placa.*mercosul)/.test(txt)) {
    return { key: 'placa_mercosul', service: SERVICES['placa_mercosul'] };
  }

  return null;
}

/**
 * Resposta padrão quando não há match claro.
 */
function fallback(message: string): string {
  return [
    `### 🔍 Atendimento Profissional - Lívia`,
    ``,
    `Olá! Sou a **Lívia**, sua atendente especializada do Despachante Beto Dehon.`,
    ``,
    `**Para te ajudar melhor, preciso de mais detalhes:**`,
    ``,
    `📋 **Se é sobre documentação veicular:**`,
    `• Informe o tipo de serviço (transferência, licenciamento, etc.)`,
    `• Tipo do veículo (carro, moto, caminhão)`,
    `• Documentos que já possui`,
    ``,
    `🚨 **Se é sobre multas:**`,
    `• Informe se deseja parcelar ou recorrer`,
    `• Órgão autuador (DETRAN, PRF, Municipal)`,
    ``,
    `📞 **Atendimento direto:**`,
    `WhatsApp: **(48) 3255-0606**`,
    ``,
    `*Todas as orientações seguem rigorosamente o Manual DETRAN/SC 2024.*`,
  ].join('\n');
}

/**
 * Gera a resposta baseada na mensagem.
 */
function generateAnswer(message: string): string {
  const found = findServiceFromMessage(message);

  if (found?.key === 'parcelar_multa') return answerParcelarMulta();
  if (found?.key === 'lei_multas') return answerLeiMultas();
  if (found?.key === 'lei_transferencia') return answerLeiTransferencia();
  if (found?.key === 'lei_ipva') return answerLeiIPVA();
  if (found?.key === 'lei_licenciamento') return answerLeiLicenciamento();

  if (found && found.service) {
    const { aliases, descricao, documentos, importantes } = found.service;
    // Usa o primeiro alias como título principal
    const titulo = aliases[0]
      .replace(/\b\w/g, (m: string) => m.toUpperCase()) // capitalize
      .replace(/\s+/g, ' ')
      .trim();

    return formatResponse(titulo, descricao, documentos, importantes);
  }

  // Se o texto bater exatamente com um título dado por você (ex: botão usa texto exato)
  const directKey = Object.keys(SERVICES).find((k) =>
    SERVICES[k].aliases.some((a) => a.toLowerCase() === message.toLowerCase().trim()),
  );
  if (directKey) {
    const s = SERVICES[directKey];
    return formatResponse(s.aliases[0], s.descricao, s.documentos, s.importantes);
  }

  return fallback(message);
}

/**
 * Handler Next.js API
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Garantir Content-Type JSON
  res.setHeader('Content-Type', 'application/json');

  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Informe "message" (string) no corpo da requisição.' });
    }

    const response = generateAnswer(message);
    return res.status(200).json({ response });
  } catch (err) {
    console.error('API /api/ia error:', err);
    return res.status(500).json({ error: 'Erro interno ao processar a solicitação.' });
  } finally {
    if (!res.headersSent) {
      res.status(500).json({ 
        response: '',
        error: 'Resposta não enviada' 
      });
    }
  }
}
