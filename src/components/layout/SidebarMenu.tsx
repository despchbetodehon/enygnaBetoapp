
import React, { useState, useContext, useEffect } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Typography, 
  Avatar,
  IconButton,
  Chip,
  Box,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
 
  

  Snackbar
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import {
  Dashboard,
  People,
  Chat,
  Business,
  Settings,
  ExitToApp,
  Security,
  Assessment,
  
  NotificationsActive,
  WhatsApp,
  Timeline,
  EmojiObjects,
  MoreVert,
  Add,
  Edit,
  Delete,
  VpnKey,
 
  SupervisorAccount,
  PersonAdd,
  AccountCircle,
  Lock,
  LockOpen
} from '@material-ui/icons';
import { useRouter } from 'next/router';
import AutenticacaoContext from '@/data/contexts/AutenticacaoContext';

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: 280,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 280,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRight: 'none',
  },
  userSection: {
    padding: theme.spacing(2),
    background: 'rgba(255,255,255,0.1)',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
  },
  userAvatar: {
    width: 60,
    height: 60,
    margin: '0 auto 8px',
    border: '3px solid rgba(255,255,255,0.3)',
  },
  menuItem: {
    margin: theme.spacing(0.5, 1),
    borderRadius: theme.spacing(1),
    '&:hover': {
      background: 'rgba(255,255,255,0.1)',
    },
    '&.active': {
      background: 'rgba(255,255,255,0.2)',
      '& .MuiListItemIcon-root': {
        color: '#FFD700',
      },
    },
  },
  permissionChip: {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    fontSize: '0.7rem',
    height: 20,
  },
  adminSection: {
    background: 'rgba(255,0,0,0.1)',
    margin: theme.spacing(1),
    borderRadius: theme.spacing(1),
    border: '1px solid rgba(255,0,0,0.3)',
  },
  userManagementCard: {
    margin: theme.spacing(1),
    background: 'rgba(255,255,255,0.95)',
    color: theme.palette.text.primary,
    borderRadius: theme.spacing(2),
  },
  quickActionBtn: {
    margin: theme.spacing(0.5),
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    '&:hover': {
      background: 'rgba(255,255,255,0.2)',
    },
  },
}));

