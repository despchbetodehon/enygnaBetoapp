import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  IconButton,
  TextField,
  Avatar,
  Divider,
  Hidden,
  CircularProgress,
  useMediaQuery,
  Chip,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  Drawer,
} from '@material-ui/core';
import { makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import {
  Send as SendIcon,
  Android as BotIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
} from '@material-ui/icons';
import { Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
const REMARK_GFM_SAFE: any = remarkGfm as unknown as any;

/* =========================
 *  Estilos Atualizados
 * ========================= */
const useStyles = makeStyles((theme: Theme) => ({
  root: { 
    height: '96vh', 
    display: 'flex', 
    flexDirection: 'column', 
    background: '#f8f9fb',
    overflow: 'hidden',
  },
  appBar: { 
    background: 'linear-gradient(135deg, #ffffffff 0%, #2d6b55 100%)', 
    color: '#fff',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  contentWrap: { 
    flex: 1, 
    display: 'flex', 
    overflow: 'hidden',
    position: 'relative',
  },
  sidebar: {
    width: 360, 
    minWidth: 280, 
    borderRight: '1px solid rgba(199,174,129,0.15)',
    background: '#fff', 
    display: 'flex', 
    flexDirection: 'column',
    height: '100%',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      minWidth: '100%',
    },
  },
  sidebarHeader: { 
    padding: theme.spacing(2), 
    borderBottom: '1px solid #eee',
    background: 'rgba(26, 74, 58, 0.02)',
  },
  sidebarSearch: { 
    padding: theme.spacing(2),
    borderBottom: '1px solid rgba(0,0,0,0.05)',
  },
  sidebarScroll: { 
    flex: 1, 
    overflowY: 'auto', 
    padding: theme.spacing(0, 1, 2),
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(199,174,129,0.05)',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(199,174,129,0.2)',
      borderRadius: '3px',
    },
  },
  main: { 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    minWidth: 0, // Important for flexbox shrinking
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    backgroundColor: '#f8f9fb',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(199,174,129,0.1)',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(199,174,129,0.3)',
      borderRadius: '4px',
      '&:hover': {
        background: 'rgba(199,174,129,0.5)',
      },
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
      gap: theme.spacing(1.5),
    },
  },
  messageUser: {
    alignSelf: 'flex-end', 
    maxWidth: '85%',
    background: 'linear-gradient(135deg, #e4e4e4ff)',
    color: '#fff', 
    padding: theme.spacing(1.5, 2), 
    borderRadius: '18px 18px 4px 18px',
    boxShadow: '0 2px 8px rgba(26, 74, 58, 0.2)',
    [theme.breakpoints.down('sm')]: {
      maxWidth: '90%',
      padding: theme.spacing(1.2, 1.5),
    },
  },
  messageBot: {
    alignSelf: 'flex-start', 
    maxWidth: '85%', 
    background: '#fff', 
    color: '#000',
    padding: theme.spacing(1.5, 2), 
    borderRadius: '18px 18px 18px 4px',
    border: '1px solid rgba(199,174,129,0.2)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    [theme.breakpoints.down('sm')]: {
      maxWidth: '90%',
      padding: theme.spacing(1.2, 1.5),
    },
  },
  markdown: {
    '& h1, & h2, & h3': {
      fontFamily: '"Playfair Display", Georgia, serif', 
      color: '#1a4a3a', 
      margin: '12px 0 8px',
      fontSize: '1.1em',
      fontWeight: 600,
    },
    '& ul': { 
      paddingLeft: '20px', 
      margin: '8px 0' 
    },
    '& ol': { 
      paddingLeft: '20px', 
      margin: '8px 0' 
    },
    '& li': { 
      marginBottom: '6px',
      lineHeight: '1.5',
    },
    '& blockquote': {
      borderLeft: '4px solid #2d6b55',
      paddingLeft: theme.spacing(2),
      margin: '12px 0',
      color: '#555',
      fontStyle: 'italic',
      background: 'rgba(45, 107, 85, 0.03)',
      padding: theme.spacing(1, 2),
      borderRadius: '0 8px 8px 0',
    },
    '& p': { 
      margin: '8px 0', 
      lineHeight: '1.6' 
    },
    '& strong': { 
      color: '#1a4a3a',
      fontWeight: 600,
    },
    '& code': {
      background: 'rgba(199,174,129,0.1)',
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '0.9em',
    },
  },
  inputBar: {
    background: '#fff', 
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(199,174,129,0.15)',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1.5),
    },
  },
  inputContainer: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'flex-end',
    [theme.breakpoints.down('sm')]: {
      gap: theme.spacing(0.5),
    },
  },
  sendButton: {
    borderRadius: 24, 
    color: '#fff',
    background: 'linear-gradient(135deg, #1a4a3a 0%, #2d6b55 100%)',
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(0.5),
    '&:hover': {
      background: 'linear-gradient(135deg, #164031 0%, #265a46 100%)',
    },
    '&:disabled': {
      background: '#ccc',
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
      minWidth: 'auto',
    },
  },
  catHeader: {
    fontWeight: 700, 
    color: '#1a4a3a', 
    margin: theme.spacing(2, 0, 1),
    paddingLeft: theme.spacing(2),
    fontSize: '0.9rem',
  },
  chipRow: { 
    display: 'flex', 
    flexWrap: 'wrap', 
    gap: theme.spacing(1), 
    padding: theme.spacing(0, 2, 2) 
  },
  loadingMessage: {
    alignSelf: 'flex-start',
    background: '#fff',
    padding: theme.spacing(1.5, 2),
    borderRadius: '18px 18px 18px 4px',
    border: '1px solid rgba(199,174,129,0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  drawerPaper: {
    width: '100%',
    maxWidth: 400,
    [theme.breakpoints.up('sm')]: {
      width: 360,
    },
  },
}));

