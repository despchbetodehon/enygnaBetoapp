
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // em milissegundos
}

class APICache {
  private cache: Map<string, CacheEntry<any>>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.cache = new Map();
    this.cleanupInterval = null;
    this.startCleanup();
  }

  /**
   * Armazena dados no cache
   * @param key Chave única (ex: cpf:12345678900)
   * @param data Dados a serem armazenados
   * @param expiresIn Tempo de expiração em milissegundos (padrão: 24 horas)
   */
  set<T>(key: string, data: T, expiresIn: number = 24 * 60 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    });
  }

  /**
   * Recupera dados do cache
   * @param key Chave única
   * @returns Dados armazenados ou null se não existir/expirado
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = (now - entry.timestamp) > entry.expiresIn;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Verifica se uma chave existe e está válida
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove uma entrada específica do cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Limpa entradas expiradas automaticamente
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if ((now - entry.timestamp) > entry.expiresIn) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 Cache cleanup: ${keysToDelete.length} entradas expiradas removidas`);
    }
  }

  /**
   * Inicia limpeza automática a cada hora
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000); // 1 hora
  }

  /**
   * Para a limpeza automática
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    this.cache.forEach(entry => {
      if ((now - entry.timestamp) > entry.expiresIn) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    });

    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries
    };
  }
}

// Instância singleton do cache
export const apiCache = new APICache();

export default apiCache;
