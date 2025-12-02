
/**
 * Formata CPF/CNPJ para exibição com pontos e traços
 */
export function formatCpfCnpjParaImpressao(valor: string | undefined): string {
  if (!valor) return ''
  
  const nums = valor.replace(/\D/g, '')
  
  if (nums.length === 11) {
    // CPF: 999.999.999-99
    return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  } else if (nums.length === 14) {
    // CNPJ: 99.999.999/9999-99
    return nums.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  
  return valor
}

/**
 * Formata CEP para exibição
 */
export function formatCepParaImpressao(valor: string | undefined): string {
  if (!valor) return ''
  
  const nums = valor.replace(/\D/g, '')
  
  if (nums.length === 8) {
    return nums.replace(/(\d{5})(\d{3})/, '$1-$2')
  }
  
  return valor
}

/**
 * Formata telefone para exibição
 */
export function formatTelefoneParaImpressao(valor: string | undefined): string {
  if (!valor) return ''
  
  const nums = valor.replace(/\D/g, '')
  
  if (nums.length === 11) {
    // Celular: (99) 99999-9999
    return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (nums.length === 10) {
    // Fixo: (99) 9999-9999
    return nums.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  
  return valor
}
