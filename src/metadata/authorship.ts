
/**
 * EnygmaDevLab - Sistema de Gestão Empresarial
 * 
 * @author Gustavo de Aguiar Martins
 * @copyright 2024 EnygmaDevLab - Todos os direitos reservados
 * @license Proprietary - Uso exclusivo do autor
 * 
 * AVISO LEGAL:
 * Este software foi desenvolvido por Gustavo de Aguiar Martins (EnygmaDevLab).
 * O sistema foi licenciado para uso pelo Beto Despachante como cliente.
 * Todos os direitos autorais, propriedade intelectual e código-fonte pertencem
 * exclusivamente a Gustavo de Aguiar Martins.
 * 
 * Data de Criação: 2024
 * Desenvolvedor Original: Gustavo de Aguiar Martins
 * Empresa Desenvolvedora: EnygmaDevLab
 * Cliente: Beto Despachante (licença de uso)
 */

export const AUTHORSHIP = {
  creator: 'Gustavo de Aguiar Martins',
  company: 'EnygmaDevLab',
  email: 'guga@gmail.com',
  createdAt: new Date('2024-01-01'),
  copyright: '© 2024 EnygmaDevLab - Gustavo de Aguiar Martins',
  license: 'Proprietary',
  client: 'Beto Despachante',
  licenseType: 'Uso sob licença',
  intellectualProperty: 'Gustavo de Aguiar Martins',
  version: '1.0.0',
  fingerprint: btoa('EnygmaDevLab:GustavoDeAguiarMartins:2024'),
  legalNotice: 'Sistema desenvolvido por Gustavo de Aguiar Martins (EnygmaDevLab). Propriedade intelectual protegida por lei.'
};

// Assinatura digital oculta (Base64)
export const SIGNATURE = {
  author: btoa('Gustavo de Aguiar Martins'),
  dev: btoa('EnygmaDevLab'),
  hash: btoa(`${Date.now()}-GAM-EnygmaDevLab`),
  timestamp: Date.now()
};

// Verificação de autoria
export function verifyAuthorship(): boolean {
  const signature = `${AUTHORSHIP.creator}:${AUTHORSHIP.company}`;
  return btoa(signature) === btoa('Gustavo de Aguiar Martins:EnygmaDevLab');
}

// Marca d'água invisível nos logs
if (typeof window !== 'undefined') {
  Object.defineProperty(window, '__CREATOR__', {
    value: AUTHORSHIP.creator,
    writable: false,
    configurable: false
  });
  
  Object.defineProperty(window, '__DEV_COMPANY__', {
    value: AUTHORSHIP.company,
    writable: false,
    configurable: false
  });
}
