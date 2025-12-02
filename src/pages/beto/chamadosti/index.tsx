
import React from 'react';
import ForcarAutenticacao from '@/components/autenticacao/ForcarAutenticacao';
import ListaChamados from '@/components/enterprises/betodespa/chamadosti/ListaChamados';
import useAutenticacao from '@/data/hooks/useAutenticacao';

const ChamadosTIPage: React.FC = () => {
  const { usuario } = useAutenticacao();

  return (
    <ForcarAutenticacao>
      <ListaChamados
        usuarioId={usuario?.id || ''}
        usuarioNome={usuario?.nome || 'Usuário'}
      />
    </ForcarAutenticacao>
  );
};

export default ChamadosTIPage;
