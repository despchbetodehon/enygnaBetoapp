import React, { useState, useEffect, useRef } from 'react';
import {
  Paper, Typography, List, ListItem, ListItemText, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  Grid, CircularProgress, Box, Fab, Avatar, Tabs, Tab, LinearProgress
} from '@material-ui/core';
import { 
  Add, Close, PhotoCamera, AttachFile, Send, Chat, GetApp, 
  Mic, Stop, PlayArrow, Image as ImageIcon, InsertDriveFile as FileIcon,
  Audiotrack as AudioIcon
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { Timestamp } from 'firebase/firestore';
import Colecao from '@/logic/firebase/db/Colecao';
import ChamadoTI from './Item';
import ChatChamados from './ChatChamados';
import { storage } from '@/logic/firebase/config/app';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { format } from 'date-fns';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(3),
  },
  header: {
    marginBottom: theme.spacing(3),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItem: {
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    marginBottom: theme.spacing(2),
    cursor: 'pointer',
    transition: 'all 0.3s',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transform: 'translateY(-2px)',
    },
  },
  fab: {
    position: 'fixed',
    bottom: theme.spacing(3),
    left: theme.spacing(3),
    backgroundColor: '#2d5a3d',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#1e3d28',
    },
  },
  uploadButton: {
    marginTop: theme.spacing(2),
  },
  thumbnail: {
    width: 100,
    height: 100,
    objectFit: 'cover',
    borderRadius: 8,
    margin: theme.spacing(1),
  },
  chatPublicoContainer: {
    height: 'calc(100vh - 350px)',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing(2),
    '&::-webkit-scrollbar': {
      width: 6,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#2d5a3d',
      borderRadius: 3,
    },
  },
  messageItem: {
    marginBottom: theme.spacing(2),
    display: 'flex',
    gap: theme.spacing(1),
  },
  messageContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: theme.spacing(1.5),
    maxWidth: '80%',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  inputArea: {
    padding: theme.spacing(2),
    backgroundColor: '#fff',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
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
  },
  attachmentFile: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: 'rgba(45,90,61,0.1)',
    borderRadius: 8,
    marginBottom: theme.spacing(0.5),
    cursor: 'pointer',
    minWidth: 0,
    maxWidth: '100%',
    '&:hover': {
      backgroundColor: 'rgba(45,90,61,0.2)',
    },
  },
  audioRecording: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: theme.spacing(0.5),
    width: '100%',
  },
  audioPlayer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: 'rgba(45,90,61,0.1)',
    borderRadius: 8,
    marginBottom: theme.spacing(0.5),
    cursor: 'pointer',
    minWidth: 200,
  },
}));

interface ListaChamadosProps {
  usuarioId: string;
  usuarioNome: string;
}

interface MensagemPublica {
  id: string;
  texto: string;
  usuarioId: string;
  usuarioNome: string;
  timestamp: Timestamp;
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
  audioDuration?: number;
}

