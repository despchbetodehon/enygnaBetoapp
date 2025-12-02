import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Avatar,
  Typography,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Fab,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  LinearProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  PhotoCamera as PhotoCameraIcon,
  Remove as RemoveIcon,
  GetApp as DownloadIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Mic as MicIcon,
  Stop as StopIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Audiotrack as AudioIcon,
} from '@material-ui/icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import useAutenticacao from '@/data/hooks/useAutenticacao';
import Colecao from '@/logic/firebase/db/Colecao';
import { storage } from '@/logic/firebase/config/app';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const useStyles = makeStyles((theme) => ({
  fabButton: {
    position: 'fixed',
    bottom: theme.spacing(2),
    left: theme.spacing(2),
    zIndex: 1300,
    backgroundColor: '#1976d2',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#1565c0',
    },
  },
  contactListContainer: {
    position: 'fixed',
    bottom: theme.spacing(2),
    left: theme.spacing(2),
    width: 280,
    maxHeight: 400,
    zIndex: 1300,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  contactListHeader: {
    backgroundColor: '#1976d2',
    color: '#fff',
    padding: theme.spacing(1.5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactList: {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#fff',
    maxHeight: 350,
  },
  contactItem: {
    cursor: 'pointer',
    borderBottom: '1px solid #f0f0f0',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  chatWindowsContainer: {
    position: 'fixed',
    bottom: theme.spacing(2),
    left: theme.spacing(37),
    display: 'flex',
    gap: theme.spacing(1),
    zIndex: 1299,
    [theme.breakpoints.down('sm')]: {
      left: theme.spacing(2),
      flexDirection: 'column-reverse',
    },
  },
  chatWindow: {
    width: 320,
    height: 400,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      maxWidth: 320,
    },
  },
  chatWindowMinimized: {
    width: 250,
    height: 50,
  },
  chatHeader: {
    backgroundColor: '#1976d2',
    color: '#fff',
    padding: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing(2),
    backgroundColor: '#f5f5f5',
    minHeight: 250,
    maxHeight: 280,
  },
  messageOwn: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing(1),
  },
  messageOther: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(1),
  },
  messageBubble: {
    maxWidth: '70%',
    padding: theme.spacing(1, 2),
    borderRadius: 18,
    wordBreak: 'break-word',
  },
  messageBubbleOwn: {
    backgroundColor: '#1976d2',
    color: '#fff',
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: '#fff',
    color: '#000',
    borderBottomLeftRadius: 4,
  },
  inputContainer: {
    padding: theme.spacing(1),
    backgroundColor: '#fff',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  attachmentPreview: {
    width: '100%',
    maxWidth: 250,
    maxHeight: 200,
    objectFit: 'cover',
    borderRadius: 8,
    cursor: 'pointer',
    marginBottom: theme.spacing(0.5),
    display: 'block',
    [theme.breakpoints.down('sm')]: {
      maxWidth: '100%',
      maxHeight: 150,
    },
  },
  attachmentFile: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    marginBottom: theme.spacing(0.5),
    cursor: 'pointer',
    minWidth: 0,
    maxWidth: '100%',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.3)',
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(0.5),
      gap: theme.spacing(0.5),
    },
  },
  fileIcon: {
    fontSize: 24,
  },
  audioRecording: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: theme.spacing(0.5),
  },
  audioPlayer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    marginBottom: theme.spacing(0.5),
    cursor: 'pointer',
  },
  audioProgress: {
    flex: 1,
  },
}));

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
  audioDuration?: number;
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  imagemUrl?: string;
}

interface ChatWindow {
  user: Usuario;
  messages: Message[];
  inputText: string;
  isMinimized: boolean;
  isLoading: boolean;
  isRecording: boolean;
  recordingTime: number;
  audioBlob?: Blob;
}

