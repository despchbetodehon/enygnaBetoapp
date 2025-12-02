import React from 'react';
import Produto from '@/components/enterprises/betodespa/procuracao/Produtoset';
import Forcaautenticacao from '@/components/autenticacao/ForcarAutenticacao'





const PageProduto: React.FC = () => {
  return (
    <>
      <Forcaautenticacao>
        <Produto />
      </Forcaautenticacao>
    </>
  );
};

export default PageProduto;