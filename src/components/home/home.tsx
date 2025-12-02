import { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Chip
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import Person from '@material-ui/icons/Person';
import Business from '@material-ui/icons/Business';
import People from '@material-ui/icons/People';
import Assignment from '@material-ui/icons/Assignment';
import Dashboard from '@material-ui/icons/Dashboard';
import CloseIcon from '@material-ui/icons/Close';
import Lock from '@material-ui/icons/Lock';
import ExitToApp from '@material-ui/icons/ExitToApp';
import VpnKey from '@material-ui/icons/VpnKey';
import ViewModule from '@material-ui/icons/ViewModule';
import Check from '@material-ui/icons/Check';
import { FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';
import AutenticacaoContext from '@/data/contexts/AutenticacaoContext';
import { usePermissions } from '@/hooks/usePermissions';
import LoginEmailSenha from '@/components/landing/cabecalho/LoginEmailSenha';

const useStyles = makeStyles((theme) => ({
  floatingMenuButton: {
    position: 'fixed',
    top: '20px',
    left: '20px',
    zIndex: 1300,
    background: 'rgba(10, 10, 10, 0.2)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  
    borderRadius: '56px',
    padding: theme.spacing(1.5),
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    color: '#1a1a1a',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.15)',
      transform: 'translateY(-2px) scale(1.05)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
    },
    '&:active': {
      transform: 'scale(0.98)',
    },
  },
  drawer: {
    width: 320,
  },
  drawerPaper: {
    width: 320,
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  },
  drawerContent: {
    display: 'flex',
    flexDirection: 'column',
  
    height: '100%',
  },
  drawerHeader: {
    padding: theme.spacing(2.5, 2),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  drawerTitle: {
    fontWeight: 700,
    fontSize: '1.2rem',
    fontFamily: '"Playfair Display", serif',
    color: '#1a1a1a',
    letterSpacing: '0.05em',
  },
  closeButton: {
    color: '#4b5563',
    padding: theme.spacing(0.75),
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    background: 'rgba(255, 255, 255, 0.1)',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.2)',
      transform: 'scale(1.1)',
    },
    '&:active': {
      transform: 'scale(0.95)',
    },
  },
  menuItem: {
    borderRadius: '16px',
    margin: theme.spacing(0.5, 1.5),
    padding: theme.spacing(1.5, 2),
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    background: 'rgba(255, 255, 255, 0.05)',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.15)',
      transform: 'translateX(4px) scale(1.02)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    '&:active': {
      transform: 'translateX(2px) scale(0.98)',
    },
  },
  menuItemIcon: {
    color: '#2d5a3d',
    minWidth: '40px',
    transition: 'all 0.2s ease',
    '& svg': {
      transition: 'transform 0.2s ease',
    },
  },
  menuItemText: {
    '& .MuiTypography-root': {
      fontWeight: 500,
      fontSize: '0.95rem',
      fontFamily: '"Inter", sans-serif',
      color: '#1f2937',
      letterSpacing: '0.01em',
    },
  },
  menuItemAuthenticated: {
    '&:hover': {
      background: 'rgba(16, 185, 129, 0.1)',
      '& $menuItemIcon': {
        color: '#059669',
        '& svg': {
          transform: 'scale(1.1)',
        },
      },
      '& .MuiListItemText-root .MuiTypography-root': {
        color: '#047857',
      },
    },
  },
  lockedItem: {
    opacity: 0.5,
    cursor: 'not-allowed !important',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.05)',
      transform: 'none',
    },
  },
  userInfo: {
    padding: theme.spacing(3),
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  contactInfo: {
    padding: theme.spacing(2.5),
    background: 'rgba(255, 255, 255, 0.05)',
    margin: theme.spacing(2),
    borderRadius: '16px',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  actionButtons: {
    padding: theme.spacing(2),
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
  },
  actionButton: {
    borderRadius: '16px',
    fontWeight: 600,
    textTransform: 'none',
    padding: theme.spacing(1.5, 2),
    background: 'rgba(220, 38, 38, 0.1)',
    backdropFilter: 'blur(10px)',
    color: '#dc2626',
    fontSize: '0.925rem',
    fontFamily: '"Inter", sans-serif',
    border: '1px solid rgba(220, 38, 38, 0.2)',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: 'rgba(220, 38, 38, 0.2)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(220, 38, 38, 0.2)',
    },
    '&:active': {
      transform: 'scale(0.98)',
    },
  },
  loginButton: {
    borderRadius: '16px',
    fontWeight: 600,
    textTransform: 'none',
    padding: theme.spacing(1.5, 2),
    background: 'rgba(16, 185, 129, 0.1)',
    backdropFilter: 'blur(10px)',
    color: '#059669',
    fontSize: '0.925rem',
    fontFamily: '"Inter", sans-serif',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: 'rgba(16, 185, 129, 0.2)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(16, 185, 129, 0.2)',
    },
    '&:active': {
      transform: 'scale(0.98)',
    },
  },
  logoAvatar: {
    backgroundColor: '#1f2937',
    color: '#fff',
    marginRight: theme.spacing(1),
    fontWeight: 700,
    width: 64,
    height: 64,
    fontSize: '1.5rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
  },
  permissionChip: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    backdropFilter: 'blur(10px)',
    color: '#ffffff',
    fontSize: '0.7rem',
    fontWeight: 600,
    height: '24px',
    marginLeft: theme.spacing(0.5),
    fontFamily: '"Inter", sans-serif',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  chipContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1.5),
  },
  toast: {
    position: 'fixed',
    top: theme.spacing(2),
    right: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    zIndex: 9999,
    animation: '$slideInDown 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  toastIcon: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'rgba(16, 185, 129, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#059669',
    animation: '$scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both',
  },
  toastMessage: {
    color: '#1f2937',
    fontWeight: 500,
    fontSize: '0.925rem',
    fontFamily: '"Inter", sans-serif',
  },
  '@keyframes slideInDown': {
    '0%': {
      opacity: 0,
      transform: 'translateY(-2rem) scale(0.9)',
    },
    '50%': {
      opacity: 0.8,
      transform: 'translateY(0.2rem) scale(1.02)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0) scale(1)',
    },
  },
  '@keyframes scaleIn': {
    '0%': {
      transform: 'scale(0) rotate(180deg)',
      opacity: 0,
    },
    '100%': {
      transform: 'scale(1) rotate(0deg)',
      opacity: 1,
    },
  },
}));

