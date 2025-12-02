
export interface ProcessoUsuario {
  id: string;
  type: string;
  status: string;
  timestamp: any;
  email?: string;
  nome?: string;
  cpf?: string;
  cnpj?: string;
  [key: string]: any;
}

export interface EstatisticasUsuario {
  total: number;
  emAndamento: number;
  concluidos: number;
  pendentes: number;
}

export class ServicosUsuarioProcessos {
  
  /**
   * Busca todos os processos relacionados a um usuário
   * @param userIdentifiers Array com identificadores do usuário (email, nome, cpf, etc.)
   * @returns Promise<ProcessoUsuario[]>
   */
  static async buscarProcessosUsuario(userIdentifiers: string[]): Promise<ProcessoUsuario[]> {
    try {
      console.log('🔄 Buscando processos para identificadores:', userIdentifiers);
      
      const { getFirestore, collection, query, where, getDocs, or } = await import('firebase/firestore');
      const { app } = await import('@/logic/firebase/config/app');
      
      const db = getFirestore(app);
      const allProcesses: ProcessoUsuario[] = [];
      
      // Configuração das coleções e campos de busca
      const collections = [
        {
          name: 'requerimentos',
          searchFields: [
            'email', 'nomevendedor', 'nomecomprador', 'emailvendedor', 'emailcomprador',
            'cpfvendedor', 'cpfcomprador', 'cnpjvendedor', 'cnpjcomprador'
          ]
        },
        {
          name: 'transferencias',
          searchFields: [
            'email', 'nomevendedor', 'nomecomprador', 'emailvendedor', 'emailcomprador',
            'cpfvendedor', 'cpfcomprador', 'cnpjvendedor', 'cnpjcomprador'
          ]
        },
        {
          name: 'anuencias',
          searchFields: [
            'email', 'nomesocio1', 'nomesocio2', 'nomesocio3', 'emailempresa',
            'cpfsocio1', 'cpfsocio2', 'cpfsocio3', 'cnpjempresa'
          ]
        },
        {
          name: 'requerimentosdigitais',
          searchFields: [
            'email', 'nomevendedor', 'nomecomprador', 'emailvendedor', 'emailcomprador',
            'cpfvendedor', 'cpfcomprador', 'cnpjvendedor', 'cnpjcomprador'
          ]
        }
      ];

      // Buscar em cada coleção
      for (const col of collections) {
        await this.searchInCollection(db, col.name, col.searchFields, userIdentifiers, allProcesses);
      }

      // Remover duplicatas baseado no ID e tipo
      const uniqueProcesses = allProcesses.filter((process, index, self) =>
        index === self.findIndex((p) => p.id === process.id && p.type === process.type)
      );

      // Ordenar por data mais recente
      uniqueProcesses.sort((a, b) => {
        const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0);
        const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0);
        return dateB.getTime() - dateA.getTime();
      });

      console.log('✅ Total de processos únicos encontrados:', uniqueProcesses.length);
      return uniqueProcesses;

    } catch (error) {
      console.error('❌ Erro ao buscar processos do usuário:', error);
      return [];
    }
  }

  /**
   * Busca em uma coleção específica
   */
  private static async searchInCollection(
    db: any,
    collectionName: string,
    searchFields: string[],
    userIdentifiers: string[],
    allProcesses: ProcessoUsuario[]
  ): Promise<void> {
    try {
      const { collection, query, where, getDocs, or } = await import('firebase/firestore');
      
      const collectionRef = collection(db, collectionName);
      
      // Criar queries para diferentes campos e identificadores
      const whereConditions = [];
      
      for (const field of searchFields) {
        for (const identifier of userIdentifiers) {
          if (identifier && identifier.trim()) {
            whereConditions.push(where(field, '==', identifier.trim()));
          }
        }
      }
      
      if (whereConditions.length === 0) return;
      
      // Firebase permite no máximo 10 condições em uma query OR
      const chunkedConditions = [];
      for (let i = 0; i < whereConditions.length; i += 10) {
        chunkedConditions.push(whereConditions.slice(i, i + 10));
      }
      
      for (const conditionChunk of chunkedConditions) {
        try {
          let q;
          if (conditionChunk.length === 1) {
            q = query(collectionRef, conditionChunk[0]);
          } else {
            q = query(collectionRef, or(...conditionChunk));
          }
          
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            allProcesses.push({
              id: doc.id,
              type: collectionName,
              ...doc.data(),
              timestamp: doc.data().timestamp || new Date()
            } as ProcessoUsuario);
          });
          
        } catch (queryError) {
          console.warn(`Erro na query para ${collectionName}:`, queryError);
          // Continua com as próximas queries mesmo se uma falhar
        }
      }
      
      console.log(`📊 ${collectionName}: ${allProcesses.filter(p => p.type === collectionName).length} processos encontrados`);
      
    } catch (error) {
      console.error(`❌ Erro ao buscar na coleção ${collectionName}:`, error);
    }
  }

  /**
   * Calcula estatísticas dos processos
   */
  static calcularEstatisticas(processos: ProcessoUsuario[]): EstatisticasUsuario {
    return {
      total: processos.length,
      emAndamento: processos.filter(p => 
        p.status === 'Em Andamento' || 
        p.status === 'Processando' || 
        p.status === 'Aguardando' ||
        p.status === 'Análise'
      ).length,
      concluidos: processos.filter(p => 
        p.status === 'Concluído' || 
        p.status === 'Finalizado' || 
        p.status === 'Aprovado' ||
        p.status === 'Completed'
      ).length,
      pendentes: processos.filter(p => 
        p.status === 'Pendente' || 
        p.status === 'Aguardando Documentos' || 
        p.status === 'Revisão' ||
        p.status === 'Pending' ||
        !p.status
      ).length
    };
  }

  /**
   * Extrai identificadores únicos do usuário
   */
  static extrairIdentificadoresUsuario(usuario: any): string[] {
    if (!usuario) return [];
    
    const identificadores = [
      usuario.email,
      usuario.nome,
      usuario.id,
      usuario.uid,
      usuario.cpf,
      usuario.cnpj,
      // Remover caracteres especiais dos documentos
      usuario.cpf?.replace(/\D/g, ''),
      usuario.cnpj?.replace(/\D/g, ''),
    ].filter(Boolean);
    
    // Remover duplicatas
    return Array.from(new Set(identificadores));
  }
}
