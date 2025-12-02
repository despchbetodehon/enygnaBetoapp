
import React, { useState, memo } from 'react';
import Link from 'next/link';
import { 
  FaStore, 
  FaChartPie, 
  FaBars, 
  FaTachometerAlt, 
  FaBuilding, 
  FaUsers,
  FaFileAlt,
  FaCog,
  FaHome,
  FaChartLine,
  FaPhone,
  FaTimes,
  FaUserTie,
  FaShoppingCart,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import { 
  makeStyles, 
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Grid,
  Card,
  CardContent,
  Paper,
  Box,
  useTheme,
  useMediaQuery,
  Divider,
  Chip,
  Avatar,
  Collapse,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@material-ui/core';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { produtosDigitais, ProdutoDigital } from '../../../../data/produtosDigitais';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f4f6f9 0%, #e9ecef 25%, #dee2e6 75%, #ced4da 100%)',
  },
  appBar: {
    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  content: {
    padding: theme.spacing(3),
    marginTop: 64,
  },
  headerSection: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: theme.spacing(4),
    borderRadius: 20,
    marginBottom: theme.spacing(3),
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  },
  mainTitle: {
    fontFamily: 'Montserrat, Poppins, sans-serif',
    fontWeight: 900,
    fontSize: 'clamp(1.8rem, 4vw, 3rem)',
    marginBottom: theme.spacing(1),
    textShadow: '0 2px 12px rgba(0,0,0,0.3)',
  },
  subtitle: {
    fontFamily: '"Playfair Display", "Georgia", serif',
    fontSize: '1.1rem',
    opacity: 0.9,
  },
  horizontalMenu: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    marginBottom: theme.spacing(3),
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  tabsContainer: {
    '& .MuiTabs-indicator': {
      backgroundColor: '#667eea',
      height: 3,
      borderRadius: 3,
    },
  },
  tab: {
    minWidth: 'auto',
    textTransform: 'none',
    fontWeight: 600,
    color: '#2c3e50',
    '&.Mui-selected': {
      color: '#667eea',
    },
    '& .MuiTab-wrapper': {
      flexDirection: 'row',
      '& > *:first-child': {
        marginRight: theme.spacing(1),
        marginBottom: 0,
      },
    },
  },
  contentCard: {
    borderRadius: 20,
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  serviceCard: {
    borderRadius: 15,
    padding: theme.spacing(3),
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    border: '1px solid rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    marginBottom: theme.spacing(2),
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    },
  },
  serviceCardExpanded: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  },
  serviceIcon: {
    fontSize: '2.5rem',
    marginBottom: theme.spacing(1),
    color: '#667eea',
    transition: 'color 0.3s ease',
  },
  serviceIconExpanded: {
    color: 'white',
  },
  expandedContent: {
    padding: theme.spacing(3),
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '0 0 15px 15px',
    marginTop: theme.spacing(2),
  },
  expandButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    textAlign: 'left',
  },
  breadcrumb: {
    background: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    padding: theme.spacing(1, 2),
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
}));

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  link: string;
  details: {
    features: string[];
    benefits: string[];
    actions: { label: string; link: string; primary?: boolean }[];
  };
}

