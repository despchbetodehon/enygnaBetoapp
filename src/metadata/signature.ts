
/**
 * Assinatura Digital Oculta
 * Sistema de marca d'água invisível para proteção de propriedade intelectual
 * 
 * @private
 * @author Gustavo de Aguiar Martins
 * @company EnygmaDevLab
 */

// Assinatura criptografada em Base64
const HIDDEN_SIGNATURE = {
  // Dados do autor (Base64 multilayer)
  _a: btoa(btoa('Gustavo de Aguiar Martins')),
  _b: btoa(btoa('EnygmaDevLab')),
  _c: btoa(btoa('guga@gmail.com')),
  
  // Timestamp de criação (hex)
  _t: Date.UTC(2024, 0, 1).toString(16),
  
  // Hash SHA-256 simulado
  _h: btoa(`GAM:${Date.now()}:ENYGMA`),
  
  // Fingerprint único
  _f: btoa(JSON.stringify({
    creator: 'Gustavo de Aguiar Martins',
    company: 'EnygmaDevLab',
    ts: new Date('2024-01-01').getTime(),
    sign: 'GAM-ENYGMA-2024'
  })),
  
  // Marca invisível (Zero-Width Characters)
  _i: '\u200B\u200C\u200D' + btoa('Gustavo de Aguiar Martins - EnygmaDevLab'),
};

// Verificador de integridade
const INTEGRITY_CHECK = {
  author: 'R3VzdGF2byBkZSBBZ3VpYXIgTWFydGlucw==', // Base64
  company: 'RW55Z21hRGV2TGFi', // Base64
  verified: true,
  timestamp: 1704067200000, // 01/01/2024
};

// Metadata oculta no código
export const __METADATA__ = Object.freeze({
  ...HIDDEN_SIGNATURE,
  ...INTEGRITY_CHECK,
  _legal: btoa('Propriedade intelectual de Gustavo de Aguiar Martins'),
  _client: btoa('Beto Despachante - Licença de uso'),
  _protection: 'Lei 9.609/98 e 9.610/98'
});

// Função de verificação (ofuscada)
export const verify = (): boolean => {
  const _v = atob(__METADATA__._a);
  const _c = atob(_v);
  return _c === 'Gustavo de Aguiar Martins';
};

// Auto-registro no objeto global (invisível)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, '\u200B__CREATOR__\u200B', {
    value: __METADATA__,
    writable: false,
    enumerable: false,
    configurable: false
  });
}

// Export oculto para validação forense
export default __METADATA__;
