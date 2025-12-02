
import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Grid,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
} from '@material-ui/core';
import {
  ArrowBack,
  Assignment,
  AttachMoney,
  Category,
  Description,
  CheckCircle,
  Business,
  Security,
  Person,
  DirectionsCar,
  Warning,
  Build,
  LocalShipping,
  AccountBox,
  Search,
  TrendingUp,
  NavigateNext,
  Home,
  WhatsApp,
  Phone,
  Email,
} from '@material-ui/icons';
import { motion } from 'framer-motion';
import { servicos, Servico } from '../../data/servicos';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
  },
  appBar: {
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)',
  },
  backButton: {
    marginRight: theme.spacing(2),
    color: '#fff',
  },
  container: {
    padding: theme.spacing(3),
  },
  breadcrumbs: {
    backgroundColor: '#fff',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(3),
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  heroCard: {
    background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(4),
    marginBottom: theme.spacing(3),
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    border: '1px solid #e5e7eb',
  },
  serviceIcon: {
    fontSize: 80,
    color: '#2563eb',
    marginBottom: theme.spacing(2),
  },
  serviceName: {
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: theme.spacing(1),
  },
  servicePrice: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: theme.spacing(1),
  },
  categoryChip: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
  },
  typeChip: {
    fontWeight: 'bold',
    marginLeft: theme.spacing(1),
  },
  infoCard: {
    background: '#fff',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  documentItem: {
    backgroundColor: '#f9fafb',
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(1),
    border: '1px solid #e5e7eb',
  },
  actionCard: {
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: '#fff',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(3),
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)',
  },
  actionButton: {
    backgroundColor: '#fff',
    color: '#2563eb',
    fontWeight: 'bold',
    margin: theme.spacing(1),
    '&:hover': {
      backgroundColor: '#f8fafc',
      transform: 'translateY(-2px)',
    },
  },
  backToListButton: {
    backgroundColor: '#6b7280',
    color: '#fff',
    marginTop: theme.spacing(2),
    '&:hover': {
      backgroundColor: '#4b5563',
    },
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
  CreditCard: <Breadcrumbs />,
  Flight: <Person />,
};

interface ServicoDetailProps {
  servico: Servico;
}