interface Toast {
  message: string;
  visible: boolean;
}

export default function ResponsiveAppBar() {
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const { usuario, logout } = useContext(AutenticacaoContext);
  const { hasAreaAccess } = usePermissions();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const showToast = (message: string) => {
    setToast({ message, visible: true });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const isAuthenticated = !!usuario?.email;

  const hasClienteAccess = isAuthenticated && hasAreaAccess('cliente');
  const hasEmpresarialAccess = isAuthenticated && hasAreaAccess('empresarial');
  const hasColaboradorAccess = isAuthenticated && hasAreaAccess('colaborador');

  const menuSections = [
    {
      title: "Serviços",
      items: [
        {
          icon: <ViewModule />,
          text: "Todos os Serviços",
          path: "/servicos"
        },
        {
          icon: <Assignment />,
          text: "Acompanhar Serviços",
          path: "/acompanhamento"
        }
      ]
    },
    {
      title: "Áreas Principais",
      items: [
        ...(hasClienteAccess ? [{
          icon: <Person />,
          text: "Área do Cliente",
          path: "/area-cliente",
          status: "ATIVO"
        }] : []),
        ...(hasColaboradorAccess ? [{
          icon: <People />,
          text: "Área Colaboradores",
          path: "/beto"
        }] : [])
      ]
    },
    ...(isAuthenticated ? [{
      title: "Tubarão",
      items: [
        {
          icon: <Dashboard />,
          text: "Dashboard",
          path: "/beto/dashboard"
        },
        {
          icon: <Assignment />,
          text: "Requerimentos",
          path: "/beto/requerimento"
        },
        
        {
          icon: <Business />,
          text: "Transferências",
          path: "/beto/transferencia"
        }
      ]
    }] : []),
    ...(isAuthenticated ? [{
      title: "Digital",
      items: [
        {
          icon: <Dashboard />,
          text: "Dashboard Digital",
          path: "/beto/dashboard/digital"
        },
        {
          icon: <Assignment />,
          text: "Requerimentos Digital",
          path: "/beto/requerimento/digital"
        },
        {
          icon: <VpnKey />,
          text: "Procurações",
          path: "/beto/procuracao"
        }
      ]
    }] : []),
   
  ];

  const handleMenuItemClick = (text: string, path?: string) => {
    showToast(`${text} clicked!`);
    if (path) {
      setTimeout(() => setDrawerOpen(false), 300);
    }
  };

  const renderDrawerContent = () => (
    <Box className={classes.drawerContent}>
      <Box className={classes.drawerHeader}>
        <Typography variant="h6" className={classes.drawerTitle}>
          Menu
        </Typography>
        <IconButton onClick={toggleDrawer} className={classes.closeButton} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {isAuthenticated ? (
        <Box className={classes.userInfo}>
          <Avatar
            src={usuario?.imagemUrl ?? ''}
            className={classes.logoAvatar}
            style={{ margin: '0 auto 12px' }}
          >
            {usuario?.nome?.charAt(0) ?? 'U'}
          </Avatar>
          <Typography variant="h6" style={{
            fontFamily: '"Inter", sans-serif',
            fontWeight: 600,
            color: '#1a1a1a',
            fontSize: '1rem',
            marginBottom: '4px'
          }}>
            {usuario?.nome ?? 'Usuário'}
          </Typography>
          <Typography variant="caption" style={{
            color: '#6b7280',
            fontSize: '0.875rem'
          }}>
            {usuario?.email ?? ''}
          </Typography>
          <Box className={classes.chipContainer}>
            <Chip
              label="Conectado"
              size="small"
              className={classes.permissionChip}
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.8)' }}
            />
            {usuario?.permissao && (
              <Chip
                label={usuario.permissao}
                size="small"
                className={classes.permissionChip}
              />
            )}
          </Box>
        </Box>
      ) : (
        <Box className={classes.contactInfo}>
          <VpnKey style={{ fontSize: 48, color: '#059669', marginBottom: 12 }} />
          <Typography variant="h6" style={{
            fontFamily: '"Inter", sans-serif',
            fontWeight: 600,
            color: '#1a1a1a',
            fontSize: '1.1rem',
            marginBottom: '8px'
          }}>
            Acesso ao Sistema
          </Typography>
          <Typography variant="body2" style={{
            color: '#6b7280',
            marginBottom: 16,
            fontSize: '0.875rem'
          }}>
            Faça login para acessar recursos exclusivos
          </Typography>
          <LoginEmailSenha/>

          <Divider style={{ margin: '16px 0', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />



          <Button
            startIcon={<FaWhatsapp />}
            className={classes.loginButton}
            onClick={() => setContactDialog(true)}
            style={{
              background: 'rgba(37, 211, 102, 0.1)',
              color: '#25d366',
              borderColor: 'rgba(37, 211, 102, 0.2)',
              marginTop: '8px'
            }}
            fullWidth
          >
            Solicitar Acesso
          </Button>
        </Box>
      )}

      <List style={{ flex: 1, overflowY: 'auto' }}>
        {menuSections.map((section, sectionIndex) => (
          <Box key={sectionIndex}>
            {section.items.length > 0 && (
              <>
                <Typography
                  variant="overline"
                  style={{
                    padding: '12px 24px 8px',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    letterSpacing: '0.1em',
                    fontFamily: '"Inter", sans-serif',
                    textTransform: 'uppercase'
                  }}
                >
                  {section.title}
                </Typography>
                {section.items.map((item, itemIndex) => {
                  const hasAccess = (
                    item.text === "Todos os Serviços" ||
                    item.text === "Acompanhar Serviços" ||
                    isAuthenticated
                  );

                  return hasAccess ? (
                    <Link href={item.path || '/'} passHref key={itemIndex}>
                      <ListItem
                        button
                        className={`${classes.menuItem} ${classes.menuItemAuthenticated}`}
                        onClick={() => handleMenuItemClick(item.text, item.path)}
                      >
                        <ListItemIcon className={classes.menuItemIcon}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.text}
                          className={classes.menuItemText}
                        />
                      </ListItem>
                    </Link>
                  ) : (
                    <ListItem className={`${classes.menuItem} ${classes.lockedItem}`} key={itemIndex}>
                      <ListItemIcon className={classes.menuItemIcon}>
                        <Lock />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        className={classes.menuItemText}
                      />
                      <Lock style={{ fontSize: 16, opacity: 0.5, color: '#9ca3af' }} />
                    </ListItem>
                  );
                })}
                {sectionIndex < menuSections.length - 1 && (
                  <Divider style={{ margin: "8px 16px", background: "rgba(255, 255, 255, 0.1)" }} />
                )}
              </>
            )}
          </Box>
        ))}
      </List>

      {isAuthenticated && (
        <Box className={classes.actionButtons}>
          <Divider style={{ margin: "8px 0", background: "rgba(255, 255, 255, 0.1)" }} />
          <Button
            startIcon={<ExitToApp />}
            className={classes.actionButton}
            onClick={logout}
            fullWidth
          >
            Sair do Sistema
          </Button>
        </Box>
      )}
    </Box>
  );

  const [contactDialog, setContactDialog] = useState(false);

  return (
    <>
      <IconButton
        edge="start"
        className={classes.floatingMenuButton}
        aria-label="menu"
        onClick={toggleDrawer}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        classes={{ paper: classes.drawerPaper }}
      >
        {renderDrawerContent()}
      </Drawer>

      {toast && toast.visible && (
        <Box className={classes.toast}>
          <Box className={classes.toastIcon}>
            <Check fontSize="small" />
          </Box>
          <Typography className={classes.toastMessage}>
            {toast.message}
          </Typography>
        </Box>
      )}

      <Dialog open={contactDialog} onClose={() => setContactDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" style={{ gap: 8 }}>
            <FaWhatsapp color="#25d366" size={24} />
            <Typography variant="h6" style={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 600,
              color: '#1a1a1a'
            }}>
              Solicitar Acesso
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom style={{
            fontFamily: '"Inter", sans-serif',
            color: '#4b5563',
            lineHeight: 1.6
          }}>
            Entre em contato conosco pelo WhatsApp para criar suas credenciais de acesso ao sistema.
          </Typography>
          <Paper elevation={0} style={{
            padding: 16,
            marginTop: 16,
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}>
            <Typography variant="subtitle2" style={{
              color: '#1a1a1a',
              fontWeight: 600,
              marginBottom: '8px',
              fontFamily: '"Inter", sans-serif'
            }}>
              📱 Despachante Beto Dehon
            </Typography>
            <Typography variant="body2" style={{ marginBottom: 8, color: '#6b7280' }}>
              🕒 Segunda a Sexta, 8h às 18h
            </Typography>
            <Typography variant="body2" style={{ color: '#6b7280' }}>
              📍 Atendimento Personalizado
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions style={{ padding: '16px 24px' }}>
          <Button onClick={() => setContactDialog(false)} style={{ color: '#6b7280' }}>
            Fechar
          </Button>
          <Button
            variant="contained"
            startIcon={<FaWhatsapp />}
            onClick={() => {
              const message = 'Olá! Gostaria de solicitar acesso ao sistema do Despachante Beto Dehon.';
              window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(message)}`, '_blank');
              setContactDialog(false);
            }}
            style={{
              background: 'linear-gradient(135deg, #25d366 0%, #22c55e 100%)',
              color: '#fff',
              fontFamily: '"Inter", sans-serif',
              fontWeight: 600,
              borderRadius: '8px',
              textTransform: 'none'
            }}
          >
            Abrir WhatsApp
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
