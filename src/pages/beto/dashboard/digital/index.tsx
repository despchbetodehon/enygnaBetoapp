
import React, { useState, useEffect, useRef, useCallback } from 'react';
import debounce from 'lodash/debounce';
import {
  Typography, Paper, Card, TextField, Button, CircularProgress, IconButton,
  List, ListItem, ListItemText, Divider, Grid, Avatar, Snackbar, Box, Container,
  Chip, Collapse, CardContent, CardActions, Select, MenuItem, FormControl, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@material-ui/core';
import { makeStyles, createTheme, ThemeProvider } from '@material-ui/core/styles';
import { collection, getFirestore, getDocs, updateDoc, doc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { app } from '@/logic/firebase/config/app';
import {
  Refresh, ExpandMore, ExpandLess, Assignment, CheckCircle, 
  DateRange, Business, Search, Schedule, Warning, PictureAsPdf,
  Phone, Email, Person, DirectionsCar, Delete
} from '@material-ui/icons';
import { Timestamp } from 'firebase/firestore';

import {Thumbnails} from '@/components/enterprises/betodespa/transferencia/thumbnails';

import Forcaautenticacao from '@/components/autenticacao/ForcarAutenticacao';
const db = getFirestore(app);

interface Stats {
  total: number;
  pendentes: number;
  analisando: number;
  faltandoDoc: number;
  aguardandoDetran: number;
  prontos: number;
  concluidos: number;
  valorTotal: number;
}

interface Item {
  docUuid?: string;
  id: string;
  cliente: string;
  status: string;
  quantidade: number;
  imagemUrls: string[];
  concluido: boolean;
  placa: string;
  renavam: string;
  crv: string;
  valordevenda: string;
  nomevendedor: string;
  cpfvendedor: string;
  enderecovendedor: string;
  complementovendedor: string;
  municipiovendedor: string;
  emailvendedor: string;
  nomecomprador: string;
  cpfcomprador: string;
  enderecocomprador: string;
  complementocomprador: string;
  municipiocomprador: string;
  bairrocomprador: string;
  emailcomprador: string;
  celtelcomprador: string;
  celtelvendedor: string;
  cepvendedor: string;
  cepcomprador: string;
  tipo: string;
  cnpjempresa: string;
  nomeempresa: string;
  dataCriacao: string | Timestamp;
  signature?: string;
  produtosSelecionados?: string[];
}

const theme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#1a4d3a',
    },
    secondary: {
      main: '#2d5a3d',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(120deg, #f4f6f9 60%, #e9ecef 100%)',
    padding: theme.spacing(1),
    fontFamily: 'Montserrat, Poppins, sans-serif',
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(2),
    },
    '@media print': {
      background: 'white !important',
      padding: '0 !important',
      margin: '0 !important',
      '& > *': {
        display: 'none !important',
      },
      '& .printContent': {
        display: 'block !important',
        position: 'relative !important',
        top: '0 !important',
        left: '0 !important',
        width: '100% !important',
        height: 'auto !important',
        margin: '0 !important',
        padding: '20px !important',
        backgroundColor: 'white !important',
        boxShadow: 'none !important',
        borderRadius: '0 !important',
        border: 'none !important',
      },
    },
  },
  dashboardHeader: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #1a4d3a 0%, #2d5a3d 100%)',
    boxShadow: '0 8px 32px rgba(26,77,58,0.3)',
    color: '#fff',
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  },
  headerTitle: {
    fontFamily: 'Montserrat, Poppins, sans-serif',
    fontWeight: 900,
    fontSize: '1.5rem',
    color: '#fff',
    textAlign: 'center',
    marginBottom: theme.spacing(1),
    textShadow: '0 2px 12px rgba(0,0,0,0.4)',
    [theme.breakpoints.up('md')]: {
      fontSize: '1.5rem',
    },
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
    [theme.breakpoints.up('md')]: {
      gap: theme.spacing(1),
    },
  },
  statCard: {
    padding: theme.spacing(0.5),
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '12px',
    transition: 'transform 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-4px)',
    },
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(0.1),
    },
  },
  title: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statIcon: {
    fontSize: '0.5rem',
    marginBottom: theme.spacing(0.2),
    [theme.breakpoints.up('md')]: {
      fontSize: '1.0rem',
      marginBottom: theme.spacing(1),
    },
  },
  statNumber: {
    fontSize: '0.04rem',
    fontWeight: 'bold',
    color: '#1a4d3a',
    [theme.breakpoints.up('md')]: {
      fontSize: '2.2rem',
    },
  },
  statLabel: {
    fontSize: '0.7rem',
    color: '#666',
    fontWeight: 600,
    textTransform: 'uppercase',
    [theme.breakpoints.up('md')]: {
      fontSize: '0.65rem',
    },
  },
  filterContainer: {
    padding: theme.spacing(2),
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    marginBottom: theme.spacing(2),
  },
  searchField: {
    width: '100%',
    marginBottom: theme.spacing(1),
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
    },
    [theme.breakpoints.up('md')]: {
      marginBottom: 0,
    },
  },
  documentCard: {
    marginBottom: theme.spacing(2),
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      transform: 'translateY(-2px)',
    },
  },
  documentHeader: {
    padding: theme.spacing(2),
    borderBottom: '1px solid #f0f0f0',
  },
  documentTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#1a4d3a',
    marginBottom: theme.spacing(0.5),
  },
  documentSubtitle: {
    fontSize: '0.9rem',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    flexWrap: 'wrap',
  },
  statusChip: {
    fontWeight: 'bold',
    fontSize: '0.75rem',
  },
  expandButton: {
    padding: theme.spacing(1),
    borderRadius: '8px',
    transition: 'all 0.3s ease',
  },
  statusSelect: {
    minWidth: 120,
    '& .MuiSelect-select': {
      padding: '8px 12px',
      fontSize: '0.85rem',
    },
  },
  expandedContent: {
    padding: theme.spacing(2),
    backgroundColor: '#fafafa',
  },
  paper: {
    padding: theme.spacing(4),
    margin: 'auto',
    maxWidth: '1077px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #ccc',
    fontFamily: 'Arial, sans-serif',
    lineHeight: 1.6,
    '@media print': {
      boxShadow: 'none !important',
      margin: '0 !important',
      padding: '20px !important',
      width: '100% !important',
      maxWidth: 'none !important',
      fontSize: '12pt !important',
      fontFamily: 'Arial, sans-serif !important',
      lineHeight: '1.4 !important',
      backgroundColor: 'white !important',
      color: 'black !important',
      border: 'none !important',
      borderRadius: '0 !important',
      pageBreakBefore: 'auto',
      pageBreakAfter: 'auto',
      pageBreakInside: 'avoid',
    },
  },
  printContent: {
    '@media print': {
      display: 'block !important',
      visibility: 'visible !important',
      position: 'static !important',
      width: '100% !important',
      height: 'auto !important',
      margin: '0 !important',
      padding: '0 !important',
      backgroundColor: 'white !important',
      color: 'black !important',
      boxShadow: 'none !important',
      borderRadius: '0 !important',
      border: 'none !important',
      '& *': {
        visibility: 'visible !important',
        backgroundColor: 'transparent !important',
        color: 'black !important',
        boxShadow: 'none !important',
      },
    },
  },
  documentPreview: {
    background: '#fff',
    borderRadius: '8px',
    padding: theme.spacing(2),
    border: '2px solid #1a4d3a',
    margin: theme.spacing(1, 0),
  },
  documentOfficialHeader: {
    textAlign: 'center',
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    background: 'linear-gradient(135deg, #1a4d3a 0%, #2d5a3d 100%)',
    color: '#fff',
    borderRadius: '8px',
  },
  header2: {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
    fontSize: '1.0rem',
    fontWeight: 'bold',
  },
  title1: {
    fontSize: '1.9rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  title2: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: '0.8rem',
    marginTop: theme.spacing(1),
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#1a4d3a',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    borderBottom: '2px solid #1a4d3a',
    paddingBottom: theme.spacing(0.5),
  },
  sectionTitle2: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    background: 'rgba(124, 124, 124, 0.58)',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    textAlign: 'center',
  },
  fieldRow: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    },
  },
  field: {
    fontSize: '0.9rem',
    padding: theme.spacing(0.5),
    background: 'rgba(26, 77, 58, 0.05)',
    borderRadius: '4px',
    border: '1px solid rgba(26, 77, 58, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    '&:hover': {
      background: 'rgba(26, 77, 58, 0.15)',
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },
  copiedIndicator: {
    position: 'absolute',
    top: '-24px',
    right: '0',
    background: '#4CAF50',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    animation: 'fadeIn 0.3s ease',
    zIndex: 1000,
  },
  field3: {
    fontSize: '0.7rem',
    marginBottom: theme.spacing(1),
  },
  field2: {
    fontSize: '1.3rem',
    marginBottom: theme.spacing(1),
  },
  sectionTitle3: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginTop: theme.spacing(0),
    marginBottom: theme.spacing(2),
    borderBottom: '1px solid #ccc',
    paddingBottom: theme.spacing(0),
  },
  sectionTitle4: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(2),
    borderBottom: '1px solid #ccc',
    paddingBottom: theme.spacing(0),
  },
  signatureSection: {
    marginTop: theme.spacing(20),
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%',
  },
  signatureBlock: {
    textAlign: 'center',
    width: 'auto',
    borderTop: '2px solid #000',
    paddingTop: theme.spacing(1),
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
    fontSize: '1.0rem',
    fontWeight: 'bold',
  },
  noPrint: {
    '@media print': {
      display: 'none !important',
    },
  },
  downloadButton: {
    marginTop: theme.spacing(1),
    backgroundColor: '#4CAF50',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#45a049',
    },
  },
  printButton: {
    marginTop: theme.spacing(2),
    borderRadius: '8px',
    background: 'linear-gradient(45deg, #1a4d3a 30%, #2d5a3d 90%)',
    color: '#fff',
    '&:hover': {
      background: 'linear-gradient(45deg, #2d5a3d 30%, #4a7c59 90%)',
    },
  },
