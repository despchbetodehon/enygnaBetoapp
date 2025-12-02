
'use client';

import { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, IconButton, Paper, Grid, Card, 
  CardContent, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, Tooltip
} from '@material-ui/core';
import { Delete, Edit, Search, Add, Visibility, VisibilityOff, FileCopy } from '@material-ui/icons';
import {
  collection, addDoc, getDocs, deleteDoc, doc, Timestamp, updateDoc
} from 'firebase/firestore';
import { db } from '@/logic/firebase/config/app';
import Forcaautenticacao from '@/components/autenticacao/ForcarAutenticacao';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '90vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: theme.spacing(3),
  },
  header: {
    textAlign: 'center',
    marginBottom: theme.spacing(3),
    '& h4': {
      fontWeight: 700,
      color: '#2d3748',
      fontSize: '1.5rem',
    }
  },
  controlPanel: {
    background: 'white',
    borderRadius: 12,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  codesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: theme.spacing(1),
  },
  codeCard: {
    background: 'white',
    borderRadius: 8,
    padding: theme.spacing(0.05),
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    transition: 'all 0.2s ease',
    border: '1px solid #e2e8f0',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      transform: 'translateY(-2px)',
    }
  },
  codeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  codeText: {
    fontSize: '0.75rem',
    fontWeight: 300,
    fontFamily: 'monospace',
    color: '#2d3748',
    letterSpacing: 1,
  },
  chip: {
    fontSize: '0.65rem',
    height: 20,
    fontWeight: 600,
  },
  chipTemp: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  chipPerm: {
    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
    color: 'white',
  },
  observacao: {
    fontSize: '0.8rem',
    color: '#718096',
    marginTop: theme.spacing(0.2),
    marginBottom: theme.spacing(1),
  },
  expiracao: {
    fontSize: '0.7rem',
    color: '#e53e3e',
    fontWeight: 500,
  },
  actions: {
    display: 'flex',
    gap: theme.spacing(0.5),
    justifyContent: 'flex-end',
  },
  iconBtn: {
    padding: 6,
    '&:hover': {
      background: '#f7fafc',
    }
  },
  searchBox: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 8,
    }
  },
  addButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontWeight: 600,
    padding: '8px 16px',
    borderRadius: 8,
    '&:hover': {
      background: 'linear-gradient(135deg, #5568d3 0%, #6a3f92 100%)',
    }
  },
  section: {
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#4a5568',
    marginBottom: theme.spacing(1),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing(4),
    color: '#a0aec0',
  }
}));

const gerarCodigoAleatorio = (length = 6) => {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
};

