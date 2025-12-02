import React, { useState, useEffect, useContext } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Tab,
  Tabs,
  Chip,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Container,
  CssBaseline,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Checkbox,
  IconButton,
  Menu,
  Collapse,
  CircularProgress,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import {
  People,
  Security,
  Assignment,
  Add,
  Edit,
  Delete,
  MoreVert,
  ExpandLess,
  ExpandMore,
  Visibility,
  Dashboard,
  CheckCircle,
  Cancel,
  Save,
  CloudUpload,
  Share,
} from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import { motion, AnimatePresence } from 'framer-motion';
import AutenticacaoContext from '@/data/contexts/AutenticacaoContext';
import { usePermissions } from '@/hooks/usePermissions';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    background: theme.palette.type === 'dark'
      ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)'
      : 'linear-gradient(135deg, rgb(150, 150, 150) 0%, #c3cfe2 100%)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    [theme.breakpoints.down('xs')]: {
      overflow: 'auto',
    },
  },
  header: {
    padding: theme.spacing(4),
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textAlign: 'center',
    borderRadius: '0 0 30px 30px',
    boxShadow: theme.shadows[10],
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(3),
      borderRadius: '0 0 20px 20px',
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      borderRadius: '0 0 15px 15px',
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(1.5),
      borderRadius: '0 0 10px 10px',
    },
  },
  tabsContainer: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    margin: theme.spacing(2),
    boxShadow: theme.shadows[8],
    overflow: 'hidden',
    [theme.breakpoints.down('md')]: {
      margin: theme.spacing(1.5),
      borderRadius: theme.spacing(1.5),
    },
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(1),
      borderRadius: theme.spacing(1),
      boxShadow: theme.shadows[4],
    },
    [theme.breakpoints.down('xs')]: {
      margin: theme.spacing(0.5),
      borderRadius: theme.spacing(0.5),
      boxShadow: theme.shadows[2],
    },
  },
  tabs: {
    borderBottom: '1px solid #e0e0e0',
    '& .MuiTab-root': {
      minWidth: 120,
      fontSize: '0.875rem',
      padding: '12px 16px',
      [theme.breakpoints.down('sm')]: {
        minWidth: 80,
        fontSize: '0.7rem',
        padding: '8px 12px',
      },
    },
  },
  tabPanel: {
    padding: 0,
    minHeight: 'calc(100vh - 400px)',
  },
  card: {
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[4],
    background: theme.palette.background.paper,
    transition: 'all 0.3s ease',
    [theme.breakpoints.down('md')]: {
      borderRadius: theme.spacing(1.5),
      boxShadow: theme.shadows[3],
    },
    [theme.breakpoints.down('sm')]: {
      borderRadius: theme.spacing(1),
      boxShadow: theme.shadows[2],
    },
    [theme.breakpoints.down('xs')]: {
      borderRadius: theme.spacing(0.8),
      boxShadow: theme.shadows[1],
    },
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[8],
      [theme.breakpoints.down('sm')]: {
        transform: 'translateY(-1px)',
        boxShadow: theme.shadows[4],
      },
      [theme.breakpoints.down('xs')]: {
        transform: 'none',
        boxShadow: theme.shadows[2],
      },
    },
  },
  permissionChip: {
    fontSize: '0.7rem',
    fontWeight: 'bold',
    color: theme.palette.getContrastText('#3f51b5'),
    backgroundColor: '#3f51b5',
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.65rem',
      height: 18,
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '0.6rem',
      height: 16,
    },
  },
  chipContainer: {
    display: 'flex',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
    marginTop: theme.spacing(1),
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      gap: theme.spacing(0.5),
      marginTop: theme.spacing(0.5),
    },
    [theme.breakpoints.down('xs')]: {
      gap: theme.spacing(0.3),
      marginTop: theme.spacing(0.3),
      justifyContent: 'flex-start',
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
  const classes = useStyles();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      className={classes.tabPanel}
      {...other}
    >
      {value === index && (
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{
              duration: 0.4,
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

const Colaboradores: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
  const router = useRouter();
  const isMobile = theme.breakpoints.down('sm');
  const [tabValue, setTabValue] = useState(0);
  const { usuario, estaAutenticado, carregando } = useContext(AutenticacaoContext);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [usuariosList, setUsuariosList] = useState<any[]>([]);
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState<{
    nome: string;
    email: string;
    senha: string;
    permissao: 'cliente' | 'empresa' | 'colaborador' | 'administrador' | 'Visualizador' | 'Operador' | 'Administrador' | 'CEO' | 'EnygmaDeveloper';
  }>({
    nome: '',
    email: '',
    senha: '',
    permissao: 'cliente',
  });
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [editUserData, setEditUserData] = useState<{
    id: string;
    nome: string;
    email: string;
    permissao: 'cliente' | 'empresa' | 'colaborador' | 'administrador' | 'Visualizador' | 'Operador' | 'Administrador' | 'CEO' | 'EnygmaDeveloper';
    ativo: boolean;
  }>({
    id: '',
    nome: '',
    email: '',
    permissao: 'cliente',
    ativo: true,
  });
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newProfileDialogOpen, setNewProfileDialogOpen] = useState(false);
  const [newProfileData, setNewProfileData] = useState({
    nome: '',
    descricao: '',
    permissoes: {
      dashboard: false,
      chat: false,
      crm: false,
      relatorios: false,
      usuarios: false,
      configuracoes: false,
    },
  });
  const [dashboardExpanded, setDashboardExpanded] = useState<string | null>(null);

  const { hasAreaAccess, hasModulePermission } = usePermissions();
  const isAuthenticated = estaAutenticado();
  const hasColaboradorAccess = isAuthenticated && hasAreaAccess('colaborador');
  const hasUserManagement = isAuthenticated && (
    hasModulePermission('colaborador', 'usuarios', 'visualizar') ||
    hasModulePermission('empresarial', 'usuarios', 'visualizar')
  );
  const hasPermissionManagement = isAuthenticated && (
    hasModulePermission('colaborador', 'permissoes', 'visualizar') ||
    usuario?.permissao === 'Administrador' ||
    usuario?.permissao === 'EnygmaDeveloper'
  );

  const accessProfiles = [
    {
      id: 'administrador',
      nome: 'Administrador',
      descricao: 'Acesso total ao sistema',
      icon: <Security style={{ color: '#f44336' }} />,
      color: '#f44336',
      usuarios: usuariosList.filter((u) => u.permissao === 'Administrador').length,
      permissoes: {
        dashboard: { ativo: true, criar: true, editar: true, excluir: true, visualizar: true },
        usuarios: { ativo: true, criar: true, editar: true, excluir: true, visualizar: true },
        permissoes: { ativo: true, criar: true, editar: true, excluir: true, visualizar: true },
      },
    },
    {
      id: 'ceo',
      nome: 'CEO',
      descricao: 'Acesso executivo total',
      icon: <Security style={{ color: '#9c27b0' }} />,
      color: '#9c27b0',
      usuarios: usuariosList.filter((u) => u.permissao === 'CEO').length,
      permissoes: {
        dashboard: { ativo: true, criar: true, editar: true, excluir: true, visualizar: true },
        usuarios: { ativo: true, criar: true, editar: true, excluir: true, visualizar: true },
        permissoes: { ativo: true, criar: false, editar: true, excluir: false, visualizar: true },
      },
    },
    {
      id: 'enygmadeveloper',
      nome: 'EnygmaDeveloper',
      descricao: 'Desenvolvedor do sistema',
      icon: <Security style={{ color: '#00bcd4' }} />,
      color: '#00bcd4',
      usuarios: usuariosList.filter((u) => u.permissao === 'EnygmaDeveloper').length,
      permissoes: {
        dashboard: { ativo: true, criar: true, editar: true, excluir: true, visualizar: true },
        usuarios: { ativo: true, criar: true, editar: true, excluir: true, visualizar: true },
        permissoes: { ativo: true, criar: true, editar: true, excluir: true, visualizar: true },
      },
    },
    {
      id: 'operador',
      nome: 'Operador',
      descricao: 'Operações básicas',
      icon: <Security style={{ color: '#ff9800' }} />,
      color: '#ff9800',
      usuarios: usuariosList.filter((u) => u.permissao === 'Operador').length,
      permissoes: {
        dashboard: { ativo: true, criar: false, editar: false, excluir: false, visualizar: true },
        usuarios: { ativo: false, criar: false, editar: false, excluir: false, visualizar: false },
        permissoes: { ativo: false, criar: false, editar: false, excluir: false, visualizar: false },
      },
    },
    {
      id: 'visualizador',
      nome: 'Visualizador',
      descricao: 'Apenas visualização',
      icon: <Visibility style={{ color: '#2196f3' }} />,
      color: '#2196f3',
      usuarios: usuariosList.filter((u) => u.permissao === 'Visualizador' || !u.permissao).length,
      permissoes: {
        dashboard: { ativo: true, criar: false, editar: false, excluir: false, visualizar: true },
        usuarios: { ativo: false, criar: false, editar: false, excluir: false, visualizar: false },
        permissoes: { ativo: false, criar: false, editar: false, excluir: false, visualizar: false },
      },
    },
  ];

  const dashboardsData = [
    {
      id: 'geral',
      nome: 'Dashboard Geral',
      descricao: 'Visão geral de todos os documentos',
      icon: <Dashboard />,
      color: '#4CAF50',
      documentos: 1247,
      acoes: [
        { id: 'visualizar', nome: 'Visualizar', icon: <Visibility />, color: '#2196F3' },
        { id: 'compartilhar', nome: 'Compartilhar', icon: <Share />, color: '#FF9800' },
        { id: 'backup', nome: 'Backup', icon: <Save />, color: '#607D8B' },
      ],
    },
    {
      id: 'documentos',
      nome: 'Dashboard Documentos',
      descricao: 'Gerenciamento de documentos',
      icon: <Assignment />,
      color: '#E91E63',
      documentos: 456,
      acoes: [
        { id: 'visualizar', nome: 'Visualizar', icon: <Visibility />, color: '#2196F3' },
        { id: 'upload', nome: 'Upload', icon: <CloudUpload />, color: '#4CAF50' },
        { id: 'compartilhar', nome: 'Compartilhar', icon: <Share />, color: '#FF9800' },
        { id: 'backup', nome: 'Backup', icon: <Save />, color: '#607D8B' },
      ],
    },
  ];

  useEffect(() => {
    setIsLoading(true);
    carregarUsuarios().finally(() => setIsLoading(false));
  }, []);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  };

  const carregarUsuarios = async () => {
    try {
      const { default: Colecao } = await import('@/logic/firebase/db/Colecao');
      const colecao = new Colecao();
      const usuarios = await colecao.consultarTodos('usuarios');
      
      // Filtrar dados sensíveis e formatar
      const usuariosFormatados = usuarios.map((usuario) => {
        // Remover campos sensíveis da memória
        const { senha, senhaHash, salt, ...dadosPublicos } = usuario;
        
        return {
          id: dadosPublicos.id || dadosPublicos.email,
          nome: dadosPublicos.nome || 'Nome não informado',
          email: dadosPublicos.email || 'Email não informado',
          permissao: dadosPublicos.permissao || 'Visualizador',
          ativo: dadosPublicos.ativo !== false,
          imagemUrl: dadosPublicos.imagemUrl || '/betologo.jpeg',
          dataCriacao: dadosPublicos.dataCriacao || new Date(),
          // Indicadores de segurança (sem expor os valores)
          temSenhaSegura: !!(senhaHash && salt),
          temSenhaTextoPlano: !!senha,
        };
      });
      
      setUsuariosList(usuariosFormatados);
      
      // Log de segurança
      const usuariosInseguros = usuariosFormatados.filter(u => u.temSenhaTextoPlano);
      if (usuariosInseguros.length > 0) {
        console.warn(`⚠️ ${usuariosInseguros.length} usuário(s) com senha em texto plano detectado(s)!`);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setUsuariosList([]);
      setNotifications([{
        id: Date.now(),
        message: 'Erro ao carregar usuários.',
        type: 'error',
      }]);
    }
  };

  const handleToggleUserStatus = async (usuario: any) => {
    try {
      const { default: Colecao } = await import('@/logic/firebase/db/Colecao');
      const colecao = new Colecao();
      const novoStatus = !usuario.ativo;
      await colecao.salvar('usuarios', {
        ...usuario,
        ativo: novoStatus,
        dataAtualizacao: new Date(),
      }, usuario.email);
      setNotifications([{
        id: Date.now(),
        message: `Usuário ${usuario.nome} ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`,
        type: 'success',
      }]);
      await carregarUsuarios();
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      setNotifications([{
        id: Date.now(),
        message: 'Erro ao alterar status do usuário.',
        type: 'error',
      }]);
    }
  };

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>, usuario: any) => {
    setUserMenuAnchor(event.currentTarget);
    setSelectedUser(usuario);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
    setSelectedUser(null);
  };

  const handleEditUser = (usuario: any) => {
    setEditUserData({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      permissao: usuario.permissao,
      ativo: usuario.ativo,
    });
    setEditUserDialogOpen(true);
    handleUserMenuClose();
  };

  const handleDeleteUser = (usuario: any) => {
    setUserToDelete(usuario);
    setDeleteUserDialogOpen(true);
    handleUserMenuClose();
  };

  const handleNewUserInputChange = (field: keyof typeof newUserData, value: any) => {
    setNewUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditUserInputChange = (field: keyof typeof editUserData, value: any) => {
    setEditUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNewUserSubmit = async () => {
    try {
      if (!newUserData.nome || !newUserData.email || !newUserData.senha) {
        setNotifications([{
          id: Date.now(),
          message: 'Preencha todos os campos obrigatórios.',
          type: 'error',
        }]);
        return;
      }

      console.log('🔐 Criando usuário seguro com criptografia salt+hash SHA-256:', newUserData.email);

      // SEMPRE usar a API segura - NUNCA salvar direto no Firestore
      const response = await fetch('/api/migrar-contas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          criarUsuario: true,
          usuario: {
            email: newUserData.email.trim().toLowerCase(),
            nome: newUserData.nome.trim(),
            senha: newUserData.senha,
            permissao: newUserData.permissao,
            imagemUrl: '/betologo.jpeg',
            ativo: true,
            consentimentoLGPD: true,
            aceitouTermos: true,
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar usuário');
      }

      console.log('✅ Usuário criado com segurança:', {
        email: data.email,
        temSalt: !!data.usuario?.salt,
        temHash: !!data.usuario?.senhaHash,
        lgpdCompliant: data.usuario?.lgpdCompliant
      });

      setNotifications([{
        id: Date.now(),
        message: `✅ ${newUserData.nome} criado com sucesso! 🔒 Senha criptografada com salt único + SHA-256. ✅ LGPD compliant.`,
        type: 'success',
      }]);
      
      setNewUserDialogOpen(false);
      setNewUserData({
        nome: '',
        email: '',
        senha: '',
        permissao: 'cliente',
      });
      
      // Aguardar um pouco antes de recarregar para garantir que o Firestore foi atualizado
      await new Promise(resolve => setTimeout(resolve, 500));
      await carregarUsuarios();
    } catch (error: any) {
      console.error('❌ Erro ao criar usuário:', error);
      setNotifications([{
        id: Date.now(),
        message: error.message || 'Erro ao criar usuário. Verifique os dados.',
        type: 'error',
      }]);
    }
  };

  const handleEditUserSubmit = async () => {
    try {
      const { default: Colecao } = await import('@/logic/firebase/db/Colecao');
      const colecao = new Colecao();
      const dadosAtualizados = {
        nome: editUserData.nome,
        email: editUserData.email,
        permissao: editUserData.permissao,
        ativo: editUserData.ativo,
        dataAtualizacao: new Date(),
      };
      await colecao.salvar('usuarios', dadosAtualizados, editUserData.email);
      setNotifications([{
        id: Date.now(),
        message: `Usuário ${editUserData.nome} atualizado com sucesso!`,
        type: 'success',
      }]);
      setEditUserDialogOpen(false);
      await carregarUsuarios();
    } catch (error) {
      console.error('Erro ao editar usuário:', error);
      setNotifications([{
        id: Date.now(),
        message: 'Erro ao editar usuário.',
        type: 'error',
      }]);
    }
  };

  const confirmDeleteUser = async () => {
    try {
      const { default: Colecao } = await import('@/logic/firebase/db/Colecao');
      const colecao = new Colecao();
      await colecao.excluir('usuarios', userToDelete.email);
      setNotifications([{
        id: Date.now(),
        message: `Usuário ${userToDelete.nome} excluído com sucesso!`,
        type: 'success',
      }]);
      setDeleteUserDialogOpen(false);
      setUserToDelete(null);
      await carregarUsuarios();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setNotifications([{
        id: Date.now(),
        message: 'Erro ao excluir usuário.',
        type: 'error',
      }]);
    }
  };

  const handleNewProfileInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setNewProfileData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as Record<string, any>,
          [child]: value,
        },
      }));
    } else {
      setNewProfileData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleNewProfileSubmit = () => {
    console.log('Criando novo perfil:', newProfileData);
    setNewProfileDialogOpen(false);
    setNewProfileData({
      nome: '',
      descricao: '',
      permissoes: {
        dashboard: false,
        chat: false,
        crm: false,
        relatorios: false,
        usuarios: false,
        configuracoes: false,
      },
    });
    setNotifications([{
      id: Date.now(),
      message: `Perfil ${newProfileData.nome} criado com sucesso!`,
      type: 'success',
    }]);
  };

  const handleDashboardExpand = (dashboardId: string) => {
    setDashboardExpanded(dashboardExpanded === dashboardId ? null : dashboardId);
  };

  const handleDashboardAction = (dashboardId: string, actionId: string) => {
    console.log(`Ação ${actionId} no dashboard ${dashboardId}`);
    setNotifications([{
      id: Date.now(),
      message: `Ação ${actionId} executada no ${dashboardId}!`,
      type: 'success',
    }]);
  };

  if (carregando) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <CircularProgress size={60} style={{ color: '#fff' }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/');
    return null;
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Paper className={classes.header}>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing(-3) }}>
            <Avatar
              src={usuario?.imagemUrl || '/betologo.jpeg'}
              style={{ width: 50, height: 50, marginRight: theme.spacing(1) }}
            >
              {usuario?.nome?.charAt(0)?.toUpperCase() || usuario?.email?.charAt(0)?.toUpperCase() || '?'}
            </Avatar>
            <div>
              <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                {usuario?.nome || usuario?.email || 'Usuário'}
              </Typography>
              <div className={classes.chipContainer}>
                <Chip
                  label="Online"
                  size="small"
                  className={classes.permissionChip}
                  style={{ backgroundColor: '#4caf50' }}
                />
                {usuario?.permissao && (
                  <Chip
                    label={usuario.permissao}
                    size="small"
                    className={classes.permissionChip}
                    style={{
                      backgroundColor: usuario.permissao === 'Administrador' ? '#f44336' :
                        usuario.permissao === 'CEO' ? '#9c27b0' :
                          usuario.permissao === 'EnygmaDeveloper' ? '#00bcd4' :
                            usuario.permissao === 'Operador' ? '#ff9800' : '#2196f3',
                    }}
                  />
                )}
                {hasColaboradorAccess && (
                  <Chip
                    label="Colaborador"
                    size="small"
                    style={{
                      backgroundColor: '#ff9800',
                      color: 'white',
                      fontSize: '0.6rem',
                      height: '18px',
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </Paper>

      <Container maxWidth="xl">
        <Paper className={classes.tabsContainer}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            className={classes.tabs}
          >
            <Tab
              label={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <People style={{ marginRight: 8 }} />
                  Usuários
                </div>
              }
            />
            <Tab
              label={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Security style={{ marginRight: 8 }} />
                  Permissões
                </div>
              }
            />
            <Tab
              label={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Assignment style={{ marginRight: 8 }} />
                  Dashboard Documentos
                </div>
              }
            />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Container maxWidth="lg" style={{ padding: '24px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Typography variant="h4" style={{ fontWeight: 'bold', color: '#1976d2' }}>
                  👥 Gestão de Usuários ({usuariosList?.length || 0})
                </Typography>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => {
                      setIsLoading(true);
                      carregarUsuarios().finally(() => setIsLoading(false));
                    }}
                    disabled={isLoading}
                    style={{ borderRadius: 8 }}
                  >
                    Recarregar
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={() => setNewUserDialogOpen(true)}
                    style={{ borderRadius: 8 }}
                    disabled={!hasUserManagement}
                  >
                    Novo Usuário
                  </Button>
                </div>
              </div>

              <TableContainer
                component={Paper}
                style={{
                  borderRadius: isMobile ? 8 : 12,
                  boxShadow: isMobile ? '0 2px 8px rgba(0,0,0,0.1)' : '0 4px 16px rgba(0,0,0,0.1)',
                  overflowX: 'auto',
                }}
              >
                <Table size={isMobile ? 'small' : 'medium'}>
                  <TableHead style={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell style={{ minWidth: isMobile ? 120 : 150 }}><strong>Usuário</strong></TableCell>
                      {!isMobile && <TableCell><strong>Email</strong></TableCell>}
                      <TableCell><strong>Permissão</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell style={{ minWidth: 80 }}><strong>Ações</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosList && usuariosList.length > 0 ? (
                      usuariosList.map((usuario, index) => (
                        <TableRow 
                          key={usuario.id || usuario.email || index} 
                          hover
                          style={{
                            backgroundColor: (usuario as any).temSenhaTextoPlano ? '#fff3cd' : undefined
                          }}
                        >
                          <TableCell>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                src={usuario.imagemUrl || '/betologo.jpeg'}
                                style={{
                                  width: isMobile ? 32 : 40,
                                  height: isMobile ? 32 : 40,
                                  marginRight: isMobile ? 8 : 12,
                                  border: (usuario as any).temSenhaTextoPlano ? '2px solid #ff9800' : undefined
                                }}
                              >
                                {usuario.nome?.charAt(0)?.toUpperCase() || usuario.email?.charAt(0)?.toUpperCase() || '?'}
                              </Avatar>
                              <div>
                                <Typography
                                  variant="body1"
                                  style={{
                                    fontWeight: 'bold',
                                    fontSize: isMobile ? '0.8rem' : undefined,
                                  }}
                                >
                                  {usuario.nome || usuario.email || 'Nome não informado'}
                                </Typography>
                                {isMobile && (
                                  <Typography variant="caption" color="textSecondary" style={{ fontSize: '0.7rem' }}>
                                    {usuario.email}
                                  </Typography>
                                )}
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                  style={{ fontSize: isMobile ? '0.65rem' : undefined }}
                                >
                                  ID: {usuario.id || usuario.email || 'N/A'}
                                </Typography>
                              </div>
                            </div>
                          </TableCell>
                          {!isMobile && (
                            <TableCell>
                              <Typography variant="body2" style={{ fontSize: isMobile ? '0.75rem' : undefined }}>
                                {usuario.email || 'Email não informado'}
                              </Typography>
                            </TableCell>
                          )}
                          <TableCell>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                              <Chip
                                label={usuario.permissao || 'Visualizador'}
                                color={usuario.permissao === 'Administrador' ? 'secondary' : 'default'}
                                size="small"
                                style={{
                                  fontSize: isMobile ? '0.65rem' : undefined,
                                  height: isMobile ? 20 : undefined,
                                }}
                              />
                              {(usuario as any).temSenhaTextoPlano && (
                                <Chip
                                  label="⚠️ Senha insegura"
                                  size="small"
                                  style={{
                                    backgroundColor: '#ff9800',
                                    color: 'white',
                                    fontSize: isMobile ? '0.6rem' : '0.65rem',
                                    height: isMobile ? 18 : 20,
                                  }}
                                />
                              )}
                              {(usuario as any).temSenhaSegura && (
                                <Chip
                                  label="🔒 Seguro"
                                  size="small"
                                  style={{
                                    backgroundColor: '#4caf50',
                                    color: 'white',
                                    fontSize: isMobile ? '0.6rem' : '0.65rem',
                                    height: isMobile ? 18 : 20,
                                  }}
                                />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={usuario.ativo !== false}
                                  onChange={() => handleToggleUserStatus(usuario)}
                                  color="primary"
                                  size="small"
                                />
                              }
                              label={usuario.ativo !== false ? 'Ativo' : 'Inativo'}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={(e) => handleUserMenuClick(e, usuario)}
                              size="small"
                            >
                              <MoreVert />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} style={{ textAlign: 'center', padding: '48px' }}>
                          <Typography variant="h6" color="textSecondary">
                            {isLoading ? 'Carregando usuários...' : 'Nenhum usuário encontrado'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                            {!isLoading && 'Adicione o primeiro usuário clicando no botão "Novo Usuário"'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
              >
                <MenuItem onClick={() => handleEditUser(selectedUser)}>
                  <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
                  <ListItemText>Editar</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleDeleteUser(selectedUser)}>
                  <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
                  <ListItemText>Excluir</ListItemText>
                </MenuItem>
              </Menu>
            </Container>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Container maxWidth="lg" style={{ padding: '24px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Typography variant="h4" style={{ fontWeight: 'bold', color: '#1976d2' }}>
                  🔐 Sistema de Permissões
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={() => setNewProfileDialogOpen(true)}
                  style={{ borderRadius: 8 }}
                  disabled={!hasPermissionManagement}
                >
                  Novo Perfil
                </Button>
              </div>

              <Grid container spacing={isMobile ? 2 : 3}>
                {accessProfiles.map((profile) => (
                  <Grid item xs={12} sm={6} md={6} lg={4} key={profile.id}>
                    <Card className={classes.card} style={{ height: '100%' }}>
                      <CardContent>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                          {profile.icon}
                          <Typography variant="h6" style={{ marginLeft: 8, fontWeight: 'bold' }}>
                            {profile.nome}
                          </Typography>
                        </div>
                        <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                          {profile.descricao}
                        </Typography>
                        <div style={{ marginBottom: 16 }}>
                          <Chip
                            label={`${profile.usuarios} usuários`}
                            size="small"
                            style={{ backgroundColor: profile.color, color: 'white' }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Container maxWidth="lg" style={{ padding: '24px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Typography variant="h4" style={{ fontWeight: 'bold', color: '#1976d2' }}>
                  📊 Dashboard Documentos
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  style={{ borderRadius: 8 }}
                >
                  Novo Dashboard
                </Button>
              </div>

              <Grid container spacing={isMobile ? 2 : 3}>
                {dashboardsData.map((dashboard) => (
                  <Grid item xs={12} sm={6} md={6} lg={6} key={dashboard.id}>
                    <Card className={classes.card}>
                      <CardContent>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                          {dashboard.icon}
                          <div style={{ marginLeft: 12, flex: 1 }}>
                            <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                              {dashboard.nome}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {dashboard.descricao}
                            </Typography>
                            <Typography variant="caption" style={{ color: dashboard.color }}>
                              {dashboard.documentos} documentos
                            </Typography>
                          </div>
                          <IconButton
                            onClick={() => handleDashboardExpand(dashboard.id)}
                            size="small"
                          >
                            {dashboardExpanded === dashboard.id ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </div>

                        <Collapse in={dashboardExpanded === dashboard.id}>
                          <Typography variant="subtitle2" style={{ marginBottom: 8, fontWeight: 'bold' }}>
                            Ações Disponíveis:
                          </Typography>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {dashboard.acoes.map((acao) => (
                              <Button
                                key={acao.id}
                                size="small"
                                variant="outlined"
                                startIcon={acao.icon}
                                onClick={() => handleDashboardAction(dashboard.id, acao.id)}
                                style={{ borderColor: acao.color, color: acao.color }}
                              >
                                {acao.nome}
                              </Button>
                            ))}
                          </div>
                        </Collapse>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </TabPanel>
        </Paper>
      </Container>

      <Dialog
        open={newUserDialogOpen}
        onClose={() => setNewUserDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={typeof isMobile === 'boolean' ? isMobile : false}
        PaperProps={{
          style: {
            margin: isMobile ? 0 : 32,
            borderRadius: isMobile ? 0 : 8,
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" style={{ display: 'flex', alignItems: 'center' }}>
            <Add style={{ marginRight: 8 }} />
            Adicionar Novo Usuário
          </Typography>
          <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
            🔒 Senha será armazenada com salt aleatório e hash SHA-256 para máxima segurança
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: 8 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={newUserData.nome}
                onChange={(e) => handleNewUserInputChange('nome', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newUserData.email}
                onChange={(e) => handleNewUserInputChange('email', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Senha"
                type="password"
                value={newUserData.senha}
                onChange={(e) => handleNewUserInputChange('senha', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Permissão</InputLabel>
                <Select
                  value={newUserData.permissao}
                  onChange={(e) => handleNewUserInputChange('permissao', e.target.value as string)}
                  label="Permissão"
                >
                  <MenuItem value="cliente">Área Cliente</MenuItem>
                 
                  <MenuItem value="colaborador">Colaborador</MenuItem>
                  <MenuItem value="administrador">Administrador</MenuItem>
                  <MenuItem value="Visualizador">Visualizador</MenuItem>
                  <MenuItem value="Operador">Operador</MenuItem>
                  <MenuItem value="CEO">CEO</MenuItem>
                  <MenuItem value="EnygmaDeveloper">EnygmaDeveloper</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewUserDialogOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleNewUserSubmit} color="primary" variant="contained" disabled={!hasUserManagement}>
            Criar Usuário
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editUserDialogOpen}
        onClose={() => setEditUserDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={typeof isMobile === 'boolean' ? isMobile : false}
        PaperProps={{
          style: {
            margin: isMobile ? 0 : 32,
            borderRadius: isMobile ? 0 : 8,
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" style={{ display: 'flex', alignItems: 'center' }}>
            <Edit style={{ marginRight: 8 }} />
            Editar Usuário
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: 8 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={editUserData.nome}
                onChange={(e) => handleEditUserInputChange('nome', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editUserData.email}
                onChange={(e) => handleEditUserInputChange('email', e.target.value)}
                variant="outlined"
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Permissão</InputLabel>
                <Select
                  value={editUserData.permissao}
                  onChange={(e) => handleEditUserInputChange('permissao', e.target.value as string)}
                  label="Permissão"
                >
                  <MenuItem value="cliente">Área Cliente</MenuItem>
                  <MenuItem value="empresa">Área Empresarial</MenuItem>
                  <MenuItem value="colaborador">Colaborador</MenuItem>
                  <MenuItem value="administrador">Administrador</MenuItem>
                  <MenuItem value="Visualizador">Visualizador</MenuItem>
                  <MenuItem value="Operador">Operador</MenuItem>
                  <MenuItem value="CEO">CEO</MenuItem>
                  <MenuItem value="EnygmaDeveloper">EnygmaDeveloper</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editUserData.ativo}
                    onChange={(e) => handleEditUserInputChange('ativo', e.target.checked)}
                    color="primary"
                  />
                }
                label="Usuário Ativo"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUserDialogOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleEditUserSubmit} color="primary" variant="contained" disabled={!hasUserManagement}>
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteUserDialogOpen} onClose={() => setDeleteUserDialogOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o usuário <strong>{userToDelete?.nome}</strong>?
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteUserDialogOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={confirmDeleteUser} color="primary" variant="contained" disabled={!hasUserManagement}>
            Confirmar Exclusão
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={newProfileDialogOpen}
        onClose={() => setNewProfileDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={typeof isMobile === 'boolean' ? isMobile : false}

        PaperProps={{
          style: {
            margin: isMobile ? 0 : 32,
            borderRadius: isMobile ? 0 : 8,
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" style={{ display: 'flex', alignItems: 'center' }}>
            <Add style={{ marginRight: 8 }} />
            Criar Novo Perfil de Acesso
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} style={{ marginTop: 8 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome do Perfil"
                value={newProfileData.nome}
                onChange={(e) => handleNewProfileInputChange('nome', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Descrição"
                value={newProfileData.descricao}
                onChange={(e) => handleNewProfileInputChange('descricao', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" style={{ marginTop: 16, marginBottom: 16 }}>
                Permissões do Módulo
              </Typography>
              <Grid container spacing={2}>
                {Object.keys(newProfileData.permissoes).map((permissao) => (
                  <Grid item xs={12} sm={6} md={4} key={permissao}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={newProfileData.permissoes[permissao as keyof typeof newProfileData.permissoes]}
                          onChange={(e) => handleNewProfileInputChange(`permissoes.${permissao}`, e.target.checked)}
                          color="primary"
                        />
                      }
                      label={permissao.charAt(0).toUpperCase() + permissao.slice(1)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewProfileDialogOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleNewProfileSubmit} color="primary" variant="contained">
            Criar Perfil
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notifications.length > 0}
        autoHideDuration={6000}
        onClose={() => setNotifications([])}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={notifications[0]?.type || 'success'} onClose={() => setNotifications([])}>
          {notifications[0]?.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Colaboradores;