const ServicosDigitaisEmpresas: React.FC = memo(() => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProdutoDigital | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
    setExpandedService(null);
  };

  const handleServiceToggle = (serviceId: string) => {
    setExpandedService(expandedService === serviceId ? null : serviceId);
  };

  const handleProductClick = (product: ProdutoDigital) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard Digital', icon: <FaTachometerAlt /> },
    { id: 'portal', label: 'Portal do Cliente', icon: <FaPhone /> },
    { id: 'assinatura', label: 'Assinatura Digital', icon: <FaFileAlt /> },
    { id: 'produtos', label: 'Produtos Digitais', icon: <FaShoppingCart /> },
    { id: 'ia', label: 'IA & Automação', icon: <FaUserTie /> },
    { id: 'mobile', label: 'App Mobile', icon: <FaShoppingCart /> },
    { id: 'relatorios', label: 'Relatórios Digitais', icon: <FaChartLine /> },
    { id: 'configuracoes', label: 'Configurações', icon: <FaCog /> },
  ];

  const serviceItems: ServiceItem[] = [
    {
      id: 'portal-cliente',
      title: 'Portal do Cliente Digital',
      description: 'Acesse todos os serviços através da plataforma digital',
      icon: <FaPhone />,
      color: '#38ef7d',
      link: '/beto/digital/empresas',
      details: {
        features: [
          'Interface responsiva e moderna',
          'Acompanhamento em tempo real',
          'Notificações automáticas',
          'Histórico completo de serviços'
        ],
        benefits: [
          'Acesso 24/7 aos serviços',
          'Redução de 90% no tempo de atendimento',
          'Transparência total dos processos',
          'Economia de tempo e recursos'
        ],
        actions: [
          { label: 'Acessar Portal', link: '/beto/digital/empresas', primary: true },
          { label: 'Tutorial', link: '/beto/digital/tutorial' }
        ]
      }
    },
    {
      id: 'assinatura-digital',
      title: 'Assinatura Digital',
      description: 'Documentos assinados digitalmente com validade jurídica',
      icon: <FaFileAlt />,
      color: '#667eea',
      link: '/beto/digital/assinatura',
      details: {
        features: [
          'Certificado digital ICP-Brasil',
          'Assinatura com validade jurídica',
          'Timestamping automático',
          'Verificação de integridade'
        ],
        benefits: [
          'Eliminação de papel físico',
          'Agilidade nos processos',
          'Segurança garantida',
          'Conformidade legal total'
        ],
        actions: [
          { label: 'Assinar Documentos', link: '/beto/digital/assinatura', primary: true }
        ]
      }
    },
    {
      id: 'chatbot-ia',
      title: 'Assistente Virtual IA',
      description: 'Atendimento inteligente com IA 24 horas por dia',
      icon: <FaUserTie />,
      color: '#764ba2',
      link: '/beto/chat-ia',
      details: {
        features: [
          'Atendimento automatizado 24/7',
          'Respostas inteligentes',
          'Escalação para humanos',
          'Aprendizado contínuo'
        ],
        benefits: [
          'Atendimento instantâneo',
          'Resolução de 80% das dúvidas',
          'Disponibilidade total',
          'Satisfação do cliente elevada'
        ],
        actions: [
          { label: 'Conversar com IA', link: '/beto/chat-ia', primary: true }
        ]
      }
    },
    {
      id: 'app-mobile',
      title: 'Aplicativo Mobile',
      description: 'Todos os serviços na palma da sua mão',
      icon: <FaShoppingCart />,
      color: '#11998e',
      link: '/beto/mobile/download',
      details: {
        features: [
          'App nativo iOS e Android',
          'Sincronização em tempo real',
          'Notificações push',
          'Modo offline disponível'
        ],
        benefits: [
          'Mobilidade total',
          'Produtividade aumentada',
          'Facilidade de uso',
          'Acesso em qualquer lugar'
        ],
        actions: [
          { label: 'Download App', link: '/beto/mobile/download', primary: true },
          { label: 'Guia de Uso', link: '/beto/mobile/guia' }
        ]
      }
    }
  ];

  const renderContent = () => {
    const activeMenuItem = menuItems[activeTab];

    if (activeMenuItem.id === 'dashboard') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper className={classes.contentCard}>
            <Typography variant="h4" gutterBottom style={{ color: '#2c3e50', fontWeight: 700 }}>
              📱 Serviços Digitais
            </Typography>
            <Typography variant="body1" paragraph style={{ color: '#5a6c7d' }}>
              Modernize sua experiência com nossos serviços 100% digitais. Tecnologia de ponta para facilitar sua vida.
            </Typography>

            <Grid container spacing={2} style={{ marginTop: theme.spacing(3) }}>
              {serviceItems.map((service, index) => (
                <Grid item xs={12} key={service.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card 
                      className={`${classes.serviceCard} ${expandedService === service.id ? classes.serviceCardExpanded : ''}`}
                    >
                      <CardContent>
                        <Box 
                          className={classes.expandButton}
                          onClick={() => handleServiceToggle(service.id)}
                        >
                          <Box display="flex" alignItems="center">
                            <Box 
                              className={`${classes.serviceIcon} ${expandedService === service.id ? classes.serviceIconExpanded : ''}`}
                              style={{ color: expandedService === service.id ? 'white' : service.color, marginRight: theme.spacing(2) }}
                            >
                              {service.icon}
                            </Box>
                            <Box>
                              <Typography variant="h6" gutterBottom style={{ fontWeight: 600, margin: 0 }}>
                                {service.title}
                              </Typography>
                              <Typography variant="body2" style={{ opacity: 0.8, margin: 0 }}>
                                {service.description}
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton style={{ color: expandedService === service.id ? 'white' : '#666' }}>
                            {expandedService === service.id ? <FaChevronUp /> : <FaChevronDown />}
                          </IconButton>
                        </Box>
                      </CardContent>

                      <AnimatePresence>
                        {expandedService === service.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Box className={classes.expandedContent}>
                              <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                  <Typography variant="h6" gutterBottom style={{ color: '#2c3e50', fontWeight: 600 }}>
                                    ⚡ Funcionalidades
                                  </Typography>
                                  {service.details.features.map((feature, idx) => (
                                    <Typography key={idx} variant="body2" paragraph>
                                      • {feature}
                                    </Typography>
                                  ))}
                                </Grid>

                                <Grid item xs={12} md={4}>
                                  <Typography variant="h6" gutterBottom style={{ color: '#2c3e50', fontWeight: 600 }}>
                                    🚀 Benefícios
                                  </Typography>
                                  {service.details.benefits.map((benefit, idx) => (
                                    <Typography key={idx} variant="body2" paragraph>
                                      • {benefit}
                                    </Typography>
                                  ))}
                                </Grid>

                                <Grid item xs={12} md={4}>
                                  <Typography variant="h6" gutterBottom style={{ color: '#2c3e50', fontWeight: 600 }}>
                                    🎯 Ações Rápidas
                                  </Typography>
                                  <Box display="flex" flexDirection="column" style={{ gap:1 }}>
                                    {service.details.actions.map((action, idx) => (
                                      <Link key={idx} href={action.link} style={{ textDecoration: 'none' }}>
                                        <Button
                                          variant={action.primary ? "contained" : "outlined"}
                                          color="primary"
                                          fullWidth
                                          size="small"
                                          style={{ 
                                            textTransform: 'none',
                                            ...(action.primary && {
                                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                              color: 'white'
                                            })
                                          }}
                                        >
                                          {action.label}
                                        </Button>
                                      </Link>
                                    ))}
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </motion.div>
      );
    }

    // Conteúdo específico para Produtos Digitais
    if (activeMenuItem.id === 'produtos') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper className={classes.contentCard}>
            <Typography variant="h4" gutterBottom style={{ color: '#2c3e50', fontWeight: 700 }}>
              🛍️ Produtos Digitais
            </Typography>
            <Typography variant="body1" paragraph style={{ color: '#5a6c7d' }}>
              Conheça nossos produtos digitais especializados, desenvolvidos conforme a legislação do DETRAN/SC e município de Tubarão.
            </Typography>

            <Grid container spacing={3} style={{ marginTop: theme.spacing(2) }}>
              {produtosDigitais.map((produto, index) => (
                <Grid item xs={12} sm={6} md={4} key={produto.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                  >
                    <Card 
                      className={classes.serviceCard}
                      onClick={() => handleProductClick(produto)}
                      style={{ cursor: 'pointer' }}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="center" marginBottom={2}>
                          <Box 
                            className={classes.serviceIcon}
                            style={{ color: '#667eea' }}
                          >
                            {produto.aplicacao}
                          </Box>
                        </Box>

                        <Typography variant="h6" gutterBottom style={{ fontWeight: 600, color: '#2c3e50' }}>
                          {produto.descricao}
                        </Typography>

                        <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                          Código: {produto.codigo}
                        </Typography>

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#059669' }}>
                            R$ {produto.valor}
                          </Typography>
                          <Chip
                            label={produto.categoria}
                            size="small"
                            style={{
                              backgroundColor: '#dbeafe',
                              color: '#1e40af',
                              fontSize: '0.7rem',
                            }}
                          />
                        </Box>

                        <Button
                          variant="contained"
                          fullWidth
                          style={{
                            marginTop: theme.spacing(2),
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            textTransform: 'none'
                          }}
                        >
                          Ver Detalhes
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </motion.div>
      );
    }

    // Conteúdo específico para outras seções
    const contentMapping: { [key: string]: any } = {
      portal: {
        title: 'Portal do Cliente Digital',
        description: 'Interface moderna e intuitiva para acesso aos nossos serviços.',
        services: [
          { name: 'Intenção de Venda', link: '/beto/requerimento', color: '#4CAF50' },
          { name: 'Painel de Controle', link: '/beto/dashboard/empresas', color: '#2196F3' },
        ]
      },
      assinatura: {
        title: 'Assinatura Digital',
        description: 'Tecnologia de ponta para documentos com validade jurídica.',
        services: [
          { name: 'Assinar Documentos', link: '/beto/digital/assinatura', color: '#FF9800' },
          { name: 'Validar Assinaturas', link: '/beto/digital/validar', color: '#E91E63' },
        ]
      },
      ia: {
        title: 'IA & Automação',
        description: 'Inteligência artificial para otimizar seus processos.',
        services: [
          { name: 'Chat IA Lívia', link: '/beto/chat-ia', color: '#9C27B0' },
          { name: 'Relatórios IA', link: '/beto/relatorios-ia', color: '#673AB7' },
        ]
      },
      mobile: {
        title: 'Aplicativo Mobile',
        description: 'Acesse nossos serviços em qualquer lugar.',
        services: [
          { name: 'Download Android', link: '/beto/mobile/android', color: '#4CAF50' },
          { name: 'Download iOS', link: '/beto/mobile/ios', color: '#2196F3' },
        ]
      },
      relatorios: {
        title: 'Relatórios Digitais',
        description: 'Análises detalhadas e insights em tempo real.',
        services: [
          { name: 'Relatório Mensal', link: '/beto/relatorios/mensal', color: '#FF5722' },
          { name: 'Relatório Anual', link: '/beto/relatorios/anual', color: '#795548' },
        ]
      },
      configuracoes: {
        title: 'Configurações',
        description: 'Personalize sua experiência digital.',
        services: [
          { name: 'Configurar Conta', link: '/beto/configuracoes/conta', color: '#607D8B' },
          { name: 'Preferências', link: '/beto/configuracoes/preferencias', color: '#9E9E9E' },
        ]
      }
    };

    const currentContent = contentMapping[activeMenuItem.id];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper className={classes.contentCard}>
          <Typography variant="h4" gutterBottom style={{ color: '#2c3e50', fontWeight: 700 }}>
            {currentContent?.title || activeMenuItem.label}
          </Typography>
          <Typography variant="body1" paragraph style={{ color: '#5a6c7d' }}>
            {currentContent?.description || `Conteúdo da seção "${activeMenuItem.label}" está sendo desenvolvido. Em breve teremos novidades!`}
          </Typography>

          {currentContent?.services && (
            <Grid container spacing={3} style={{ marginTop: theme.spacing(2) }}>
              {currentContent.services.map((service: any, index: number) => (
                <Grid item xs={12} md={6} key={index}>
                  <Link href={service.link} style={{ textDecoration: 'none' }}>
                    <Card 
                      className={classes.serviceCard}
                      style={{ borderLeft: `4px solid ${service.color}` }}
                    >
                      <CardContent>
                        <Typography variant="h6" style={{ color: service.color, fontWeight: 600 }}>
                          {service.name}
                        </Typography>
                        <Button 
                          variant="contained" 
                          style={{ 
                            background: service.color, 
                            color: 'white',
                            marginTop: theme.spacing(2),
                            textTransform: 'none'
                          }}
                          fullWidth
                        >
                          Acessar
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </motion.div>
    );
  };

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Avatar 
            style={{ 
              width: 40, 
              height: 40, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontSize: '1rem',
              fontWeight: 'bold',
              marginRight: theme.spacing(2)
            }}
          >
            BD
          </Avatar>

          <Typography variant="h6" style={{ flexGrow: 1, fontWeight: 600 }}>
            Serviços Digitais - Beto Dehon
          </Typography>

          <Box className={classes.breadcrumb}>
            <FaBuilding />
            <Typography variant="body2">
              Digital / {menuItems[activeTab]?.label || 'Dashboard'}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <main className={classes.content}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Paper className={classes.headerSection}>
            <Typography className={classes.mainTitle}>
              📱 Serviços Digitais
            </Typography>
            <Typography className={classes.subtitle}>
              Tecnologia de Ponta & Soluções Inteligentes
            </Typography>
          </Paper>

          {/* Menu Horizontal */}
          <Paper className={classes.horizontalMenu}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              className={classes.tabsContainer}
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons="auto"
              indicatorColor="primary"
              textColor="primary"
            >
              {menuItems.map((item, index) => (
                <Tab
                  key={item.id}
                  label={
                    <Box display="flex" alignItems="center">
                      {item.icon}
                      <Typography variant="body2" style={{ marginLeft: 8 }}>
                        {item.label}
                      </Typography>
                    </Box>
                  }
                  className={classes.tab}
                />
              ))}
            </Tabs>
          </Paper>

          {/* Conteúdo Dinâmico */}
          <Container maxWidth="xl">
            {renderContent()}
          </Container>

          {/* Link para Menu Principal */}
          <Box textAlign="center" mt={4}>
            <Link href="/beto" style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                startIcon={<FaHome />}
                style={{
                  borderColor: '#667eea',
                  color: '#667eea',
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Voltar ao Menu Principal
              </Button>
            </Link>
          </Box>
        </motion.div>
      </main>

      {/* Modal de Detalhes do Produto */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: 20,
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          }
        }}
      >
        {selectedProduct && (
          <>
            <DialogTitle style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center',
              fontSize: '1.3rem',
              fontWeight: 'bold'
            }}>
              {selectedProduct.aplicacao} {selectedProduct.descricao}
            </DialogTitle>
            
            <DialogContent style={{ padding: theme.spacing(3) }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom style={{ color: '#2c3e50', fontWeight: 600 }}>
                    💰 Informações Gerais
                  </Typography>
                  <Box style={{ background: 'white', padding: theme.spacing(2), borderRadius: 10, marginBottom: theme.spacing(2) }}>
                    <Typography variant="body2" paragraph>
                      <strong>Código:</strong> {selectedProduct.codigo}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Valor:</strong> R$ {selectedProduct.valor}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Categoria:</strong> {selectedProduct.categoria}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Prazo:</strong> {selectedProduct.detalhes.prazoProcessamento}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom style={{ color: '#2c3e50', fontWeight: 600 }}>
                    ⚖️ Fundamentação Legal
                  </Typography>
                  <Box style={{ background: 'white', padding: theme.spacing(2), borderRadius: 10, marginBottom: theme.spacing(2) }}>
                    <Typography variant="body2" paragraph>
                      {selectedProduct.detalhes.fundamentoLegal}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom style={{ color: '#2c3e50', fontWeight: 600 }}>
                    📋 Documentos Necessários
                  </Typography>
                  <Box style={{ background: 'white', padding: theme.spacing(2), borderRadius: 10, marginBottom: theme.spacing(2) }}>
                    <List dense>
                      {selectedProduct.detalhes.documentosNecessarios.map((doc, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <FaFileAlt style={{ color: '#667eea' }} />
                          </ListItemIcon>
                          <ListItemText primary={doc} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom style={{ color: '#2c3e50', fontWeight: 600 }}>
                    📚 Legislação Aplicável
                  </Typography>
                  <Box style={{ background: 'white', padding: theme.spacing(2), borderRadius: 10, marginBottom: theme.spacing(2) }}>
                    <List dense>
                      {selectedProduct.detalhes.legislacao.map((lei, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <FaCog style={{ color: '#764ba2' }} />
                          </ListItemIcon>
                          <ListItemText primary={lei} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom style={{ color: '#2c3e50', fontWeight: 600 }}>
                    ℹ️ Observações Importantes
                  </Typography>
                  <Box style={{ background: 'white', padding: theme.spacing(2), borderRadius: 10 }}>
                    <Typography variant="body2">
                      {selectedProduct.detalhes.observacoes}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions style={{ padding: theme.spacing(2) }}>
              <Button
                onClick={handleCloseModal}
                variant="outlined"
                style={{
                  borderColor: '#667eea',
                  color: '#667eea',
                  textTransform: 'none'
                }}
              >
                Fechar
              </Button>
              <Button
                variant="contained"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  textTransform: 'none'
                }}
              >
                Solicitar Serviço
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
});

ServicosDigitaisEmpresas.displayName = 'ServicosDigitaisEmpresas';

export default ServicosDigitaisEmpresas;
