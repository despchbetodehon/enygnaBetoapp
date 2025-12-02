
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Paper, TextField, IconButton, Typography, Avatar, Divider,
  List, ListItem, ListItemAvatar, ListItemText, CircularProgress,
  Box, Chip
} from '@material-ui/core';
import { Send, PhotoCamera, AttachFile } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import Colecao from '@/logic/firebase/db/Colecao';
import ChamadoTI, { MensagemChamado } from './Item';
import { storage } from '@/logic/firebase/config/app';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const useStyles = makeStyles((theme) => ({
  chatContainer: {
    height: 'calc(100vh - 300px)',
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
  },
  myMessage: {
    textAlign: 'right',
    '& .MuiListItemText-root': {
      backgroundColor: '#e8f5e9',
      borderRadius: 8,
      padding: theme.spacing(1),
      display: 'inline-block',
      maxWidth: '70%',
    },
  },
  otherMessage: {
    '& .MuiListItemText-root': {
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: theme.spacing(1),
      display: 'inline-block',
      maxWidth: '70%',
    },
  },
  inputArea: {
    padding: theme.spacing(2),
    backgroundColor: '#fff',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    gap: theme.spacing(1),
  },
  messageImage: {
    maxWidth: 200,
    borderRadius: 8,
    marginTop: theme.spacing(1),
    cursor: 'pointer',
  },
}));

interface ChatChamadosProps {
  chamado: ChamadoTI;
  usuarioId: string;
  usuarioNome: string;
  onUpdate: () => void;
}

const ChatChamados: React.FC<ChatChamadosProps> = ({ chamado, usuarioId, usuarioNome, onUpdate }) => {
  const classes = useStyles();
  const [mensagem, setMensagem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mensagens, setMensagens] = useState<MensagemChamado[]>(chamado.mensagens || []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  useEffect(() => {
    setMensagens(chamado.mensagens || []);
  }, [chamado.mensagens]);

  const handleFileUpload = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const fileName = `chamados/${chamado.id}/${timestamp}-${file.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setIsLoading(true);

    try {
      const imageUrl = await handleFileUpload(file);
      await enviarMensagem('📎 Arquivo anexado', imageUrl);
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error);
      alert('Erro ao enviar arquivo');
    } finally {
      setIsLoading(false);
    }
  };

  const enviarMensagem = async (texto?: string, imagemUrl?: string) => {
    const textoMensagem = texto || mensagem.trim();
    if (!textoMensagem && !imagemUrl) return;

    setIsLoading(true);
    try {
      const novaMensagem: MensagemChamado = {
        id: Date.now().toString(),
        texto: textoMensagem,
        usuarioId,
        usuarioNome,
        timestamp: Timestamp.fromDate(new Date()),
        imagemUrl,
      };

      const mensagensAtualizadas = [...mensagens, novaMensagem];
      setMensagens(mensagensAtualizadas);

      const colecao = new Colecao();
      await colecao.salvar('chamadosTI', {
        ...chamado,
        mensagens: mensagensAtualizadas,
        dataAtualizacao: Timestamp.fromDate(new Date()),
      }, chamado.id);

      setMensagem('');
      onUpdate();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  return (
    <Paper className={classes.chatContainer}>
      <Box p={2} bgcolor="#2d5a3d" color="#fff">
        <Typography variant="h6">{chamado.assunto}</Typography>
        <Typography variant="caption">{chamado.descricao}</Typography>
      </Box>

      <div className={classes.messagesArea}>
        <List>
          {mensagens.map((msg, index) => (
            <ListItem
              key={msg.id}
              className={`${classes.messageItem} ${msg.usuarioId === usuarioId ? classes.myMessage : classes.otherMessage}`}
            >
              {msg.usuarioId !== usuarioId && (
                <ListItemAvatar>
                  <Avatar style={{ backgroundColor: '#2d5a3d' }}>
                    {msg.usuarioNome.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
              )}
              <ListItemText
                primary={
                  <>
                    <Typography variant="body2" style={{ fontWeight: 600 }}>
                      {msg.usuarioNome}
                    </Typography>
                    <Typography variant="body1">{msg.texto}</Typography>
                    {msg.imagemUrl && (
                      <img
                        src={msg.imagemUrl}
                        alt="Anexo"
                        className={classes.messageImage}
                        onClick={() => window.open(msg.imagemUrl, '_blank')}
                      />
                    )}
                  </>
                }
                secondary={format(msg.timestamp.toDate(), 'dd/MM/yyyy HH:mm')}
              />
            </ListItem>
          ))}
        </List>
        <div ref={messagesEndRef} />
      </div>

      <div className={classes.inputArea}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <IconButton
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          color="primary"
        >
          <AttachFile />
        </IconButton>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Digite sua mensagem..."
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <IconButton
          onClick={() => enviarMensagem()}
          disabled={isLoading || !mensagem.trim()}
          color="primary"
        >
          {isLoading ? <CircularProgress size={24} /> : <Send />}
        </IconButton>
      </div>
    </Paper>
  );
};

export default ChatChamados;
