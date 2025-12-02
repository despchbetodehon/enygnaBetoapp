
import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  List,
  ListItem,
  Avatar,
  Chip,
  LinearProgress,
} from '@material-ui/core';
import { Collapse } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  LocationOn,
  Schedule,
  
  ExpandMore,
  ExpandLess,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(2),
    borderRadius: '12px',
    height: '500px',
    overflow: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  listItem: {
    background: '#f9fafb',
    borderRadius: '8px',
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1.5),
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
  },
  avatar: {
    width: 36,
    height: 36,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  estrategia: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#fff',
    padding: theme.spacing(2),
    borderRadius: '8px',
    marginTop: theme.spacing(1),
  },
  metrica: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.85rem',
  },
}));

interface CidadeAnalise {
  nome: string;
  documentos: number;
  receita: number;
  horaPico: string;
  tendencia: 'up' | 'down' | 'stable';
  crescimento: number;
  potencialMarketing: number;
}

interface ListaFluxoCidadesProps {
  cidades: CidadeAnalise[];
  onGerarEstrategia: (cidade: string) => Promise<string>;
}

const ListaFluxoCidades: React.FC<ListaFluxoCidadesProps> = ({ cidades, onGerarEstrategia }) => {
  const classes = useStyles();
  const [expandido, setExpandido] = useState<string | null>(null);
  const [estrategias, setEstrategias] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState<Record<string, boolean>>({});

  const handleExpand = async (cidadeNome: string) => {
    if (expandido === cidadeNome) {
      setExpandido(null);
    } else {
      setExpandido(cidadeNome);
      
      // Se não tem estratégia ainda, gera
      if (!estrategias[cidadeNome]) {
        setCarregando({ ...carregando, [cidadeNome]: true });
        const estrategia = await onGerarEstrategia(cidadeNome);
        setEstrategias({ ...estrategias, [cidadeNome]: estrategia });
        setCarregando({ ...carregando, [cidadeNome]: false });
      }
    }
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'up':
        return <TrendingUp style={{ color: '#4caf50' }} />;
      case 'down':
        return <TrendingDown style={{ color: '#f44336' }} />;
      default:
        return <TrendingFlat style={{ color: '#ff9800' }} />;
    }
  };

  return (
    <Card className={classes.card}>
      <Box className={classes.header}>
        <Typography variant="h6" style={{ fontWeight: 'bold' }}>
          <LocationOn style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          Análise de Marketing por Cidade
        </Typography>
        <Chip label={`${cidades.length} cidades`} color="primary" size="small" />
      </Box>

      <List>
        {cidades.map((cidade, index) => (
          <div key={cidade.nome}>
            <ListItem className={classes.listItem} onClick={() => handleExpand(cidade.nome)}>
              <Box display="flex" alignItems="center" width="100%" style={{ gap: '16px' }}>
                <Avatar className={classes.avatar}>{index + 1}</Avatar>
                
                <Box flex={1}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                      {cidade.nome}
                    </Typography>
                    {getTendenciaIcon(cidade.tendencia)}
                  </Box>

                  <Box display="flex" style={{ gap: '16px' }} mb={1} flexWrap="wrap">
                    <Typography variant="caption" className={classes.metrica}>
                      📊 {cidade.documentos} docs
                    </Typography>
                    <Typography variant="caption" className={classes.metrica}>
                      💰 R$ {cidade.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="caption" className={classes.metrica}>
                      <Schedule style={{ fontSize: 14 }} /> Pico: {cidade.horaPico}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" style={{ color: '#666', fontWeight: 600 }}>
                      Potencial: {cidade.potencialMarketing}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={cidade.potencialMarketing}
                      style={{ height: 8, borderRadius: 4, marginTop: 4 }}
                    />
                  </Box>
                </Box>

                <Box>
                  {expandido === cidade.nome ? <ExpandLess /> : <ExpandMore />}
                </Box>
              </Box>
            </ListItem>

            <Collapse in={expandido === cidade.nome} timeout="auto" unmountOnExit>
              <Box className={classes.estrategia} ml={2} mr={2} mb={2}>
                <Typography variant="subtitle2" style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                  🎯 Estratégia de Marketing - {cidade.nome}
                </Typography>
                {carregando[cidade.nome] ? (
                  <Typography variant="body2">Gerando estratégia personalizada com IA...</Typography>
                ) : (
                  <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                    {estrategias[cidade.nome] || 'Clique para gerar estratégia'}
                  </Typography>
                )}
              </Box>
            </Collapse>
          </div>
        ))}
      </List>
    </Card>
  );
};

export default ListaFluxoCidades;