pdfDialogPaper: { width: '95vw', height: '95vh', maxWidth: 'none' },
pdfContent: { padding: 0, height: '100%' },
pdfEmbed: { display: 'block', width: '100%', height: '100%', border: 0 },
}));

const formatDate = (date: string | Timestamp): string => {
  let dateObj: Date;
  if (date instanceof Timestamp) {
    dateObj = date.toDate();
  } else {
    dateObj = new Date(date);
  }
  return dateObj.toLocaleDateString('pt-BR') + ' | ' + dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const convertStringToNumber = (value: string): number => {
  if (!value || typeof value !== 'string') return 0;
  const cleanedValue = value.replace(/\./g, '').replace(',', '.');
  const numberValue = parseFloat(cleanedValue);
  return isNaN(numberValue) ? 0 : numberValue;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pendente': return { background: '#FFE082', color: '#E65100' };
    case 'Faltando Comunica': return { background: '#81C784', color: '#2E7D32' };
    case 'Faltando Documentação': return { background: '#FFAB91', color: '#D84315' };
    case 'Aguardando Assinar': return { background: '#90CAF9', color: '#1565C0' };
    case 'Pronto': return { background: '#A5D6A7', color: '#388E3C' };
    case 'Concluído': return { background: '#C8E6C9', color: '#4CAF50' };
    default: return { background: '#E0E0E0', color: '#666' };
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Pendente': return <Schedule />;
    case 'Faltando Comunica': return <Search />;
    case 'Faltando Documentação': return <Warning />;
    case 'Aguardando Assinar': return <Schedule />;
    case 'Pronto': return <CheckCircle />;
    case 'Concluído': return <CheckCircle />;
    default: return <Assignment />;
  }
};