const ChatFlutuante: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { usuario } = useAutenticacao();
  const colecao = new Colecao();

  const [showContactList, setShowContactList] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [openChats, setOpenChats] = useState<Map<string, ChatWindow>>(new Map());
  const [unreadCount, setUnreadCount] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [lastMessageIds, setLastMessageIds] = useState<Map<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chat_last_message_ids');
      return saved ? new Map(JSON.parse(saved)) : new Map();
    }
    return new Map();
  });
  const [unreadMessages, setUnreadMessages] = useState<Map<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chat_unread_messages');
      return saved ? new Map(JSON.parse(saved)) : new Map();
    }
    return new Map();
  });

  const messagesEndRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const fileInputRefs = useRef<Map<string, HTMLInputElement | null>>(new Map());
  const cameraInputRefs = useRef<Map<string, HTMLInputElement | null>>(new Map());
  const chatIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const mediaRecorderRefs = useRef<Map<string, MediaRecorder | null>>(new Map());
  const audioChunksRefs = useRef<Map<string, Blob[]>>(new Map());
  const recordingTimerRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const audioPlayersRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const globalCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Salvar lastMessageIds no localStorage quando mudar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat_last_message_ids', JSON.stringify(Array.from(lastMessageIds.entries())));
    }
  }, [lastMessageIds]);

  // Salvar unreadMessages no localStorage quando mudar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat_unread_messages', JSON.stringify(Array.from(unreadMessages.entries())));
    }
  }, [unreadMessages]);

  // Carregar usuários
  useEffect(() => {
    const carregarUsuarios = async () => {
      try {
        const todosUsuarios = await colecao.consultar('usuarios');
        const usuariosFiltrados = todosUsuarios.filter(
          (u: Usuario) => u.id !== usuario?.id
        );
        setUsuarios(usuariosFiltrados);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      }
    };

    if (usuario) {
      carregarUsuarios();
    }
  }, [usuario]);

  // Verificação global de novas mensagens de todos os usuários
  useEffect(() => {
    if (!usuario) return;

    const verificarNovasMensagens = async () => {
      try {
        for (const user of usuarios) {
          const chatId = [usuario.id, user.id].sort().join('_');
          const msgs = await colecao.consultar(`chats/${chatId}/mensagens`, 'timestamp');

          if (msgs.length > 0) {
            const ultimaMensagem = msgs[msgs.length - 1];
            const lastId = lastMessageIds.get(user.id);

            // Se há nova mensagem e não é do próprio usuário
            if (ultimaMensagem.id !== lastId && ultimaMensagem.senderId !== usuario.id) {
              // Atualizar último ID
              setLastMessageIds(prev => new Map(prev).set(user.id, ultimaMensagem.id));

              // Incrementar contador de não lidas
              setUnreadMessages(prev => {
                const newMap = new Map(prev);
                const current = newMap.get(user.id) || 0;
                newMap.set(user.id, current + 1);
                return newMap;
              });

              // Calcular total de não lidas
              const totalUnread = Array.from(unreadMessages.values()).reduce((a, b) => a + b, 0) + 1;
              setUnreadCount(totalUnread);

              // Se o chat está aberto, atualizar mensagens
              if (openChats.has(user.id)) {
                carregarMensagens(user.id);
              } else {
                // Apenas notificar, não abrir automaticamente
                // Mostrar notificação visual
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification(`Nova mensagem de ${user.nome}`, {
                    body: ultimaMensagem.text || 'Anexo',
                    icon: user.imagemUrl || '/betologo.jpg',
                  });
                }

                // Som de notificação
                playNotificationSound();
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar novas mensagens:', error);
      }
    };

    // Verificar a cada 2 segundos
    verificarNovasMensagens();
    globalCheckInterval.current = setInterval(verificarNovasMensagens, 2000);

    return () => {
      if (globalCheckInterval.current) {
        clearInterval(globalCheckInterval.current);
      }
    };
  }, [usuario, usuarios, lastMessageIds, unreadMessages, openChats]);

  // Solicitar permissão para notificações
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Limpar intervalos ao desmontar
  useEffect(() => {
    return () => {
      chatIntervals.current.forEach(interval => clearInterval(interval));
      recordingTimerRefs.current.forEach(timer => clearInterval(timer));
      mediaRecorderRefs.current.forEach(recorder => {
        if (recorder && recorder.state !== 'inactive') {
          recorder.stop();
        }
      });
      audioPlayersRefs.current.forEach(player => player.pause());
    };
  }, []);

  const scrollToBottom = (userId: string) => {
    messagesEndRefs.current.get(userId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const playNotificationSound = () => {
    try {
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
    } catch (error) {
      console.error('Erro ao tocar som:', error);
    }
  };

  const carregarMensagens = async (userId: string) => {
    if (!usuario) return;

    const chatId = [usuario.id, userId].sort().join('_');
    try {
      const msgs = await colecao.consultar(`chats/${chatId}/mensagens`, 'timestamp');

      setOpenChats(prev => {
        const newChats = new Map(prev);
        const chat = newChats.get(userId);
        if (chat) {
          chat.messages = msgs;
          chat.isLoading = false;
        }
        return newChats;
      });

      setTimeout(() => scrollToBottom(userId), 100);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const abrirChat = async (user: Usuario) => {
    // Marcar todas as mensagens deste chat como lidas
    if (usuario) {
      const chatId = [usuario.id, user.id].sort().join('_');
      try {
        const msgs = await colecao.consultar(`chats/${chatId}/mensagens`, 'timestamp');
        if (msgs.length > 0) {
          const ultimaMensagem = msgs[msgs.length - 1];
          setLastMessageIds(prev => new Map(prev).set(user.id, ultimaMensagem.id));
        }
      } catch (error) {
        console.error('Erro ao marcar mensagens como lidas:', error);
      }
    }

    // Limpar contador de não lidas ao abrir chat
    setUnreadMessages(prev => {
      const newMap = new Map(prev);
      newMap.delete(user.id);
      return newMap;
    });

    // Recalcular total de não lidas
    const totalUnread = Array.from(unreadMessages.values())
      .filter((_, key) => key.toString() !== user.id)
      .reduce((a, b) => a + b, 0);
    setUnreadCount(totalUnread);

    if (openChats.has(user.id)) {
      setOpenChats(prev => {
        const newChats = new Map(prev);
        const chat = newChats.get(user.id);
        if (chat) {
          chat.isMinimized = false;
        }
        return newChats;
      });
      return;
    }

    const newChat: ChatWindow = {
      user,
      messages: [],
      inputText: '',
      isMinimized: false,
      isLoading: true,
      isRecording: false,
      recordingTime: 0,
    };

    setOpenChats(prev => new Map(prev).set(user.id, newChat));
    carregarMensagens(user.id);

    const interval = setInterval(() => {
      carregarMensagens(user.id);
    }, 3000);
    chatIntervals.current.set(user.id, interval);
  };

  const fecharChat = async (userId: string) => {
    const interval = chatIntervals.current.get(userId);
    if (interval) {
      clearInterval(interval);
      chatIntervals.current.delete(userId);
    }

    // Marcar todas as mensagens como lidas ao fechar
    if (usuario) {
      const chatId = [usuario.id, userId].sort().join('_');
      try {
        const msgs = await colecao.consultar(`chats/${chatId}/mensagens`, 'timestamp');
        if (msgs.length > 0) {
          const ultimaMensagem = msgs[msgs.length - 1];
          setLastMessageIds(prev => new Map(prev).set(userId, ultimaMensagem.id));
        }
      } catch (error) {
        console.error('Erro ao marcar mensagens como lidas:', error);
      }
    }

    // Limpar contador de não lidas
    setUnreadMessages(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });

    // Recalcular total de não lidas
    const totalUnread = Array.from(unreadMessages.values()).reduce((a, b) => a + b, 0);
    setUnreadCount(totalUnread);

    setOpenChats(prev => {
      const newChats = new Map(prev);
      newChats.delete(userId);
      return newChats;
    });
  };

  const toggleMinimize = (userId: string) => {
    setOpenChats(prev => {
      const newChats = new Map(prev);
      const chat = newChats.get(userId);
      if (chat) {
        chat.isMinimized = !chat.isMinimized;
      }
      return newChats;
    });
  };

  const startRecording = async (userId: string) => {
    // Verificar se o usuário tem permissão de administrador
    if (!usuario || (usuario.permissao !== 'Administrador' && usuario.permissao !== 'administrador')) {
      alert('Apenas administradores podem gravar áudios');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setOpenChats(prev => {
          const newChats = new Map(prev);
          const chat = newChats.get(userId);
          if (chat) {
            chat.audioBlob = audioBlob;
            chat.isRecording = false;
          }
          return newChats;
        });
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRefs.current.set(userId, mediaRecorder);
      audioChunksRefs.current.set(userId, audioChunks);

      setOpenChats(prev => {
        const newChats = new Map(prev);
        const chat = newChats.get(userId);
        if (chat) {
          chat.isRecording = true;
          chat.recordingTime = 0;
        }
        return newChats;
      });

      // Timer para atualizar tempo de gravação
      const timer = setInterval(() => {
        setOpenChats(prev => {
          const newChats = new Map(prev);
          const chat = newChats.get(userId);
          if (chat && chat.isRecording) {
            chat.recordingTime += 1;
            // Parar automaticamente em 60 segundos
            if (chat.recordingTime >= 60) {
              stopRecording(userId);
            }
          }
          return newChats;
        });
      }, 1000);

      recordingTimerRefs.current.set(userId, timer);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      alert('Erro ao acessar microfone. Verifique as permissões.');
    }
  };

  const stopRecording = (userId: string) => {
    const mediaRecorder = mediaRecorderRefs.current.get(userId);
    const timer = recordingTimerRefs.current.get(userId);

    if (timer) {
      clearInterval(timer);
      recordingTimerRefs.current.delete(userId);
    }

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };

  const cancelRecording = (userId: string) => {
    stopRecording(userId);
    setOpenChats(prev => {
      const newChats = new Map(prev);
      const chat = newChats.get(userId);
      if (chat) {
        chat.isRecording = false;
        chat.recordingTime = 0;
        chat.audioBlob = undefined;
      }
      return newChats;
    });
  };

  const sendAudio = async (userId: string) => {
    const chat = openChats.get(userId);
    if (!chat?.audioBlob || !usuario) return;

    setOpenChats(prev => {
      const newChats = new Map(prev);
      const chatAtual = newChats.get(userId);
      if (chatAtual) {
        chatAtual.isLoading = true;
      }
      return newChats;
    });

    try {
      const timestamp = Date.now();
      const storageRef = ref(storage, `chat_audio/${usuario.id}/${timestamp}_audio.webm`);

      const metadata = {
        contentType: 'audio/webm',
        customMetadata: {
          duration: chat.recordingTime.toString(),
        }
      };

      await uploadBytes(storageRef, chat.audioBlob, metadata);
      const downloadURL = await getDownloadURL(storageRef);

      await enviarMensagem(userId, downloadURL, 'audio', 'Áudio', chat.recordingTime);

      // Limpar blob de áudio
      setOpenChats(prev => {
        const newChats = new Map(prev);
        const chatAtual = newChats.get(userId);
        if (chatAtual) {
          chatAtual.audioBlob = undefined;
          chatAtual.recordingTime = 0;
        }
        return newChats;
      });
    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
      alert('Erro ao enviar áudio');
    } finally {
      setOpenChats(prev => {
        const newChats = new Map(prev);
        const chat = newChats.get(userId);
        if (chat) {
          chat.isLoading = false;
        }
        return newChats;
      });
    }
  };

  const enviarMensagem = async (userId: string, attachmentUrl?: string, attachmentType?: string, attachmentName?: string, audioDuration?: number) => {
    const chat = openChats.get(userId);
    if (!chat || (!chat.inputText.trim() && !attachmentUrl) || !usuario) {
      console.log('❌ Validação falhou:', { 
        hasChat: !!chat, 
        hasText: !!chat?.inputText.trim(), 
        hasAttachment: !!attachmentUrl,
        hasUsuario: !!usuario 
      });
      return;
    }

    // Validar campos essenciais do usuário
    if (!usuario.id || (!usuario.nome && !usuario.email)) {
      console.error('❌ Dados do usuário incompletos:', {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      });
      alert('Erro: Dados do usuário incompletos. Faça login novamente.');
      return;
    }

    const chatId = [usuario.id, userId].sort().join('_');
    const mensagemTexto = chat.inputText.trim();
    const senderName = usuario.nome || usuario.email || 'Usuário';

    console.log('📤 Tentando enviar mensagem:', {
      chatId,
      senderId: usuario.id,
      senderName,
      hasText: !!mensagemTexto,
      hasAttachment: !!attachmentUrl
    });

    const novaMensagem = {
      text: mensagemTexto,
      senderId: usuario.id,
      senderName: senderName,
      timestamp: new Date(),
      ...(attachmentUrl && { attachmentUrl, attachmentType, attachmentName }),
      ...(audioDuration && { audioDuration }),
    };

    // Atualizar UI otimisticamente
    setOpenChats(prev => {
      const newChats = new Map(prev);
      const chatAtual = newChats.get(userId);
      if (chatAtual) {
        chatAtual.messages = [...chatAtual.messages, { 
          id: Date.now().toString(), 
          ...novaMensagem,
          timestamp: { toDate: () => new Date() } as any
        }];
        chatAtual.inputText = '';
      }
      return newChats;
    });

    try {
      const mensagemId = Date.now().toString();
      console.log('💾 Salvando mensagem no Firebase:', { chatId, mensagemId });
      
      await colecao.salvar(`chats/${chatId}/mensagens`, novaMensagem, mensagemId);
      
      console.log('✅ Mensagem salva com sucesso!');
      setTimeout(() => carregarMensagens(userId), 500);
    } catch (error: any) {
      console.error('❌ Erro ao enviar mensagem:', {
        error,
        code: error?.code,
        message: error?.message,
        chatId,
        usuarioId: usuario.id
      });
      
      // Reverter mensagem otimista em caso de erro
      setOpenChats(prev => {
        const newChats = new Map(prev);
        const chatAtual = newChats.get(userId);
        if (chatAtual) {
          chatAtual.messages = chatAtual.messages.slice(0, -1);
        }
        return newChats;
      });
      
      if (error?.code === 'permission-denied') {
        alert('Erro de permissão: Verifique as regras do Firestore. O usuário pode não ter permissão para salvar mensagens.');
      } else {
        alert(`Erro ao enviar mensagem: ${error?.message || 'Erro desconhecido'}`);
      }
    }
  };

  const handleFileChange = async (userId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !usuario) return;

    // Verificar se o usuário tem permissão de administrador
    if (usuario.permissao !== 'Administrador' && usuario.permissao !== 'administrador') {
      alert('Apenas administradores podem enviar arquivos');
      e.target.value = '';
      return;
    }

    setOpenChats(prev => {
      const newChats = new Map(prev);
      const chat = newChats.get(userId);
      if (chat) {
        chat.isLoading = true;
      }
      return newChats;
    });

    try {
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `chat_files/${usuario.id}/${timestamp}_${sanitizedName}`);

      const metadata = {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
        }
      };

      await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(storageRef);

      const fileType = file.type.startsWith('image/') ? 'image' : 'file';
      await enviarMensagem(userId, downloadURL, fileType, file.name);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao enviar arquivo');
    } finally {
      setOpenChats(prev => {
        const newChats = new Map(prev);
        const chat = newChats.get(userId);
        if (chat) {
          chat.isLoading = false;
        }
        return newChats;
      });
      // Limpar input
      e.target.value = '';
    }
  };

  const handleCameraCapture = async (userId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !usuario) return;

    // Verificar se o usuário tem permissão de administrador
    if (usuario.permissao !== 'Administrador' && usuario.permissao !== 'administrador') {
      alert('Apenas administradores podem enviar fotos');
      e.target.value = '';
      return;
    }

    setOpenChats(prev => {
      const newChats = new Map(prev);
      const chat = newChats.get(userId);
      if (chat) {
        chat.isLoading = true;
      }
      return newChats;
    });

    try {
      const timestamp = Date.now();
      const storageRef = ref(storage, `chat_photos/${usuario.id}/${timestamp}_photo.jpg`);

      const metadata = {
        contentType: 'image/jpeg',
        customMetadata: {
          originalName: 'foto.jpg',
        }
      };

      await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(storageRef);

      await enviarMensagem(userId, downloadURL, 'image', 'Foto');
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      alert('Erro ao enviar foto');
    } finally {
      setOpenChats(prev => {
        const newChats = new Map(prev);
        const chat = newChats.get(userId);
        if (chat) {
          chat.isLoading = false;
        }
        return newChats;
      });
      // Limpar input
      e.target.value = '';
    }
  };

  const downloadFile = async (url: string, fileName: string) => {
    try {
      // Método 1: Tentar download direto via fetch
      const response = await fetch(url, {
        mode: 'cors',
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName || 'arquivo';
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpar objeto URL após um delay
      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 100);

    } catch (error) {
      console.error('Erro ao baixar arquivo (método 1):', error);

      // Método 2: Fallback - abrir em nova aba
      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'arquivo';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (fallbackError) {
        console.error('Erro ao baixar arquivo (método 2):', fallbackError);
        alert('Não foi possível baixar o arquivo. Por favor, clique com o botão direito e selecione "Salvar como".');
      }
    }
  };

  const renderMessage = (msg: Message, userId: string) => {
    const isOwn = msg.senderId === usuario?.id;
    const audioKey = `${userId}_${msg.id}`;

    return (
      <div key={msg.id} className={isOwn ? classes.messageOwn : classes.messageOther}>
        <div className={`${classes.messageBubble} ${isOwn ? classes.messageBubbleOwn : classes.messageBubbleOther}`}>
          {!isOwn && (
            <Typography variant="caption" style={{ fontWeight: 'bold', display: 'block' }}>
              {msg.senderName}
            </Typography>
          )}

          {/* Renderizar anexos */}
          {msg.attachmentUrl && msg.attachmentType === 'image' && (
            <Box mb={0.5} display="flex" flexDirection="column" style={{ gap: 4 }}>
              <img
                src={msg.attachmentUrl}
                alt="Imagem anexada"
                className={classes.attachmentPreview}
                onClick={() => setPreviewImage(msg.attachmentUrl!)}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              <Box display="flex" style={{ gap: 4 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadFile(msg.attachmentUrl!, msg.attachmentName || 'imagem.jpg');
                  }}
                  style={{ color: isOwn ? '#fff' : '#1976d2', padding: 4 }}
                  title="Baixar imagem"
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          )}

          {msg.attachmentUrl && msg.attachmentType === 'file' && (
            <Box className={classes.attachmentFile} onClick={() => downloadFile(msg.attachmentUrl!, msg.attachmentName || 'arquivo')}>
              <FileIcon className={classes.fileIcon} />
              <Box flex={1} minWidth={0}>
                <Typography variant="caption" style={{ wordBreak: 'break-word' }}>
                  {msg.attachmentName || 'Arquivo'}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadFile(msg.attachmentUrl!, msg.attachmentName || 'arquivo');
                }}
                style={{ color: isOwn ? '#fff' : '#1976d2', padding: 4 }}
                title="Baixar arquivo"
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          {msg.attachmentUrl && msg.attachmentType === 'audio' && (
            <Box 
              display="flex" 
              alignItems="center" 
              borderRadius={2}
              style={{ 
                background: isOwn ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                minWidth: 200,
                maxWidth: '100%',
                gap: '8px'
              }}
            >
              <IconButton
                size="small"
                onClick={() => {
                  let audioPlayer = audioPlayersRefs.current.get(audioKey);

                  if (!audioPlayer) {
                    audioPlayer = new Audio(msg.attachmentUrl);
                    audioPlayer.addEventListener('ended', () => {
                      audioPlayersRefs.current.delete(audioKey);
                    });
                    audioPlayersRefs.current.set(audioKey, audioPlayer);
                  }

                  if (audioPlayer.paused) {
                    // Pausar todos os outros áudios
                    audioPlayersRefs.current.forEach((player, key) => {
                      if (key !== audioKey && !player.paused) {
                        player.pause();
                      }
                    });
                    audioPlayer.play();
                  } else {
                    audioPlayer.pause();
                  }
                }}
                style={{ color: isOwn ? '#fff' : '#1976d2', padding: 4 }}
                title="Reproduzir/Pausar"
              >
                <PlayIcon fontSize="small" />
              </IconButton>

              <AudioIcon style={{ color: isOwn ? '#fff' : '#1976d2', fontSize: 20 }} />

              <Box flex={1} minWidth={0}>
                <Typography variant="caption" style={{ fontSize: '0.7rem', display: 'block' }}>
                  {msg.audioDuration ? `${Math.floor(msg.audioDuration / 60)}:${(msg.audioDuration % 60).toString().padStart(2, '0')}` : 'Áudio'}
                </Typography>
              </Box>

              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadFile(msg.attachmentUrl!, `audio_${msg.id}.webm`);
                }}
                style={{ color: isOwn ? '#fff' : '#1976d2', padding: 4 }}
                title="Baixar áudio"
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          {msg.text && <Typography variant="body2" style={{ wordBreak: 'break-word' }}>{msg.text}</Typography>}

          <Typography variant="caption" style={{ fontSize: '0.7rem', opacity: 0.8, display: 'block', marginTop: 4 }}>
            {msg.timestamp?.toDate ? format(msg.timestamp.toDate(), 'HH:mm', { locale: ptBR }) : ''}
          </Typography>
        </div>
      </div>
    );
  };

  const renderChatWindow = (userId: string, chat: ChatWindow) => (
    <Paper 
      key={userId} 
      className={`${classes.chatWindow} ${chat.isMinimized ? classes.chatWindowMinimized : ''}`}
    >
      <div className={classes.chatHeader} onClick={() => toggleMinimize(userId)}>
        <Box display="flex" alignItems="center" style={{ gap: '8px' }}>
          <Badge badgeContent={unreadMessages.get(userId) || 0} color="error">
            <Avatar src={chat.user.imagemUrl} alt={chat.user.nome || chat.user.email} style={{ width: 32, height: 32 }}>
              {chat.user.nome?.[0] || chat.user.email?.[0] || '?'}
            </Avatar>
          </Badge>
          <Typography variant="subtitle2">{chat.user.nome || chat.user.email}</Typography>
        </Box>
        <Box>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleMinimize(userId); }}>
            <RemoveIcon style={{ color: '#fff', fontSize: 18 }} />
          </IconButton>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); fecharChat(userId); }}>
            <CloseIcon style={{ color: '#fff', fontSize: 18 }} />
          </IconButton>
        </Box>
      </div>

      {!chat.isMinimized && (
        <>
          <div className={classes.messagesContainer}>
            {chat.isLoading && chat.messages.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress size={30} />
              </Box>
            ) : (
              <>
                {chat.messages.map(msg => renderMessage(msg, userId))}
                <div ref={(el) => messagesEndRefs.current.set(userId, el)} />
              </>
            )}
          </div>

          <div>
            {/* Indicador de gravação */}
            {chat.isRecording && (
              <Box className={classes.audioRecording}>
                <MicIcon style={{ color: '#f44336', animation: 'pulse 1s infinite' }} />
                <Typography variant="caption" style={{ flex: 1 }}>
                  Gravando: {Math.floor(chat.recordingTime / 60)}:{(chat.recordingTime % 60).toString().padStart(2, '0')}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(chat.recordingTime / 60) * 100} 
                  style={{ width: 60 }}
                />
                <IconButton size="small" onClick={() => cancelRecording(userId)} title="Cancelar">
                  <CloseIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => stopRecording(userId)} title="Parar">
                  <StopIcon fontSize="small" style={{ color: '#f44336' }} />
                </IconButton>
              </Box>
            )}

            {/* Preview de áudio gravado */}
            {chat.audioBlob && !chat.isRecording && (
              <Box className={classes.audioRecording}>
                <AudioIcon style={{ color: '#1976d2' }} />
                <Typography variant="caption" style={{ flex: 1 }}>
                  Áudio pronto ({Math.floor(chat.recordingTime / 60)}:{(chat.recordingTime % 60).toString().padStart(2, '0')})
                </Typography>
                <IconButton size="small" onClick={() => cancelRecording(userId)} title="Cancelar">
                  <CloseIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => sendAudio(userId)} title="Enviar" color="primary">
                  <SendIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            <div className={classes.inputContainer}>
              {/* Input de arquivo oculto */}
              <input
                ref={(el) => fileInputRefs.current.set(userId, el)}
                type="file"
                style={{ display: 'none' }}
                onChange={(e) => handleFileChange(userId, e)}
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              />

              {/* Input de câmera oculto */}
              <input
                ref={(el) => cameraInputRefs.current.set(userId, el)}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={(e) => handleCameraCapture(userId, e)}
              />

              {(usuario?.permissao === 'Administrador' || usuario?.permissao === 'administrador') && (
                <>
                  <IconButton 
                    size="small" 
                    onClick={() => cameraInputRefs.current.get(userId)?.click()} 
                    disabled={chat.isLoading || chat.isRecording}
                    title="Tirar foto"
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>

                  <IconButton 
                    size="small" 
                    onClick={() => fileInputRefs.current.get(userId)?.click()} 
                    disabled={chat.isLoading || chat.isRecording}
                    title="Anexar arquivo"
                  >
                    <AttachFileIcon fontSize="small" />
                  </IconButton>

                  <IconButton 
                    size="small" 
                    onClick={() => chat.isRecording ? stopRecording(userId) : startRecording(userId)} 
                    disabled={chat.isLoading}
                    title={chat.isRecording ? "Parar gravação" : "Gravar áudio"}
                    style={{ color: chat.isRecording ? '#f44336' : 'inherit' }}
                  >
                    {chat.isRecording ? <StopIcon fontSize="small" /> : <MicIcon fontSize="small" />}
                  </IconButton>
                </>
              )}

              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Mensagem..."
                value={chat.inputText}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setOpenChats(prev => {
                    const newChats = new Map(prev);
                    const chatAtual = newChats.get(userId);
                    if (chatAtual) {
                      chatAtual.inputText = newValue;
                    }
                    return newChats;
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    enviarMensagem(userId);
                  }
                }}
                disabled={chat.isLoading || chat.isRecording}
                autoComplete="off"
              />

              <IconButton
                size="small"
                color="primary"
                onClick={() => enviarMensagem(userId)}
                disabled={!chat.inputText.trim() || chat.isLoading || chat.isRecording}
              >
                {chat.isLoading ? <CircularProgress size={20} /> : <SendIcon fontSize="small" />}
              </IconButton>
            </div>
          </div>
        </>
      )}
    </Paper>
  );

  if (!usuario) return null;

  return (
    <>
      {/* Botão flutuante */}
      {!showContactList && (
        <Fab className={classes.fabButton} onClick={() => setShowContactList(true)}>
          <Badge badgeContent={unreadCount} color="error">
            <ChatIcon />
          </Badge>
        </Fab>
      )}

      {/* Lista de contatos */}
      {showContactList && (
        <Paper className={classes.contactListContainer}>
          <div className={classes.contactListHeader}>
            <Typography variant="h6" style={{ fontSize: '1rem' }}>Mensagens</Typography>
            <IconButton size="small" onClick={() => setShowContactList(false)}>
              <CloseIcon style={{ color: '#fff' }} />
            </IconButton>
          </div>
          <List className={classes.contactList}>
            {usuarios.map((user) => (
              <ListItem
                key={user.id}
                className={classes.contactItem}
                onClick={() => abrirChat(user)}
              >
                <ListItemAvatar>
                  <Badge badgeContent={unreadMessages.get(user.id) || 0} color="error">
                    <Avatar src={user.imagemUrl} alt={user.nome || user.email}>
                      {user.nome?.[0] || user.email?.[0] || '?'}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText 
                  primary={user.nome || user.email} 
                  secondary={user.email}
                  primaryTypographyProps={{ 
                    style: { 
                      fontSize: '0.9rem',
                      fontWeight: (unreadMessages.get(user.id) || 0) > 0 ? 'bold' : 'normal'
                    } 
                  }}
                  secondaryTypographyProps={{ style: { fontSize: '0.75rem' } }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Janelas de chat abertas */}
      <div className={classes.chatWindowsContainer}>
        {Array.from(openChats.entries()).map(([userId, chat]) => 
          renderChatWindow(userId, chat)
        )}
      </div>

      {/* Dialog para preview de imagem */}
      <Dialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: '#000',
            boxShadow: 'none',
          }
        }}
      >
        <DialogTitle style={{ backgroundColor: '#1976d2', color: '#fff' }}>
          Visualizar Imagem
          <IconButton
            onClick={() => setPreviewImage(null)}
            style={{ position: 'absolute', right: 8, top: 8, color: '#fff' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ backgroundColor: '#000', padding: 0 }}>
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              style={{ 
                width: '100%', 
                height: 'auto', 
                display: 'block',
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            />
          )}
        </DialogContent>
        <DialogActions style={{ backgroundColor: '#1976d2', padding: '8px 16px' }}>
          <Button
            onClick={() => {
              if (previewImage) {
                const fileName = `imagem_${Date.now()}.jpg`;
                downloadFile(previewImage, fileName);
              }
            }}
            style={{ color: '#fff' }}
            startIcon={<DownloadIcon />}
          >
            Baixar
          </Button>
          <Button onClick={() => setPreviewImage(null)} style={{ color: '#fff' }}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChatFlutuante;