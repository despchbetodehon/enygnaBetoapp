
/**
 * Utilitários de sanitização conforme LGPD
 */

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().replace(/[^\w\s@.-]/gi, '');
}

export function sanitizeCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

export function sanitizeCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

export function sanitizeTelefone(telefone: string): string {
  return telefone.replace(/\D/g, '');
}

export function sanitizeString(str: string): string {
  // Remove HTML tags e caracteres especiais perigosos
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[<>'"]/g, '')
    .trim();
}

export function anonimizarCPF(cpf: string): string {
  if (!cpf || cpf.length < 11) return '***.***.***-**';
  return `***.***.${cpf.substring(6, 9)}-**`;
}

export function anonimizarEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***.***';
  const [local, domain] = email.split('@');
  const localAnonimo = local.substring(0, 2) + '***';
  return `${localAnonimo}@${domain}`;
}

export function anonimizarTelefone(telefone: string): string {
  if (!telefone || telefone.length < 8) return '(**) ****-****';
  const clean = telefone.replace(/\D/g, '');
  return `(**) ****-${clean.substring(clean.length - 4)}`;
}

// Validação de dados conforme LGPD
export function validarConsentimento(usuario: any): boolean {
  return !!(
    usuario.consentimentoLGPD &&
    usuario.dataConsentimento &&
    usuario.aceitouTermos
  );
}
