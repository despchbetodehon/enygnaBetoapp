import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/logic/firebase/config/app';
import ListPost from './ListPost';

const Produtoset: React.FC = () => {
  const [codigo, setCodigo] = useState('');
  const [acessoLiberado, setAcessoLiberado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const salvo = localStorage.getItem('codigoAcesso');
    if (salvo) {
      setCodigo(salvo);
      verificarCodigo(salvo);
    }
  }, []);

  const verificarCodigo = async (codigoInput: string) => {
    setCarregando(true);
    const querySnapshot = await getDocs(collection(db, 'CodigosDeAcesso'));
    const agora = new Date();

    const valido = querySnapshot.docs.some(doc => {
      const data = doc.data();
      const expira = data.expiraEm?.toDate?.();
      return (
        data.codigo === codigoInput &&
        data.ativo &&
        (data.tipo === 'permanente' || (expira && expira > agora))
      );
    });

    if (valido) {
      setAcessoLiberado(true);
      localStorage.setItem('codigoAcesso', codigoInput);
    } else {
      alert('🔒 Código inválido ou expirado.');
      localStorage.removeItem('codigoAcesso');
    }

    setCarregando(false);
  };

  const handleVerificar = () => {
    verificarCodigo(codigo);
  };

  const resetarAcesso = () => {
    setAcessoLiberado(false);
    localStorage.removeItem('codigoAcesso');
    setCodigo('');
  };

  // Permitir acesso público para adicionar requerimentos
  const usuario = null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      fontFamily: '"Playfair Display", serif',
      color: '#1a202c'
    }}>
      {/* A lógica de verificação de código foi removida para permitir acesso público */}
      <div style={{ width: '100%' }}>
        <ListPost setItems={() => {}} onItemEnviado={resetarAcesso} />
      </div>

      <style jsx>{`
        @keyframes logoPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Produtoset;