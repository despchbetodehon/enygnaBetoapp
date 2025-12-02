import { Timestamp } from 'firebase/firestore';

export function converterParaSGDW(item: any) {
  // Usar nome do vendedor como fallback se o solicitante não estiver preenchido
  const nomeOrigem = item.nomeempresa?.trim() || item.nomevendedor?.trim() || 'NÃO INFORMADO';
  const origemcpfcnpj = item.cnpjempresa?.replace(/\D/g, '') || item.cpfvendedor?.replace(/\D/g, '') || '';

  console.log('🔄 Convertendo para SGDW:', {
    origem: nomeOrigem,
    origemcpfCnpj: origemcpfcnpj
  });

  // Validar origem obrigatória
  const origem = nomeOrigem;
  if (!origem || origem === 'NÃO INFORMADO') {
    console.warn('⚠️ Nome do solicitante não informado, usando fallback');
  }

  return {
    placa: item.id?.trim() || '',
    renav: item.renavam?.trim() || '',
    chassi: '', // Se disponível
    valorNF: item.valordevenda?.trim() || '',
    cliente: {
      cpf: item.cpfvendedor?.replace(/\D/g, '') || '',
      nome: item.nomevendedor?.trim() || '',
      email: item.emailvendedor?.trim() || '',
      telefone: item.celtelvendedor?.replace(/\D/g, '') || '',
      endereco: {
        cep: item.cepvendedor?.replace(/\D/g, '') || '',
        logradouro: item.enderecovendedor?.trim() || '',
        numero: '', // Se disponível separadamente
        bairro: '', // Se disponível
        municipio: item.municipiovendedor?.trim() || '',
        uf: item.complementovendedor?.trim() || ''
      }
    },
    comprador: {
      cpf: item.cpfcomprador?.replace(/\D/g, '') || '',
      nome: item.nomecomprador?.trim() || '',
      email: item.emailcomprador?.trim() || '',
      telefone: item.celtelcomprador?.replace(/\D/g, '') || '',
      endereco: {
        cep: item.cepcomprador?.replace(/\D/g, '') || '',
        logradouro: item.enderecocomprador?.trim() || '',
        numero: '', // Se disponível separadamente
        bairro: item.bairrocomprador?.trim() || '',
        municipio: item.municipiocomprador?.trim() || '',
        uf: item.complementocomprador?.trim() || ''
      }
    },
    origem: origem,
    origemcpfCnpj: origemcpfcnpj,
    servico: item.produtosSelecionados?.trim() || '',
    dataSolicitacao: (() => {
      let utcDate: Date;
      
      if (item.dataCriacao instanceof Timestamp) {
        utcDate = item.dataCriacao.toDate();
      } else {
        utcDate = new Date();
      }
      
      // Converter UTC para horário de Brasília (UTC-3)
      // Subtrair 3 horas do horário UTC
      const brasiliaDate = new Date(utcDate.getTime() - 3 * 3600000);
      
      return brasiliaDate.toISOString();
    })(),
    status: item.status?.toLowerCase() === 'concluído' ? 1 : 0
  };
};
