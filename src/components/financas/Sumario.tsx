import { TipoTransacao } from '@/logic/core/financas/TipoTransacao';
import Transacao from '@/logic/core/financas/Transacao';
import Dinheiro from '@/logic/utils/Dinheiro';
import { IconArrowsDoubleSwNe, IconCash, IconCreditCard } from '@tabler/icons-react';
import SumarioItem from './SumarioItem';
import { motion } from 'framer-motion';

interface SumarioProps {
  transacoes: Transacao[];
  className?: string;
}

const Sumario: React.FC<SumarioProps> = (props) => {
  const totalizar = (total: number, transacao: Transacao) => total + transacao.valor;

  const receitas = props.transacoes
    .filter((transacao) => transacao.tipo === TipoTransacao.RECEITA)
    .reduce(totalizar, 0);

  const despesas = props.transacoes
    .filter((transacao) => transacao.tipo === TipoTransacao.DESPESA)
    .reduce(totalizar, 0);

  const total = receitas - despesas;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SumarioItem
          titulo="Receitas"
          valor={receitas}
          icone={<IconCash />}
          iconeClassName="text-green-500"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <SumarioItem
          titulo="Despesas"
          valor={despesas}
          icone={<IconCreditCard />}
          iconeClassName="text-red-500"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <SumarioItem
          titulo="Total"
          valor={total}
          icone={<IconArrowsDoubleSwNe />}
          iconeClassName="text-yellow-500"
          valorClassName={total > 0 ? 'text-green-500' : total < 0 ? 'text-red-500' : ''}
        />
      </motion.div>
    </div>
  );
};

export default Sumario;
