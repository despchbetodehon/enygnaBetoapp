
import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Badge,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,

  Fab,
  Snackbar,
  Switch,
  FormControlLabel,
  Divider,
} from '@material-ui/core';
import {
  Notifications,
  NotificationsActive,
  Warning,
  Info,
  CheckCircle,
  Error,
  Close,
  Settings,

  Delete,
  Star,
  Schedule,
  TrendingUp,
  LocalOffer,

} from '@material-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';

const useStyles = makeStyles((theme) => ({
  notificationFab: {
    position: 'fixed',
    top: 20,
    right: 20,
    animation: '$pulse 2s infinite',
  },
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.05)' },
    '100%': { transform: 'scale(1)' },
  },
  notificationPanel: {
    position: 'fixed',
    top: 80,
    right: 20,
    width: 400,
    maxHeight: 600,
    background: '#fff',
    borderRadius: theme.spacing(2),
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    zIndex: 1300,
    overflow: 'hidden',
  },
  notificationHeader: {
    padding: theme.spacing(2),
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
  },
  notificationList: {
    maxHeight: 400,
    overflowY: 'auto',
  },
  notificationItem: {
    borderBottom: '1px solid #f0f0f0',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: '#f8f9fa',
    },
  },
  urgentNotification: {
    borderLeft: '4px solid #F44336',
    background: '#ffebee',
    animation: '$blink 1.5s infinite',
  },
  '@keyframes blink': {
    '0%, 50%': { opacity: 1 },
    '51%, 100%': { opacity: 0.8 },
  },
  vipNotification: {
    borderLeft: '4px solid #FFD700',
    background: 'linear-gradient(135deg, #fffde7 0%, #fff9c4 100%)',
  },
  promotionalNotification: {
    borderLeft: '4px solid #4CAF50',
    background: '#e8f5e8',
  },
  psychologyTrigger: {
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
    color: '#fff',
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(1),
    animation: '$glow 2s ease-in-out infinite alternate',
  },
  '@keyframes glow': {
    from: { boxShadow: '0 0 5px #ff6b6b' },
    to: { boxShadow: '0 0 15px #ff6b6b' },
  },
}));

interface Notification {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'urgent' | 'info' | 'success' | 'warning' | 'error' | 'vip' | 'promotional' | 'psychology';
  data: Date;
  lida: boolean;
  icone?: React.ReactNode;
  acao?: {
    texto: string;
    callback: () => void;
  };
  prazo?: Date;
  categoria: 'processo' | 'documentos' | 'financeiro' | 'promocional' | 'sistema';
}

interface NotificacaoManagerProps {
  clienteId: string;
  processos: any[];
}

