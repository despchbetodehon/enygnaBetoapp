
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Avatar,
  Badge,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Divider,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Tooltip,
  Menu,
  MenuItem,
  Fab,
  Slide,
  Fade,
  Zoom,
  Container,
  useMediaQuery,
  InputAdornment,
  LinearProgress,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  Select,
  InputLabel,
  Box
} from '@material-ui/core';
import { Alert, Autocomplete } from '@material-ui/lab';
import {
  Chat,
  Send,
  EmojiEmotions,
  AttachFile,
  Image,
  VideoCall,
  Phone,
  MoreVert,
  Search,
  Group,
  PersonAdd,
  Settings,
  Notifications,
  NotificationsOff,
  VolumeUp,
  VolumeOff,
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  ScreenShare,
  StopScreenShare,
  Call,
  CallEnd,
  ChatBubble,
  Forum,
  People,
  Public,
  Lock,
  Star,
  Reply,
  Forward,
  Delete,
  Edit,
  Info,
  Close,
  Add,
  Remove,
  ExpandMore,

  FiberManualRecord,
  Schedule,
  Done,
  DoneAll,
  Visibility,
  VisibilityOff,
  Extension,


  TrendingUp,

  Speed,
  Security
} from '@material-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    color: 'black',
    display: 'flex',
    background: theme.palette.type === 'dark' 
      ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)'
      : 'linear-gradient(135deg,rgb(79, 79, 80) 0%,rgb(63, 70, 80) 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  sidebar: {
    width: 320,
    background: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: theme.shadows[4],
  },
  sidebarHeader: {
    padding: theme.spacing(2),
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: theme.palette.background.default,
  },
  chatHeader: {
    padding: theme.spacing(2),
    background: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: theme.shadows[2],
  },
  messagesContainer: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: 'auto',
    background: `linear-gradient(to bottom, 
      ${theme.palette.background.default} 0%, 
      ${theme.palette.action.hover} 100%)`,
    position: 'relative',
  },
  messageArea: {
    padding: theme.spacing(2),
    background: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  message: {
    maxWidth: '70%',
    margin: theme.spacing(0.5, 0),
    padding: theme.spacing(1, 2),
    borderRadius: 18,
    color: 'black',
    position: 'relative',
    wordBreak: 'break-word',
  },
  messageOwn: {
    marginLeft: 'auto',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'black',
    borderBottomRightRadius: 4,
    '&::after': {
      content: '""',
      position: 'absolute',
      right: -8,
      bottom: 0,
      width: 0,
      height: 0,
      border: '8px solid transparent',
      borderTopColor: '#764ba2',
      borderRight: 0,
      marginTop: -8,
      marginRight: -8,
    },
  },
  messageOther: {
    marginRight: 'auto',
    background: theme.palette.background.paper,
    color: 'black',
    borderBottomLeftRadius: 4,
    boxShadow: theme.shadows[2],
    '&::after': {
      content: '""',
      position: 'absolute',
      left: -8,
      bottom: 0,
      width: 0,
      height: 0,
      border: '8px solid transparent',
      borderTopColor: theme.palette.background.paper,
      borderLeft: 0,
      marginTop: -8,
      marginLeft: -8,
    },
  },
  userItem: {
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    borderRadius: theme.spacing(1),
    color: 'black',
    margin: theme.spacing(0.5),
    '&:hover': {
      background: theme.palette.action.hover,
      transform: 'translateX(4px)',
    },
  },
  onlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    color: 'black',
    border: '2px solid white',
    position: 'absolute',
    bottom: 0,
    right: 0,
    animation: '$pulse 2s infinite',
  },
  '@keyframes pulse': {
    '0%': { opacity: 1, transform: 'scale(1)' },
    '50%': { opacity: 0.7, transform: 'scale(1.1)' },
    '100%': { opacity: 1, transform: 'scale(1)' },
  },
  offlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: '#757575',
    border: '2px solid white',
    color: 'black',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  groupItem: {
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    borderRadius: theme.spacing(1),
    color: 'black',
    margin: theme.spacing(0.5),
    background: `linear-gradient(135deg, 
      ${theme.palette.primary.light}20 0%, 
      ${theme.palette.secondary.light}20 100%)`,
    '&:hover': {
      background: `linear-gradient(135deg, 
        ${theme.palette.primary.light}40 0%, 
        ${theme.palette.secondary.light}40 100%)`,
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4],
    },
  },
  floatingButton: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    zIndex: 1000,
    '&:hover': {
      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
      transform: 'scale(1.1)',
    },
  },
  notificationPanel: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 300,
    maxHeight: 400,
    background: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[12],
    border: `2px solid ${theme.palette.primary.main}`,
    zIndex: 1000,
    overflow: 'hidden',
  },
  smartFeatures: {
    position: 'absolute',
    top: 20,
    left: 20,
    background: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
    minWidth: 200,
    boxShadow: theme.shadows[8],
    border: `2px solid ${theme.palette.secondary.main}`,
  },
  voiceIndicator: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(0,0,0,0.8)',
    color: 'black',
    padding: theme.spacing(3),
    borderRadius: '50%',
    width: 120,
    height: 120,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    zIndex: 10000,
  },
  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
    color: 'black',

    fontStyle: 'italic',
  },
  messageTime: {
    fontSize: '0.7rem',
    opacity: 0.7,
    color: 'black',
    marginTop: theme.spacing(0.5),
  },
  messageStatus: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    color: 'black',
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
  },
  searchBar: {
    margin: theme.spacing(1),
    '& .MuiOutlinedInput-root': {
      borderRadius: 20,
    },
  },
  tabsContainer: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: 'black',
  },
  mediaPreview: {
    maxWidth: 200,
    maxHeight: 200,
    borderRadius: theme.spacing(1),
    margin: theme.spacing(1, 0),
  },
  mentionChip: {
    background: theme.palette.secondary.main,
    color: 'white',
    margin: theme.spacing(0.25),
  },
  replyPreview: {
    background: theme.palette.action.hover,
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    padding: theme.spacing(1),
    margin: theme.spacing(1, 0),
    borderRadius: theme.spacing(0.5),
  },
  encryptionStatus: {
    display: 'flex',
    alignItems: 'center',
    color: 'black',
    gap: theme.spacing(0.5),

    fontSize: '0.8rem',
  },
  aiSuggestions: {
    background: theme.palette.background.paper,
    color: 'black',
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1),
    margin: theme.spacing(1, 0),
    border: `1px solid ${theme.palette.primary.main}`,
  },
}));

interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: Date;
  isTyping?: boolean;
}

interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  avatar: string;
  isPrivate: boolean;
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  sender: User;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'voice' | 'video';
  status: 'sent' | 'delivered' | 'read';
  mentions?: string[];
  replyTo?: Message | null; 
  isEncrypted?: boolean;
  attachments?: any[];
}

interface Notification {
  id: string;
  type: 'mention' | 'message' | 'group_invite' | 'system';
  content: string;
  timestamp: Date;
  read: boolean;
  sender?: User;
}

const ChatInterno: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Estados principais
  const [selectedChat, setSelectedChat] = useState<User | Group | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  // Estados de controle
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [videoCall, setVideoCall] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const [muteNotifications, setMuteNotifications] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Dados simulados
  const mockUsers: User[] = useMemo(() => [
    {
      id: '1',
      name: 'Ana Silva',
      avatar: '/gabi.png',
      status: 'online',
      isTyping: false,
    },
    {
      id: '2',
      name: 'João Santos',
      avatar: '/gui.png',
      status: 'online',
      isTyping: false,
    },
    {
      id: '3',
      name: 'Maria Costa',
      avatar: '/gabi.png',
      status: 'away',
      lastSeen: new Date(Date.now() - 300000),
    },
    {
      id: '4',
      name: 'Pedro Oliveira',
      avatar: '/gui.png',
      status: 'offline',
      lastSeen: new Date(Date.now() - 3600000),
    },
    {
      id: '5',
      name: 'Lívia IA',
      avatar: '/logo.webp',
      status: 'online',
      isTyping: false,
    },
  ], []);

  const mockGroups: Group[] = useMemo(() => [
    {
      id: 'g1',
      name: 'Equipe Principal',
      description: 'Canal principal da empresa',
      members: ['1', '2', '3', '4', '5'],
      avatar: '/betologo.jpeg',
      isPrivate: false,
      unreadCount: 3,
    },
    {
      id: 'g2',
      name: 'Desenvolvimento',
      description: 'Equipe de desenvolvimento',
      members: ['1', '2', '5'],
      avatar: '/logo.webp',
      isPrivate: true,
      unreadCount: 1,
    },
    {
      id: 'g3',
      name: 'Gerência',
      description: 'Canal executivo',
      members: ['1', '3'],
      avatar: '/betologo.jpeg',
      isPrivate: true,
      unreadCount: 0,
    },
  ], []);

  // Inicialização
  useEffect(() => {
    setUsers(mockUsers);
    setGroups(mockGroups);

    // Simular mensagens iniciais
    const initialMessages: Message[] = [
      {
        id: '1',
        content: 'Olá! Sistema de chat interno funcionando perfeitamente! 🚀',
        sender: mockUsers[4], // Lívia IA
        timestamp: new Date(Date.now() - 300000),
        type: 'text',
        status: 'read',
        isEncrypted: true,
      },
      {
        id: '2',
        content: 'Ótimo! Agora podemos nos comunicar de forma mais eficiente.',
        sender: mockUsers[0], // Ana Silva
        timestamp: new Date(Date.now() - 240000),
        type: 'text',
        status: 'read',
        isEncrypted: true,
      },
    ];

    setMessages(initialMessages);
    setSelectedChat(mockUsers[4]); // Selecionar Lívia IA por padrão
  }, [mockUsers, mockGroups]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Detectar menções no texto
  const detectMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  };

  // Gerar sugestões IA
  const generateAISuggestions = useCallback(() => {
    const suggestions = [
      "Que tal marcarmos uma reunião?",
      "Posso ajudar com mais alguma coisa?",
      "Vamos revisar os próximos passos?",
      "Precisa de suporte técnico?",
      "Como está o andamento do projeto?",
    ];
    setAiSuggestions(suggestions.slice(0, 3));
  }, []);

  // Enviar mensagem
  const sendMessage = useCallback(() => {
    if (!message.trim() || !selectedChat) return;

    const mentions = detectMentions(message);
    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: {
        id: 'current',
        name: 'Você',
        avatar: '/betologo.jpeg',
        status: 'online',
      },
      timestamp: new Date(),
      type: 'text',
      status: 'sent',
      mentions,
      replyTo: replyingTo,
      isEncrypted: encryptionEnabled,
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setReplyingTo(null);
    setAiSuggestions([]);

    // Simular resposta da IA se estiver falando com Lívia
    if (selectedChat.id === '5') {
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: `Entendi! ${message.includes('@') ? 'Vi que você mencionou alguém. ' : ''}Vou processar sua solicitação e te dar o melhor suporte possível. Como posso ajudar mais?`,
          sender: mockUsers[4],
          timestamp: new Date(),
          type: 'text',
          status: 'delivered',
          isEncrypted: encryptionEnabled,
        };
        setMessages(prev => [...prev, aiResponse]);
        generateAISuggestions();
      }, 1500);
    }

    // Simular notificações para menções
    mentions.forEach(mention => {
      const user = users.find(u => u.name.toLowerCase().includes(mention.toLowerCase()));
      if (user) {
        const notification: Notification = {
          id: Date.now().toString() + mention,
          type: 'mention',
          content: `Você foi mencionado por ${newMessage.sender.name}`,
          timestamp: new Date(),
          read: false,
          sender: newMessage.sender,
        };
        setNotifications(prev => [...prev, notification]);
      }
    });
  }, [message, selectedChat, replyingTo, encryptionEnabled, users, mockUsers, generateAISuggestions]);

  // Filtrar usuários e grupos
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Status do usuário
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#4CAF50';
      case 'away': return '#FF9800';
      case 'busy': return '#F44336';
      default: return '#757575';
    }
  };

  // Renderizar mensagem
  // Renderizar mensagem
const renderMessage = (msg: Message) => (
  <motion.div
    key={msg.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`${classes.message} ${
      msg.sender.id === 'current' ? classes.messageOwn : classes.messageOther
    }`}
  >
    {msg.replyTo && (
      <div className={classes.replyPreview}>
        <Typography variant="caption" style={{ color: 'black' }}>
          Respondendo a: {msg.replyTo.content.substring(0, 50)}...
        </Typography>
      </div>
    )}

    {/* AQUI GARANTE QUE TODO TEXTO DA MENSAGEM FICA PRETO */}
    <Typography variant="body2" style={{ color: 'black' }}>
      {msg.content}
    </Typography>

    {msg.mentions && msg.mentions.length > 0 && (
      <div>
        {msg.mentions.map(mention => (
          <Chip
            key={mention}
            label={`@${mention}`}
            size="small"
            className={classes.mentionChip}
          />
        ))}
      </div>
    )}

    <div className={classes.messageTime}>
      {msg.timestamp.toLocaleTimeString()}
      {msg.isEncrypted && (
        <Lock style={{ fontSize: 12, marginLeft: 4 }} />
      )}
    </div>

    {msg.sender.id === 'current' && (
      <div className={classes.messageStatus}>
        {msg.status === 'sent' && <Done style={{ fontSize: 16 }} />}
        {msg.status === 'delivered' && <DoneAll style={{ fontSize: 16 }} />}
        {msg.status === 'read' && <DoneAll style={{ fontSize: 16, color: '#4CAF50' }} />}
      </div>
    )}
  </motion.div>
);


  return (
    <div className={classes.root}>

      {/* Recursos Inteligentes */}
      <motion.div
        className={classes.smartFeatures}
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Typography variant="h6" gutterBottom>
          <Notifications style={{ marginRight: 8, verticalAlign: 'middle' }} />
          IA Assistente
        </Typography>
        <Typography variant="body2" style={{ marginBottom: 8 }}>
          <Extension style={{ marginRight: 4, fontSize: 16 }} />
          Chat criptografado E2E
        </Typography>
        <Typography variant="body2" style={{ marginBottom: 8 }}>
          <Notifications style={{ marginRight: 4, fontSize: 16 }} />
          Análise em tempo real
        </Typography>
        <Chip 
          icon={<Notifications />} 
          label="IA Ativa" 
          color="primary" 
          size="small"
        />
      </motion.div>

      {/* Sidebar */}
      <div className={classes.sidebar}>
        {/* Header da Sidebar */}
        <div className={classes.sidebarHeader}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Chat style={{ marginRight: 8 }} />
            <Typography variant="h6">Chat Interno</Typography>
          </div>
          <div>
            <IconButton 
              color="inherit" 
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Badge badgeContent={notifications.filter(n => !n.read).length} color="secondary">
                <Notifications />
              </Badge>
            </IconButton>
            <IconButton color="inherit">
              <Settings />
            </IconButton>
          </div>
        </div>

        {/* Barra de Pesquisa */}
        <TextField
          className={classes.searchBar}
          placeholder="Buscar conversas..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          className={classes.tabsContainer}
          variant="fullWidth"
        >
          <Tab label="Usuários" icon={<People />} />
          <Tab label="Grupos" icon={<Group />} />
          <Tab label="IA" icon={<Notifications />} />
        </Tabs>

        {/* Lista de Usuários */}
      {activeTab === 0 && (
  <List style={{ flex: 1, overflow: 'auto' }}>
    {filteredUsers.map((user) => (
      <ListItem
        key={user.id}
        className={classes.userItem}
        onClick={() => setSelectedChat(user)}
        selected={selectedChat?.id === user.id}
      >
        <ListItemAvatar>
          <Badge
            overlap="circular"
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            badgeContent={
              <FiberManualRecord
                style={{
                  color: getStatusColor(user.status),
                  fontSize: 12,
                }}
              />
            }
          >
            <Avatar src={user.avatar} alt={user.name} />
          </Badge>
        </ListItemAvatar>
        <ListItemText
          // O nome do usuário sempre preto e em negrito
          primary={<span style={{ color: 'black', fontWeight: 600 }}>{user.name}</span>}
          // O status ou 'digitando...' (você pode colocar preto também se quiser)
          secondary={
            user.isTyping ? (
              <span style={{ color: '#4CAF50', fontStyle: 'italic' }}>
                digitando...
              </span>
            ) : (
              <span style={{ color: 'black' }}>
                {user.status === 'online' ? 'Online' : 'Offline'}
              </span>
            )
          }
        />
        {user.status === 'online' && <Notifications style={{ color: '#4CAF50', fontSize: 12 }} />}
      </ListItem>
    ))}
  </List>
)}


        {/* Lista de Grupos */}
        {activeTab === 1 && (
          <List style={{ flex: 1, overflow: 'auto' }}>
            {filteredGroups.map((group) => (
              <ListItem
                key={group.id}
                className={classes.groupItem}
                onClick={() => setSelectedChat(group)}
                selected={selectedChat?.id === group.id}
              >
                <ListItemAvatar>
                  <Badge badgeContent={group.unreadCount} color="secondary">
                    <Avatar src={group.avatar} alt={group.name}>
                      <Group />
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {group.name}
                      {group.isPrivate && <Lock style={{ fontSize: 16, marginLeft: 4 }} />}
                    </div>
                  }
                  secondary={`${group.members.length} membros • ${group.description}`}
                />
              </ListItem>
            ))}

            {/* Botão Criar Grupo */}
            <ListItem button className={classes.groupItem}>
              <ListItemIcon>
                <Add />
              </ListItemIcon>
              <ListItemText primary="Criar Novo Grupo" />
            </ListItem>
          </List>
        )}

        {/* IA Assistente */}
        {activeTab === 2 && (
          <div style={{ padding: 16, flex: 1 }}>
            <Card style={{ marginBottom: 16 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Extension style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  Lívia IA Pro
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Assistente inteligente com recursos avançados
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<Chat />}
                onClick={() => setSelectedChat(users.find(u => u.id === '5') || null)}

                >
                  Conversar com IA
                </Button>
              </CardContent>
            </Card>

            <Typography variant="subtitle2" gutterBottom>
              Recursos Disponíveis:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><Notifications /></ListItemIcon>
                <ListItemText primary="Sugestões Inteligentes" />
              </ListItem>
              <ListItem>
                <ListItemIcon><TrendingUp /></ListItemIcon>
                <ListItemText primary="Análise de Sentimento" />
              </ListItem>
              <ListItem>
                <ListItemIcon><Security /></ListItemIcon>
                <ListItemText primary="Moderação Automática" />
              </ListItem>
            </List>
          </div>
        )}
      </div>

      {/* Área Principal do Chat */}
      <div className={classes.chatArea}>
        {selectedChat ? (
          <>
            {/* Header do Chat */}
            <div className={classes.chatHeader}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src={selectedChat.avatar} 
                  alt={selectedChat.name}
                  style={{ marginRight: 12 }}
                />
                <div>
                  <Typography variant="h6">{selectedChat.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {'status' in selectedChat ? (
                      selectedChat.status === 'online' ? 'Online' : 'Offline'
                    ) : (
                      `${selectedChat.members.length} membros`
                    )}
                  </Typography>
                </div>
                {encryptionEnabled && (
                  <div className={classes.encryptionStatus}>
                    <Lock style={{ fontSize: 16 }} />
                    <span>Criptografado</span>
                  </div>
                )}
              </div>

              <div>
                <IconButton onClick={() => setVideoCall(true)}>
                  <Videocam />
                </IconButton>
                <IconButton>
                  <Phone />
                </IconButton>
                <IconButton>
                  <Info />
                </IconButton>
                <IconButton>
                  <MoreVert />
                </IconButton>
              </div>
            </div>

            {/* Área de Mensagens */}
            <div className={classes.messagesContainer}>
              <AnimatePresence>
                {messages.map(renderMessage)}
              </AnimatePresence>

              {/* Indicador de digitação */}
              {isTyping && (
                <div className={classes.typingIndicator}>
                  <CircularProgress size={16} style={{ marginRight: 8 }} />
                  <Typography variant="caption">
                    {selectedChat.name} está digitando...
                  </Typography>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Sugestões IA */}
            {aiSuggestions.length > 0 && (
              <motion.div
                className={classes.aiSuggestions}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Typography variant="caption" gutterBottom>
                  <Notifications style={{ fontSize: 14, marginRight: 4 }} />
                  Sugestões IA:
                </Typography>
                <div>
                  {aiSuggestions.map((suggestion, index) => (
                    <Chip
                      key={index}
                      label={suggestion}
                      size="small"
                      variant="outlined"
                      onClick={() => setMessage(suggestion)}
                      style={{ margin: 2 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Preview de Resposta */}
            {replyingTo && (
              <div className={classes.replyPreview}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption">
                    Respondendo a: {replyingTo.content.substring(0, 100)}...
                  </Typography>
                  <IconButton size="small" onClick={() => setReplyingTo(null)}>
                    <Close />
                  </IconButton>
                </div>
              </div>
            )}

            {/* Área de Input */}
            <div className={classes.messageArea}>
              <IconButton onClick={() => fileInputRef.current?.click()}>
                <AttachFile />
              </IconButton>
              <IconButton>
                <Image />
              </IconButton>
              <TextField
                ref={messageInputRef}
                fullWidth
                placeholder="Digite uma mensagem... (use @ para mencionar)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                variant="outlined"
                size="small"
                multiline
                maxRows={3}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setVoiceRecording(!voiceRecording)}>
                        {voiceRecording ? <MicOff /> : <Mic />}
                      </IconButton>
                      <IconButton>
                        <EmojiEmotions />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <IconButton 
                color="primary" 
                onClick={sendMessage}
                disabled={!message.trim()}
              >
                <Send />
              </IconButton>
            </div>
          </>
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            flexDirection: 'column' 
          }}>
            <ChatBubble style={{ fontSize: 64, color: theme.palette.primary.main, marginBottom: 16 }} />
            <Typography variant="h5" gutterBottom>
              Bem-vindo ao Chat Interno
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Selecione uma conversa para começar
            </Typography>
          </div>
        )}
      </div>

      {/* Painel de Notificações */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            className={classes.notificationPanel}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Typography variant="h6">Notificações</Typography>
                <IconButton size="small" onClick={() => setShowNotifications(false)}>
                  <Close />
                </IconButton>
              </div>

              <List dense>
                {notifications.map((notification) => (
                  <ListItem key={notification.id}>
                    <ListItemAvatar>
                      <Avatar src={notification.sender?.avatar}>
                        <Notifications />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={notification.content}
                      secondary={notification.timestamp.toLocaleTimeString()}
                    />
                    {!notification.read && (
                      <Notifications style={{ color: '#4CAF50', fontSize: 8 }} />
                    )}
                  </ListItem>
                ))}
              </List>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de Gravação de Voz */}
      <AnimatePresence>
        {voiceRecording && (
          <motion.div
            className={classes.voiceIndicator}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <Mic style={{ fontSize: 48, marginBottom: 8 }} />
            <Typography variant="caption">Gravando...</Typography>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input de Arquivo Oculto */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx"
      />

      {/* Botão Flutuante de Configurações */}
      <Fab className={classes.floatingButton}>
        <Settings />
      </Fab>
    </div>
  );
};

export default ChatInterno;