const DashboardHeader: React.FC<{ stats: Stats; onFilterChange: (filter: string) => void; activeFilter: string }> = ({ stats, onFilterChange, activeFilter }) => {
  const classes = useStyles();

  const statusCards = [
    {
      key: 'todos',
      icon: Assignment,
      color: '#1a4d3a',
      value: stats.total,
      label: 'Total',
    },
    {
      key: 'Pendente',
      icon: Schedule,
      color: '#E65100',
      value: stats.pendentes,
      label: 'Pendentes',
    },
    {
      key: 'Faltando Comunica',
      icon: Search,
      color: '#2E7D32',
      value: stats.analisando,
      label: 'Faltando Comunicar',
    },
    {
      key: 'Faltando Documentação',
      icon: Warning,
      color: '#D84315',
      value: stats.faltandoDoc,
      label: 'Faltando Doc',
    },
    {
      key: 'Aguardando Assinar',
      icon: DirectionsCar,
      color: '#1565C0',
      value: stats.aguardandoDetran,
      label: 'Aguardando Assinar',
    },

    {
      key: 'Concluído',
      icon: CheckCircle,
      color: '#4CAF50',
      value: stats.concluidos,
      label: 'Concluídos',
    },

  ];

  return (
    <Paper className={classes.dashboardHeader}>


      <div className={classes.statsContainer}>
        {statusCards.map((card) => {
          const IconComponent = card.icon;
          const isActive = activeFilter === card.key;

          return (
            <Card 
              key={card.key} 
              className={classes.statCard}
              onClick={() => card.key !== 'valor' && onFilterChange(card.key)}
              style={{
                cursor: card.key !== 'valor' ? 'pointer' : 'default',
                transform: isActive ? 'translateY(-4px)' : 'none',
                boxShadow: isActive 
                  ? '0 8px 24px rgba(26, 77, 58, 0.3)' 
                  : '0 4px 16px rgba(0,0,0,0.1)',
                border: isActive ? `2px solid ${card.color}` : '1px solid #e0e0e0',
              }}
            >
              <IconComponent className={classes.statIcon} style={{ color: card.color }} />
              <Typography className={classes.statNumber}>{card.value}</Typography>
              <Typography className={classes.statLabel}>{card.label}</Typography>
            </Card>
          );
        })}
      </div>
    </Paper>
  );
};

