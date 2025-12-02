import { motion, Variants } from 'framer-motion';
import Transacao from '@/logic/core/financas/Transacao';
import Data from '@/logic/utils/Data';
import Dinheiro from '@/logic/utils/Dinheiro';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';

interface ListaProps {
  transacoes: Transacao[];
  selecionarTransacao?: (transacao: Transacao) => void;
}

const itemVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const Lista: React.FC<ListaProps> = (props) => {
  function renderizarTipo(transacao: Transacao) {
    return (
      <span
        className={`
          flex justify-center items-center 
          h-8 w-8 sm:w-10 sm:h-10 p-1.5 rounded-full
          ${transacao.tipo === 'receita' ? 'bg-green-500' : 'bg-red-500'}
        `}
      >
        {transacao.tipo === 'receita' ? <IconTrendingUp /> : <IconTrendingDown />}
      </span>
    );
  }

  function renderizarLinha(transacao: Transacao, indice: number) {
    return (
      <motion.div
        key={transacao.id}
        variants={itemVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={`
          flex items-center gap-3 p-3 cursor-pointer
          ${indice % 2 === 0 ? 'bg-zinc-500' : 'bg-zinc-800'}
        `}
        onClick={() => props.selecionarTransacao?.(transacao)}
      >
        {renderizarTipo(transacao)}
        <span className="w-full md:w-1/2">{transacao.descricao}</span>
        <span className="hidden md:inline flex-1">
          {Data.ddmmyy.formatar(transacao.data)}
        </span>
        <span>{Dinheiro.formatar(transacao.valor)}</span>
      </motion.div>
    );
  }

  return (
    <div
      className={`
        flex flex-col border border-zinc-700
        rounded-xl overflow-hidden
      `}
    >
      {props.transacoes.map(renderizarLinha)}
    </div>
  );
};

export default Lista;
