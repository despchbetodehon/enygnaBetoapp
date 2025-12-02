
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Chip,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  IconButton,
  Paper,
} from '@material-ui/core';
import {
  Search,
  TrendingUp,
  Assignment,
  Security,
  Person,
  DirectionsCar,
  Description,
  Warning,
  Business,
  Category,
  CheckCircle,
  Build,
  LocalShipping,
  AccountBox,
} from '@material-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { servicos, categorias, Servico } from '../../data/servicos';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
  },
  appBar: {
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)',
  },
  searchContainer: {
    background: '#fff',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  searchInput: {
    '& .MuiOutlinedInput-root': {
      borderRadius: theme.spacing(2),
      backgroundColor: '#f9fafb',
      '&:hover': {
        backgroundColor: '#f3f4f6',
      },
      '&.Mui-focused': {
        backgroundColor: '#fff',
      },
    },
  },
  categoryTabs: {
    marginBottom: theme.spacing(3),
    '& .MuiTab-root': {
      textTransform: 'none',
      fontWeight: 'bold',
      minWidth: 'auto',
      padding: '6px 16px',
      color: '#6b7280',
      '&.Mui-selected': {
        color: '#2563eb',
      },
    },
    '& .MuiTabs-indicator': {
      backgroundColor: '#2563eb',
      height: 3,
      borderRadius: '3px 3px 0 0',
    },
  },
  serviceCard: {
    borderRadius: theme.spacing(1.5),
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    border: '1px solid #e5e7eb',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '&:hover': {
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: '0 20px 40px rgba(37, 99, 235, 0.15)',
      borderColor: '#2563eb',
    },
  },
  serviceIcon: {
    fontSize: 48,
    color: '#2563eb',
    marginBottom: theme.spacing(2),
  },
  serviceName: {
    fontWeight: 'bold',
    fontSize: '1.1rem',
    color: '#111827',
    marginBottom: theme.spacing(1),
    minHeight: '2.2rem',
    display: 'flex',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 'auto',
  },
  categoryChip: {
    fontSize: '0.75rem',
    height: 24,
    fontWeight: 'bold',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    marginBottom: theme.spacing(1),
  },
  statsContainer: {
    background: '#fff',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  statCard: {
    textAlign: 'center',
    padding: theme.spacing(2),
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  noResults: {
    textAlign: 'center',
    padding: theme.spacing(8),
    color: '#6b7280',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },
}));

const iconMap: { [key: string]: React.ReactNode } = {
  LocalShipping: <LocalShipping />,
  Search: <Search />,
  TrendingUp: <TrendingUp />,
  Person: <Person />,
  Build: <Build />,
  Description: <Description />,
  Assignment: <Assignment />,
  CheckCircle: <CheckCircle />,
  Security: <Security />,
  Business: <Business />,
  Warning: <Warning />,
  AccountBox: <AccountBox />,
  Receipt: <Assignment />,
  FindInPage: <Search />,
  CreditCard: <Person />,
  Flight: <Person />,
};

const Servicos: React.FC = () => {
  const classes = useStyles();
  const router = useRouter();
  const [termoBusca, setTermoBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const servicosFiltrados = useMemo(() => {
    let filtered = servicos;

    // Filtrar por categoria
    if (categoriaAtiva > 0) {
      const categoriaSelecionada = categorias[categoriaAtiva];
      filtered = filtered.filter(servico => servico.categoria === categoriaSelecionada);
    }

    // Filtrar por termo de busca
    if (termoBusca.trim()) {
      filtered = filtered.filter(servico =>
        servico.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        servico.categoria.toLowerCase().includes(termoBusca.toLowerCase())
      );
    }

    return filtered;
  }, [termoBusca, categoriaAtiva]);

  const handleServiceClick = async (servicoId: number) => {
    setIsLoading(true);
    await router.push(`/servicos/${servicoId}`);
    setIsLoading(false);
  };

  const handleCategoryChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setCategoriaAtiva(newValue);
  };

  const estatisticas = {
    total: servicos.length,
    categorias: new Set(servicos.map(s => s.categoria)).size,
    taxas: servicos.filter(s => s.tipo === 'TAXAS').length,
    outras: servicos.filter(s => s.tipo === 'OUTRAS DESPESAS').length,
  };

  return (
    <Box className={classes.root}>
     

      <Container maxWidth="xl" style={{ padding: '24px' }}>
        {/* Estatísticas */}
        <Paper className={classes.statsContainer}>
          <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
              <Box className={classes.statCard}>
                <Typography className={classes.statNumber}>
                  {estatisticas.total}
                </Typography>
                <Typography className={classes.statLabel}>
                  Total de Serviços
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box className={classes.statCard}>
                <Typography className={classes.statNumber}>
                  {estatisticas.categorias}
                </Typography>
                <Typography className={classes.statLabel}>
                  Categorias
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box className={classes.statCard}>
                <Typography className={classes.statNumber}>
                  {estatisticas.taxas}
                </Typography>
                <Typography className={classes.statLabel}>
                  Taxas Oficiais
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box className={classes.statCard}>
                <Typography className={classes.statNumber}>
                  {estatisticas.outras}
                </Typography>
                <Typography className={classes.statLabel}>
                  Outras Despesas
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Campo de Busca */}
        <Paper className={classes.searchContainer}>
          <TextField
            fullWidth
            placeholder="Digite o nome do serviço..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className={classes.searchInput}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search style={{ color: '#6b7280' }} />
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />
        </Paper>

        {/* Filtros por Categoria */}
        <Paper style={{ marginBottom: 24 }}>
          <Tabs
            value={categoriaAtiva}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            className={classes.categoryTabs}
          >
            {categorias.map((categoria, index) => (
              <Tab
                key={categoria}
                label={categoria}
                icon={index === 0 ? <Category /> : undefined}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Grid de Serviços */}
        {isLoading ? (
          <Box className={classes.loadingContainer}>
            <Typography variant="h6" color="textSecondary">
              Carregando...
            </Typography>
          </Box>
        ) : servicosFiltrados.length > 0 ? (
          <Grid container spacing={3}>
            <AnimatePresence>
              {servicosFiltrados.map((servico, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={servico.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -8 }}
                  >
                    <Card
                      className={classes.serviceCard}
                      onClick={() => handleServiceClick(servico.id)}
                    >
                      <CardContent style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box display="flex" justifyContent="center" marginBottom={2}>
                          <Box className={classes.serviceIcon}>
                            {iconMap[servico.icone] || <Assignment />}
                          </Box>
                        </Box>

                        <Chip
                          label={servico.categoria}
                          size="small"
                          className={classes.categoryChip}
                        />

                        <Typography className={classes.serviceName}>
                          {servico.nome}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="textSecondary"
                          style={{ 
                            marginBottom: 16, 
                            flexGrow: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {servico.descricao}
                        </Typography>

                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          marginTop="auto"
                        >
                          <Typography className={classes.servicePrice}>
                            R$ {servico.valor}
                          </Typography>
                          <Chip
                            label={servico.tipo}
                            size="small"
                            style={{
                              backgroundColor: servico.tipo === 'TAXAS' ? '#dcfce7' : '#fef3c7',
                              color: servico.tipo === 'TAXAS' ? '#166534' : '#92400e',
                              fontSize: '0.7rem',
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        ) : (
          <Box className={classes.noResults}>
            <Search style={{ fontSize: 64, color: '#d1d5db', marginBottom: 16 }} />
            <Typography variant="h6" gutterBottom>
              Nenhum serviço encontrado
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Tente ajustar os filtros ou termo de busca
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Servicos;