/* =========================
 *  Tipos (mantidos)
 * ========================= */
interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

type QuickItem = {
  label: string;
  prompt: string;
  hint?: string;
};

type QuickCategory = {
  title: string;
  items: QuickItem[];
};

/* =========================
 *  Quick Prompts (mantido igual)
 * ========================= */
const QUICK_PROMPT_CATEGORIES: QuickCategory[] = [
  {
    title: 'Transferências',
    items: [
      { label: 'Transferência (compra e venda)', prompt: 'Quais documentos para transferência de veículo (compra e venda)?' },
      { label: 'Transferência (herança/inventário)', prompt: 'Quais documentos para transferência de veículo por herança/inventário?' },
    ],
  },
  {
    title: 'Documentos e Placas',
    items: [
      { label: '2ª via do CRV', prompt: 'Como emitir 2ª via do CRV? Quais documentos?' },
      { label: 'Troca de placa Mercosul', prompt: 'Como trocar para placa Mercosul? Quais documentos?' },
      { label: 'Autorização de estampagem', prompt: 'Como pedir autorização de estampagem? Quais documentos?' },
      { label: 'Segunda via de etiqueta', prompt: 'Como emitir segunda via de etiqueta? Quais documentos?' },
    ],
  },
  {
    title: 'Gravame e Emplacamento',
    items: [
      { label: 'Inclusão de alienação', prompt: 'Como incluir alienação? Quais documentos?' },
      { label: 'Primeiro emplacamento', prompt: 'Como fazer primeiro emplacamento? Quais documentos?' },
      { label: 'Licenciamento anual', prompt: 'Como fazer licenciamento anual? Quais documentos?' },
    ],
  },
  {
    title: 'Baixas e Restrições',
    items: [
      { label: 'Baixa de sinistro', prompt: 'Como fazer baixa por sinistro/média monta? Quais documentos?' },
      { label: 'Baixa do Art. 270', prompt: 'Como pedir baixa do Art. 270? Quais documentos?' },
      { label: 'Baixa de veículo', prompt: 'Como dar baixa definitiva do veículo? Quais documentos?' },
    ],
  },
  {
    title: 'Alterações / Modificações',
    items: [
      { label: 'Remarcação de motor', prompt: 'Como fazer remarcação de motor? Quais documentos?' },
      { label: 'Inclusão de GNV', prompt: 'Como incluir GNV? Quais documentos e etapas?' },
      { label: 'Alteração de carroceria', prompt: 'Como alterar carroceria? Quais documentos?' },
      { label: 'Alteração de motor', prompt: 'Como alterar motor? Quais documentos? O que a nota deve constar?' },
      { label: 'Alongamento de chassi', prompt: 'Como fazer alongamento de chassi? Quais documentos e etapas?' },
      { label: 'Inclusão de 2º eixo direcional', prompt: 'Quais documentos necessários para inclusão de segundo eixo direcional?' },
    ],
  },
  {
    title: 'Hodômetro',
    items: [
      { label: 'Reinício de hodômetro', prompt: 'Como registrar reinício de hodômetro? Quais documentos?' },
      { label: 'Restauração de hodômetro', prompt: 'Como fazer restauração de hodômetro? Quais documentos e fluxo?' },
    ],
  },
  {
    title: 'Chassi e Etiquetas',
    items: [
      { label: 'Remarcação de chassi', prompt: 'Como fazer remarcação de chassi? Quais documentos e ordem das etapas?' },
    ],
  },
  {
    title: 'Multas / Condutores',
    items: [
      { label: 'Indicação de condutor', prompt: 'Como indicar condutor em multa? Quais documentos?' },
      { label: 'Como parcelar multa?', prompt: 'Como parcelar multas estaduais em SC? Quais requisitos?' },
    ],
  },
  {
    title: 'Escolares',
    items: [
      { label: 'Autorização de condutor escolar', prompt: 'Quais documentos para autorização de condutor do transporte escolar?' },
      { label: 'Transporte escolar (veículo)', prompt: 'Quais documentos para veículo se tornar transporte escolar?' },
    ],
  },
];