export default function DashboardCodigos() {
  const classes = useStyles();
  const [tipo, setTipo] = useState<'temporario' | 'permanente'>('temporario');
  const [codigoManual, setCodigoManual] = useState('');
  const [observacao, setObservacao] = useState('');
  const [codigos, setCodigos] = useState<any[]>([]);
  const [filtro, setFiltro] = useState('');
  const [editando, setEditando] = useState<any | null>(null);
  const [showCodes, setShowCodes] = useState(true);

  const carregarCodigos = async () => {
    const querySnapshot = await getDocs(collection(db, 'CodigosDeAcesso'));
    const agora = new Date();

    const ativos: any[] = [];
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const expira = data.expiraEm?.toDate?.();

      if (data.tipo === 'temporario' && expira && expira <= agora) {
        await deleteDoc(doc(db, 'CodigosDeAcesso', docSnap.id));
      } else {
        ativos.push({ firestoreId: docSnap.id, ...data });
      }
    }
    setCodigos(ativos);
  };

  useEffect(() => {
    carregarCodigos();
  }, []);

  const verificarDuplicado = (codigo: string) => {
    return codigos.some(c => c.codigo === codigo);
  };

  const adicionarCodigo = async (manual?: boolean) => {
    let codigo = manual ? codigoManual.toUpperCase() : gerarCodigoAleatorio();
    if (verificarDuplicado(codigo)) {
      alert('⚠️ Código já existe. Escolha outro.');
      return;
    }
    const dataExpiracao = tipo === 'temporario'
      ? Timestamp.fromDate(new Date(Date.now() + 3 * 60 * 60 * 1000))
      : null;

    await addDoc(collection(db, 'CodigosDeAcesso'), {
      codigo,
      tipo,
      observacao,
      criadoEm: Timestamp.now(),
      expiraEm: dataExpiracao,
      ativo: true,
    });

    setCodigoManual('');
    setObservacao('');
    carregarCodigos();
  };

  const excluirCodigo = async (id: string) => {
    if (confirm('Deseja excluir este código?')) {
      await deleteDoc(doc(db, 'CodigosDeAcesso', id));
      carregarCodigos();
    }
  };

  const salvarEdicao = async () => {
    if (editando) {
      await updateDoc(doc(db, 'CodigosDeAcesso', editando.firestoreId), { 
        observacao: editando.observacao 
      });
      setEditando(null);
      carregarCodigos();
    }
  };

  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    alert('Código copiado!');
  };

  const codigosFiltrados = codigos.filter(c =>
    c.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
    (c.observacao || '').toLowerCase().includes(filtro.toLowerCase())
  );

  const temporarios = codigosFiltrados.filter(c => c.tipo === 'temporario');
  const permanentes = codigosFiltrados.filter(c => c.tipo === 'permanente');

  return (
  <Forcaautenticacao>
      <Box className={classes.root}>
        <Box maxWidth={1400} margin="0 auto">
          {/* Header */}
          <Box className={classes.header}>
            <Typography variant="h4">🔐 Códigos de Acesso</Typography>
          </Box>

          {/* Painel de Controle */}
          <Paper className={classes.controlPanel}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={2}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as any)}
                  variant="outlined"
                  SelectProps={{ native: true }}
                >
                  <option value="temporario">Temporário (3h)</option>
                  <option value="permanente">Permanente</option>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={2}>
                <TextField
                  label="Código"
                  placeholder="Auto"
                  size="small"
                  value={codigoManual}
                  onChange={(e) => setCodigoManual(e.target.value)}
                  fullWidth
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Cliente/Observação"
                  size="small"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  fullWidth
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  variant="contained"
                  className={classes.addButton}
                  onClick={() => adicionarCodigo(!!codigoManual)}
                  startIcon={<Add />}
                >
                  Criar
                </Button>
              </Grid>

              <Grid item xs={12} sm={2}>
                <TextField
                  placeholder="🔍 Buscar..."
                  size="small"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  fullWidth
                  variant="outlined"
                  className={classes.searchBox}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Códigos Temporários */}
          {temporarios.length > 0 && (
            <Box className={classes.section}>
              <Typography className={classes.sectionTitle}>
                Temporários ({temporarios.length})
              </Typography>
              <Box className={classes.codesGrid}>
                {temporarios.map(c => (
                  <Card key={c.firestoreId} className={classes.codeCard}>
                    <Box className={classes.codeHeader}>
                      <Typography className={classes.codeText}>
                        {showCodes ? c.codigo : '••••••'}
                      </Typography>
                      <Chip 
                        label="3H" 
                        size="small" 
                        className={`${classes.chip} ${classes.chipTemp}`}
                      />
                    </Box>
                    
                    {c.observacao && (
                      <Typography className={classes.observacao}>
                        👤 {c.observacao}
                      </Typography>
                    )}
                    
                    <Typography className={classes.expiracao}>
                      ⏱ Expira: {c.expiraEm?.toDate?.().toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>

                    <Box className={classes.actions}>
                      <Tooltip title="Copiar código">
                        <IconButton 
                          className={classes.iconBtn}
                          onClick={() => copiarCodigo(c.codigo)}
                          size="small"
                        >
                          <FileCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton 
                          className={classes.iconBtn}
                          onClick={() => setEditando(c)}
                          size="small"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton 
                          className={classes.iconBtn}
                          onClick={() => excluirCodigo(c.firestoreId)}
                          size="small"
                        >
                          <Delete fontSize="small" color="error" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          {/* Códigos Permanentes */}
          {permanentes.length > 0 && (
            <Box className={classes.section}>
              <Typography className={classes.sectionTitle}>
                Permanentes ({permanentes.length})
              </Typography>
              <Box className={classes.codesGrid}>
                {permanentes.map(c => (
                  <Card key={c.firestoreId} className={classes.codeCard}>
                    <Box className={classes.codeHeader}>
                      <Typography className={classes.codeText}>
                        {showCodes ? c.codigo : '••••••'}
                      </Typography>
                      <Chip 
                        label="∞" 
                        size="small" 
                        className={`${classes.chip} ${classes.chipPerm}`}
                      />
                    </Box>
                    
                    {c.observacao && (
                      <Typography className={classes.observacao}>
                        👤 {c.observacao}
                      </Typography>
                    )}

                    <Box className={classes.actions}>
                      <Tooltip title="Copiar código">
                        <IconButton 
                          className={classes.iconBtn}
                          onClick={() => copiarCodigo(c.codigo)}
                          size="small"
                        >
                          <FileCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton 
                          className={classes.iconBtn}
                          onClick={() => setEditando(c)}
                          size="small"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton 
                          className={classes.iconBtn}
                          onClick={() => excluirCodigo(c.firestoreId)}
                          size="small"
                        >
                          <Delete fontSize="small" color="error" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          {codigosFiltrados.length === 0 && (
            <Box className={classes.emptyState}>
              <Typography variant="h6">Nenhum código encontrado</Typography>
            </Box>
          )}

          {/* Dialog de Edição */}
          <Dialog open={!!editando} onClose={() => setEditando(null)} maxWidth="xs" fullWidth>
            <DialogTitle>Editar Observação</DialogTitle>
            <DialogContent>
              <TextField
                label="Cliente/Observação"
                value={editando?.observacao || ''}
                onChange={(e) => setEditando({ ...editando, observacao: e.target.value })}
                fullWidth
                variant="outlined"
                margin="dense"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditando(null)}>Cancelar</Button>
              <Button onClick={salvarEdicao} color="primary" variant="contained">
                Salvar
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Forcaautenticacao>
  );
}