const ListaChamados: React.FC<ListaChamadosProps> = ({ usuarioId, usuarioNome }) => {
  const classes = useStyles();
  const [chamados, setChamados] = useState<ChamadoTI[]>([]);
  const [chamadoSelecionado, setChamadoSelecionado] = useState<ChamadoTI | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [novoChamado, setNovoChamado] = useState({
    assunto: '',
    descricao: '',
    prioridade: 'media' as 'baixa' | 'media' | 'alta',
  });
  const [arquivos, setArquivos] = useState<File[]>([]);

  // Estados para chat público
  const [tabAtiva, setTabAtiva] = useState(0);
  const [mensagensPublicas, setMensagensPublicas] = useState<MensagemPublica[]>([]);
  const [mensagemPublica, setMensagemPublica] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Estados para preview de arquivo
  const [previewFile, setPreviewFile] = useState<{ url: string; type: string } | null>(null);
  
  // Estados para anexos e áudio
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayersRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (url: string): string => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('.pdf')) return 'pdf';
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/)) return 'image';
    return 'other';
  };

  const carregarChamados = async () => {
    try {
      const colecao = new Colecao();
      const dados = await colecao.consultar('chamadosTI');
      setChamados(dados as ChamadoTI[]);
    } catch (error) {
      console.error('Erro ao carregar chamados:', error);
    }
  };

  const carregarMensagensPublicas = async () => {
    try {
      const colecao = new Colecao();
      const chat = await colecao.consultarPorId('chatPublico', 'geral');
      if (chat && (chat as any).mensagens) {
        setMensagensPublicas((chat as any).mensagens);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens públicas:', error);
    }
  };

  useEffect(() => {
    carregarChamados();
    carregarMensagensPublicas();

    // Recarregar mensagens a cada 5 segundos
    const interval = setInterval(carregarMensagensPublicas, 5000);
    
    return () => {
      clearInterval(interval);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      audioPlayersRef.current.forEach(player => player.pause());
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensagensPublicas]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArquivos([...arquivos, ...Array.from(e.target.files)]);
    }
  };

  const uploadArquivos = async (): Promise<string[]> => {
    if (arquivos.length === 0) return [];

    const urls: string[] = [];
    for (const arquivo of arquivos) {
      const timestamp = Date.now();
      const fileName = `chamados/${timestamp}-${arquivo.name}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, arquivo);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }
    return urls;
  };

  const criarChamado = async () => {
    if (!novoChamado.assunto.trim() || !novoChamado.descricao.trim()) {
      alert('Preencha assunto e descrição');
      return;
    }

    setIsLoading(true);
    try {
      const imagemUrls = await uploadArquivos();

      const chamado: ChamadoTI = {
        id: Date.now().toString(),
        assunto: novoChamado.assunto,
        descricao: novoChamado.descricao,
        status: 'aberto',
        prioridade: novoChamado.prioridade,
        usuarioId,
        usuarioNome,
        imagemUrls,
        mensagens: [],
        dataCriacao: Timestamp.fromDate(new Date()),
      };

      const colecao = new Colecao();
      await colecao.salvar('chamadosTI', chamado, chamado.id);

      setChamados([chamado, ...chamados]);
      setDialogAberto(false);
      setNovoChamado({ assunto: '', descricao: '', prioridade: 'media' });
      setArquivos([]);
    } catch (error) {
      console.error('Erro ao criar chamado:', error);
      alert('Erro ao criar chamado');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberto': return 'error';
      case 'em_andamento': return 'primary';
      case 'concluido': return 'default';
      default: return 'default';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return '#d32f2f';
      case 'media': return '#ff9800';
      case 'baixa': return '#4caf50';
      default: return '#666';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = audioChunks;

      setIsRecording(true);
      setRecordingTime(0);

      // Timer para atualizar tempo de gravação
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      alert('Erro ao acessar microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setIsRecording(false);
    setRecordingTime(0);
    setAudioBlob(null);
  };

  const sendAudio = async () => {
    if (!audioBlob) return;

    setUploadingFile(true);
    try {
      const timestamp = Date.now();
      const storageRef = ref(storage, `chat_publico_audio/${usuarioId}/${timestamp}_audio.webm`);
      
      const metadata = {
        contentType: 'audio/webm',
        customMetadata: {
          duration: recordingTime.toString(),
        }
      };
      
      await uploadBytes(storageRef, audioBlob, metadata);
      const downloadURL = await getDownloadURL(storageRef);

      await enviarMensagemPublica(downloadURL, 'audio', 'Áudio', recordingTime);

      setAudioBlob(null);
      setRecordingTime(0);
    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
      alert('Erro ao enviar áudio');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `chat_publico_files/${usuarioId}/${timestamp}_${sanitizedName}`);
      
      const metadata = {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
        }
      };
      
      await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(storageRef);

      const fileType = file.type.startsWith('image/') ? 'image' : 'file';
      await enviarMensagemPublica(downloadURL, fileType, file.name);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao enviar arquivo');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const timestamp = Date.now();
      const storageRef = ref(storage, `chat_publico_photos/${usuarioId}/${timestamp}_photo.jpg`);
      
      const metadata = {
        contentType: 'image/jpeg',
        customMetadata: {
          originalName: 'foto.jpg',
        }
      };
      
      await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(storageRef);

      await enviarMensagemPublica(downloadURL, 'image', 'Foto');
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      alert('Erro ao enviar foto');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const downloadFile = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url, {
        mode: 'cors',
        cache: 'no-cache',
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName || 'arquivo';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 100);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'arquivo';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const enviarMensagemPublica = async (attachmentUrl?: string, attachmentType?: string, attachmentName?: string, audioDuration?: number) => {
    if (!mensagemPublica.trim() && !attachmentUrl) return;

    setIsLoading(true);
    try {
      const novaMensagem: MensagemPublica = {
        id: Date.now().toString(),
        texto: mensagemPublica,
        usuarioId,
        usuarioNome,
        timestamp: Timestamp.fromDate(new Date()),
        ...(attachmentUrl && { attachmentUrl, attachmentType, attachmentName }),
        ...(audioDuration && { audioDuration }),
      };

      const mensagensAtualizadas = [...mensagensPublicas, novaMensagem];
      setMensagensPublicas(mensagensAtualizadas);

      const colecao = new Colecao();
      await colecao.salvar('chatPublico', {
        mensagens: mensagensAtualizadas,
        dataAtualizacao: Timestamp.fromDate(new Date()),
      }, 'geral');

      setMensagemPublica('');
    } catch (error) {
      console.error('Erro ao enviar mensagem pública:', error);
      alert('Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagemPublica();
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Typography variant="h4" style={{ fontWeight: 600, color: '#2d5a3d' }}>
          Chamados TI
        </Typography>
      </div>

      <Paper style={{ marginBottom: 16 }}>
        <Tabs
          value={tabAtiva}
          onChange={(e, newValue) => setTabAtiva(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Chat Público" icon={<Chat />} />
          <Tab label="Meus Chamados" icon={<Add />} />
        </Tabs>
      </Paper>

      {tabAtiva === 0 && (
        <Paper className={classes.chatPublicoContainer}>
          <Box p={2} bgcolor="#2d5a3d" color="#fff">
            <Typography variant="h6">Chat Público - Suporte TI</Typography>
            <Typography variant="caption">
              Converse com todos os usuários em tempo real
            </Typography>
          </Box>

          <div className={classes.messagesArea}>
            {mensagensPublicas.length === 0 ? (
              <Typography variant="body2" color="textSecondary" align="center" style={{ padding: 32 }}>
                Nenhuma mensagem ainda. Seja o primeiro a conversar!
              </Typography>
            ) : (
              mensagensPublicas.map((msg) => (
                <div key={msg.id} className={classes.messageItem}>
                  <Avatar style={{ backgroundColor: '#2d5a3d' }}>
                    {msg.usuarioNome.charAt(0).toUpperCase()}
                  </Avatar>
                  <div className={classes.messageContent}>
                    <Typography variant="body2" style={{ fontWeight: 600, marginBottom: 4 }}>
                      {msg.usuarioNome}
                    </Typography>
                    
                    {/* Renderizar anexos */}
                    {msg.attachmentUrl && msg.attachmentType === 'image' && (
                      <Box mb={1}>
                        <img
                          src={msg.attachmentUrl}
                          alt="Imagem anexada"
                          className={classes.attachmentPreview}
                          onClick={() => setPreviewFile({ url: msg.attachmentUrl!, type: 'image' })}
                        />
                        <IconButton
                          size="small"
                          onClick={() => downloadFile(msg.attachmentUrl!, msg.attachmentName || 'imagem.jpg')}
                          style={{ color: '#2d5a3d' }}
                        >
                          <GetApp fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                    
                    {msg.attachmentUrl && msg.attachmentType === 'file' && (
                      <Box className={classes.attachmentFile} onClick={() => downloadFile(msg.attachmentUrl!, msg.attachmentName || 'arquivo')}>
                        <FileIcon style={{ fontSize: 24, color: '#2d5a3d' }} />
                        <Typography variant="caption" style={{ flex: 1 }}>
                          {msg.attachmentName || 'Arquivo'}
                        </Typography>
                        <IconButton size="small" style={{ color: '#2d5a3d' }}>
                          <GetApp fontSize="small" />
                        </IconButton>
                      </Box>
                    )}

                    {msg.attachmentUrl && msg.attachmentType === 'audio' && (
                      <Box className={classes.audioPlayer}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            const audioKey = `public_${msg.id}`;
                            let audioPlayer = audioPlayersRef.current.get(audioKey);
                            
                            if (!audioPlayer) {
                              audioPlayer = new Audio(msg.attachmentUrl);
                              audioPlayer.addEventListener('ended', () => {
                                audioPlayersRef.current.delete(audioKey);
                              });
                              audioPlayersRef.current.set(audioKey, audioPlayer);
                            }
                            
                            if (audioPlayer.paused) {
                              audioPlayersRef.current.forEach((player, key) => {
                                if (key !== audioKey && !player.paused) {
                                  player.pause();
                                }
                              });
                              audioPlayer.play();
                            } else {
                              audioPlayer.pause();
                            }
                          }}
                          style={{ color: '#2d5a3d' }}
                        >
                          <PlayArrow fontSize="small" />
                        </IconButton>
                        
                        <AudioIcon style={{ color: '#2d5a3d', fontSize: 20 }} />
                        
                        <Typography variant="caption" style={{ flex: 1 }}>
                          {msg.audioDuration ? `${Math.floor(msg.audioDuration / 60)}:${(msg.audioDuration % 60).toString().padStart(2, '0')}` : 'Áudio'}
                        </Typography>
                        
                        <IconButton
                          size="small"
                          onClick={() => downloadFile(msg.attachmentUrl!, `audio_${msg.id}.webm`)}
                          style={{ color: '#2d5a3d' }}
                        >
                          <GetApp fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                    
                    {msg.texto && <Typography variant="body1">{msg.texto}</Typography>}
                    <Typography variant="caption" color="textSecondary">
                      {format(msg.timestamp.toDate(), 'dd/MM/yyyy HH:mm')}
                    </Typography>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Indicador de gravação */}
          {isRecording && (
            <Box className={classes.audioRecording}>
              <Mic style={{ color: '#f44336', animation: 'pulse 1s infinite' }} />
              <Typography variant="caption" style={{ flex: 1 }}>
                Gravando: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(recordingTime / 60) * 100} 
                style={{ width: 60 }}
              />
              <IconButton size="small" onClick={cancelRecording}>
                <Close fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={stopRecording} style={{ color: '#f44336' }}>
                <Stop fontSize="small" />
              </IconButton>
            </Box>
          )}

          {/* Preview de áudio gravado */}
          {audioBlob && !isRecording && (
            <Box className={classes.audioRecording}>
              <AudioIcon style={{ color: '#2d5a3d' }} />
              <Typography variant="caption" style={{ flex: 1 }}>
                Áudio pronto ({Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')})
              </Typography>
              <IconButton size="small" onClick={cancelRecording}>
                <Close fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={sendAudio} color="primary">
                <Send fontSize="small" />
              </IconButton>
            </Box>
          )}

          <div className={classes.inputArea}>
            {/* Inputs ocultos */}
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            />
            
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleCameraCapture}
            />
            
            <IconButton 
              size="small" 
              onClick={() => cameraInputRef.current?.click()} 
              disabled={isLoading || isRecording || uploadingFile}
              title="Tirar foto"
            >
              <PhotoCamera fontSize="small" />
            </IconButton>
            
            <IconButton 
              size="small" 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isLoading || isRecording || uploadingFile}
              title="Anexar arquivo"
            >
              <AttachFile fontSize="small" />
            </IconButton>

            <IconButton 
              size="small" 
              onClick={() => isRecording ? stopRecording() : startRecording()} 
              disabled={isLoading || uploadingFile}
              title={isRecording ? "Parar gravação" : "Gravar áudio"}
              style={{ color: isRecording ? '#f44336' : 'inherit' }}
            >
              {isRecording ? <Stop fontSize="small" /> : <Mic fontSize="small" />}
            </IconButton>
            
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Digite sua mensagem..."
              value={mensagemPublica}
              onChange={(e) => setMensagemPublica(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || isRecording || uploadingFile}
            />
            <IconButton
              onClick={() => enviarMensagemPublica()}
              disabled={isLoading || isRecording || uploadingFile || (!mensagemPublica.trim() && !audioBlob)}
              color="primary"
            >
              {isLoading || uploadingFile ? <CircularProgress size={24} /> : <Send />}
            </IconButton>
          </div>
        </Paper>
      )}

      {tabAtiva === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={chamadoSelecionado ? 6 : 12}>
            <Paper style={{ padding: 16 }}>
              <Typography variant="h6" gutterBottom>
                Todos os Chamados
              </Typography>
            <List>
              {chamados.length === 0 ? (
                <Typography variant="body2" color="textSecondary" align="center" style={{ padding: 32 }}>
                  Nenhum chamado criado ainda
                </Typography>
              ) : (
                chamados.map((chamado) => (
                  <ListItem
                    key={chamado.id}
                    className={classes.listItem}
                    onClick={() => setChamadoSelecionado(chamado)}
                    selected={chamadoSelecionado?.id === chamado.id}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" style={{ gap: '8px' }}>
                          <Avatar>{chamado.usuarioNome[0]}</Avatar>
                          <div>
                            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                              {chamado.assunto}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {chamado.usuarioNome}
                            </Typography>
                          </div>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="textSecondary">
                            {chamado.descricao}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Por {chamado.usuarioNome} • {chamado.mensagens?.length || 0} mensagens
                          </Typography>
                          
                          {/* Miniaturas dos arquivos */}
                          {chamado.imagemUrls && chamado.imagemUrls.length > 0 && (
                            <Box mt={1} display="flex" flexWrap="wrap" style={{ gap: 8 }}>
                              {chamado.imagemUrls.map((url, idx) => {
                                const fileType = getFileType(url);
                                return (
                                  <Box 
                                    key={idx} 
                                    className={classes.thumbnail}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPreviewFile({ url, type: fileType });
                                    }}
                                    style={{ 
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      backgroundColor: fileType === 'pdf' ? '#f5f5f5' : 'transparent'
                                    }}
                                  >
                                    {fileType === 'pdf' ? (
                                      <Box textAlign="center">
                                        <AttachFile style={{ fontSize: 40, color: '#d32f2f' }} />
                                        <Typography variant="caption" display="block">PDF</Typography>
                                      </Box>
                                    ) : (
                                      <img
                                        src={url}
                                        alt={`Anexo ${idx + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                                      />
                                    )}
                                  </Box>
                                );
                              })}
                            </Box>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        {chamadoSelecionado && (
            <Grid item xs={12} md={6}>
              <ChatChamados
                chamado={chamadoSelecionado}
                usuarioId={usuarioId}
                usuarioNome={usuarioNome}
                onUpdate={carregarChamados}
              />
            </Grid>
          )}
        </Grid>
      )}

      {tabAtiva === 1 && (
        <Fab className={classes.fab} onClick={() => setDialogAberto(true)}>
          <Add />
        </Fab>
      )}

      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Novo Chamado</Typography>
            <IconButton onClick={() => setDialogAberto(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Assunto"
            value={novoChamado.assunto}
            onChange={(e) => setNovoChamado({ ...novoChamado, assunto: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Descrição"
            value={novoChamado.descricao}
            onChange={(e) => setNovoChamado({ ...novoChamado, descricao: e.target.value })}
            margin="normal"
            multiline
            rows={4}
            required
          />
          <Box mt={2}>
            <Typography variant="body2" gutterBottom>
              Prioridade
            </Typography>
            <Box display="flex" style={{ gap: '8px' }}>
              {(['baixa', 'media', 'alta'] as const).map((p) => (
                <Button
                  key={p}
                  variant={novoChamado.prioridade === p ? 'contained' : 'outlined'}
                  onClick={() => setNovoChamado({ ...novoChamado, prioridade: p })}
                  style={{
                    backgroundColor: novoChamado.prioridade === p ? getPrioridadeColor(p) : 'transparent',
                    color: novoChamado.prioridade === p ? '#fff' : getPrioridadeColor(p),
                    borderColor: getPrioridadeColor(p),
                  }}
                >
                  {p.toUpperCase()}
                </Button>
              ))}
            </Box>
          </Box>

          <Box mt={2}>
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              id="chamado-file-upload"
              onChange={handleFileChange}
            />
            <label htmlFor="chamado-file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<AttachFile />}
                fullWidth
                className={classes.uploadButton}
              >
                Anexar Arquivos
              </Button>
            </label>
          </Box>

          {arquivos.length > 0 && (
            <Box mt={2}>
              <Typography variant="body2" gutterBottom>
                Arquivos selecionados:
              </Typography>
              <Box display="flex" flexWrap="wrap">
                {arquivos.map((arquivo, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(arquivo)}
                    alt={arquivo.name}
                    className={classes.thumbnail}
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={criarChamado}
            variant="contained"
            style={{ backgroundColor: '#2d5a3d', color: '#fff' }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Criar Chamado'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para preview de arquivo */}
      <Dialog
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Visualizar Anexo
          <IconButton
            onClick={() => setPreviewFile(null)}
            style={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ minHeight: 500 }}>
          {previewFile && (
            <>
              {previewFile.type === 'pdf' ? (
                <iframe
                  src={previewFile.url}
                  style={{ 
                    width: '100%', 
                    height: '70vh', 
                    border: 'none',
                    borderRadius: 8 
                  }}
                  title="Visualização do PDF"
                />
              ) : previewFile.type === 'image' ? (
                <img
                  src={previewFile.url}
                  alt="Preview"
                  style={{ width: '100%', height: 'auto', borderRadius: 8 }}
                />
              ) : (
                <Box textAlign="center" py={4}>
                  <AttachFile style={{ fontSize: 80, color: '#999' }} />
                  <Box mt={2}>
                    <Typography variant="h6" color="textSecondary">
                      Arquivo não suportado para preview
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Clique em "Baixar" para fazer o download do arquivo
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              if (previewFile) {
                const link = document.createElement('a');
                link.href = previewFile.url;
                link.download = `anexo-${Date.now()}.${previewFile.type === 'pdf' ? 'pdf' : 'jpg'}`;
                link.target = '_blank';
                link.click();
              }
            }}
            color="primary"
            startIcon={<GetApp />}
          >
            Baixar
          </Button>
          <Button onClick={() => setPreviewFile(null)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ListaChamados;