const DocumentPreview: React.FC<{ doc: Item }> = ({ doc }) => {
  const classes = useStyles();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopyField = (value: string, fieldName: string) => {
    if (!value) return;

    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }).catch(err => {
      console.error('Erro ao copiar:', err);
    });
  };

  const handlePrintDocument = () => {
    const printContent = document.getElementById("printable-content");
    if (!printContent) {
      console.error("Elemento printable-content não encontrado!");
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error("Não foi possível abrir janela de impressão!");
      return;
    }

    const currentStyles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          return '';
        }
      })
      .join('\n');

    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Impressão do Documento</title>
        <style>
          ${currentStyles}

          html, body {
            margin: 0;
            padding: 0;
            font-size: 9pt;
            line-height: 1.05;
            height: auto !important;
            overflow: visible !important;
          }

          @page {
            size: A4 portrait;
            margin: 5mm 5mm;
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              background: white !important;
            }

            .print-container {
              display: block !important;
              visibility: visible !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              page-break-inside: avoid !important;
            }

            .noPrint {
              display: none !important;
            }

            .print-container * {
              margin-top: 2px !important;
              margin-bottom: 2px !important;
            }
          }

          .print-container {
            font-family: Arial, sans-serif;
            font-size: 9pt;
            line-height: 1.05;
            color: #000;
            background: white;
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${printContent.innerHTML}
        </div>
        <script>
          window.onload = function () {
            setTimeout(() => {
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
  };

  return (
    <Card className={`${classes.paper} printContent`} id="printable-content">
      <div className={classes.header}>
        <Typography className={classes.title2}>Estado de Santa Catarina</Typography>
        <Typography className={classes.subtitle}>Secretaria de Estado de Segurança Pública</Typography>
        <Typography className={classes.subtitle}>Departamento Estadual de Trânsito</Typography>
        <Typography className={classes.subtitle}>Diretoria de Veículo</Typography>
      </div>

      <Typography className={classes.title} style={{ textAlign: 'center' }}>
        Requerimento de Intenção de Venda
      </Typography>

      <div key={doc.id}>
        <Typography className={classes.sectionTitle}>Identificação do Veículo</Typography>
        <Box position="relative">
          <Typography 
            className={classes.field} 
            onClick={() => handleCopyField(doc.id, 'placa')}
            title="Clique para copiar"
          >
            <strong>Placa:</strong> {doc.id}
          </Typography>
          {copiedField === 'placa' && (
            <Box className={classes.copiedIndicator}>✓ Copiado!</Box>
          )}
        </Box>
        <Box position="relative">
          <Typography 
            className={classes.field} 
            onClick={() => handleCopyField(doc.renavam, 'renavam')}
            title="Clique para copiar"
          >
            <strong>Renavam:</strong> {doc.renavam}
          </Typography>
          {copiedField === 'renavam' && (
            <Box className={classes.copiedIndicator}>✓ Copiado!</Box>
          )}
        </Box>
        <Box position="relative">
          <Typography 
            className={classes.field} 
            onClick={() => handleCopyField(doc.crv, 'crv')}
            title="Clique para copiar"
          >
            <strong>CRV:</strong> {doc.crv}
          </Typography>
          {copiedField === 'crv' && (
            <Box className={classes.copiedIndicator}>✓ Copiado!</Box>
          )}
        </Box>
        <Box position="relative">
          <Typography 
            className={classes.field} 
            onClick={() => handleCopyField(doc.valordevenda, 'valordevenda')}
            title="Clique para copiar"
          >
            <strong>Valor de Venda:</strong> R$ {doc.valordevenda}
          </Typography>
          {copiedField === 'valordevenda' && (
            <Box className={classes.copiedIndicator}>✓ Copiado!</Box>
          )}
        </Box>

        <Typography className={classes.sectionTitle}>Identificação do Vendedor</Typography>
        <Box position="relative">
          <Typography 
            className={classes.field} 
            onClick={() => handleCopyField(doc.nomevendedor, 'nomevendedor')}
            title="Clique para copiar"
          >
            <strong>Nome:</strong> {doc.nomevendedor}
          </Typography>
          {copiedField === 'nomevendedor' && (
            <Box className={classes.copiedIndicator}>✓ Copiado!</Box>
          )}
        </Box>
        <Box position="relative">
          <Typography 
            className={classes.field} 
            onClick={() => handleCopyField(doc.cpfvendedor, 'cpfvendedor')}
            title="Clique para copiar"
          >
            <strong>CPF/CNPJ:</strong> {doc.cpfvendedor}
          </Typography>
          {copiedField === 'cpfvendedor' && (
            <Box className={classes.copiedIndicator}>✓ Copiado!</Box>
          )}
        </Box>
        <Box position="relative">
          <Typography 
            className={classes.field} 
            onClick={() => handleCopyField(doc.emailvendedor, 'emailvendedor')}
            title="Clique para copiar"
          >
            <strong>E-mail:</strong> {doc.emailvendedor}
          </Typography>
          {copiedField === 'emailvendedor' && (
            <Box className={classes.copiedIndicator}>✓ Copiado!</Box>
          )}
        </Box>
        <Box position="relative">
          <Typography 
            className={classes.field} 
            onClick={() => handleCopyField(doc.enderecovendedor, 'enderecovendedor')}
            title="Clique para copiar"
          >
            <strong>Endereço:</strong> {doc.enderecovendedor}
          </Typography>
          {copiedField === 'enderecovendedor' && (
            <Box className={classes.copiedIndicator}>✓ Copiado!</Box>
          )}
        </Box>
        <Box position="relative">
          <Typography 
            className={classes.field} 
            onClick={() => handleCopyField(doc.municipiovendedor, 'municipiovendedor')}
            title="Clique para copiar"
          >
            <strong>Município:</strong> {doc.municipiovendedor}
          </Typography>
          {copiedField === 'municipiovendedor' && (
            <Box className={classes.copiedIndicator}>✓ Copiado!</Box>
          )}
        </Box>
        <Box position="relative">
          <Typography 
            className={classes.field} 
            onClick={() => handleCopyField(doc.cepvendedor, 'cepvendedor')}
            title="Clique para copiar"
          >
            <strong>CEP:</strong> {doc.cepvendedor}
          </Typography>
          {copiedField === 'cepvendedor' && (
            <Box className={classes.copiedIndicator}>✓ Copiado!</Box>
          )}
        </Box>
        <Box position="relative">
          <Typography 
            className={classes.field} 
            onClick={() => handleCopyField(doc.celtelvendedor, 'celtelvendedor')}
            title="Clique para copiar"
          >
            <strong>CEL/TEL:</strong> {doc.celtelvendedor}
          </Typography>
          {copiedField === 'celtelvendedor' && (
            <Box className={classes.copiedIndicator}>✓ Copiado!</Box>
          )}
        </Box>

        <Typography className={classes.sectionTitle}>Identificação do Comprador</Typography>
        <Box position="relative">
          <Typography 
            className={classes.field} 
            onClick={() => handleCopyField(doc.nomecomprador, 'nomecomprador')}
            title="Clique para copiar"
          >
            <strong>Nome:</strong> {doc.nomecomprador}
          </Typography>
          {copiedField === 'nomecomprador' && (
            <Box className={classes.copiedIndicator}>✓ Copiado!</Box>
          )}
        </Box>
        <Box position="relative">
          <Typography 
            className={classes.field} 
            onClick={() => handleCopyField(doc.cpfcomprador, 'cpfcomprador')}
            title="Clique para copiar"
          >
            <strong>CPF/CNPJ:</strong> {doc.cpfcomprador}
          </Typography>
          {copiedField === 'cpfcomprador' && (
            <Box className={classes.copiedIndicator}>✓ Copiado!</Box>
          )}
        </Box>
        <Box position="relative">
          <Typography 
            className={classes.field} 
            onClick={() => handleCopyField(doc.cepcomprador, 'cepcomprador')}
            title="Clique para copiar"
          >
            <strong>CEP:</strong> {doc.cepcomprador}
          </Typography>
          {copiedField === 'cepcomprador' && (
            <Box className={classes.copiedIndicator}>✓ Copiado!</Box>
          )}
        </Box>
        <Box position="relative">
          <Typography 
            className={classes.field} 
            onClick={() => handleCopyField(doc.enderecocomprador, 'enderecocomprador')}
            title="Clique para copiar"
          >
            <strong>Endereço:</strong> {doc.enderecocomprador}
          </Typography>
          {copiedField === 'enderecocomprador' && (
            <Box className={classes.copiedIndicator}>✓ Copiado!</Box>
          )}
        </Box>
        <Box position="relative">
          <Typography 
            className={classes.field} 
            onClick={() => handleCopyField(doc.bairrocomprador, 'bairrocomprador')}
            title="Clique para copiar"
          >
            <strong>Bairro:</strong> {doc.bairrocomprador}
          </Typography>
          {copiedField === 'bairrocomprador' && (
            <Box className={classes.copiedIndicator}>✓ Copiado!</Box>
          )}
        </Box>
        <Box position="relative">
          <Typography 
            className={classes.field} 
            onClick={() => handleCopyField(doc.municipiocomprador, 'municipiocomprador')}
            title="Clique para copiar"
          >
            <strong>Município:</strong> {doc.municipiocomprador}
          </Typography>
          {copiedField === 'municipiocomprador' && (
            <Box className={classes.copiedIndicator}>✓ Copiado!</Box>
          )}
        </Box>
        <Box position="relative">
          <Typography 
            className={classes.field} 
            onClick={() => handleCopyField(doc.complementocomprador, 'estado')}
            title="Clique para copiar"
          >
            <strong>Estado:</strong> {doc.complementocomprador}
          </Typography>
          {copiedField === 'estado' && (
            <Box className={classes.copiedIndicator}>✓ Copiado!</Box>
          )}
        </Box>
        <Box position="relative">
          <Typography 
            className={classes.field} 
            onClick={() => handleCopyField(doc.emailcomprador, 'emailcomprador')}
            title="Clique para copiar"
          >
            <strong>E-mail:</strong> {doc.emailcomprador}
          </Typography>
          {copiedField === 'emailcomprador' && (
            <Box className={classes.copiedIndicator}>✓ Copiado!</Box>
          )}
        </Box>
        <Box position="relative">
          <Typography 
            className={classes.field} 
            onClick={() => handleCopyField(doc.celtelcomprador, 'celtelcomprador')}
            title="Clique para copiar"
          >
            <strong>CEL/TEL:</strong> {doc.celtelcomprador}
          </Typography>
          {copiedField === 'celtelcomprador' && (
            <Box className={classes.copiedIndicator}>✓ Copiado!</Box>
          )}
        </Box>

        <Typography className={classes.sectionTitle}></Typography>
        <Typography className={classes.field2} style={{ marginTop: '20px' }}>
          Eu <strong>VENDEDOR</strong>, com base na Resolução do CONTRAN nº 809, de 15 de dezembro 2020,
          informo ao Departamento Estadual de Trânsito de Santa Catarina (DETRAN-SC) a,
          <strong>INTENÇÃO DE VENDA</strong> em {formatDate(doc.dataCriacao)}, para o <strong>COMPRADOR</strong> conforme indicado acima.
        </Typography>
        {doc.signature && (
          <div className={classes.signatureSection}>
            <img src={doc.signature} alt="Assinatura do Cliente" style={{ maxWidth: '100%' }} />
          </div>
        )}

        <div className={classes.signatureSection}>
          <div className={classes.signatureBlock}>
            Assinatura do Vendedor ou Responsável
          </div>
        </div>

        <Typography className={classes.sectionTitle4}>b3certificacao@gmail.com</Typography>
        <Typography className={classes.sectionTitle3}>Documentação Básica</Typography>
        <Typography className={classes.field3}>Pessoa Física: Cópia da CNH ou RG/CPF</Typography>
        <Typography className={classes.field3}>Pessoa Jurídica: Cópia do ato constitutivo e Cartão CNPJ</Typography>
        <Typography className={classes.field3}>Obs: Cópia autenticada de procuração e cópia da CNH ou RG/CPF do procurador caso solicitado por terceiro.</Typography>
      </div>
      <Button onClick={handlePrintDocument} className={`${classes.downloadButton} ${classes.noPrint}`}>
        Imprimir Documento
      </Button>
    </Card>
  );
};

const Dashboard = () => {
  const classes = useStyles();
  const [documents, setDocuments] = useState<Item[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Item[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('todos');
  const [stats, setStats] = useState({
    total: 0,
    pendentes: 0,
    analisando: 0,
    faltandoDoc: 0,
    aguardandoDetran: 0,
    prontos: 0,
    concluidos: 0,
    valorTotal: 0,
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [newDocumentMessage, setNewDocumentMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const calculateStats = (docs: Item[]) => {
    const newStats = {
      total: docs.length,
      pendentes: docs.filter(d => d.status === 'Pendente').length,
      analisando: docs.filter(d => d.status === 'Faltando Comunica').length,
      faltandoDoc: docs.filter(d => d.status === 'Faltando Documentação').length,
      aguardandoDetran: docs.filter(d => d.status === 'Aguardando Assinar').length,
      prontos: docs.filter(d => d.status === 'Pronto').length,
      concluidos: docs.filter(d => d.status === 'Concluído').length,
      valorTotal: docs.reduce((sum, d) => sum + convertStringToNumber(d.valordevenda || '0'), 0),
    };
    setStats(newStats);
  };

  const fetchDocuments = async () => {
  setLoading(true);
  try {
    const itemsCollectionRef = collection(db, 'Betodespachanteintrncaodevendaoficialdigital');
    const querySnapshot = await getDocs(itemsCollectionRef);
    const fetchedItems: Item[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as Omit<Item, 'docUuid'>;
      fetchedItems.push({ ...data, docUuid: docSnap.id } as Item);
    });

    fetchedItems.sort((a, b) => {
     const toDate = (d: string | Timestamp) => d instanceof Timestamp ? d.toDate() : new Date(d);
return toDate(b.dataCriacao).getTime() - toDate(a.dataCriacao).getTime();

    });

    setDocuments(fetchedItems);
    calculateStats(fetchedItems);
  } catch (error) {
    console.error('Erro ao buscar os itens:', error);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
  const itemsCollectionRef = collection(db, 'Betodespachanteintrncaodevendaoficialdigital');

  const unsubscribe = onSnapshot(itemsCollectionRef, (snapshot) => {
    const updatedDocuments: Item[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Omit<Item, 'docUuid'>; // mantém o id interno (placa)
      updatedDocuments.push({
        ...data,
        docUuid: docSnap.id, // ✅ guarda o UUID do Firestore
      } as Item);
    });

    // ordena por data (mais recente primeiro)
    updatedDocuments.sort((a, b) => {
     const toDate = (d: string | Timestamp) => d instanceof Timestamp ? d.toDate() : new Date(d);
return toDate(b.dataCriacao).getTime() - toDate(a.dataCriacao).getTime();

    });

    setDocuments(updatedDocuments);
    calculateStats(updatedDocuments);

    // alerta visual para novos docs pendentes
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const newDoc = {
          ...(change.doc.data() as Item),
          docUuid: change.doc.id, // ✅ inclui o UUID também aqui
        } as Item;

        if (newDoc.status === 'Pendente') {
          setNewDocumentMessage('🔔 Novo requerimento adicionado!');
          setSnackbarOpen(true);
        }
      }
    });
  });

  return () => unsubscribe();
}, []);


  const handleStatusUpdate = async (docUuid: string, novoStatus: string) => {
  try {
    const docRef = doc(db, 'Betodespachanteintrncaodevendaoficialdigital', docUuid);
    await updateDoc(docRef, { status: novoStatus });
  } catch (error) {
    console.error("Erro ao atualizar o status:", error);
  }
};

  const handleDeleteClick = (docUuid: string) => {
    setDocumentToDelete(docUuid);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      const docRef = doc(db, 'Betodespachanteintrncaodevendaoficialdigital', documentToDelete);
      await deleteDoc(docRef);
      setNewDocumentMessage('🗑️ Documento excluído com sucesso!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Erro ao excluir documento:", error);
      setNewDocumentMessage('❌ Erro ao excluir documento');
      setSnackbarOpen(true);
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };


  const applyFilters = () => {
    let filtered = documents;

    // Filtro por status
    if (activeFilter !== 'todos') {
      filtered = filtered.filter(doc => doc.status === activeFilter);
    }

    // Filtro por texto de busca
    if (searchText) {
  const q = searchText.toLowerCase();
filtered = filtered.filter(doc =>
  (doc.nomeempresa ?? '').toLowerCase().includes(q) ||
  (doc.id ?? '').toLowerCase().includes(q) ||         // placa (seu id interno)
  (doc.placa ?? '').toLowerCase().includes(q) ||      // se existir campo placa separado
  (doc.renavam ?? '').toLowerCase().includes(q) ||
  (doc.nomevendedor ?? '').toLowerCase().includes(q) ||
  (doc.nomecomprador ?? '').toLowerCase().includes(q)
);
    }

    setFilteredDocuments(filtered);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  // Aplicar filtros sempre que documents, activeFilter ou searchText mudarem
  useEffect(() => {
    applyFilters();
    setCurrentPage(1); // Reset para primeira página quando filtros mudarem
  }, [documents, activeFilter, searchText]);

  // Calcular documentos da página atual
  const indexOfLastDocument = currentPage * itemsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - itemsPerPage;
  const currentDocuments = filteredDocuments.slice(indexOfFirstDocument, indexOfLastDocument);
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);

  // Função para mudar página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpanded(null); // Fechar documentos expandidos ao mudar página
  };

  // Gerar números das páginas para navegação
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };


  return (
    <Forcaautenticacao>
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <Container maxWidth="xl">
          <DashboardHeader 
            stats={stats} 
            onFilterChange={handleFilterChange}
            activeFilter={activeFilter}
          />

          <Paper className={classes.filterContainer}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  label="🔍 Buscar documentos..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  variant="outlined"
                  className={classes.searchField}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                {activeFilter !== 'todos' && (
                  <Chip
                    label={`Filtro: ${activeFilter}`}
                    onDelete={() => setActiveFilter('todos')}
                    color="primary"
                    variant="outlined"
                    style={{ backgroundColor: '#f0f8f0' }}
                  />
                )}
              </Grid>
              <Grid item xs={12} md={3}>
                <Button 
                  onClick={fetchDocuments} 
                  variant="contained" 
                  startIcon={<Refresh />}
                  disabled={loading}
                  fullWidth
                  style={{ backgroundColor: '#1a4d3a', color: '#fff' }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Atualizar'}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress size={50} style={{ color: '#1a4d3a' }} />
            </Box>
          ) : filteredDocuments.length === 0 ? (
            <Paper style={{ padding: 32, textAlign: 'center' }}>
              <Assignment style={{ fontSize: 64, color: '#ccc', marginBottom: 16 }} />
              <Typography variant="h6" color="textSecondary">
                Nenhum documento encontrado
              </Typography>
            </Paper>
          ) : (
            <>
              {/* Informações de paginação */}
              <Paper style={{ padding: 16, marginBottom: 16, backgroundColor: '#f5f5f5' }}>
                <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                  <Grid item>
                    <Typography variant="body2" color="textSecondary">
                      Mostrando {indexOfFirstDocument + 1} - {Math.min(indexOfLastDocument, filteredDocuments.length)} de {filteredDocuments.length} documentos
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="body2" color="textSecondary">
                      Página {currentPage} de {totalPages}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Lista de documentos da página atual */}
              {currentDocuments.map((doc) => (
              <Card key={doc.docUuid ?? doc.id} className={classes.documentCard}>
                <CardContent className={classes.documentHeader}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                      <Typography className={classes.documentTitle}>
                        {doc.nomeempresa || doc.nomevendedor}
                      </Typography>
                      <div className={classes.documentSubtitle}>
                        <DirectionsCar fontSize="small" />
                        <span>{doc.id}</span>
                        <span>•</span>
                        <Person fontSize="small" />
                        <span>{doc.nomevendedor}</span>
                        <span>•</span>
                        <DateRange fontSize="small" />
                       <span>{Array.isArray(doc.produtosSelecionados) ? doc.produtosSelecionados.join(', ') : (doc.produtosSelecionados ?? '')}</span>

                        <span>{formatDate(doc.dataCriacao)}</span>
                        <Thumbnails urls={doc.imagemUrls} />
                      </div>
                      <Box mt={1}>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Valor:</strong> R$ {doc.valordevenda}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box display="flex" flexDirection="column" style={{ gap: 8 }}>
                        <Chip
                          icon={getStatusIcon(doc.status)}
                          label={doc.status || 'Pendente'}
                          style={{
                            backgroundColor: getStatusColor(doc.status || 'Pendente').background,
                            color: getStatusColor(doc.status || 'Pendente').color,
                            fontWeight: 'bold',
                          }}
                          className={classes.statusChip}
                        />
                        <Box display="flex" style={{ gap:1 }}>
                          <FormControl size="small" className={classes.statusSelect} style={{ flex: 1 }}>
                            <Select
                              value={doc.status || 'Pendente'}
                              onChange={(e) => handleStatusUpdate(doc.docUuid ?? doc.id, e.target.value as string)}
                              variant="outlined"
                            >
                              <MenuItem value="Pendente">⏳ Pendente</MenuItem>
                              <MenuItem value="Faltando Comunica">🔍 Faltando Comunicar</MenuItem>
                              <MenuItem value="Faltando Documentação">⚠️ Faltando Doc</MenuItem>
                              <MenuItem value="Aguardando Assinar">⏰ Aguardando Assinar</MenuItem>
                              <MenuItem value="Concluído">🎯 Concluído</MenuItem>
                            </Select>
                          </FormControl>
                          <IconButton
                            onClick={() => handleDeleteClick(doc.docUuid ?? doc.id)}
                            style={{
                              backgroundColor: '#ff4444',
                              color: '#fff',

                            }}
                            size="small"
                            title="Excluir documento"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>

                <CardActions>
                  <Button
                   onClick={() => {
  const k = doc.docUuid ?? doc.id;
  setExpanded(expanded === k ? null : k);
}}
startIcon={(expanded === (doc.docUuid ?? doc.id)) ? <ExpandLess /> : <ExpandMore />}

                    size="small"
                  >
                    {expanded === doc.id ? 'Fechar Documento' : 'Ver Documento'}
                  </Button>
                </CardActions>

                <Collapse in={expanded === (doc.docUuid ?? doc.id)}
 timeout="auto" unmountOnExit>
                  <div className={classes.expandedContent}>
                    <DocumentPreview doc={doc} />
                  </div>
                </Collapse>
              </Card>
              ))}

              {/* Controles de Paginação */}
              {totalPages > 1 && (
                <Paper style={{ padding: 16, marginTop: 16 }}>
                  <Grid container spacing={2} alignItems="center" justifyContent="center">
                    {/* Botão Primeira Página */}
                    <Grid item>
                      <Button
                        variant="outlined"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        size="small"
                        style={{ minWidth: 40 }}
                      >
                        ««
                      </Button>
                    </Grid>

                    {/* Botão Página Anterior */}
                    <Grid item>
                      <Button
                        variant="outlined"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        size="small"
                        style={{ minWidth: 40 }}
                      >
                        ‹
                      </Button>
                    </Grid>

                    {/* Números das Páginas */}
                    {getPageNumbers().map((pageNumber) => (
                      <Grid item key={pageNumber}>
                        <Button
                          variant={currentPage === pageNumber ? "contained" : "outlined"}
                          onClick={() => handlePageChange(pageNumber)}
                          size="small"
                          style={{
                            minWidth: 40,
                            backgroundColor: currentPage === pageNumber ? '#1a4d3a' : 'transparent',
                            color: currentPage === pageNumber ? '#fff' : '#1a4d3a',
                          }}
                        >
                          {pageNumber}
                        </Button>
                      </Grid>
                    ))}

                    {/* Botão Próxima Página */}
                    <Grid item>
                      <Button
                        variant="outlined"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        size="small"
                        style={{ minWidth: 40 }}
                      >
                        ›
                      </Button>
                    </Grid>

                    {/* Botão Última Página */}
                    <Grid item>
                      <Button
                        variant="outlined"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        size="small"
                        style={{ minWidth: 40 }}
                      >
                        »»
                      </Button>
                    </Grid>
                  </Grid>

                  {/* Informações adicionais de paginação */}
                  <Box mt={2} textAlign="center">
                    <Typography variant="body2" color="textSecondary">
                      Total de {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''} 
                      {activeFilter !== 'todos' && ` • Filtro: ${activeFilter}`}
                    </Typography>
                  </Box>
                </Paper>
              )}
            </>
          )}

          <Dialog
            open={deleteDialogOpen}
            onClose={handleDeleteCancel}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Confirmar Exclusão"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteCancel} color="primary">
                Cancelar
              </Button>
              <Button onClick={handleDeleteConfirm} style={{ color: '#ff4444' }} autoFocus>
                Excluir
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
            message={newDocumentMessage}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          />
        </Container>
      </div>
    </ThemeProvider>
    </Forcaautenticacao>
  );
};

export default Dashboard;