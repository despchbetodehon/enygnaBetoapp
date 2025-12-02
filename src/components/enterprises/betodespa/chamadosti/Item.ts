
import { Timestamp } from 'firebase/firestore';

export default interface ChamadoTI {
  id: string;
  assunto: string;
  descricao: string;
  status: 'aberto' | 'em_andamento' | 'concluido';
  prioridade: 'baixa' | 'media' | 'alta';
  usuarioId: string;
  usuarioNome: string;
  imagemUrls: string[];
  mensagens: MensagemChamado[];
  dataCriacao: Timestamp;
  dataAtualizacao?: Timestamp;
}

export interface MensagemChamado {
  id: string;
  texto: string;
  usuarioId: string;
  usuarioNome: string;
  timestamp: Timestamp;
  imagemUrl?: string;
}