/* =========================
 *  Template universal (mantido)
 * ========================= */
function buildUniversalTemplate(question: string, raw: string): string {
  return [
    `Beto Despachante`,
    ``,
    `Consulta: ${question.trim()}`,
    ``,
    raw
  ].join('\n');
}

/* =========================
 *  Componente Atualizado
 * ========================= */
const ChatInterno: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => { 
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  };

  useEffect(() => { 
    scrollToBottom(); 
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        isUser: false,
        timestamp: new Date(),
        text: 'Para orientações, clique nas opções ao lado ou digite sua dúvida (ex.: "Quais documentos para transferência?", "Como parcelar multa?").\n\nAs respostas são baseadas exclusivamente no **Manual de Procedimentos do DETRAN/SC (2024)**.',
      }]);
    }
  }, [messages.length]);

  const sendToAPI = useCallback(async (question: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question }),
      });

      const data = await response.json();
      if (response.ok && data?.response) {
        const formatted = buildUniversalTemplate(question, data.response);
        const botMsg: Message = { text: formatted, isUser: false, timestamp: new Date() };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error('Erro API');
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          text: 'Ocorreu um problema técnico. Tente novamente em instantes ou fale no WhatsApp (48) 3255-0606.',
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setSidebarOpen(false); // Fecha sidebar no mobile após enviar
    }
  }, []);

  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { text, isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    await sendToAPI(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClickQuick = async (prompt: string) => {
    if (isLoading) return;
    const userMsg: Message = { text: prompt, isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setSidebarOpen(false); // Fecha sidebar no mobile
    await sendToAPI(prompt);
  };

  // Filtro de busca local nos itens das categorias
  const filteredCategories = QUICK_PROMPT_CATEGORIES.map(cat => ({
    ...cat,
    items: cat.items.filter(i =>
      (i.label + ' ' + i.prompt).toLowerCase().includes(filter.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0 || filter.trim() === '');

  const SidebarContent = () => (
    <Box className={classes.sidebar}>
      <Box className={classes.sidebarHeader}>
        <Typography variant="subtitle1" style={{ fontWeight: 700 }}>Perguntas rápidas</Typography>
        <Typography variant="caption" style={{ color: '#666' }}>
          Use os modelos prontos por tema.
        </Typography>
      </Box>

      <Box className={classes.sidebarSearch}>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Buscar por tema..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box className={classes.sidebarScroll}>
        {filteredCategories.map((cat, idx) => (
          <Accordion key={idx} defaultExpanded={idx < 2}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography style={{ fontWeight: 300, color: '#1a4a3a', fontSize: '0.9rem' }}>
                {cat.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails style={{ display: 'block', paddingTop: 0 }}>
              <List dense>
                {cat.items.map((item, j) => (
                  <ListItem
                    button
                    key={j}
                    onClick={() => handleClickQuick(item.prompt)}
                    style={{ borderRadius: 8, margin: '4px 0' }}
                  >
                    <ListItemText
                      primary={item.label}
                      secondary={item.hint || item.prompt}
                      primaryTypographyProps={{ style: { fontSize: '1.00rem', fontWeight: 500 } }}
                      secondaryTypographyProps={{ style: { fontSize: '0.85rem' } }}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}

        <Typography className={classes.catHeader}>Atalhos</Typography>
        <Box className={classes.chipRow}>
          <Chip 
            label="Como parcelar multa?" 
            onClick={() => handleClickQuick('Como parcelar multa?')} 
            clickable 
            size="small"
          />
          <Chip 
            label="Quanto tempo leva?" 
            onClick={() => handleClickQuick('Quanto tempo leva a transferência?')} 
            clickable 
            size="small"
          />
          <Chip 
            label="Quais taxas?" 
            onClick={() => handleClickQuick('Quais taxas adicionais existem?')} 
            clickable 
            size="small"
          />
        </Box>

        <Box paddingX={2} paddingTop={2}>
          <Typography variant="caption" style={{ color: '#666', lineHeight: 1.4 }}>
            Conteúdos estruturados a partir do acervo de documentos do escritório.
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box className={classes.root}>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Avatar style={{ marginRight: 12, background: 'linear-gradient(135deg,#c7ae81,#b8a070)', color: '#1a4a3a' }}>
            <BotIcon />
          </Avatar>
          <Typography variant="h6" style={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
            Atendimento Online — Despachante Beto Dehon
          </Typography>
        </Toolbar>
      </AppBar>

      <Box className={classes.contentWrap}>
        {/* Sidebar para desktop */}
        <Hidden smDown>
          <SidebarContent />
        </Hidden>

        {/* Drawer para mobile/tablet */}
        <Drawer
          variant="temporary"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          ModalProps={{ keepMounted: true }}
          classes={{ paper: classes.drawerPaper }}
        >
          <SidebarContent />
        </Drawer>

        {/* Janela principal */}
        <Box className={classes.main}>
          <div ref={messagesContainerRef} className={classes.messagesContainer}>
            {messages.map((m, i) => (
              <Paper key={i} className={m.isUser ? classes.messageUser : classes.messageBot}>
                {!m.isUser && (
                  <Typography variant="caption" style={{ color: '#666', marginBottom: 4, display: 'block' }}>
                    Lívia · Atendente
                  </Typography>
                )}
                {m.isUser ? (
                  <Typography variant="body2" style={{ color: '#fff', lineHeight: 1.5 }}>
                    {m.text}
                  </Typography>
                ) : (
                  <div className={classes.markdown}>
                    <ReactMarkdown remarkPlugins={[REMARK_GFM_SAFE]}>
                      {m.text}
                    </ReactMarkdown>
                  </div>
                )}
              </Paper>
            ))}
            {isLoading && (
              <Box className={classes.loadingMessage}>
                <CircularProgress size={20} style={{ color: '#2d6b55' }} />
                <Typography variant="body2" style={{ color: '#666' }}>
                  Processando sua consulta...
                </Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </div>

          <Box className={classes.inputBar}>
            <Box className={classes.inputContainer}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                variant="outlined"
                placeholder="Digite sua mensagem…"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                size="small"
              />
              <IconButton
                className={classes.sendButton}
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                aria-label="Enviar mensagem"
                size="medium"
              >
                <SendIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </Box>
            
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatInterno;