const ServicoDetail: React.FC<ServicoDetailProps> = ({ servico }) => {
  const classes = useStyles();
  const router = useRouter();

  if (router.isFallback) {
    return (
      <Box className={classes.root}>
        <Container className={classes.container}>
          <Typography variant="h6" align="center">
            Carregando...
          </Typography>
        </Container>
      </Box>
    );
  }

  const handleVoltar = () => {
    router.push('/servicos');
  };

  const handleSolicitarServico = () => {
    // Aqui você pode implementar redirecionamento para WhatsApp ou formulário
    const mensagem = `Olá! Gostaria de solicitar o serviço: ${servico.nome} (ID: ${servico.id})`;
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Box className={classes.root}>
      {/* Header */}
      <AppBar position="static" className={classes.appBar}>
        <Toolbar>
          <IconButton
            className={classes.backButton}
            onClick={handleVoltar}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1, fontWeight: 'bold' }}>
            Detalhes do Serviço
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" className={classes.container}>
        {/* Breadcrumbs */}
        <Paper className={classes.breadcrumbs}>
          <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
            <Link
              component="button"
              variant="body2"
              onClick={() => router.push('/')}
              style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              <Home style={{ marginRight: 4 }} fontSize="small" />
              Início
            </Link>
            <Link
              component="button"
              variant="body2"
              onClick={handleVoltar}
              style={{ textDecoration: 'none' }}
            >
              Serviços
            </Link>
            <Typography variant="body2" color="textPrimary">
              {servico.nome}
            </Typography>
          </Breadcrumbs>
        </Paper>

        <Grid container spacing={3}>
          {/* Coluna Principal */}
          <Grid item xs={12} md={8}>
            {/* Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper className={classes.heroCard}>
                <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                  <Box className={classes.serviceIcon}>
                    {iconMap[servico.icone] || <Assignment />}
                  </Box>

                  <Chip
                    label={servico.categoria}
                    className={classes.categoryChip}
                    icon={<Category />}
                  />

                  <Typography variant="h4" className={classes.serviceName}>
                    {servico.nome}
                  </Typography>

                  <Box display="flex" alignItems="center" marginBottom={2}>
                    <Typography className={classes.servicePrice}>
                      R$ {servico.valor}
                    </Typography>
                    <Chip
                      label={servico.tipo}
                      size="small"
                      className={classes.typeChip}
                      style={{
                        backgroundColor: servico.tipo === 'TAXAS' ? '#dcfce7' : '#fef3c7',
                        color: servico.tipo === 'TAXAS' ? '#166534' : '#92400e',
                      }}
                    />
                  </Box>
                </Box>
              </Paper>
            </motion.div>

            {/* Descrição */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Paper className={classes.infoCard}>
                <Typography variant="h6" className={classes.sectionTitle}>
                  <Description />
                  Descrição do Serviço
                </Typography>
                <Typography variant="body1" style={{ lineHeight: 1.8, color: '#374151' }}>
                  {servico.descricao}
                </Typography>
              </Paper>
            </motion.div>

            {/* Documentos Necessários */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Paper className={classes.infoCard}>
                <Typography variant="h6" className={classes.sectionTitle}>
                  <Assignment />
                  Documentos Necessários
                </Typography>
                <List>
                  {servico.documentos.map((documento, index) => (
                    <ListItem key={index} className={classes.documentItem}>
                      <ListItemIcon>
                        <CheckCircle style={{ color: '#059669' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={documento}
                        primaryTypographyProps={{
                          style: { fontWeight: 500, color: '#374151' }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </motion.div>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Card de Ação */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Paper className={classes.actionCard}>
                <Typography variant="h6" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                  Solicitar Serviço
                </Typography>
                <Typography variant="body2" style={{ marginBottom: 24, opacity: 0.9 }}>
                  Entre em contato conosco para solicitar este serviço ou esclarecer dúvidas
                </Typography>

                <Button
                  fullWidth
                  variant="contained"
                  className={classes.actionButton}
                  startIcon={<WhatsApp />}
                  onClick={handleSolicitarServico}
                  style={{ marginBottom: 12 }}
                >
                  WhatsApp
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  className={classes.actionButton}
                  startIcon={<Phone />}
                  href="tel:+5511999999999"
                  style={{ marginBottom: 12 }}
                >
                  Telefone
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  className={classes.actionButton}
                  startIcon={<Email />}
                  href="mailto:contato@betodheon.com.br"
                >
                  E-mail
                </Button>
              </Paper>
            </motion.div>

            {/* Informações Adicionais */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Paper className={classes.infoCard} style={{ marginTop: 24 }}>
                <Typography variant="h6" className={classes.sectionTitle}>
                  <AttachMoney />
                  Informações do Preço
                </Typography>

                <Box marginBottom={2}>
                  <Typography variant="body2" color="textSecondary">
                    Valor do Serviço
                  </Typography>
                  <Typography variant="h6" style={{ color: '#059669', fontWeight: 'bold' }}>
                    R$ {servico.valor}
                  </Typography>
                </Box>

                <Box marginBottom={2}>
                  <Typography variant="body2" color="textSecondary">
                    Tipo de Cobrança
                  </Typography>
                  <Typography variant="body1" style={{ fontWeight: 500 }}>
                    {servico.tipo}
                  </Typography>
                </Box>

                <Divider style={{ margin: '16px 0' }} />

                <Typography variant="caption" color="textSecondary">
                  * Os valores podem sofrer alterações conforme regulamentação dos órgãos competentes
                </Typography>
              </Paper>
            </motion.div>

            {/* Botão Voltar */}
            <Button
              fullWidth
              variant="contained"
              className={classes.backToListButton}
              startIcon={<ArrowBack />}
              onClick={handleVoltar}
            >
              Voltar para Lista de Serviços
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = servicos.map((servico) => ({
    params: { id: servico.id.toString() },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const servico = servicos.find((s) => s.id.toString() === params?.id);

  if (!servico) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      servico,
    },
  };
};

export default ServicoDetail;
