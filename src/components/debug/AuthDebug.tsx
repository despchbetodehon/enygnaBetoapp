
import React, { useContext } from 'react';
import { Card, CardContent, Typography, Chip } from '@material-ui/core';
import AutenticacaoContext from '@/data/contexts/AutenticacaoContext';

const AuthDebug: React.FC = () => {
  const { usuario, carregando, estaAutenticado } = useContext(AutenticacaoContext);

  return (
    <Card style={{ margin: 16, backgroundColor: '#f5f5f5' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🐛 Debug - Estado da Autenticação
        </Typography>
        
        <div style={{ marginBottom: 8 }}>
          <Chip 
            label={`Carregando: ${carregando ? 'SIM' : 'NÃO'}`}
            color={carregando ? 'secondary' : 'default'}
            size="small"
            style={{ marginRight: 8 }}
          />
          
          <Chip 
            label={`Autenticado: ${estaAutenticado() ? 'SIM' : 'NÃO'}`}
            color={estaAutenticado() ? 'primary' : 'secondary'}
            size="small"
            style={{ marginRight: 8 }}
          />
        </div>

        {usuario && (
          <div>
            <Typography variant="body2">
              <strong>Email:</strong> {usuario.email}
            </Typography>
            <Typography variant="body2">
              <strong>Nome:</strong> {usuario.nome}
            </Typography>
            <Typography variant="body2">
              <strong>Permissão:</strong> {usuario.permissao || 'Não definida'}
            </Typography>
            <Typography variant="body2">
              <strong>UID:</strong> {usuario.uid || 'Não definido'}
            </Typography>
            <Typography variant="body2">
              <strong>Ativo:</strong> {usuario.ativo ? 'Sim' : 'Não'}
            </Typography>
          </div>
        )}
        
        <div style={{ marginTop: 16 }}>
          <Typography variant="body2">
            <strong>localStorage - Manter Conectado:</strong> {typeof window !== 'undefined' ? (localStorage.getItem('manterConectado') || 'Não') : 'N/A (SSR)'}
          </Typography>
          <Typography variant="body2">
            <strong>localStorage - Usuário Salvo:</strong> {typeof window !== 'undefined' ? (localStorage.getItem('usuarioAutenticado') ? 'Sim' : 'Não') : 'N/A (SSR)'}
          </Typography>
          {typeof window !== 'undefined' && localStorage.getItem('usuarioAutenticado') && (
            <Typography variant="body2" style={{ fontSize: '0.75rem' }}>
              <strong>Dados Salvos:</strong> {JSON.stringify(JSON.parse(localStorage.getItem('usuarioAutenticado') || '{}'), null, 2)}
            </Typography>
          )}
        </div>

        {!usuario && (
          <Typography variant="body2" color="textSecondary">
            Nenhum usuário logado
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthDebug;
