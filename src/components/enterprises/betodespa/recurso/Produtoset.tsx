import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/logic/firebase/config/app';
import ListPost from './ListPost';

const Produtoset: React.FC = () => {
  const [codigo, setCodigo] = useState('');
  const [acessoLiberado, setAcessoLiberado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [modeloSelecionado, setModeloSelecionado] = useState<1 | 2>(1);

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
      {!acessoLiberado ? (
        <div style={{
          background: '#f8f9f7',
          border: '1px solid #e0e0e0',
          borderRadius: 20,
          padding: '40px 32px 32px',
          textAlign: 'center',
          boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
          animation: 'fadeIn 0.8s ease-in-out',
          width: '100%',
          maxWidth: 400,
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            position: 'absolute',
            top: -45,
            left: 0,
            right: 0
          }}>
            <img src="/betologo.jpg" alt="Logo" style={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              border: '3px solid #2d5a3d',
              background: '#fff',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              animation: 'logoPulse 2s infinite'
            }} />
          </div>

          <div style={{ paddingTop: 60 }}>
            <h2 style={{ marginBottom: 24, color: '#2d5a3d' }}>🔐 Código de Acesso</h2>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="EX: A7B2C9D8"
              style={{
                width: '100%',
                padding: 14,
                fontSize: 18,
                borderRadius: 12,
                border: '1px solid #ccc',
                outline: 'none',
                background: '#fff',
                color: '#1a202c',
                fontWeight: 'bold',
                letterSpacing: 2,
                marginBottom: 20
              }}
            />
            <button
              onClick={handleVerificar}
              disabled={carregando}
              style={{
                padding: '12px 24px',
                fontSize: 16,
                fontWeight: 700,
                borderRadius: 12,
                background: 'linear-gradient(90deg, #2d5a3d, #4a7c59)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 6px 14px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease'
              }}
            >
              {carregando ? 'Verificando...' : 'Acessar'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ width: '100%' }}>
          {/* Abas de Seleção de Modelo */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            marginBottom: 24,
            padding: '0 16px'
          }}>
            <button
              onClick={() => setModeloSelecionado(1)}
              style={{
                padding: '12px 32px',
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 12,
                background: modeloSelecionado === 1 
                  ? 'linear-gradient(90deg, #2d5a3d, #4a7c59)' 
                  : '#f0f0f0',
                color: modeloSelecionado === 1 ? '#fff' : '#666',
                border: modeloSelecionado === 1 ? 'none' : '2px solid #ddd',
                cursor: 'pointer',
                boxShadow: modeloSelecionado === 1 
                  ? '0 4px 12px rgba(45, 90, 61, 0.3)' 
                  : 'none',
                transition: 'all 0.3s ease',
                transform: modeloSelecionado === 1 ? 'translateY(-2px)' : 'none'
              }}
            >
              📄 Recurso de Multa
            </button>
            <button
              onClick={() => setModeloSelecionado(2)}
              style={{
                padding: '12px 32px',
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 12,
                background: modeloSelecionado === 2 
                  ? 'linear-gradient(90deg, #2d5a3d, #4a7c59)' 
                  : '#f0f0f0',
                color: modeloSelecionado === 2 ? '#fff' : '#666',
                border: modeloSelecionado === 2 ? 'none' : '2px solid #ddd',
                cursor: 'pointer',
                boxShadow: modeloSelecionado === 2 
                  ? '0 4px 12px rgba(45, 90, 61, 0.3)' 
                  : 'none',
                transition: 'all 0.3s ease',
                transform: modeloSelecionado === 2 ? 'translateY(-2px)' : 'none'
              }}
            >
              📋 Recurso Administrativo
            </button>
          </div>

          <ListPost 
            setItems={() => {}} 
            onItemEnviado={resetarAcesso}
            modeloRecurso={modeloSelecionado}
          />
        </div>
      )}

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