interface SidebarMenuProps {
  open: boolean;
  onClose: () => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ open, onClose }) => {
  const classes = useStyles();
  const router = useRouter();
  const { usuario, logout, estaAutenticado } = useContext(AutenticacaoContext);
  
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [quickUserDialogOpen, setQuickUserDialogOpen] = useState(false);
  const [userStats, setUserStats] = useState({ total: 0, active: 0, admin: 0 });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [newUserData, setNewUserData] = useState({
    nome: '',
    email: '',
    senha: '',
    permissao: 'Visualizador'
  });

  // Verificar permissões do usuário
  const isAdmin = usuario?.permissao === 'Administrador' || usuario?.permissao === 'EnygmaDeveloper';
  const canManageUsers = isAdmin || usuario?.permissao === 'CEO';

  // Carregar estatísticas de usuários
  useEffect(() => {
    if (canManageUsers) {
      loadUserStats();
    }
  }, [canManageUsers]);

  const loadUserStats = async () => {
    try {
      const { default: Colecao } = await import('@/logic/firebase/db/Colecao');
      const colecao = new Colecao();
      const usuarios = await colecao.consultarTodos('usuarios');
      const usuariosArray = Array.isArray(usuarios) ? usuarios : Object.values(usuarios || {});
      
      setUserStats({
        total: usuariosArray.length,
        active: usuariosArray.filter(u => u.ativo !== false).length,
        admin: usuariosArray.filter(u => ['Administrador', 'CEO', 'EnygmaDeveloper'].includes(u.permissao)).length
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const menuItems = [
    { 
      icon: <Dashboard />, 
      text: 'Dashboard', 
      path: '/colaboradores',
      badge: null,
      permission: 'all'
    },
    { 
      icon: <Chat />, 
      text: 'Chat Interno', 
      path: '/colaboradores#chat',
      badge: 3,
      permission: 'all'
    },
    { 
      icon: <EmojiObjects />, 
      text: 'IA Lívia', 
      path: '/colaboradores#ia',
      badge: null,
      permission: 'all'
    },
    { 
      icon: <Business />, 
      text: 'CRM', 
      path: '/colaboradores#crm',
      badge: null,
      permission: 'all'
    },
    { 
      icon: <Timeline />, 
      text: 'Feed', 
      path: '/colaboradores#feed',
      badge: 5,
      permission: 'all'
    },
    { 
      icon: <People />, 
      text: 'Usuários', 
      path: '/colaboradores#usuarios',
      badge: userStats.total > 0 ? userStats.total : null,
      permission: 'admin'
    },
    { 
      icon: <WhatsApp />, 
      text: 'WhatsApp', 
      path: '/colaboradores#whatsapp',
      badge: null,
      permission: 'all'
    },
    { 
      icon: <Security />, 
      text: 'Permissões', 
      path: '/colaboradores#permissoes',
      badge: null,
      permission: 'admin'
    },
    { 
      icon: <Assessment />, 
      text: 'Relatórios', 
      path: '/colaboradores#relatorios',
      badge: null,
      permission: 'all'
    },
    { 
      icon: <Settings />, 
      text: 'Configurações', 
      path: '/colaboradores#configuracoes',
      badge: null,
      permission: 'admin'
    },
  ];

  const handleNavigation = (path: string) => {
    if (path.includes('#')) {
      const [basePath, hash] = path.split('#');
      router.push(basePath).then(() => {
        // Simular clique na aba correspondente
        const tabMap: { [key: string]: number } = {
          'chat': 1,
          'ia': 2,
          'crm': 3,
          'feed': 4,
          'usuarios': 5,
          'whatsapp': 6,
          'permissoes': 7,
          'relatorios': 8,
          'configuracoes': 9
        };
        // Aqui você pode implementar a lógica para mudar a aba ativa
      });
    } else {
      router.push(path);
    }
    onClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const handleQuickCreateUser = async () => {
    try {
      const { default: ServicosUsuario } = await import('@/logic/core/usuario/ServicosUsuario');
      const servicosUsuario = new ServicosUsuario();

      const novoUsuario = {
        ...newUserData,
        ativo: true,
        dataCriacao: new Date(),
        id: newUserData.email
      };

      await servicosUsuario.salvar(novoUsuario);
      
      setNotifications([{
        id: Date.now(),
        message: `Usuário ${newUserData.nome} criado com sucesso!`,
        type: 'success'
      }]);

      setQuickUserDialogOpen(false);
      setNewUserData({ nome: '', email: '', senha: '', permissao: 'Visualizador' });
      loadUserStats();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setNotifications([{
        id: Date.now(),
        message: 'Erro ao criar usuário. Tente novamente.',
        type: 'error'
      }]);
    }
  };

  const shouldShowMenuItem = (permission: string) => {
    if (permission === 'all') return true;
    if (permission === 'admin') return canManageUsers;
    return false;
  };

  if (!estaAutenticado()) {
    return null;
  }

  return (
    <>
      <Drawer
        className={classes.drawer}
        variant="temporary"
        anchor="left"
        open={open}
        onClose={onClose}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        {/* Seção do Usuário */}
        <Box className={classes.userSection}>
          <Avatar 
            src={usuario?.imagemUrl || '/betologo.jpg'} 
            className={classes.userAvatar}
          >
            {usuario?.nome?.charAt(0) || 'U'}
          </Avatar>
          
          <Typography variant="h6" align="center" style={{ fontWeight: 'bold' }}>
            {usuario?.nome || 'Usuário'}
          </Typography>
          
          <Typography variant="body2" align="center" style={{ opacity: 0.8, marginBottom: 8 }}>
            {usuario?.email}
          </Typography>
          
          <Box display="flex" justifyContent="center" style={{ gap: 1}}>
            <Chip 
              label={usuario?.permissao || 'Usuário'} 
              size="small" 
              className={classes.permissionChip}
              icon={<VpnKey style={{ color: 'white' }} />}
            />
            {isAdmin && (
              <Chip 
                label="Admin" 
                size="small" 
                style={{ background: '#f44336', color: 'white' }}
                icon={<Settings style={{ color: 'white' }} />}
              />
            )}
          </Box>

          <Box display="flex" justifyContent="center" marginTop={1}>
            <IconButton 
              size="small" 
              className={classes.quickActionBtn}
              onClick={(e) => setUserMenuAnchor(e.currentTarget)}
            >
              <MoreVert />
            </IconButton>
            {canManageUsers && (
              <IconButton 
                size="small" 
                className={classes.quickActionBtn}
                onClick={() => setQuickUserDialogOpen(true)}
                title="Criar Usuário Rápido"
              >
                <PersonAdd />
              </IconButton>
            )}
            <IconButton 
              size="small" 
              className={classes.quickActionBtn}
              onClick={() => setAdminDialogOpen(true)}
              title="Painel Admin"
            >
              <Settings />
            </IconButton>
          </Box>
        </Box>

        {/* Estatísticas rápidas para admins */}
        {canManageUsers && (
          <Card className={classes.userManagementCard}>
            <CardContent style={{ padding: '12px' }}>
              <Typography variant="subtitle2" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                📊 Gestão de Usuários
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <Typography variant="h6" style={{ color: '#2196f3' }}>
                      {userStats.total}
                    </Typography>
                    <Typography variant="caption">Total</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <Typography variant="h6" style={{ color: '#4caf50' }}>
                      {userStats.active}
                    </Typography>
                    <Typography variant="caption">Ativos</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <Typography variant="h6" style={{ color: '#ff9800' }}>
                      {userStats.admin}
                    </Typography>
                    <Typography variant="caption">Admins</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        <Divider style={{ background: 'rgba(255,255,255,0.2)' }} />

        {/* Menu de Navegação */}
        <List>
          {menuItems.filter(item => shouldShowMenuItem(item.permission)).map((item, index) => (
            <ListItem
              button
              key={index}
              className={classes.menuItem}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon style={{ color: 'white' }}>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>

        <Divider style={{ background: 'rgba(255,255,255,0.2)' }} />

        {/* Seção Admin (se aplicável) */}
        {isAdmin && (
          <Box className={classes.adminSection}>
            <Typography variant="subtitle2" style={{ padding: 8, fontWeight: 'bold' }}>
              🔐 Área Administrativa
            </Typography>
            <ListItem
              button
              className={classes.menuItem}
              onClick={() => router.push('/admin/system-test')}
            >
              <ListItemIcon style={{ color: '#ff5722' }}>
                <Security />
              </ListItemIcon>
              <ListItemText primary="Sistema de Testes" />
            </ListItem>
          </Box>
        )}

        {/* Logout */}
        <Box style={{ marginTop: 'auto', padding: 16 }}>
          <ListItem
            button
            className={classes.menuItem}
            onClick={handleLogout}
            style={{ background: 'rgba(255,0,0,0.2)' }}
          >
            <ListItemIcon style={{ color: 'white' }}>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Sair" />
          </ListItem>
        </Box>
      </Drawer>

      {/* Menu do Usuário */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          router.push('/usuario');
          setUserMenuAnchor(null);
        }}>
          <AccountCircle style={{ marginRight: 8 }} />
          Meu Perfil
        </MenuItem>
        <MenuItem onClick={() => {
          setUserMenuAnchor(null);
          setAdminDialogOpen(true);
        }}>
          <Settings style={{ marginRight: 8 }} />
          Configurações
        </MenuItem>
        <MenuItem onClick={() => {
          setUserMenuAnchor(null);
          handleLogout();
        }}>
          <ExitToApp style={{ marginRight: 8 }} />
          Sair
        </MenuItem>
      </Menu>

      {/* Dialog - Criação Rápida de Usuário */}
      <Dialog open={quickUserDialogOpen} onClose={() => setQuickUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" style={{ display: 'flex', alignItems: 'center' }}>
            <PersonAdd style={{ marginRight: 8 }} />
            Criar Usuário Rápido
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: 8 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={newUserData.nome}
                onChange={(e) => setNewUserData(prev => ({ ...prev, nome: e.target.value }))}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Senha"
                type="password"
                value={newUserData.senha}
                onChange={(e) => setNewUserData(prev => ({ ...prev, senha: e.target.value }))}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Permissão</InputLabel>
                <Select
                  value={newUserData.permissao}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, permissao: e.target.value as string }))}
                  label="Permissão"
                >
                  <MenuItem value="Visualizador">Visualizador</MenuItem>
                  <MenuItem value="Operador">Operador</MenuItem>
                  {isAdmin && <MenuItem value="Administrador">Administrador</MenuItem>}
                  {isAdmin && <MenuItem value="CEO">CEO</MenuItem>}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuickUserDialogOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleQuickCreateUser} color="primary" variant="contained">
            Criar Usuário
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog - Painel Admin */}
      <Dialog open={adminDialogOpen} onClose={() => setAdminDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" style={{ display: 'flex', alignItems: 'center' }}>
            <Settings style={{ marginRight: 8 }} />
            Painel Administrativo
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🔐 Controle de Acesso
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Sua permissão: {usuario?.permissao}
                  </Typography>
                  <Box marginTop={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Security />}
                      onClick={() => {
                        setAdminDialogOpen(false);
                        handleNavigation('/colaboradores#permissoes');
                      }}
                    >
                      Gerenciar Permissões
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    👥 Gestão de Usuários
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {userStats.total} usuários cadastrados
                  </Typography>
                  <Box marginTop={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<People />}
                      onClick={() => {
                        setAdminDialogOpen(false);
                        handleNavigation('/colaboradores#usuarios');
                      }}
                    >
                      Gerenciar Usuários
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {isAdmin && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Modo Administrador Ativo:</strong> Você tem acesso total ao sistema e pode gerenciar todos os usuários e permissões.
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminDialogOpen(false)} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para Notificações */}
      <Snackbar
        open={notifications.length > 0}
        autoHideDuration={6000}
        onClose={() => setNotifications([])}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert severity="success" onClose={() => setNotifications([])}>
          {notifications[0]?.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SidebarMenu;
