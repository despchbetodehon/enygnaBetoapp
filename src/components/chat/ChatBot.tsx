import React, { useState, useRef, useEffect } from 'react';
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Avatar,
  CircularProgress,
  Fade,
  Zoom,
} from '@material-ui/core';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Android as BotIcon,
  WhatsApp as WhatsAppIcon,
  ExitToApp as ExitIcon,
} from '@material-ui/icons';
import { makeStyles, Theme } from '@material-ui/core/styles';

// Markdown sem remark-gfm (evita erro de tipos)
import ReactMarkdown from 'react-markdown';

const useStyles = makeStyles((theme: Theme) => ({
  chatContainer: {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    zIndex: 1000,
    [theme.breakpoints.down('sm')]: {
      bottom: '15px',
      left: '15px',
    },
  },
  chatButton: {
    background: 'linear-gradient(135deg, #1a4a3a 0%, #2d6b55 100%)',
    color: '#ffffff',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    boxShadow: '0 4px 20px rgba(26, 74, 58, 0.4)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: 'none',
    animation: '$pulse 2s infinite',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 'auto',
    position: 'relative',
    '&:hover': {
      background: 'linear-gradient(135deg, #2d6b55 0%, #1a4a3a 100%)',
      transform: 'scale(1.1)',
      boxShadow: '0 6px 25px rgba(26, 74, 58, 0.5)',
      animation: 'none',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-2px',
      left: '-2px',
      right: '-2px',
      bottom: '-2px',
      borderRadius: '50%',
      background: 'linear-gradient(45deg, #4a7c59, #2d6b55)',
      zIndex: -1,
      opacity: 0,
      transition: 'opacity 0.3s ease',
    },
    '&:hover::before': { opacity: 1 },
    [theme.breakpoints.down('sm')]: { width: '55px', height: '55px' },
  },
  chatBubble: {
    position: 'absolute',
    top: '-45px',
    right: 0,
    background: '#ffffff',
    color: '#1a4a3a',
    padding: '8px 12px',
    borderRadius: '16px 16px 4px 16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    fontSize: '14px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    opacity: 0,
    transform: 'translateY(10px) scale(0.9)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: 'none',
    fontFamily: '"Playfair Display","Georgia",serif',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '-6px',
      right: '15px',
      width: 0,
      height: 0,
      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent',
      borderTop: '6px solid #ffffff',
    },
    '$chatButton:hover &': {
      opacity: 1,
      transform: 'translateY(0) scale(1)',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '12px',
      padding: '6px 10px',
      top: '-40px',
    },
  },
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.05)' },
    '100%': { transform: 'scale(1)' },
  },
  dialog: {
    '& .MuiDialog-paper': {
      borderRadius: '20px',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      border: '1px solid rgba(199, 174, 129, 0.1)',
      boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
      maxWidth: '420px',
      width: '95vw',
      maxHeight: '80vh',
      overflow: 'hidden',
      position: 'fixed',
      [theme.breakpoints.down('sm')]: {
        bottom: '80px',
        right: '15px',
        top: 'auto',
        left: 'auto',
        width: 'calc(100vw - 30px)',
        height: '70vh',
        maxHeight: '70vh',
        maxWidth: 'calc(100vw - 30px)',
        margin: 0,
        borderRadius: '16px',
        transform: 'none !important',
      },
      [theme.breakpoints.up('sm')]: {
        bottom: '90px',
        right: '20px',
        top: 'auto',
        left: 'auto',
        transform: 'none !important',
        margin: 0,
      },
    },
  },
  dialogTitle: {
    background: 'linear-gradient(135deg, #1a4a3a 0%, #2d6b55 100%)',
    color: '#ffffff',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(199, 174, 129, 0.2)',
  },
  dialogContent: {
    padding: 0,
    height: '500px',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('sm')]: { height: 'calc(100vh - 120px)' },
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    '&::-webkit-scrollbar': { width: '6px' },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(199, 174, 129, 0.1)',
      borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(199, 174, 129, 0.3)',
      borderRadius: '3px',
      '&:hover': { background: 'rgba(199, 174, 129, 0.5)' },
    },
  },
  messageUser: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
    background: 'linear-gradient(135deg, #1a4a3a 0%, #2d6b55 100%)',
    color: '#ffffff',
    padding: '12px 16px',
    borderRadius: '16px 16px 4px 16px',
    boxShadow: '0 2px 8px rgba(26, 74, 58, 0.2)',
    wordWrap: 'break-word',
    whiteSpace: 'pre-line',
  },
  messageBot: {
    alignSelf: 'flex-start',
    maxWidth: '80%',
    background: '#ffffff',
    color: '#000000',
    padding: '12px 16px',
    borderRadius: '16px 16px 16px 4px',
    border: '1px solid rgba(199, 174, 129, 0.2)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    wordWrap: 'break-word',
  },
  markdown: {
    color: '#000000',
    whiteSpace: 'pre-wrap',
    '& h1, & h2, & h3': {
      fontFamily: '"Playfair Display","Georgia",serif',
      margin: '4px 0 8px',
      lineHeight: 1.25,
      color: '#1a4a3a',
    },
    '& h1': { fontSize: '1.1rem', fontWeight: 800 },
    '& h2': { fontSize: '1.0rem', fontWeight: 700 },
    '& h3': { fontSize: '0.95rem', fontWeight: 700 },
    '& p': { margin: '4px 0 8px' },
    '& ul, & ol': { paddingLeft: 20, margin: '4px 0 8px' },
    '& li': { marginBottom: 4 },
    '& strong': { fontWeight: 700 },
    '& a': { color: '#1a4a3a', textDecoration: 'underline' },
    '& hr': {
      border: 0,
      borderTop: '1px solid rgba(199,174,129,.3)',
      margin: '8px 0',
    },
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '12px',
  },
  actionButton: {
    background: 'linear-gradient(135deg, #1a4a3a 0%, #2d6b55 100%)',
    color: '#ffffff',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '0.9rem',
    textTransform: 'none',
    boxShadow: '0 2px 8px rgba(26, 74, 58, 0.2)',
    '&:hover': {
      background: 'linear-gradient(135deg, #2d6b55 0%, #1a4a3a 100%)',
      transform: 'translateY(-1px)',
    },
  },
  whatsappButton: {
    background: '#25D366',
    '&:hover': { background: '#128C7E' },
  },
  inputContainer: {
    padding: '16px',
    borderTop: '1px solid rgba(199, 174, 129, 0.1)',
    background: '#ffffff',
  },
  inputField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '24px',
      background: '#f8f9fa',
      '& fieldset': { borderColor: 'rgba(199, 174, 129, 0.3)' },
      '&:hover fieldset': { borderColor: 'rgba(199, 174, 129, 0.5)' },
      '&.Mui-focused fieldset': { borderColor: '#1a4a3a' },
    },
  },
  sendButton: {
    background: 'linear-gradient(135deg, #1a4a3a 0%, #2d6b55 100%)',
    color: '#ffffff',
    borderRadius: '50%',
    minWidth: 'auto',
    width: '48px',
    height: '48px',
    marginLeft: '8px',
    boxShadow: '0 4px 12px rgba(26, 74, 58, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, #2d6b55 0%, #1a4a3a 100%)',
      transform: 'scale(1.05)',
    },
    '&:disabled': {
      background: 'rgba(199, 174, 129, 0.3)',
      color: 'rgba(255,255,255,0.5)',
    },
  },
  avatarBot: {
    background: 'linear-gradient(135deg, #c7ae81 0%, #b8a070 100%)',
    color: '#1a4a3a',
    width: '32px',
    height: '32px',
    marginRight: '8px',
    fontFamily: '"Playfair Display","Georgia",serif',
    fontWeight: 600,
  },
  welcomeMessage: {
    textAlign: 'center',
    color: '#000000',
    fontStyle: 'italic',
    margin: '20px 0',
  },
}));

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  hasActions?: boolean;
  actionType?: 'multa' | 'transferencia' | 'ipva' | 'geral';
  pricing?: { service: string; price: string; installments?: string }[];
  suggestedServices?: string[];
}

