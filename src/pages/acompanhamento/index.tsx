import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  LinearProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Badge,
  Tooltip,
  Fab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Container,
} from '@material-ui/core';

import {
  Dashboard,
  Assignment,
  CheckCircle,
  Schedule,
  Warning,
  Error,
  Info,
  Visibility,
  Print,
  Share,
  Add,
  Refresh,
  FilterList,
  Search,
  ExpandMore,
  Phone,
  Email,
  WhatsApp,
  AccountCircle,
  BusinessCenter,
  Description,
  AttachMoney,
  Today,
  Update,
  Star,
  Group,
  Settings,
  Help,
  Security,
  Payment,
  Receipt,
  Gavel,
  DirectionsCar,
  CreditCard,
  AccountBalance,
  LocalShipping,
  Build,
  Assessment,
  Public,
  Lock,
  Home,
  Close,
  Person,
  TransferWithinAStation
} from '@material-ui/icons';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

import ResponsiveAppBar from '@/components/home/home';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a4d3a 0%, #2d5a3d 100%)',
  },
  appBar: {
    background: 'linear-gradient(135deg, #1a4d3a 0%, #2d5a3d 100%)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(0, 3),
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#fff',
  },
  tabsContainer: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
  },
  tabs: {
    '& .MuiTab-root': {
      color: 'rgba(255,255,255,0.7)',
      fontWeight: 'bold',
      minWidth: 120,
    },
    '& .Mui-selected': {
      color: '#fff',
    },
    '& .MuiTabs-indicator': {
      backgroundColor: '#fff',
      height: 3,
    },
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  avatar: {
    width: 40,
    height: 40,
    background: 'linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%)',
    cursor: 'pointer',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: theme.spacing(3),
  },
  dashboardCard: {
    background: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    padding: theme.spacing(3),
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    marginBottom: theme.spacing(3),
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      background: 'linear-gradient(90deg, #1a4d3a, #2d5a3d)',
    },
  },
  statCard: {
    background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(3),
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
    },
  },
  statIcon: {
    fontSize: 40,
    color: '#2d5a3d',
    marginBottom: theme.spacing(1),
  },
  processCard: {
    background: '#fff',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #eee',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    },
  },
  processStep: {
    background: '#f8f9fa',
    borderRadius: theme.spacing(1),
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
    border: '2px solid transparent',
    transition: 'all 0.3s ease',
  },
  activeStep: {
    borderColor: '#4CAF50',
    background: '#e8f5e8',
  },
  completedStep: {
    borderColor: '#2196F3',
    background: '#e3f2fd',
  },
  urgentStep: {
    borderColor: '#FF5722',
    background: '#ffebee',
    animation: '$blink 1.5s infinite',
  },
  '@keyframes blink': {
    '0%, 50%': { opacity: 1 },
    '51%, 100%': { opacity: 0.7 },
  },
  statusChip: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    padding: theme.spacing(1, 2),
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    background: 'linear-gradient(90deg, #1a4d3a, #2d5a3d)',
  },
  documentUpload: {
    border: '2px dashed #ccc',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(4),
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: '#667eea',
      background: 'rgba(102, 126, 234, 0.05)',
    },
  },
  chatFab: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    background: 'linear-gradient(135deg, #1a4d3a 0%, #2d5a3d 100%)',
    color: '#fff',
    animation: '$bounce 2s infinite',
  },
  '@keyframes bounce': {
    '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
    '40%': { transform: 'translateY(-10px)' },
    '60%': { transform: 'translateY(-5px)' },
  },
  vipBadge: {
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    color: '#000',
    fontWeight: 'bold',
    fontSize: '0.8rem',
    animation: '$pulse 2s infinite',
  },
  '@keyframes pulse': {
    '0%': { boxShadow: '0 0 0 0 rgba(255, 215, 0, 0.7)' },
    '70%': { boxShadow: '0 0 0 10px rgba(255, 215, 0, 0)' },
    '100%': { boxShadow: '0 0 0 0 rgba(255, 215, 0, 0)' },
  },
  formContainer: {
    background: '#fff',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(4),
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  },
  profileContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(3),
  },
  profileAvatar: {
    width: 120,
    height: 120,
    background: 'linear-gradient(135deg, #1a4d3a 0%, #2d5a3d 100%)',
    fontSize: '3rem',
    fontWeight: 'bold',
  },
  summaryCards: {
    display: 'flex',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    flexWrap: 'wrap',
  },
  noAccessCard: {
    background: '#f5f5f5',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(4),
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  accessDeniedIcon: {
    fontSize: 64,
    color: '#757575',
    marginBottom: theme.spacing(2),
  },
  allServicesButton: {
    background: 'linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%)',
    color: '#fff',
    fontWeight: 'bold',
    padding: theme.spacing(2, 4),
    borderRadius: theme.spacing(3),
    fontSize: '1.1rem',
    textTransform: 'none',
    '&:hover': {
      background: 'linear-gradient(135deg, #4a7c59 0%, #5d8f6c 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(45, 90, 61, 0.4)',
    },
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`nav-tabpanel-${index}`}
      aria-labelledby={`nav-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

interface ProcessData {
  id: string;
  tipo: string;
  status: 'Pendente' | 'Em Análise' | 'Aguardando Documentos' | 'Aguardando Detran' | 'Pronto' | 'Concluído';
  progresso: number;
  etapas: EtapaData[];
  documentosFaltando: string[];
  prazoEstimado: string;
  valor: number;
  urgencia: 'baixa' | 'media' | 'alta';
  ultimaAtualizacao: Date;
  dataInicio: Date;
  clienteId: string;
}

interface EtapaData {
  id: string;
  nome: string;
  concluida: boolean;
  ativa: boolean;
  descricao: string;
  dataPrevisao?: Date;
  dataConclusao?: Date;
}

export default function AreaCliente() {
  const classes = useStyles();
 

  const [selectedTab, setSelectedTab] = useState(0);
  const [expandedProcess, setExpandedProcess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [contactDialog, setContactDialog] = useState(false);
  const [serviceDialog, setServiceDialog] = useState(false);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    tipo: 'todos',
    status: 'todos',
    valorMin: '',
    valorMax: '',
    urgencia: 'todas',
  });

  // Estados para dados reais do Firebase
  const [userProcesses, setUserProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    total: 0,
    emAndamento: 0,
    concluidos: 0,
    pendentes: 0,
  });

  // Função para validar identificadores
  const validateSearchTerm = (term: string): boolean => {
    const identifiers = term
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
    if (identifiers.length === 0) {
      setSearchError('Por favor, insira pelo menos um identificador (CPF, CNPJ).');
      return false;
    }
    setSearchError(null);
    return true;
  };

  // 🔍 Função principal: busca processos sem exigir login
  const fetchUserData = async () => {
    const identifiers = searchTerm
      .split(',')
      .map((v) => v.trim().toLowerCase())
      .filter((v) => v.length > 0);

    if (!validateSearchTerm(searchTerm)) return;

    setLoading(true);

    try {
      console.log('🔄 Buscando dados para:', identifiers);
      const allProcesses: any[] = [];

      // 🔍 Função auxiliar: busca em uma coleção
      const searchInCollection = async (collectionName: string, searchFields: string[]) => {
        try {
          const { getFirestore, collection, query, where, getDocs, or } = await import('firebase/firestore');
          const { app } = await import('@/logic/firebase/config/app');

          const db = getFirestore(app);
          const collectionRef = collection(db, collectionName);

          const queries = searchFields
            .map((field) => identifiers.map((identifier) => where(field, '==', identifier)))
            .flat();

          const chunkedQueries = [];
          for (let i = 0; i < queries.length; i += 10) {
            chunkedQueries.push(queries.slice(i, i + 10));
          }

          for (const queryChunk of chunkedQueries) {
            const q = queryChunk.length === 1
              ? query(collectionRef, queryChunk[0])
              : query(collectionRef, or(...queryChunk));

            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              allProcesses.push({
                id: doc.id,
                type: collectionName,
                ...doc.data(),
                timestamp: doc.data().timestamp || new Date(),
              });
            });
          }
        } catch (error) {
          console.error(`❌ Erro ao buscar na coleção ${collectionName}:`, error);
          setSearchError('Erro ao buscar documentos. Tente novamente.');
        }
      };

      // 🗂️ Coleções públicas consultadas
      await Promise.all([
        searchInCollection('Betodespachanteintrncaodevendaoficial', [
          'email', 'nome', 'placa', 'cpf', 'cnpj',
          'nomevendedor', 'nomecomprador', 'emailvendedor', 'emailcomprador',
          'cpfvendedor', 'cpfcomprador', 'cnpjvendedor', 'cnpjcomprador', 'id',
        ]),
        searchInCollection('transferencias', [
          'email', 'nomevendedor', 'nomecomprador', 'emailvendedor', 'emailcomprador',
          'cpfvendedor', 'cpfcomprador', 'cnpjvendedor', 'cnpjcomprador',
        ]),
        searchInCollection('anuencias', [
          'email', 'nomesocio1', 'nomesocio2', 'nomesocio3', 'emailempresa',
          'cpfsocio1', 'cpfsocio2', 'cpfsocio3', 'cnpjempresa',
        ]),
        searchInCollection('requerimentosdigitais', [
          'email', 'nomevendedor', 'nomecomprador', 'emailvendedor', 'emailcomprador',
          'cpfvendedor', 'cpfcomprador', 'cnpjvendedor', 'cnpjcomprador',
        ]),
      ]);

      // 🧹 Remove duplicatas
      const uniqueProcesses = allProcesses.filter(
        (process, index, self) =>
          index === self.findIndex((p) => p.id === process.id && p.type === process.type)
      );

      // 🕒 Ordena por data
      uniqueProcesses.sort((a, b) => {
        const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0);
        const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0);
        return dateB.getTime() - dateA.getTime();
      });

      console.log('✅ Processos encontrados:', uniqueProcesses.length);
      setUserProcesses(uniqueProcesses);

      const stats = {
        total: uniqueProcesses.length,
        emAndamento: uniqueProcesses.filter((p) =>
          ['Em Andamento', 'Processando', 'Aguardando'].includes(p.status)
        ).length,
        concluidos: uniqueProcesses.filter((p) =>
          ['Concluído', 'Finalizado', 'Aprovado'].includes(p.status)
        ).length,
        pendentes: uniqueProcesses.filter((p) =>
          ['Pendente', 'Aguardando Documentos', 'Revisão'].includes(p.status)
        ).length,
      };

      setUserStats(stats);
    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error);
      setSearchError('Erro ao buscar documentos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Busca inicial se desejar (ou use botão para buscar)
  useEffect(() => {
    fetchUserData();
  }, []);

  // Processar dados reais do Firebase
  const processos = userProcesses.map((process) => {
    let tipo = 'Processo';
    let titulo = 'Processo';
    let icon = <Assignment />;
    let color = '#2196F3';

    switch (process.type) {
      case 'requerimentos':
        tipo = 'Requerimento';
        titulo = process.servicosolicitado || 'Requerimento de Veículo';
        icon = <Assignment />;
        color = '#2196F3';
        break;
      case 'transferencias':
        tipo = 'Transferência';
        titulo = `Transferência - ${process.marcaveiculo || ''} ${process.modeloveiculo || ''}`.trim();
        icon = <TransferWithinAStation />;
        color = '#4CAF50';
        break;
      case 'anuencias':
        tipo = 'Anuência';
        titulo = process.nomeempresa || 'Anuência Empresarial';
        icon = <BusinessCenter />;
        color = '#FF9800';
        break;
      case 'requerimentosdigitais':
        tipo = 'Requerimento Digital';
        titulo = process.servicosolicitado || 'Requerimento Digital';
        icon = <Description />;
        color = '#9C27B0';
        break;
    }

    const status = process.status || 'Pendente';

    let progresso = 25;
    switch (status.toLowerCase()) {
      case 'concluído':
      case 'finalizado':
      case 'aprovado':
        progresso = 100;
        break;
      case 'em andamento':
      case 'processando':
        progresso = 60;
        break;
      case 'aguardando':
      case 'revisão':
        progresso = 40;
        break;
      default:
        progresso = 25;
    }

    const dataInicio = process.timestamp?.toDate
      ? process.timestamp.toDate().toLocaleDateString('pt-BR')
      : new Date(process.timestamp || Date.now()).toLocaleDateString('pt-BR');

    return {
      id: process.id,
      tipo,
      titulo,
      status,
      dataInicio,
      previsao: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
      progresso,
      icon,
      color,
      descricao: process.observacoes || `${tipo} em processamento`,
      documentos: ['Documento de Identificação', 'Comprovante de Residência'],
      etapas: [
        { nome: 'Documentação', concluida: true },
        { nome: 'Análise', concluida: progresso >= 40 },
        { nome: 'Processamento', concluida: progresso >= 60 },
        { nome: 'Finalização', concluida: progresso >= 100 },
      ],
      dadosCompletos: process,
    };
  });

  const estatisticas = [
    {
      titulo: 'Total de Processos',
      valor: userStats.total,
      icon: <Dashboard />,
      color: '#2196F3',
      descricao: 'Todos os seus processos',
    },
    {
      titulo: 'Em Andamento',
      valor: userStats.emAndamento,
      icon: <Schedule />,
      color: '#FF9800',
      descricao: 'Processos ativos',
    },
    {
      titulo: 'Concluídos',
      valor: userStats.concluidos,
      icon: <CheckCircle />,
      color: '#4CAF50',
      descricao: 'Processos finalizados',
    },
    {
      titulo: 'Pendentes',
      valor: userStats.pendentes,
      icon: <Warning />,
      color: '#F44336',
      descricao: 'Requer atenção',
    },
  ];

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleExpandProcess = (processId: string) => {
    setExpandedProcess(expandedProcess === processId ? null : processId);
  };

  const handleFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFilterStatus(event.target.value as string);
  };

  const handleAdvancedFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearAdvancedFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      tipo: 'todos',
      status: 'todos',
      valorMin: '',
      valorMax: '',
      urgencia: 'todas',
    });
    setFilterStatus('todos');
    setSearchTerm('');
    setSearchError(null);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.tipo !== 'todos') count++;
    if (filters.status !== 'todos') count++;
    if (filters.valorMin) count++;
    if (filters.valorMax) count++;
    if (filters.urgencia !== 'todas') count++;
    if (filterStatus !== 'todos') count++;
    if (searchTerm) count++;
    return count;
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setSearchError(null);
  };

  const handleSearchSubmit = () => {
    if (validateSearchTerm(searchTerm)) {
      fetchUserData();
    }
  };

  const filteredProcesses = searchTerm
  ? processos
  : processos.filter((processo) => {
      const statusMatch = filterStatus === 'todos' || processo.status === filterStatus;
      const searchMatch =
        searchTerm === '' ||
        processo.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        processo.tipo.toLowerCase().includes(searchTerm.toLowerCase());
      const statusAdvancedMatch = filters.status === 'todos' || processo.status === filters.status;
      const tipoMatch = filters.tipo === 'todos' || processo.tipo === filters.tipo;

      let dateMatch = true;
      if (filters.startDate || filters.endDate) {
        const processDate = new Date(processo.dataInicio.split('/').reverse().join('-'));
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          dateMatch = dateMatch && processDate >= startDate;
        }
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          dateMatch = dateMatch && processDate <= endDate;
        }
      }

      let valorMatch = true;
      if (filters.valorMin || filters.valorMax) {
        const valorEstimado = processo.progresso * 50;
        if (filters.valorMin) {
          valorMatch = valorMatch && valorEstimado >= parseFloat(filters.valorMin);
        }
        if (filters.valorMax) {
          valorMatch = valorMatch && valorEstimado <= parseFloat(filters.valorMax);
        }
      }

      let urgenciaMatch = true;
      if (filters.urgencia !== 'todas') {
        const urgenciaNivel = processo.progresso < 30 ? 'alta' : processo.progresso < 70 ? 'media' : 'baixa';
        urgenciaMatch = filters.urgencia === urgenciaNivel;
      }

      return statusMatch && searchMatch && statusAdvancedMatch && tipoMatch && dateMatch && valorMatch && urgenciaMatch;
    });


  return (
    <Box className={classes.root}>
  
      <Container maxWidth="lg" style={{ marginTop: 24 }}>
        <Paper elevation={3} style={{ padding: 32, borderRadius: 16 }}>
     
          {/* Título e Filtros */}
          <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={3}>
            <Box>
              <Typography variant="h6" style={{ color: '#4a7c59', fontWeight: 'bold' }}>
                Seus Processos {loading && <CircularProgress size={10} style={{ marginLeft: 8 }} />}
              </Typography>
              <Typography variant="body2" style={{ color: '#666', marginTop: 6 }}>
                Acompanhe o andamento de todos os seus serviços
              </Typography>
            </Box>
         
          </Box>

          {/* Barra de Busca e Filtro Rápido */}
          <Box display="flex" alignItems="center" marginBottom={6} style={{ gap: 8 }}>
            <TextField
              label="Pesquisar"
              variant="outlined"
              size="small"
              style={{ flexGrow: 1 }}
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
              error={!!searchError}
              helperText={searchError}
              placeholder="Ex: 123.456.789-00"
            />
            <Tooltip title="Buscar">
              <IconButton onClick={handleSearchSubmit} disabled={loading}>
                <Search />
              </IconButton>
            </Tooltip>
            <FormControl variant="outlined" size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={filterStatus}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="Em Andamento">Em Andamento</MenuItem>
                <MenuItem value="Concluído">Concluído</MenuItem>
                <MenuItem value="Pendente">Pendente</MenuItem>
              </Select>
            </FormControl>
            <Badge badgeContent={getActiveFiltersCount()} color="primary">
              <Tooltip title="Filtros Avançados">
                <IconButton
                  onClick={() => setAdvancedFilterOpen(true)}
                  style={{
                    backgroundColor: getActiveFiltersCount() > 0 ? '#e3f2fd' : 'transparent',
                    color: getActiveFiltersCount() > 0 ? '#1976d2' : '#666',
                  }}
                >
                  <FilterList />
                </IconButton>
              </Tooltip>
            </Badge>
            {getActiveFiltersCount() > 0 && (
              <Tooltip title="Limpar Filtros">
                <IconButton onClick={clearAdvancedFilters} color="secondary">
                  <Close />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Estatísticas */}
          <Grid container spacing={3} style={{ marginBottom: 24 }}>
            {estatisticas.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card style={{ backgroundColor: '#f9fbe7', padding: 16, textAlign: 'center' }}>
                  <ListItemIcon style={{ justifyContent: 'center', color: item.color }}>
                    {item.icon}
                  </ListItemIcon>
                  <Typography variant="h6" style={{ fontWeight: 'bold', color: '#33691e' }}>
                    {item.titulo}
                  </Typography>
                  <Typography variant="h5" style={{ color: item.color, fontWeight: 'bold' }}>
                    {item.valor}
                  </Typography>
                  <Typography variant="body2" style={{ color: '#7cb342' }}>
                    {item.descricao}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
          {/* Lista de Processos */}
          <Box style={{ marginBottom: 24 }}>
            {loading ? (
              <Box display="flex" justifyContent="center" padding={4}>
                <CircularProgress />
                <Typography variant="body1" style={{ marginLeft: 16 }}>
                  Carregando os processos...
                </Typography>
              </Box>
            ) : filteredProcesses.length === 0 ? (
              <Paper style={{ padding: 32, textAlign: 'center' }}>
                <Assignment style={{ fontSize: 64, color: '#ccc', marginBottom: 16 }} />
                <Typography variant="h6" gutterBottom>
                  Nenhum processo encontrado
                </Typography>
                <Typography variant="body2" style={{ color: '#666', marginBottom: 24 }}>
                  {searchTerm
                    ? 'Nenhum documento corresponde aos identificadores fornecidos.'
                    : 'Nenhum processo foi localizado.'}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setServiceDialog(true)}
                  startIcon={<Add />}
                >
                  Solicitar Novo Serviço
                </Button>
              </Paper>
            ) : (
              <>
                {/* ✅ Mostra total de processos encontrados, sem precisar de login */}
                <Box textAlign="center" mt={4} mb={2}>
                  <Typography variant="h5" gutterBottom>
                    Total de Processos: {filteredProcesses.length}
                  </Typography>
                  <Typography variant="body1">
                    Todos os seus processos
                  </Typography>
                </Box>

                {/* Listagem dos processos */}
                {filteredProcesses.map((processo, index) => (
                  <Accordion
                    key={processo.id}
                    expanded={expandedProcess === processo.id}
                    onChange={() => handleExpandProcess(processo.id)}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />} style={{ backgroundColor: '#f1f8e9' }}>
                      <Box display="flex" alignItems="center" width="100%">
                        <ListItemIcon style={{ minWidth: 40, color: processo.color }}>
                          {processo.icon}
                        </ListItemIcon>
                        <Typography variant="subtitle1" style={{ fontWeight: 'bold', flexGrow: 1 }}>
                          {processo.titulo}
                        </Typography>
                        <Chip
                          label={processo.status}
                          style={{ backgroundColor: processo.color, color: '#fff', fontWeight: 'bold' }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails style={{ flexDirection: 'column', padding: 16 }}>
                      <Typography variant="body2" style={{ color: '#558b2f', marginBottom: 8 }}>
                        {processo.descricao}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" style={{ fontWeight: 'bold' }}>
                            Data de Início:
                          </Typography>
                          <Typography variant="body2">{processo.dataInicio}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" style={{ fontWeight: 'bold' }}>
                            Previsão de Conclusão:
                          </Typography>
                          <Typography variant="body2">{processo.previsao}</Typography>
                        </Grid>
                      </Grid>
                      <Divider style={{ margin: '16px 0' }} />
                      <Typography variant="subtitle2" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                        Etapas do Processo:
                      </Typography>
                      <List dense>
                        {processo.etapas.map((etapa, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              {etapa.concluida ? (
                                <CheckCircle style={{ color: '#2e7d32' }} />
                              ) : (
                                <Schedule style={{ color: '#bdbdbd' }} />
                              )}
                            </ListItemIcon>
                            <ListItemText primary={etapa.nome} />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </>
            )}
          </Box>


          {/* Dialog de Filtros Avançados */}
          <Dialog open={advancedFilterOpen} onClose={() => setAdvancedFilterOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>
                  Filtros Avançados
                </Typography>
                <IconButton onClick={() => setAdvancedFilterOpen(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} style={{ paddingTop: 16 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" style={{ fontWeight: 'bold', marginBottom: 16 }}>
                    📅 Período
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Data Início"
                    type="date"
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    value={filters.startDate}
                    onChange={(e) => handleAdvancedFilterChange('startDate', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Data Fim"
                    type="date"
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    value={filters.endDate}
                    onChange={(e) => handleAdvancedFilterChange('endDate', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" style={{ fontWeight: 'bold', marginBottom: 16 }}>
                    🏷️ Categorização
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Tipo de Processo</InputLabel>
                    <Select
                      value={filters.tipo}
                      onChange={(e) => handleAdvancedFilterChange('tipo', e.target.value as string)}
                      label="Tipo de Processo"
                    >
                      <MenuItem value="todos">Todos os Tipos</MenuItem>
                      <MenuItem value="Requerimento">Requerimento</MenuItem>
                      <MenuItem value="Transferência">Transferência</MenuItem>
                      <MenuItem value="Anuência">Anuência</MenuItem>
                      <MenuItem value="Requerimento Digital">Requerimento Digital</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Status Detalhado</InputLabel>
                    <Select
                      value={filters.status}
                      onChange={(e) => handleAdvancedFilterChange('status', e.target.value as string)}
                      label="Status Detalhado"
                    >
                      <MenuItem value="todos">Todos os Status</MenuItem>
                      <MenuItem value="Pendente">Pendente</MenuItem>
                      <MenuItem value="Em Andamento">Em Andamento</MenuItem>
                      <MenuItem value="Processando">Processando</MenuItem>
                      <MenuItem value="Aguardando">Aguardando</MenuItem>
                      <MenuItem value="Revisão">Em Revisão</MenuItem>
                      <MenuItem value="Concluído">Concluído</MenuItem>
                      <MenuItem value="Finalizado">Finalizado</MenuItem>
                      <MenuItem value="Aprovado">Aprovado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" style={{ fontWeight: 'bold', marginBottom: 16 }}>
                    💰 Faixa de Valor Estimado
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Valor Mínimo (R$)"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={filters.valorMin}
                    onChange={(e) => handleAdvancedFilterChange('valorMin', e.target.value)}
                    InputProps={{
                      startAdornment: <span style={{ marginRight: 8 }}>R$</span>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Valor Máximo (R$)"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={filters.valorMax}
                    onChange={(e) => handleAdvancedFilterChange('valorMax', e.target.value)}
                    InputProps={{
                      startAdornment: <span style={{ marginRight: 8 }}>R$</span>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" style={{ fontWeight: 'bold', marginBottom: 16 }}>
                    ⚡ Nível de Urgência
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Urgência</InputLabel>
                    <Select
                      value={filters.urgencia}
                      onChange={(e) => handleAdvancedFilterChange('urgencia', e.target.value as string)}
                      label="Urgência"
                    >
                      <MenuItem value="todas">Todas as Urgências</MenuItem>
                      <MenuItem value="alta">🔴 Alta Urgência</MenuItem>
                      <MenuItem value="media">🟡 Média Urgência</MenuItem>
                      <MenuItem value="baixa">🟢 Baixa Urgência</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {getActiveFiltersCount() > 0 && (
                  <Grid item xs={12}>
                    <Paper style={{ padding: 16, backgroundColor: '#f5f5f5', marginTop: 16 }}>
                      <Typography variant="subtitle2" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                        📋 Filtros Ativos ({getActiveFiltersCount()})
                      </Typography>
                      <Box display="flex" flexWrap="wrap" style={{ gap: 8 }}>
                        {searchTerm && <Chip label={`Busca: "${searchTerm}"`} size="small" color="primary" />}
                        {filterStatus !== 'todos' && <Chip label={`Status: ${filterStatus}`} size="small" color="primary" />}
                        {filters.tipo !== 'todos' && <Chip label={`Tipo: ${filters.tipo}`} size="small" color="primary" />}
                        {filters.startDate && <Chip label={`A partir de: ${filters.startDate}`} size="small" color="primary" />}
                        {filters.endDate && <Chip label={`Até: ${filters.endDate}`} size="small" color="primary" />}
                        {filters.valorMin && <Chip label={`Min: R$ ${filters.valorMin}`} size="small" color="primary" />}
                        {filters.valorMax && <Chip label={`Max: R$ ${filters.valorMax}`} size="small" color="primary" />}
                        {filters.urgencia !== 'todas' && (
                          <Chip label={`Urgência: ${filters.urgencia}`} size="small" color="primary" />
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions style={{ padding: '16px 24px' }}>
              <Button onClick={clearAdvancedFilters} color="secondary" startIcon={<Close />}>
                Limpar Todos
              </Button>
              <Button onClick={() => setAdvancedFilterOpen(false)} color="primary" variant="contained" startIcon={<Search />}>
                Aplicar Filtros
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog de Solicitação de Serviço */}
          <Dialog open={serviceDialog} onClose={() => setServiceDialog(false)}>
            <DialogTitle>Solicitar Novo Serviço</DialogTitle>
            <DialogContent>
              <Typography>Em construção...</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setServiceDialog(false)} color="primary">
                Fechar
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog de Contato */}
          <Dialog open={contactDialog} onClose={() => setContactDialog(false)}>
            <DialogTitle>Entrar em Contato</DialogTitle>
            <DialogContent>
              <Typography>Em construção...</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setContactDialog(false)} color="primary">
                Fechar
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Container>
    </Box>
  );
}
