// utils/debounce.ts
import { debounce as lodashDebounce } from 'lodash';

/**
 * Encapsula o debounce do Lodash para uso consistente no projeto.
 * @param func - Função a ser debounced
 * @param wait - Tempo de espera em milissegundos
 * @returns Uma nova função com debounce aplicado
 */
export default function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  return lodashDebounce(func, wait);
}