const NotificacaoManager: React.FC<NotificacaoManagerProps> = ({ clienteId, processos }) => {
  const classes = useStyles();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    urgentOnly: false,
    soundEnabled: true,
  });

  // Gerar notificações baseadas em estratégias psicológicas
  useEffect(() => {
    generateSmartNotifications();

    // Atualizar notificações a cada 30 segundos
    const interval = setInterval(generateSmartNotifications, 30000);
    return () => clearInterval(interval);
  }, [processos]);

  const generateSmartNotifications = () => {
    const newNotifications: Notification[] = [];

    // 1. Urgência e Escassez (Técnica psicológica)
    const processosUrgentes = processos.filter(p => 
      p.documentosFaltando?.length > 0 || p.status === 'Aguardando Documentos'
    );

    if (processosUrgentes.length > 0) {
      newNotifications.push({
        id: `urgent-${Date.now()}`,
        titulo: '🚨 AÇÃO URGENTE NECESSÁRIA!',
        mensagem: `${processosUrgentes.length} processo(s) parado(s)! Envie os documentos HOJE e ganhe 15% de desconto no próximo serviço.`,
        tipo: 'psychology',
        data: new Date(),
        lida: false,
        categoria: 'documentos',
        icone: <Warning />,
        prazo: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        acao: {
          texto: 'ENVIAR AGORA',
          callback: () => showSnackbar('Redirecionando para upload de documentos...')
        }
      });
    }

    // 2. Prova Social e Autoridade
    newNotifications.push({
      id: `social-proof-${Date.now()}`,
      titulo: '🌟 Você é um Cliente VIP!',
      mensagem: '97% dos nossos clientes VIP têm seus processos concluídos 50% mais rápido. Continue aproveitando seus benefícios exclusivos!',
      tipo: 'vip',
      data: new Date(),
      lida: false,
      categoria: 'promocional',
      icone: <Star />,
      acao: {
        texto: 'VER BENEFÍCIOS',
        callback: () => showSnackbar('Mostrando benefícios VIP...')
      }
    });

    // 3. Gamificação e Recompensa
    const processosCompletos = processos.filter(p => p.status === 'Concluído').length;
    if (processosCompletos > 0) {
      newNotifications.push({
        id: `gamification-${Date.now()}`,
        titulo: '🎉 Parabéns! Nível VIP Desbloqueado!',
        mensagem: `Você completou ${processosCompletos} processo(s)! Desbloqueou desconto de 25% no próximo serviço. Oferta válida por 48h!`,
        tipo: 'success',
        data: new Date(),
        lida: false,
        categoria: 'promocional',
        icone: <Info />,
        prazo: new Date(Date.now() + 48 * 60 * 60 * 1000),
        acao: {
          texto: 'USAR DESCONTO',
          callback: () => showSnackbar('Desconto aplicado!')
        }
      });
    }

    // 4. FOMO (Fear of Missing Out)
    const agora = new Date();
    const isHoraNobre = agora.getHours() >= 9 && agora.getHours() <= 18;

    if (isHoraNobre && Math.random() > 0.7) {
      newNotifications.push({
        id: `fomo-${Date.now()}`,
        titulo: '⏰ OFERTA RELÂMPAGO - Apenas 2h!',
        mensagem: 'Processamento EXPRESS por apenas R$ 50 extra. Seu processo fica pronto em 24h! Restam apenas 3 vagas hoje.',
        tipo: 'psychology',
        data: new Date(),
        lida: false,
        categoria: 'promocional',
        icone: <TrendingUp />,
        prazo: new Date(Date.now() + 2 * 60 * 60 * 1000),
        acao: {
          texto: 'QUERO EXPRESS',
          callback: () => showSnackbar('Solicitando processamento express...')
        }
      });
    }

    // 5. Reciprocidade - Oferta gratuita
    newNotifications.push({
      id: `reciprocity-${Date.now()}`,
      titulo: '🎁 Presente Especial para Você!',
      mensagem: 'Consultoria GRATUITA sobre documentação veicular. Agende sua sessão de 30min com nosso especialista!',
      tipo: 'vip',
      data: new Date(),
      lida: false,
      categoria: 'promocional',
      icone: <Info />,
      acao: {
        texto: 'AGENDAR GRÁTIS',
        callback: () => showSnackbar('Agendando consultoria gratuita...')
      }
    });

    // 6. Notificações de Progresso (Endowed Progress Effect)
    processos.forEach(processo => {
      if (processo.progresso > 0 && processo.progresso < 100) {
        newNotifications.push({
          id: `progress-${processo.id}`,
          titulo: `📈 ${processo.tipo} - ${processo.progresso}% Concluído`,
          mensagem: `Faltam apenas ${100 - processo.progresso}% para completar! Seu processo está avançando rapidamente.`,
          tipo: 'info',
          data: new Date(),
          lida: false,
          categoria: 'processo',
          icone: <CheckCircle />,
          acao: {
            texto: 'VER DETALHES',
            callback: () => showSnackbar('Abrindo detalhes do processo...')
          }
        });
      }
    });

    // Atualizar apenas se há novas notificações
    setNotifications(prev => {
      const existingIds = prev.map(n => n.id);
      const reallyNew = newNotifications.filter(n => !existingIds.includes(n.id));

      if (reallyNew.length > 0) {
        // Reproduzir som se habilitado
        if (settings.soundEnabled) {
          playNotificationSound();
        }
        return [...prev, ...reallyNew].slice(-10); // Manter apenas as 10 mais recentes
      }
      return prev;
    });
  };

  const playNotificationSound = () => {
    // Criar um som de notificação usando Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, lida: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, lida: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.lida).length;

  const getNotificationClass = (tipo: string) => {
    switch (tipo) {
      case 'urgent':
      case 'psychology':
        return classes.urgentNotification;
      case 'vip':
        return classes.vipNotification;
      case 'promotional':
        return classes.promotionalNotification;
      default:
        return classes.notificationItem;
    }
  };

  const getNotificationIcon = (notificacao: Notification) => {
    if (notificacao.icone) return notificacao.icone;

    switch (notificacao.tipo) {
      case 'urgent': return <Warning style={{ color: '#F44336' }} />;
      case 'success': return <CheckCircle style={{ color: '#4CAF50' }} />;
      case 'warning': return <Warning style={{ color: '#FF9800' }} />;
      case 'error': return <Error style={{ color: '#F44336' }} />;
      case 'vip': return <Star style={{ color: '#FFD700' }} />;
      case 'promotional': return <LocalOffer style={{ color: '#4CAF50' }} />;
      case 'psychology': return <Info style={{ color: '#F44336' }} />;
      default: return <Info style={{ color: '#2196F3' }} />;
    }
  };

  return (
    <>
      {/* FAB de Notificações */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Fab
          className={classes.notificationFab}
          color="secondary"
          onClick={() => setPanelOpen(!panelOpen)}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsActive />
          </Badge>
        </Fab>
      </motion.div>

      {/* Painel de Notificações */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className={classes.notificationPanel}
          >
            <Box className={classes.notificationHeader}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                  Notificações ({unreadCount})
                </Typography>
                <Box>
                  <IconButton
                    size="small"
                    style={{ color: '#fff', marginRight: 8 }}
                    onClick={() => setSettingsOpen(true)}
                  >
                    <Settings />
                  </IconButton>
                  <IconButton
                    size="small"
                    style={{ color: '#fff' }}
                    onClick={() => setPanelOpen(false)}
                  >
                    <Close />
                  </IconButton>
                </Box>
              </Box>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  onClick={markAllAsRead}
                  style={{ color: '#fff', textTransform: 'none' }}
                  startIcon={<Info />}
                >
                  Marcar todas como lidas
                </Button>
              )}
            </Box>

            <List className={classes.notificationList}>
              <AnimatePresence>
                {notifications.map((notificacao, index) => (
                  <motion.div
                    key={notificacao.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ListItem
                      className={`${getNotificationClass(notificacao.tipo)} ${
                        !notificacao.lida ? '' : 'opacity-60'
                      }`}
                      onClick={() => markAsRead(notificacao.id)}
                    >
                      <ListItemIcon>
                        {getNotificationIcon(notificacao)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" style={{ gap: 1 }}>
                            <Typography
                              variant="subtitle2"
                              style={{
                                fontWeight: notificacao.lida ? 'normal' : 'bold'
                              }}
                            >
                              {notificacao.titulo}
                            </Typography>
                            {notificacao.prazo && (
                              <Chip
                                label={`${Math.ceil((notificacao.prazo.getTime() - Date.now()) / (1000 * 60 * 60))}h restantes`}
                                size="small"
                                style={{ backgroundColor: '#ffeb3b', fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" style={{ marginBottom: 8 }}>
                              {notificacao.mensagem}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="caption" color="textSecondary">
                                {notificacao.data.toLocaleString()}
                              </Typography>
                              {notificacao.acao && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    notificacao.acao!.callback();
                                  }}
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  {notificacao.acao.texto}
                                </Button>
                              )}
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notificacao.id);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </motion.div>
                ))}
              </AnimatePresence>

              {notifications.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="Nenhuma notificação"
                    secondary="Você está em dia! 🎉"
                    style={{ textAlign: 'center' }}
                  />
                </ListItem>
              )}
            </List>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog de Configurações */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <DialogTitle>Configurações de Notificação</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications}
                onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
              />
            }
            label="Notificações por Email"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.pushNotifications}
                onChange={(e) => setSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
              />
            }
            label="Notificações Push"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.urgentOnly}
                onChange={(e) => setSettings(prev => ({ ...prev, urgentOnly: e.target.checked }))}
              />
            }
            label="Apenas Urgentes"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.soundEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
              />
            }
            label="Sons de Notificação"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </>
  );
};

export default NotificacaoManager;