const ChatBot: React.FC = () => {
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        text:
          "🌟 **Bem-vindo!** Eu sou a **Lívia**, sua atendente do Beto Despachante. 🚗✨\n\n" +
          "Posso te ajudar com:\n" +
          "• Transferência de veículos (ATPV-e)\n" +
          "• Multas e infrações\n" +
          "• IPVA, licenciamento e CRLV-e\n" +
          "• ANTT e serviços de transporte\n\n" +
          "Escreva sua dúvida ou peça um orçamento. 😉",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const handleWhatsAppContact = (service: string) => {
    const phoneNumber = '554836327624';
    let message = 'Olá! Vim do chat da Lívia e preciso de atendimento especializado.';

    if (service === 'multa')
      message =
        'Olá! Vim do chat da Lívia e preciso de ajuda para pagar/regularizar uma multa.';
    else if (service === 'transferencia')
      message =
        'Olá! Vim do chat da Lívia e preciso de ajuda com **transferência de veículo (ATPV-e)**.';
    else if (service === 'ipva')
      message =
        'Olá! Vim do chat da Lívia e preciso de ajuda com **IPVA/Licenciamento**.';

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const handleFinishChat = () => {
    setMessages([]);
    setIsOpen(false);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          context: 'chatbot',
          // ✅ Corrigido: envia histórico no formato que a /api/ia espera
          previousMessages: messages.slice(-5).map((m) => ({
            sender: m.isUser ? 'user' : 'ai',
            text: m.text,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok && data.response) {
        const botMessage: Message = {
          text: data.response, // já vem em Markdown simples
          isUser: false,
          timestamp: new Date(),
          hasActions: true,
          actionType:
            data.nextAction === 'whatsapp_contact'
              ? 'geral'
              : (data.suggestedServices?.[0] as
                    | 'multa'
                    | 'transferencia'
                    | 'ipva'
                    | 'geral') || 'geral',
          pricing: data.pricing,
          suggestedServices: data.suggestedServices,
        };

        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error('Erro na resposta da API');
      }
    } catch (error) {
      console.error('Erro ao chamar API:', error);

      const fallbackMessage: Message = {
        text:
          '## Ops! Tive um probleminha técnico\n\n' +
          'Tenta de novo em instantes. Se preferir, me chama direto no **WhatsApp (48) 3255-0606**. 😊',
        isUser: false,
        timestamp: new Date(),
        hasActions: true,
        actionType: 'geral',
      };

      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const renderActionButtons = (
    actionType: 'multa' | 'transferencia' | 'ipva' | 'geral'
  ) => (
    <Box className={classes.actionButtons}>
      <Button
        className={`${classes.actionButton} ${classes.whatsappButton}`}
        startIcon={<WhatsAppIcon />}
        onClick={() => handleWhatsAppContact(actionType)}
        fullWidth
      >
        Falar com um atendente no WhatsApp
      </Button>
      <Button
        className={classes.actionButton}
        startIcon={<ExitIcon />}
        onClick={handleFinishChat}
        fullWidth
      >
        Finalizar Chat
      </Button>
    </Box>
  );

  return (
    <>
      <Box className={classes.chatContainer}>
        <Zoom in timeout={1000}>
          <Box position="relative">
            <Box className={classes.chatBubble}>Olá! Precisa de ajuda?</Box>
            <Button
              className={classes.chatButton}
              onClick={() => setIsOpen(true)}
              variant="contained"
              aria-label="Abrir chat"
            >
              <ChatIcon style={{ fontSize: 28 }} />
            </Button>
          </Box>
        </Zoom>
      </Box>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className={classes.dialog}
        TransitionComponent={Fade}
        transitionDuration={300}
        aria-labelledby="chatbot-title"
      >
        <DialogTitle className={classes.dialogTitle} id="chatbot-title">
          <Box display="flex" alignItems="center">
            <Avatar className={classes.avatarBot}>
              <BotIcon />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                component="div"
                style={{
                  fontWeight: 700,
                  fontFamily: '"Playfair Display","Georgia",serif',
                  letterSpacing: 0.5,
                }}
              >
                Lívia - Atendente
              </Typography>
              <Typography
                variant="caption"
                style={{
                  opacity: 0.9,
                  fontFamily: '"Playfair Display","Georgia",serif',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                }}
              >
                Despachante Beto Dehon
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setIsOpen(false)} style={{ color: '#ffffff' }} size="small" aria-label="Fechar chat">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent className={classes.dialogContent}>
          <Box className={classes.messagesContainer}>
            {messages.length === 1 && (
              <Typography className={classes.welcomeMessage} variant="caption">
                Chat seguro e confidencial
              </Typography>
            )}

            {messages.map((message, index) => (
              <Paper
                key={index}
                className={message.isUser ? classes.messageUser : classes.messageBot}
                elevation={0}
              >
                {!message.isUser && (
                  <Box display="flex" alignItems="flex-start" marginBottom={1}>
                    <Avatar className={classes.avatarBot} style={{ width: 24, height: 24, marginRight: 8 }}>
                      <BotIcon style={{ fontSize: 16 }} />
                    </Avatar>
                    <Typography variant="caption" style={{ color: '#000000' }}>
                      Lívia
                    </Typography>
                  </Box>
                )}

                {message.isUser ? (
                  <Typography variant="body2" style={{ lineHeight: 1.5, color: '#000000', whiteSpace: 'pre-line' }}>
                    {message.text}
                  </Typography>
                ) : (
                  <div className={classes.markdown}>
                    <ReactMarkdown
                      components={{
                        a: ({ node, ...props }) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" />
                        ),
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
                )}

                {message.pricing && message.pricing.length > 0 && (
                  <Box style={{ marginTop: 12, padding: 8, background: '#f8f9fa', borderRadius: 8 }}>
                    <Typography variant="caption" style={{ fontWeight: 'bold', color: '#1a4a3a' }}>
                      💰 Preços dos Serviços:
                    </Typography>
                    {message.pricing.map((price, i) => (
                      <Typography key={i} variant="body2" style={{ color: '#000000', margin: '4px 0' }}>
                        • {price.service}: {price.price}
                        {price.installments && (
                          <span style={{ color: '#666', fontSize: '0.9em' }}> ({price.installments})</span>
                        )}
                      </Typography>
                    ))}
                  </Box>
                )}

                {message.hasActions && message.actionType && renderActionButtons(message.actionType)}
              </Paper>
            ))}

            {isLoading && (
              <Paper className={classes.messageBot} elevation={0}>
                <Box display="flex" alignItems="center">
                  <CircularProgress size={16} style={{ color: '#000000' }} />
                  <Typography variant="body2" style={{ color: '#000000', marginLeft: 8 }}>
                    Lívia está digitando...
                  </Typography>
                </Box>
              </Paper>
            )}

            <div ref={messagesEndRef} />
          </Box>

          <Box className={classes.inputContainer}>
            <Box display="flex" alignItems="flex-end">
              <TextField
                fullWidth
                multiline
                maxRows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                variant="outlined"
                className={classes.inputField}
                disabled={isLoading}
                size="small"
              />
              <IconButton
                className={classes.sendButton}
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                aria-label="Enviar mensagem"
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatBot;
