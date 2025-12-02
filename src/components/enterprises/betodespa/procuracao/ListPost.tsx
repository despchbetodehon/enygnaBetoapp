import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Button, Grid, Paper, Typography, IconButton,
  Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery,
  CircularProgress, Divider, Fab, Tooltip, Collapse, Card, CardContent
} from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';

import { PhotoCamera, Delete, Close, CloudUpload, Send, HelpOutline, ExpandMore, ExpandLess, Edit, PictureAsPdf, Add, Save, PersonAdd } from '@material-ui/icons';
import Cropper from 'react-easy-crop';
import SignaturePad from './SingnaturePad';
import Colecao from '@/logic/firebase/db/Colecao';
import Item from './Item';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Firestore, Timestamp } from 'firebase/firestore';
import { storage } from '@/logic/firebase/config/app';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getCroppedImg } from './cropUtils';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { addDoc, collection, setDoc, doc } from 'firebase/firestore';
import { db } from '@/logic/firebase/config/app';
import Colaboradores from '@/pages/colaboradores';

// Interface para o contato do banco de dados
interface Contact {
  id: string;
  nome: string;
  cpfCnpj: string;
  rg: string;
  nacionalidade: string;
  estadoCivil: string;
  nregistro:string;
  profissao: string;
  endereco: string;
  complemento: string;
  municipio: string;
  estado: string;
  cep: string;
}

// Interface para Procurador da Empresa
interface ProcuradorEmpresa {
  id: string;
  cpfCnpj: string;
  nome: string;
  rg: string;
  nacionalidade: string;
  estadoCivil: string;
  nregistro:string;
  profissao: string;
  endereco: string;
  complemento: string;
  municipio: string;
  estado: string;
  cep: string;
}

// Interface para Empresa
interface Empresa {
  id: string;
  nomeEmpresa: string;
  quantidadeProcuradores: number;
  procuradores: ProcuradorEmpresa[];
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #fafbfc 0%, #f7fafc 100%)',
      padding: theme.spacing(2),
      color: 'Black',
      fontFamily: '"Playfair Display", "Crimson Text", "Libre Baskerville", "Georgia", serif',
      transition: theme.transitions.create(['padding'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      [theme.breakpoints.down('xs')]: {
        padding: theme.spacing(1),
      },
    },
    formContainer: {
      display: 'flex',
      marginTop: theme.spacing(-1),
      flexDirection: 'column',
      gap: theme.spacing(1),
      background: 'rgba(255, 255, 255, 0.95)',
      maxWidth: '100%',
      color: 'Black',
      margin: '0 auto',
      padding: theme.spacing(1),
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(45, 90, 61, 0.1)',
      transition: theme.transitions.create(['padding', 'gap'], {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.standard,
      }),
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1.5),
        gap: theme.spacing(1.5),
      },
    },
    header: {
      marginBottom: theme.spacing(4),
      textAlign: 'center',
    },
    logo: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      color: 'Black',
      objectFit: 'cover',
      border: '3px solid rgba(45, 90, 61, 0.2)',
      marginBottom: theme.spacing(1),
      [theme.breakpoints.down('xs')]: {
        width: '50px',
        height: '50px',
      },
    },
    title: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
      fontSize: '1.4rem',
      color: 'Black',
      textAlign: 'center',
      [theme.breakpoints.down('xs')]: {
        fontSize: '0.9rem',
      },
    },
    compactSection: {
      background: '#ffffff',
      borderRadius: '12px',
      padding: theme.spacing(1),
      color: 'Black',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      [theme.breakpoints.down('xs')]: {
        padding: theme.spacing(0.5),
      },
    },
    sectionTitle: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 200,
      color: 'Black',
      marginBottom: theme.spacing(1.5),
      fontSize: '1.2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      [theme.breakpoints.down('xs')]: {
        fontSize: '1rem',
        marginBottom: theme.spacing(1),
      },
    },
    uploadButton: {
      borderRadius: '8px',
      padding: theme.spacing(1.5),
      fontWeight: 600,
      textTransform: 'none',
      background: 'linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%)',
      color: 'white',
      boxShadow: '0 2px 8px rgba(45, 90, 61, 0.3)',
      transition: theme.transitions.create(['transform', 'box-shadow'], {
        duration: theme.transitions.duration.shorter,
      }),
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(45, 90, 61, 0.4)',
      },
      '&:active': {
        transform: 'translateY(0)',
      },
      [theme.breakpoints.down('xs')]: {
        padding: theme.spacing(1),
        fontSize: '0.8rem',
      },
    },
    manualButton: {
      borderRadius: '8px',
      padding: theme.spacing(1),
      fontWeight: 500,
      color: 'Black',
      textTransform: 'none',
      border: '1px solid #2d5a3d',
      backgroundColor: 'transparent',
      '&:hover': {
        backgroundColor: 'rgba(45, 90, 61, 0.05)',
      },
      [theme.breakpoints.down('xs')]: {
        padding: theme.spacing(0.5),
        fontSize: '0.75rem',
      },
    },
    thumbnailContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: theme.spacing(1),
      marginTop: theme.spacing(1),
    },
    thumbnail: {
      position: 'relative',
      width: '60px',
      height: '60px',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      cursor: 'pointer',
      transition: theme.transitions.create(['transform', 'box-shadow'], {
        duration: theme.transitions.duration.shortest,
      }),
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      },
      '& img': {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      },
      [theme.breakpoints.down('xs')]: {
        width: '50px',
        height: '50px',
      },
    },
    pdfThumbnail: {
      position: 'relative',
      width: '60px',
      height: '60px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'scale(1.05)',
      },
      [theme.breakpoints.down('xs')]: {
        width: '50px',
        height: '50px',
      },
    },
    deleteButton: {
      position: 'absolute',
      top: '-6px',
      right: '-6px',
      backgroundColor: '#ff1744',
      color: 'white',
      width: '20px',
      height: '20px',
      '&:hover': {
        backgroundColor: '#d50000',
      },
    },
    textField: {
      marginBottom: theme.spacing(1),
      '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: '#2d5a3d',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#2d5a3d',
        },
      },
    },
    submitButton: {
      padding: theme.spacing(1),
      fontSize: '1.1rem',
      fontWeight: 700,
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%)',
      color: '#fff',
      textTransform: 'none',
      boxShadow: '0 4px 15px rgba(45, 90, 61, 0.3)',
      transition: theme.transitions.create(['transform', 'box-shadow'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.short,
      }),
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(45, 90, 61, 0.4)',
      },
      '&:active': {
        transform: 'translateY(0)',
        boxShadow: '0 3px 12px rgba(45, 90, 61, 0.35)',
      },
      [theme.breakpoints.down('xs')]: {
        padding: theme.spacing(1.5),
        fontSize: '1rem',
      },
    },
    expandableContent: {
      marginTop: theme.spacing(-1),
      transition: theme.transitions.create(['margin', 'opacity'], {
        duration: theme.transitions.duration.standard,
      }),
    },
    signatureContainer: {
      background: '#f8f9fa',
      borderRadius: '12px',
      padding: theme.spacing(2),
      textAlign: 'center',
      border: '2px dashed #2d5a3d',
      marginTop: theme.spacing(1),
    },
    processingIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
      color: '#2d5a3d',
      fontSize: '0.9rem',
      marginTop: theme.spacing(1),
    },
    dialogContent: {
      position: 'relative',
      height: '65vh',
      backgroundColor: '#0A1A2F',
      borderRadius: '16px',
      [theme.breakpoints.down('sm')]: {
        height: '55vh',
      },
    },
    cropControls: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: theme.spacing(2.5),
      display: 'flex',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%)',
      zIndex: 1,
    },
    noPrint: {
      '@media print': {
        display: 'none !important',
      },
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
      fontSize: '12pt',
      '@media print': {
        boxShadow: 'none',
        margin: '0',
        padding: '10px',
        width: '100%',
        fontSize: '12pt',
        boxSizing: 'border-box',
        pageBreakBefore: 'auto',
      },
    },
    documentTitle: {
      fontSize: '18pt',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: theme.spacing(3),
      textTransform: 'uppercase',
    },
    documentText: {
      fontSize: '12pt',
      lineHeight: 1.8,
      textAlign: 'justify',
      marginBottom: theme.spacing(2),
    },
    signatureSection: {
      marginTop: theme.spacing(8),
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
      fontSize: '12pt',
    },
    footer: {
      fontSize: '10pt',
      textAlign: 'center',
      marginTop: theme.spacing(4),
      fontStyle: 'italic',
    },
    fabButton: {
      position: 'fixed',
      bottom: theme.spacing(3),
      right: theme.spacing(3),
      background: 'linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%)',
      color: '#fff',
      boxShadow: '0 5px 15px rgba(45, 90, 61, 0.3)',
      '&:hover': {
        background: 'linear-gradient(135deg, #1e3d28 0%, #3a6b47 100%)',
        transform: 'scale(1.1)',
      },
      zIndex: 1000,
      [theme.breakpoints.down('xs')]: {
        bottom: theme.spacing(2),
        right: theme.spacing(2),
      },
    },
    contactDialog: {
      '& .MuiDialog-paper': {
        borderRadius: '16px',
        padding: theme.spacing(1),
      },
    },
    contactForm: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(2),
      minWidth: '400px',
      [theme.breakpoints.down('xs')]: {
        minWidth: '300px',
      },
    },
    statsGrid: {
      marginBottom: theme.spacing(4),
    },
    statCard: {
      padding: theme.spacing(2),
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: 12,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows[8],
      },
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1.5),
      },
    },
  })
);

// Componente para seção compacta
const CompactSection: React.FC<{
  title: string;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onManualEdit: () => void;
  processingImage: boolean;
  classes: any;
  manualExpanded: boolean;
  children?: React.ReactNode;
  uploadLabel?: string;
  setCameraOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ title, files, setFiles, onFileChange, onManualEdit, processingImage, classes, manualExpanded, children, uploadLabel, setCameraOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

  return (
    <div className={classes.compactSection}>
      <Typography className={classes.sectionTitle}>
        {title}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Tooltip title="Tirar Foto">
            <IconButton
              size="small"
              onClick={() => setCameraOpen(true)}
              disabled={processingImage}
              style={{
                backgroundColor: 'rgba(45, 90, 61, 0.1)',
                color: '#2d5a3d',
                width: '32px',
                height: '32px'
              }}
            >
              <PhotoCamera fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Preencher Manual">
            <IconButton
              size="small"
              onClick={onManualEdit}
              style={{
                backgroundColor: 'rgba(45, 90, 61, 0.1)',
                color: '#2d5a3d',
                width: '32px',
                height: '32px'
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </Typography>

      {processingImage && (
        <div className={classes.processingIndicator}>
          <CircularProgress size={16} />
          <Typography variant="caption">Analisando documento...</Typography>
        </div>
      )}

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <input
            accept="image/*,application/pdf"
            style={{ display: 'none' }}
            id={`upload-${title.replace(/\s+/g, '-')}`}
            type="file"
            onChange={onFileChange}
            multiple
          />
          <label htmlFor={`upload-${title.replace(/\s+/g, '-')}`}>
            <Button
              variant="contained"
              component="span"
              className={classes.uploadButton}
              fullWidth
              startIcon={<CloudUpload />}
              disabled={processingImage}
            >
              {uploadLabel || (isMobile ? 'Enviar' : `Enviar ${title}`)}
            </Button>
          </label>
        </Grid>

        {files.length > 0 && (
          <Grid item xs={12}>
            <div className={classes.thumbnailContainer}>
              {files.map((file, index) => (
                <div key={index} className={file.type === 'application/pdf' ? classes.pdfThumbnail : classes.thumbnail}>
                  {file.type === 'application/pdf' ? (
                    <PictureAsPdf style={{ color: '#d32f2f', fontSize: 30 }} />
                  ) : (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`${title} ${index}`}
                      onError={(e) => {
                        console.error('Erro ao carregar imagem:', e);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <IconButton
                    className={classes.deleteButton}
                    size="small"
                    onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </div>
              ))}
            </div>
          </Grid>
        )}
      </Grid>

      <Collapse in={manualExpanded}>
        <div className={classes.expandableContent}>
          {children}
        </div>
      </Collapse>
    </div>
  );
};

const ListPost: React.FC<{ setItems: React.Dispatch<React.SetStateAction<Item[]>>, onItemEnviado?: () => void }> = ({ setItems, onItemEnviado }) => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

  // Estados principais
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const savingRef = useRef(false);
  const uploadCacheRef = useRef(new Map<string, string>());

  // Estado para modo jurídico (empresa)
  const [modoJuridico, setModoJuridico] = useState(false);

  // Estados das seções expandidas
  const [veiculoExpanded, setVeiculoExpanded] = useState(false);
  const [proprietarioExpanded, setProprietarioExpanded] = useState(false);
  const [procuradorExpanded, setProcuradorExpanded] = useState(false);
  const [assinaturaExpanded, setAssinaturaExpanded] = useState(false);
  const [documentosExpanded, setDocumentosExpanded] = useState(false);

  // Novos estados para as seções de Empresa e Sócio Administrador
  const [empresaExpanded, setEmpresaExpanded] = useState(false);
  const [socioAdministradorExpanded, setSocioAdministradorExpanded] = useState(false);

  // Estados para os arquivos de cada seção
  const [veiculoFiles, setVeiculoFiles] = useState<File[]>([]);
  const [proprietarioDocFiles, setProprietarioDocFiles] = useState<File[]>([]);
  const [proprietarioContaFiles, setProprietarioContaFiles] = useState<File[]>([]);
  const [procuradorDocFiles, setProcuradorDocFiles] = useState<File[]>([]);
  const [procuradorContaFiles, setProcuradorContaFiles] = useState<File[]>([]);

  // Novos estados para os arquivos das seções de Empresa e Sócio Administrador
  const [empresaFiles, setEmpresaFiles] = useState<File[]>([]);
  const [socioAdministradorFiles, setSocioAdministradorFiles] = useState<File[]>([]);

  // Estados para crop e câmera
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // Estados para banco de contatos
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [isLoadingContact, setIsLoadingContact] = useState(false);
  const [contactFiles, setContactFiles] = useState<File[]>([]);
  const [contactData, setContactData] = useState<Contact>({
    id: '',
    nome: '',
    cpfCnpj: '',
    rg: '',
    nacionalidade: 'brasileiro',
    estadoCivil: '',
    profissao: '',
    endereco: '',
    nregistro:'',
    complemento: '',
    municipio: '',
    estado: '',
    cep: ''
  });

  // Estados para gerenciamento de empresas
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null);
  const [empresaDialogOpen, setEmpresaDialogOpen] = useState(false);
  const [empresaEditDialogOpen, setEmpresaEditDialogOpen] = useState(false);
  const [empresaDeleteDialogOpen, setEmpresaDeleteDialogOpen] = useState(false);
  const [empresaParaEditar, setEmpresaParaEditar] = useState<Empresa | null>(null);
  const [empresaParaExcluir, setEmpresaParaExcluir] = useState<Empresa | null>(null);
  const [novaEmpresa, setNovaEmpresa] = useState<Empresa>({
    id: '',
    nomeEmpresa: '',
    quantidadeProcuradores: 1,
    procuradores: []
  });
  const [procuradorEditIndex, setProcuradorEditIndex] = useState<number>(0);
  const [empresaProcuradorFiles, setEmpresaProcuradorFiles] = useState<{ [key: number]: File[] }>({});
  const [modoVisualizacao, setModoVisualizacao] = useState<'cards' | 'lista'>('cards');
  const [empresasPagina, setEmpresasPagina] = useState<number>(1);
  const [empresasPorPagina, setEmpresasPorPagina] = useState<number>(5);
  const empresasContainerRef = useRef<HTMLDivElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calcular quantos cards cabem na tela
  useEffect(() => {
    const calcularCardsPorPagina = () => {
      if (!empresasContainerRef.current) return;

      const containerWidth = empresasContainerRef.current.offsetWidth;
      const cardMinWidth = modoVisualizacao === 'cards' ? 126 : 200; // 120px + 6px gap
      const gap = 6;

      const cardsPossiveis = Math.floor((containerWidth + gap) / (cardMinWidth + gap));
      const novosCardsPorPagina = Math.max(1, cardsPossiveis);

      setEmpresasPorPagina(novosCardsPorPagina);

      // Ajustar página atual se necessário
      const totalPaginas = Math.ceil(empresas.length / novosCardsPorPagina);
      if (empresasPagina > totalPaginas && totalPaginas > 0) {
        setEmpresasPagina(totalPaginas);
      }
    };

    calcularCardsPorPagina();
    window.addEventListener('resize', calcularCardsPorPagina);

    return () => window.removeEventListener('resize', calcularCardsPorPagina);
  }, [empresas.length, modoVisualizacao, empresasPagina]);

  // Hook para consulta CPF/CNPJ
  const useCpfCnpjSearch = () => {
    const [isLoading, setIsLoading] = useState(false);

    const search = async (doc: string, target: keyof Item, setNewItem: React.Dispatch<React.SetStateAction<Item>>) => {
      let tipo = '';

      try {
        const cleaned = doc.replace(/\D/g, '');
        if (cleaned.length !== 11 && cleaned.length !== 14) return;

        setIsLoading(true);
        tipo = cleaned.length === 14 ? 'cnpj' : 'cpf';

        console.log(`Iniciando consulta de ${tipo.toUpperCase()}:`, cleaned);

        const response = await fetch(`/api/${tipo}?${tipo}=${cleaned}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Erro ${response.status} ao buscar ${tipo.toUpperCase()}: ${errorData.error || response.statusText}`
          );
        }

        const data = await response.json();

        console.log(`Resposta completa da consulta de ${tipo.toUpperCase()}:`, data);

        if (data.nome || tipo === 'cpf') {
          setNewItem(prev => {
            const updated = { ...prev };

            // Preencher nome se disponível
            if (data.nome) {
              (updated as any)[target] = data.nome.toUpperCase();
            }

            // Preencher campos adicionais apenas para CPF do proprietário
            if (tipo === 'cpf' && target === 'nomeProprietario') {
              console.log('🔍 Dados completos recebidos da API CPF:', data);

              // Data de nascimento - processar ANTES de retornar o updated
              if (data.nascimento) {
                const nascimentoStr = String(data.nascimento).trim();
                console.log('📅 Data de nascimento recebida:', nascimentoStr);

                let dataFormatada = '';

                // Verifica se já está no formato DD/MM/YYYY
                if (nascimentoStr.includes('/')) {
                  dataFormatada = nascimentoStr;
                  console.log('✅ Data já no formato DD/MM/YYYY:', nascimentoStr);
                } else if (nascimentoStr.includes('-')) {
                  // Formato YYYY-MM-DD
                  const partes = nascimentoStr.split('-');
                  if (partes.length === 3) {
                    const [ano, mes, dia] = partes;
                    dataFormatada = `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
                    console.log('✅ Data formatada de YYYY-MM-DD para DD/MM/YYYY:', dataFormatada);
                  }
                } else if (nascimentoStr.length === 8 && /^\d+$/.test(nascimentoStr)) {
                  // Formato YYYYMMDD
                  const ano = nascimentoStr.substring(0, 4);
                  const mes = nascimentoStr.substring(4, 6);
                  const dia = nascimentoStr.substring(6, 8);
                  dataFormatada = `${dia}/${mes}/${ano}`;
                  console.log('✅ Data formatada de YYYYMMDD para DD/MM/YYYY:', dataFormatada);
                }

                // Atribuir a data formatada ao campo
                if (dataFormatada) {
                  updated.dataNascimentoProprietario = dataFormatada;
                  console.log('✅ Campo dataNascimentoProprietario atualizado:', dataFormatada);
                }
              } else {
                console.warn('⚠️ Data de nascimento não encontrada na resposta da API');
              }

              // Nome do pai
              if (data.nomePai && data.nomePai !== 'null' && data.nomePai !== '') {
                const nomePaiFormatado = String(data.nomePai).trim().toUpperCase();
                updated.nomePaiProprietario = nomePaiFormatado;
                console.log('✅ Nome do pai preenchido:', nomePaiFormatado);
              }

              // Nome da mãe
              if (data.nomeMae && data.nomeMae !== 'null' && data.nomeMae !== '') {
                const nomeMaeFormatado = String(data.nomeMae).trim().toUpperCase();
                updated.nomeMaeProprietario = nomeMaeFormatado;
                console.log('✅ Nome da mãe preenchido:', nomeMaeFormatado);
              }

              // RG
              if (data.rg && !prev.rgProprietario) {
                updated.rgProprietario = String(data.rg);
                console.log('✅ RG preenchido:', data.rg);
              }
            }

            console.log('📝 Estado final atualizado:', updated);
            return updated;
          });
        } else {
          console.warn(`⚠️ Nenhum nome encontrado para ${tipo.toUpperCase()} ${cleaned}`);
        }
      } catch (error) {
        console.error(`❌ Erro na consulta de ${tipo || 'documento'}:`, {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          document: doc
        });

        if (error instanceof Error && error.message.includes('Erro 404')) {
          alert('Serviço de consulta temporariamente indisponível. Por favor, preencha o nome manualmente.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    return { search, isLoading, setIsLoading };
  };

  const useDebounce = (callback: Function, delay: number) => {
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    return (...args: any[]) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    };
  };

  const { search: searchCpfCnpj, isLoading: isLoadingSearch, setIsLoading: setIsLoadingSearch } = useCpfCnpjSearch();
  const debouncedSearch = useDebounce(searchCpfCnpj, 1000);

  // Função específica para busca em contatos
  const searchContactCpfCnpj = async (doc: string, target: string) => {
    try {
      const cleaned = doc.replace(/\D/g, '');
      if (cleaned.length !== 11 && cleaned.length !== 14) return;

      setIsLoadingSearch(true);
      const tipo = cleaned.length === 14 ? 'cnpj' : 'cpf';

      console.log(`Iniciando consulta de ${tipo.toUpperCase()} para contato:`, cleaned);

      const response = await fetch(`/api/${tipo}?${tipo}=${cleaned}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Erro ${response.status} ao buscar ${tipo.toUpperCase()}: ${errorData.error || response.statusText}`
        );
      }

      const data = await response.json();

      console.log(`Resposta da consulta de ${tipo.toUpperCase()} para contato:`, data);

      // Preencher todos os campos disponíveis da API
      if (tipo === 'cpf' && data.nome) {
        setContactData(prev => ({
          ...prev,
          nome: data.nome.toUpperCase()
        }));
      } else if (tipo === 'cnpj') {
        setContactData(prev => {
          const updated = { ...prev };
          if (data.nome) updated.nome = data.nome.toUpperCase();

          // Se há endereço na resposta da API, extrair e preencher
          if (data.endereco) {
            const endereco = data.endereco;
            updated.endereco = endereco.logradouro || '';
            updated.complemento = endereco.bairro || '';
            updated.municipio = endereco.municipio || '';
            updated.estado = endereco.uf || '';
            updated.cep = endereco.cep?.replace(/\D/g, '') || '';
          }

          return updated;
        });
      }

      if (!data.nome) {
        console.warn(`Nenhum nome encontrado para ${tipo.toUpperCase()} ${cleaned}`);
      }
    } catch (error) {
      console.error('Erro na consulta de contato:', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        document: doc
      });

      if (error instanceof Error && error.message.includes('Erro 404')) {
        console.log('Serviço de consulta temporariamente indisponível para contato.');
      }
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const debouncedSearchContact = useDebounce(searchContactCpfCnpj, 1000);

  // Estado para quantidade de procuradores
  const [quantidadeProcuradores, setQuantidadeProcuradores] = useState<number>(1);

  const [newItem, setNewItem] = useState<Item>({
    id: '',
    cliente: '',
    status: 'Pendente',
    quantidade: 0,
    imagemUrls: [],
    concluido: false,
    placa: '',
    renavam: '',
    crv: '',
    // Campos obrigatórios para compatibilidade
    valordevenda: '',
    nomevendedor: '',
    cpfvendedor: '',
    nregistro: '',
    enderecovendedor: '',
    complementovendedor: '',
    municipiovendedor: '',
    emailvendedor: '',
    bairrocomprador: '',
    nomecomprador: '',
    cpfcomprador: '',
    enderecocomprador: '',
    complementocomprador: '',
    municipiocomprador: '',
    emailcomprador: '',
    celtelcomprador: '',
    cepvendedor: '',
    cepcomprador: '',
    tipo: '',
    cnpjempresa: '',
    nomeempresa: '',
    celtelvendedor: '',
    // Campos específicos da procuração
    chassi: '',
    modelo: '',
    anoFabricacao: '',
    anoModelo: '',
    cor: '',
    combustivel: '',
    nomeProprietario: '',
    cpfProprietario: '',
    rgProprietario: '',
    nacionalidadeProprietario: 'brasileiro(a)',
    dataNascimentoProprietario: '',
    nomePaiProprietario: '',
    nomeMaeProprietario: '',
    enderecoProprietario: '',
    complementoProprietario: '',
    municipioProprietario: '',
    estadoProprietario: '',
    cepProprietario: '',
    nomeProcurador: '',
    cpfProcurador: '',
    rgProcurador: '',
    nacionalidadeProcurador: 'brasileiro',
    estadoCivilProcurador: '',
    profissaoProcurador: '',
    enderecoProcurador: '',
    complementoProcurador: '',
    municipioProcurador: '',
    estadoProcuradorEnd: '',
    cepProcurador: '',
    // Campos para múltiplos procuradores
    nomeProcurador2: '',
    cpfProcurador2: '',
    rgProcurador2: '',
    nacionalidadeProcurador2: 'brasileiro',
    estadoCivilProcurador2: '',
    profissaoProcurador2: '',
    enderecoProcurador2: '',
    complementoProcurador2: '',
    municipioProcurador2: '',
    estadoProcuradorEnd2: '',
    cepProcurador2: '',
    nomeProcurador3: '',
    cpfProcurador3: '',
    rgProcurador3: '',
    nacionalidadeProcurador3: 'brasileiro',
    estadoCivilProcurador3: '',
    profissaoProcurador3: '',
    enderecoProcurador3: '',
    complementoProcurador3: '',
    municipioProcurador3: '',
    estadoProcuradorEnd3: '',
    cepProcurador3: '',
    nomeProcurador4: '',
    cpfProcurador4: '',
    rgProcurador4: '',
    nacionalidadeProcurador4: 'brasileiro',
    estadoCivilProcurador4: '',
    profissaoProcurador4: '',
    enderecoProcurador4: '',
    complementoProcurador4: '',
    nregistroProcurador1:'',
      nregistroProcurador2: '',
      nregistroProcurador3: '',
       nregistroProcurador4: '',
      nregistroProcurador5: '',
      nregistroProcurador: '',
    municipioProcurador4: '',
    estadoProcuradorEnd4: '',
    cepProcurador4: '',
    nomeProcurador5: '',
    cpfProcurador5: '',
    rgProcurador5: '',
    nacionalidadeProcurador5: 'brasileiro',
    estadoCivilProcurador5: '',
    profissaoProcurador5: '',
    enderecoProcurador5: '',
    complementoProcurador5: '',
    municipioProcurador5: '',
    estadoProcuradorEnd5: '',
    cepProcurador5: '',
    dataCriacao: Timestamp.fromDate(new Date()),
    signature: '',
    // Campos específicos para modo jurídico (empresa)
    cnpjEmpresaJuridico: '',
    nomeEmpresaJuridico: '',
    enderecoEmpresaJuridico: '',
    bairroEmpresaJuridico: '',
    municipioEmpresaJuridico: '',
    estadoEmpresaJuridico: '',
    cepEmpresaJuridico: '',

    // Campos específicos para sócio administrador
    nomeSocioAdministrador: '',
    cpfSocioAdministrador: '',
    rgSocioAdministrador: '',
    nacionalidadeSocioAdministrador: 'brasileiro(a)',
    estadoCivilSocioAdministrador: '',
    profissaoSocioAdministrador: '',
    enderecoSocioAdministrador: '',
    complementoSocioAdministrador: '',
    municipioSocioAdministrador: '',
    estadoSocioAdministrador: '',
    cepSocioAdministrador: '',
    dataNascimentoSocioAdministrador: '',
  });

  // Funções helper
  const fileSig = (f: File) => `${f.name}|${f.size}|${f.lastModified}`;
  const uniqueFiles = (arr: File[]) => {
    const seen = new Set<string>();
    return arr.filter(f => {
      const k = fileSig(f);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  const formatCpfCnpj = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (_, p1, p2, p3, p4) => {
        return [p1, p2, p3].filter(Boolean).join('.') + (p4 ? `-${p4}` : '');
      });
    } else {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, (_, p1, p2, p3, p4, p5) => {
        return `${p1}.${p2}.${p3}/${p4}-${p5}`;
      });
    }
  };

  const isValidCpfCnpj = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length === 11 || cleaned.length === 14;
  };

  // Função para salvar contato no banco de dados
  const saveContact = async () => {
    if (!contactData.id || !contactData.nome || !contactData.cpfCnpj) {
      alert('Por favor, preencha pelo menos o código, nome e CPF/CNPJ');
      return;
    }

    setIsLoadingContact(true);
    try {
      const colecao = new Colecao();
      const contactToSave = {
        ...contactData,
        dataCriacao: Timestamp.fromDate(new Date()),
        ultimaAtualizacao: Timestamp.fromDate(new Date())
      };

      await colecao.salvar('bancodecontato', contactToSave, contactData.id);

      alert('Contato salvo com sucesso!');
      setContactDialogOpen(false);
      resetContactForm();
    } catch (error) {
      console.error('Erro ao salvar contato:', error);
      alert('Erro ao salvar contato. Tente novamente.');
    } finally {
      setIsLoadingContact(false);
    }
  };

  // Função para buscar contato por código
  const searchContactByCode = async (codigo: string, procuradorNumber: number = 1) => {
    if (codigo.length !== 5) return;

    setIsLoadingContact(true);
    try {
      const colecao = new Colecao();
      const contact = await colecao.consultarPorId('bancodecontato', codigo);

      if (contact) {
        // Preencher campos do procurador baseado no número
        const suffix = procuradorNumber === 1 ? '' : procuradorNumber.toString();

        setNewItem(prev => ({
          ...prev,
          [`nomeProcurador${suffix}`]: (contact as any).nome || '',
          [`cpfProcurador${suffix}`]: (contact as any).cpfCnpj?.replace(/\D/g, '') || '',
          [`rgProcurador${suffix}`]: (contact as any).rg || '',
          [`nregistroProcurador${suffix}`]: (contact as any).nregistro || '',
          [`nacionalidadeProcurador${suffix}`]: (contact as any).nacionalidade || 'brasileiro',
          [`estadoCivilProcurador${suffix}`]: (contact as any).estadoCivil || '',
          [`profissaoProcurador${suffix}`]: (contact as any).profissao || '',
          [`enderecoProcurador${suffix}`]: (contact as any).endereco || '',
          [`complementoProcurador${suffix}`]: (contact as any).complemento || '',
          [`municipioProcurador${suffix}`]: (contact as any).municipio || '',
          [`estadoProcuradorEnd${suffix}`]: (contact as any).estado || '',
          [`cepProcurador${suffix}`]: (contact as any).cep || ''
        }));

        console.log(`Contato encontrado e preenchido para procurador ${procuradorNumber}:`, contact);
      } else {
        console.log('Contato não encontrado para código:', codigo);
      }
    } catch (error) {
      console.error('Erro ao buscar contato:', error);
    } finally {
      setIsLoadingContact(false);
    }
  };

  // Função para processar dados do proprietário usando IA
  const processProprietarioWithAI = async (file: File) => {
    setProcessingImage(true);
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!geminiKey) {
      console.warn('Chave da API Gemini não configurada. Processamento de IA desabilitado.');
      setProcessingImage(false);
      return;
    }

    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      const prompt = `Extraia dados do proprietário em JSON. Para o RG, extraia o NÚMERO COMPLETO DO DOCUMENTO DE IDENTIDADE incluindo o ÓRGÃO EMISSOR e a UF (Unidade Federativa). Exemplos de formato: "1234567 /SSP SC", "9876543 /SSP SP", "5432109 /SSP RJ", "8765432 /PC GO", "2345678 /DETRAN PR". JSON: {"nome": "", "cpf": "", "rg": "", "rgOrgaoEmissor": "", "rgUF": "", "dataNascimento": "", "nomePai": "", "nomeMae": "", "endereco": "", "cep": "", "bairro": "", "municipio": "", "estado": ""}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: file.type, data: base64 } }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            console.log('Dados extraídos do proprietário:', data);

            setNewItem(prev => {
              const updated = { ...prev };
              if (data.nome) updated.nomeProprietario = data.nome.toUpperCase();
              if (data.cpf) updated.cpfProprietario = data.cpf.replace(/\D/g, '');

              // Processar RG com formato completo (número + órgão emissor + UF)
              if (data.rg) {
                const rgTexto = String(data.rg).trim();

                // Se já vier no formato completo com "/" (ex: "1234567 /SSP SC")
                if (rgTexto.includes('/')) {
                  updated.rgProprietario = rgTexto.toUpperCase();
                }
                // Se vier com campos separados, montar o formato completo
                else if (data.rgOrgaoEmissor || data.rgUF) {
                  const numeroRg = rgTexto.replace(/\D/g, '');
                  const orgao = (data.rgOrgaoEmissor || 'SSP').toString().trim().toUpperCase();
                  const uf = (data.rgUF || data.estado || 'SC').toString().trim().toUpperCase();
                  updated.rgProprietario = `${numeroRg} /${orgao} ${uf}`;
                }
                // Se vier apenas o número, adicionar SSP e tentar obter UF do estado
                else {
                  const numeroRg = rgTexto.replace(/\D/g, '');
                  const uf = (data.estado || 'SC').toString().trim().toUpperCase();
                  updated.rgProprietario = `${numeroRg} /SSP ${uf}`;
                }
              }
              // Se não vier RG mas vier órgão e UF separados
              else if (data.rgOrgaoEmissor && data.rgUF) {
                const orgao = data.rgOrgaoEmissor.toString().trim().toUpperCase();
                const uf = data.rgUF.toString().trim().toUpperCase();
                updated.rgProprietario = `[NÚMERO] /${orgao} ${uf}`;
              }

              if (data.dataNascimento) updated.dataNascimentoProprietario = data.dataNascimento;
              if (data.nomePai) updated.nomePaiProprietario = data.nomePai.toUpperCase();
              if (data.nomeMae) updated.nomeMaeProprietario = data.nomeMae.toUpperCase();
              if (data.endereco) updated.enderecoProprietario = data.endereco.toUpperCase();
              if (data.bairro) updated.complementoProprietario = data.bairro.toUpperCase();
              if (data.municipio) updated.municipioProprietario = data.municipio.toUpperCase();
              if (data.cep) {
                const cepLimpo = data.cep.replace(/\D/g, '');
                updated.cepProprietario = cepLimpo;
                // Buscar endereço completo pelo CEP se não foi preenchido
                if (cepLimpo.length === 8 && !data.endereco) {
                  setTimeout(() => fetchAddressFromCEP(cepLimpo, 'cepProprietario'), 500);
                }
              }
              if (data.estado) updated.estadoProprietario = data.estado.toUpperCase();
              return updated;
            });
          }
        }
      } else {
        const errorText = await response.text().catch(() => 'Erro desconhecido');
        console.error(`Erro na requisição para IA: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao processar imagem do proprietário:', error);
    } finally {
      setProcessingImage(false);
    }
  };

  // Função para processar dados de procurador usando IA
  const processProcuradorWithAI = async (file: File, procuradorNumber: number = 1) => {
    setProcessingImage(true);
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!geminiKey) {
      console.warn('Chave da API Gemini não configurada. Processamento de IA desabilitado.');
      setProcessingImage(false);
      return;
    }

    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      const prompt = `Extraia dados pessoais do procurador em JSON: {"nome": "", "cpf": "", "rg":, "nregistro": "", "estadoCivil": "", "profissao": "", "endereco": "", "cep": "", "bairro": "", "municipio": "", "estado": ""}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: file.type, data: base64 } }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            console.log(`Dados extraídos do procurador ${procuradorNumber}:`, data);

            const suffix = procuradorNumber === 1 ? '' : procuradorNumber.toString();

            setNewItem(prev => {
              const updated = { ...prev };
              if (data.nome) (updated as any)[`nomeProcurador${suffix}`] = data.nome.toUpperCase();
              if (data.cpf) (updated as any)[`cpfProcurador${suffix}`] = data.cpf.replace(/\D/g, '');
              if (data.rg) (updated as any)[`rgProcurador${suffix}`] = data.rg.toString();
               if (data.nregistro) (updated as any)[`nregistroProcurador${suffix}`] = data.nregistro.toString();
              if (data.estadoCivil) (updated as any)[`estadoCivilProcurador${suffix}`] = data.estadoCivil.toUpperCase();
              if (data.profissao) (updated as any)[`profissaoProcurador${suffix}`] = data.profissao.toUpperCase();
              if (data.endereco) (updated as any)[`enderecoProcurador${suffix}`] = data.endereco.toUpperCase();
              if (data.bairro) (updated as any)[`complementoProcurador${suffix}`] = data.bairro.toUpperCase();
              if (data.municipio) (updated as any)[`municipioProcurador${suffix}`] = data.municipio.toUpperCase();
              if (data.cep) {
                const cepLimpo = data.cep.replace(/\D/g, '');
                (updated as any)[`cepProcurador${suffix}`] = cepLimpo;
                // Buscar endereço completo pelo CEP se não foi preenchido
                if (cepLimpo.length === 8 && !data.endereco) {
                  setTimeout(() => fetchAddressFromCEP(cepLimpo, `cepProcurador${suffix}`), 500);
                }
              }

              if (data.estado) (updated as any)[`estadoProcuradorEnd${suffix}`] = data.estado.toUpperCase();
              return updated;
            });
          }
        }
      } else {
        const errorText = await response.text().catch(() => 'Erro desconhecido');
        console.error(`Erro na requisição para IA: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error(`Erro ao processar imagem do procurador ${procuradorNumber}:`, error);
    } finally {
      setProcessingImage(false);
    }
  };

  // Função para processar arquivos de contato com IA
  const processContactFileWithAI = async (file: File) => {
    setProcessingImage(true);
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!geminiKey) {
      console.warn('Chave da API Gemini não configurada. Processamento de IA desabilitado.');
      setProcessingImage(false);
      return;
    }

    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      const prompt = `Extraia dados pessoais em JSON: {"nome": "", "cpf": "", "cnpj": "", "rg":, "nregistro": "", "nacionalidade": "", "estadoCivil": "", "profissao": "", "endereco": "", "complemento": "", "bairro": "", "municipio": "", "estado": "", "cep": ""}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: file.type, data: base64 } }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            console.log('Dados extraídos do contato:', data);

            setContactData(prev => {
              const updated = { ...prev };
              if (data.nome) updated.nome = data.nome.toUpperCase();
              if (data.cpf) updated.cpfCnpj = data.cpf.replace(/\D/g, '');
              if (data.cnpj) updated.cpfCnpj = data.cnpj.replace(/\D/g, '');
              if (data.rg) updated.rg = data.rg.toString();
               if (data.nregistro) updated.nregistro = data.nregistro.toString();

              if (data.nacionalidade) updated.nacionalidade = data.nacionalidade.toLowerCase();
              if (data.estadoCivil) updated.estadoCivil = data.estadoCivil.toUpperCase();
              if (data.profissao) updated.profissao = data.profissao.toUpperCase();
              if (data.endereco) updated.endereco = data.endereco.toUpperCase();
              if (data.complemento || data.bairro) updated.complemento = (data.complemento || data.bairro || '').toUpperCase();
              if (data.municipio) updated.municipio = data.municipio.toUpperCase();
              if (data.estado) updated.estado = data.estado.toUpperCase();
              if (data.cep) {
                const cepLimpo = data.cep.replace(/\D/g, '');
                updated.cep = cepLimpo;
                // Buscar endereço completo pelo CEP se não foi preenchido
                if (cepLimpo.length === 8 && !data.endereco) {
                  setTimeout(() => fetchAddressFromCEPContact(cepLimpo), 500);
                }
              }
              return updated;
            });
          }
        }
      } else {
        const errorText = await response.text().catch(() => 'Erro desconhecido');
        console.error(`Erro na requisição para IA: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao processar arquivo do contato:', error);
    } finally {
      setProcessingImage(false);
    }
  };

  // Função para lidar com upload de arquivos de contato
  const handleContactFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setContactFiles(prev => [...prev, ...selectedFiles]);
    if (selectedFiles.length > 0) {
      processContactFileWithAI(selectedFiles[0]);
    }
  };

  // Função para resetar formulário de contato
  const resetContactForm = () => {
    setContactData({
      id: '',
      nome: '',
      cpfCnpj: '',
      rg: '',
      nacionalidade: 'brasileiro',
      estadoCivil: '',
      profissao: '',
      endereco: '',
      nregistro:'',
      complemento: '',
      municipio: '',
      estado: '',
      cep: ''
    });
    setContactFiles([]);
  };

  // Carregar empresas do Firestore
  useEffect(() => {
    const carregarEmpresas = async () => {
      try {
        const colecao = new Colecao();
        const empresasData = await colecao.consultar('empresasProcuracao');
        const empresasCarregadas = empresasData.map((empresa: any) => ({
          id: empresa.id,
          nomeEmpresa: empresa.nomeEmpresa,
          quantidadeProcuradores: empresa.quantidadeProcuradores,
          procuradores: empresa.procuradores || []
        } as Empresa));
        setEmpresas(empresasCarregadas);
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
      }
    };
    carregarEmpresas();
  }, []);

  // Função para gerar ID aleatório de 8 dígitos
  const gerarIdEmpresa = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  // Função para salvar empresa
  const salvarEmpresa = async () => {
    if (!novaEmpresa.nomeEmpresa) {
      alert('Por favor, preencha o nome da empresa');
      return;
    }

    if (novaEmpresa.procuradores.length !== novaEmpresa.quantidadeProcuradores) {
      alert('Por favor, preencha todos os dados dos procuradores');
      return;
    }

    try {
      setIsLoadingContact(true);
      
      // Gerar ID automaticamente se não existir
      const idEmpresa = novaEmpresa.id || gerarIdEmpresa();
      
      const colecao = new Colecao();
      const empresaParaSalvar = {
        ...novaEmpresa,
        id: idEmpresa,
        dataCriacao: Timestamp.fromDate(new Date())
      };

      await colecao.salvar('empresasProcuracao', empresaParaSalvar, idEmpresa);

      setEmpresas(prev => [...prev, empresaParaSalvar]);
      alert('Empresa cadastrada com sucesso!');
      setEmpresaDialogOpen(false);
      resetEmpresaForm();
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      alert('Erro ao salvar empresa. Tente novamente.');
    } finally {
      setIsLoadingContact(false);
    }
  };

  // Função para resetar formulário de empresa
  const resetEmpresaForm = () => {
    setNovaEmpresa({
      id: '',
      nomeEmpresa: '',
      quantidadeProcuradores: 1,
      procuradores: []
    });
    setProcuradorEditIndex(0);
    setEmpresaProcuradorFiles({});
  };

  // Função para abrir dialog de exclusão
  const abrirDialogExclusao = (empresa: Empresa, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmpresaParaExcluir(empresa);
    setEmpresaDeleteDialogOpen(true);
  };

  // Função para confirmar exclusão
  const confirmarExclusaoEmpresa = async () => {
    if (!empresaParaExcluir) return;

    try {
      setIsLoadingContact(true);
      const colecao = new Colecao();
      await colecao.excluir('empresasProcuracao', empresaParaExcluir.id);

      setEmpresas(prev => prev.filter(e => e.id !== empresaParaExcluir.id));

      if (empresaSelecionada?.id === empresaParaExcluir.id) {
        setEmpresaSelecionada(null);
      }

      setEmpresaDeleteDialogOpen(false);
      setEmpresaParaExcluir(null);
      alert('Empresa excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      alert('Erro ao excluir empresa. Tente novamente.');
    } finally {
      setIsLoadingContact(false);
    }
  };

  // Função para abrir dialog de edição
  const abrirDialogEdicao = (empresa: Empresa, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmpresaParaEditar(empresa);
    setNovaEmpresa({
      id: empresa.id,
      nomeEmpresa: empresa.nomeEmpresa,
      quantidadeProcuradores: empresa.quantidadeProcuradores,
      procuradores: [...empresa.procuradores]
    });
    setEmpresaEditDialogOpen(true);
  };

  // Função para salvar edição de empresa
  const salvarEdicaoEmpresa = async () => {
    if (!novaEmpresa.id || !novaEmpresa.nomeEmpresa) {
      alert('Por favor, preencha o ID e o nome da empresa');
      return;
    }

    if (novaEmpresa.procuradores.length !== novaEmpresa.quantidadeProcuradores) {
      alert('Por favor, preencha todos os dados dos procuradores');
      return;
    }

    try {
      setIsLoadingContact(true);
      const colecao = new Colecao();
      const empresaAtualizada = {
        ...novaEmpresa,
        ultimaAtualizacao: Timestamp.fromDate(new Date())
      };

      await colecao.salvar('empresasProcuracao', empresaAtualizada, novaEmpresa.id);

      setEmpresas(prev => prev.map(e => e.id === novaEmpresa.id ? empresaAtualizada : e));

      if (empresaSelecionada?.id === novaEmpresa.id) {
        setEmpresaSelecionada(empresaAtualizada);
      }

      alert('Empresa atualizada com sucesso!');
      setEmpresaEditDialogOpen(false);
      setEmpresaParaEditar(null);
      resetEmpresaForm();
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      alert('Erro ao atualizar empresa. Tente novamente.');
    } finally {
      setIsLoadingContact(false);
    }
  };

  // Função para processar arquivos de procurador da empresa com IA
  const processEmpresaProcuradorWithAI = async (file: File, procuradorIndex: number) => {
    setProcessingImage(true);
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!geminiKey) {
      console.warn('Chave da API Gemini não configurada. Processamento de IA desabilitado.');
      setProcessingImage(false);
      return;
    }

    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      const prompt = `Extraia dados pessoais em JSON, incluindo o NÚMERO DE REGISTRO (campo nregistro). Procure por: nome, CPF, CNPJ, RG, número de registro, nacionalidade, estado civil, profissão, endereço completo. Formato: {"nome": "", "cpf": "", "cnpj": "", "rg": "", "nregistro": "", "nacionalidade": "", "estadoCivil": "", "profissao": "", "endereco": "", "complemento": "", "bairro": "", "municipio": "", "estado": "", "cep": ""}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: file.type, data: base64 } }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            console.log(`Dados extraídos do procurador ${procuradorIndex + 1} da empresa:`, data);

            setNovaEmpresa(prev => {
              const procuradoresAtualizados = [...prev.procuradores];
              if (!procuradoresAtualizados[procuradorIndex]) {
                procuradoresAtualizados[procuradorIndex] = {
                  id: `proc-${procuradorIndex + 1}`,
                  cpfCnpj: '',
                  nome: '',
                  rg: '',
                  nacionalidade: 'brasileiro',
                  estadoCivil: '',
                  profissao: '',
                  nregistro: '',
                  endereco: '',
                  complemento: '',
                  municipio: '',
                  estado: '',
                  cep: ''
                };
              }

              if (data.nome) procuradoresAtualizados[procuradorIndex].nome = data.nome.toUpperCase();
              if (data.cpf) procuradoresAtualizados[procuradorIndex].cpfCnpj = data.cpf.replace(/\D/g, '');
              if (data.cnpj) procuradoresAtualizados[procuradorIndex].cpfCnpj = data.cnpj.replace(/\D/g, '');
              if (data.rg) procuradoresAtualizados[procuradorIndex].rg = data.rg.toString();
              if (data.nregistro) {
                procuradoresAtualizados[procuradorIndex].nregistro = data.nregistro.toString();
                console.log(`✅ Número de registro preenchido: ${data.nregistro}`);
              }
              if (data.nacionalidade) procuradoresAtualizados[procuradorIndex].nacionalidade = data.nacionalidade.toLowerCase();
              if (data.estadoCivil) procuradoresAtualizados[procuradorIndex].estadoCivil = data.estadoCivil.toUpperCase();
              if (data.profissao) procuradoresAtualizados[procuradorIndex].profissao = data.profissao.toUpperCase();
              if (data.endereco) procuradoresAtualizados[procuradorIndex].endereco = data.endereco.toUpperCase();
              if (data.complemento || data.bairro) procuradoresAtualizados[procuradorIndex].complemento = (data.complemento || data.bairro || '').toUpperCase();
              if (data.municipio) procuradoresAtualizados[procuradorIndex].municipio = data.municipio.toUpperCase();
              if (data.estado) procuradoresAtualizados[procuradorIndex].estado = data.estado.toUpperCase();
              if (data.cep) {
                const cepLimpo = data.cep.replace(/\D/g, '');
                procuradoresAtualizados[procuradorIndex].cep = cepLimpo;
                if (cepLimpo.length === 8 && !data.endereco) {
                  setTimeout(() => fetchAddressFromCEPEmpresa(cepLimpo, procuradorIndex), 500);
                }
              }

              return {
                ...prev,
                procuradores: procuradoresAtualizados
              };
            });
          }
        }
      } else {
        const errorText = await response.text().catch(() => 'Erro desconhecido');
        console.error(`Erro na requisição para IA: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error(`Erro ao processar arquivo do procurador ${procuradorIndex + 1} da empresa:`, error);
    } finally {
      setProcessingImage(false);
    }
  };

  // Função para lidar com upload de arquivos de procurador da empresa
  const handleEmpresaProcuradorFileChange = (e: React.ChangeEvent<HTMLInputElement>, procuradorIndex: number) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);

    setEmpresaProcuradorFiles(prev => ({
      ...prev,
      [procuradorIndex]: [...(prev[procuradorIndex] || []), ...selectedFiles]
    }));

    if (selectedFiles.length > 0) {
      processEmpresaProcuradorWithAI(selectedFiles[0], procuradorIndex);
    }
  };

  // Função para buscar endereço por CEP (para procuradores da empresa)
  const fetchAddressFromCEPEmpresa = async (cep: string, procuradorIndex: number) => {
    try {
      const cepLimpo = cep.replace(/\D/g, '');
      if (cepLimpo.length !== 8) return;

      console.log(`Buscando endereço para CEP: ${cepLimpo} - Procurador ${procuradorIndex + 1} da empresa`);

      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        console.log('Dados do ViaCEP:', data);

        setNovaEmpresa(prev => {
          const procuradoresAtualizados = [...prev.procuradores];
          if (!procuradoresAtualizados[procuradorIndex]) {
            procuradoresAtualizados[procuradorIndex] = {
              id: `proc-${procuradorIndex + 1}`,
              cpfCnpj: '',
              nome: '',
              rg: '',
              nacionalidade: 'brasileiro',
              estadoCivil: '',
              profissao: '',
              nregistro:'',
              endereco: '',
              complemento: '',
              municipio: '',
              estado: '',
              cep: ''
            };
          }

          procuradoresAtualizados[procuradorIndex].endereco = data.logradouro || '';
          procuradoresAtualizados[procuradorIndex].complemento = data.bairro || '';
          procuradoresAtualizados[procuradorIndex].municipio = data.localidade || '';
          procuradoresAtualizados[procuradorIndex].estado = data.uf || '';

          return {
            ...prev,
            procuradores: procuradoresAtualizados
          };
        });
      } else {
        console.warn('CEP não encontrado no ViaCEP');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP no ViaCEP:', error);
    }
  };

  // Função para selecionar empresa e preencher dados no formulário
  const selecionarEmpresa = (empresa: Empresa) => {
    setEmpresaSelecionada(empresa);
    setQuantidadeProcuradores(empresa.quantidadeProcuradores);

    // Preencher dados dos procuradores no formulário principal
    empresa.procuradores.forEach((proc, index) => {
      const suffix = index === 0 ? '' : (index + 1).toString();
      setNewItem(prev => ({
        ...prev,
        [`nomeProcurador${suffix}`]: proc.nome,
        [`cpfProcurador${suffix}`]: proc.cpfCnpj.replace(/\D/g, ''),
        [`rgProcurador${suffix}`]: proc.rg,
        [`nregistroProcurador${suffix}`]: proc.nregistro,
        [`nacionalidadeProcurador${suffix}`]: proc.nacionalidade,
        [`estadoCivilProcurador${suffix}`]: proc.estadoCivil,
        [`profissaoProcurador${suffix}`]: proc.profissao,
        [`enderecoProcurador${suffix}`]: proc.endereco,
        [`complementoProcurador${suffix}`]: proc.complemento,
        [`municipioProcurador${suffix}`]: proc.municipio,
        [`estadoProcuradorEnd${suffix}`]: proc.estado,
        [`cepProcurador${suffix}`]: proc.cep
      }));
    });
  };

  // Função para adicionar procurador à nova empresa
  const adicionarProcuradorEmpresa = (procurador: ProcuradorEmpresa) => {
    setNovaEmpresa(prev => ({
      ...prev,
      procuradores: [...prev.procuradores, procurador]
    }));
  };

  // Função para atualizar procurador da nova empresa
  const atualizarProcuradorEmpresa = (index: number, campo: keyof ProcuradorEmpresa, valor: string) => {
    setNovaEmpresa(prev => {
      const procuradoresAtualizados = [...prev.procuradores];
      if (!procuradoresAtualizados[index]) {
        procuradoresAtualizados[index] = {
          id: `proc-${index + 1}`,
          cpfCnpj: '',
          nome: '',
          rg: '',
          nacionalidade: 'brasileiro',
          estadoCivil: '',
          profissao: '',
          nregistro:'',
          endereco: '',
          complemento: '',
          municipio: '',
          estado: '',
          cep: ''
        };
      }
      procuradoresAtualizados[index] = {
        ...procuradoresAtualizados[index],
        [campo]: valor
      };
      return {
        ...prev,
        procuradores: procuradoresAtualizados
      };
    });
  };

  // Função para buscar endereço por CEP
  const fetchAddressFromCEP = async (cep: string, fieldType: string) => {
    try {
      const cepLimpo = cep.replace(/\D/g, '');
      if (cepLimpo.length !== 8) return;

      console.log(`Buscando endereço para CEP: ${cepLimpo} - Tipo: ${fieldType}`);

      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        console.log('Dados do ViaCEP:', data);

        setNewItem(prev => {
          const updated = { ...prev };

          if (fieldType === 'cepProprietario') {
            updated.enderecoProprietario = data.logradouro || '';
            updated.complementoProprietario = data.bairro || '';
            updated.municipioProprietario = data.localidade || '';
            updated.estadoProprietario = data.uf || '';
          } else if (fieldType === 'cepEmpresaJuridico') {
            updated.enderecoEmpresaJuridico = data.logradouro || '';
            updated.bairroEmpresaJuridico = data.bairro || '';
            updated.municipioEmpresaJuridico = data.localidade || '';
            updated.estadoEmpresaJuridico = data.uf || '';
          } else if (fieldType === 'cepProcurador') {
            updated.enderecoProcurador = data.logradouro || '';
            updated.complementoProcurador = data.bairro || '';
            updated.municipioProcurador = data.localidade || '';
            updated.estadoProcuradorEnd = data.uf || '';
          } else if (fieldType === 'cepProcurador2') {
            updated.enderecoProcurador2 = data.logradouro || '';
            updated.complementoProcurador2 = data.bairro || '';
            updated.municipioProcurador2 = data.localidade || '';
            updated.estadoProcuradorEnd2 = data.uf || '';
          } else if (fieldType === 'cepProcurador3') {
            updated.enderecoProcurador3 = data.logradouro || '';
            updated.complementoProcurador3 = data.bairro || '';
            updated.municipioProcurador3 = data.localidade || '';
            updated.estadoProcuradorEnd3 = data.uf || '';
          } else if (fieldType === 'cepProcurador4') {
            updated.enderecoProcurador4 = data.logradouro || '';
            updated.complementoProcurador4 = data.bairro || '';
            updated.municipioProcurador4 = data.localidade || '';
            updated.estadoProcuradorEnd4 = data.uf || '';
          } else if (fieldType === 'cepProcurador5') {
            updated.enderecoProcurador5 = data.logradouro || '';
            updated.complementoProcurador5 = data.bairro || '';
            updated.municipioProcurador5 = data.localidade || '';
            updated.estadoProcuradorEnd5 = data.uf || '';
          }

          console.log('Campos atualizados com ViaCEP:', updated);
          return updated;
        });
      } else {
        console.warn('CEP não encontrado no ViaCEP');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP no ViaCEP:', error);
    }
  };

  // Função para buscar dados da empresa por CNPJ
  const fetchEmpresaDataByCNPJ = async (cnpj: string) => {
    try {
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      if (cnpjLimpo.length !== 14) return;

      console.log('Buscando dados da empresa por CNPJ:', cnpjLimpo);

      const response = await fetch(`/api/cnpj?cnpj=${cnpjLimpo}`);

      if (response.ok) {
        const data = await response.json();
        console.log('Dados da empresa:', data);

        setNewItem(prev => ({
          ...prev,
          nomeEmpresaJuridico: data.nome?.toUpperCase() || '',
          enderecoEmpresaJuridico: data.endereco?.logradouro?.toUpperCase() || '',
          bairroEmpresaJuridico: data.endereco?.bairro?.toUpperCase() || '',
          municipioEmpresaJuridico: data.endereco?.municipio?.toUpperCase() || '',
          estadoEmpresaJuridico: data.endereco?.uf?.toUpperCase() || '',
          cepEmpresaJuridico: data.endereco?.cep?.replace(/\D/g, '') || ''
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error);
    }
  };

  // Função para processar imagens com IA
  const processImageWithAI = async (file: File, section: string) => {
    setProcessingImage(true);
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!geminiKey) {
      console.warn('Chave da API Gemini não configurada. Processamento de IA desabilitado.');
      setProcessingImage(false);
      return;
    }

    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      let prompt = '';
      if (section === 'veiculo') {
        prompt = `Analise este documento de veículo (CRV/CRLV) e extraia TODOS os dados possíveis em JSON, INCLUINDO os dados do PROPRIETÁRIO/VENDEDOR. Procure por:

        DADOS DO VEÍCULO: placa, renavam, chassi, modelo, marca, ano fabricação, ano modelo, cor, combustível, categoria, espécie, valor de venda ou IPVA.

        DADOS DO PROPRIETÁRIO/VENDEDOR: nome completo do proprietário, CPF do proprietário, endereço se houver.

        IMPORTANTE: Extraia "anoFabricacao" e "anoModelo" separadamente. Se houver apenas um ano, use-o para ambos. Para combustível, identifique o tipo (GASOLINA, ALCOOL, FLEX, DIESEL, GNV, etc).

        Formato JSON completo: {"placa": "", "renavam": "", "crv": "", "chassi": "", "modelo": "", "valordevenda": "", "anoFabricacao": "", "anoModelo": "", "cor": "", "combustivel": "", "marca": "", "nomeVendedor": "", "cpfVendedor": "", "enderecoVendedor": ""}`;
      } else if (section === 'empresa_juridico') {
        prompt = `Analise este documento empresarial (Cartão CNPJ, Contrato Social ou Comprovante de Inscrição) e extraia TODOS os dados em JSON. Procure especificamente por: CNPJ, razão social, nome fantasia, endereço completo (logradouro, número, complemento, bairro, município, estado, CEP), atividade principal, situação cadastral, data de abertura. Formato: {"cnpj": "", "razaoSocial": "", "nomeFantasia": "", "endereco": "", "bairro": "", "municipio": "", "estado": "", "cep": "", "atividadePrincipal": "", "situacao": "", "dataAbertura": ""}`;
      } else if (section === 'socio_administrador') {
        prompt = `Analise este documento pessoal (RG/CPF/CNH) do sócio administrador e extraia TODOS os dados em JSON. Procure por: nome completo, CPF, RG, nacionalidade, data de nascimento, estado civil, profissão, endereço completo se houver. Formato: {"nome": "", "cpf": "", "rg": "", "nacionalidade": "", "dataNascimento": "", "estadoCivil": "", "profissao": "", "endereco": "", "complemento": "", "municipio": "", "estado": "", "cep": ""}`;
      } else if (section === 'vendedor') {
        prompt = `Analise este documento pessoal (RG/CPF/CNH) e extraia TODOS os dados em JSON. Procure por: nome completo, CPF, RG, data de nascimento, endereço se houver. Formato: {"nome": "", "cpf": "", "rg": "", "endereco": "", "dataNascimento": ""}`;
      } else if (section === 'comprador_doc') {
        prompt = `Analise este documento pessoal (RG/CPF/CNH) e extraia TODOS os dados em JSON. Procure por: nome completo, CPF, RG, data de nascimento, endereço se houver. Formato: {"nome": "", "cpf": "", "rg": "", "endereco": "", "dataNascimento": ""}`;
      } else if (section === 'comprador_conta') {
        prompt = `Analise este comprovante de residência (Conta de Água/Luz) e extraia o endereço completo em JSON. Procure por: logradouro, número, complemento, bairro, município, estado, CEP. Formato: {"endereco": "", "complemento": "", "bairro": "", "municipio": "", "estado": "", "cep": ""}`;
      } else if (section === 'procurador_doc') {
        prompt = `Analise este documento pessoal (RG/CPF/CNH) do procurador e extraia TODOS os dados em JSON. Procure por: nome completo, CPF, RG, nacionalidade, data de nascimento, estado civil, profissão. Formato: {"nome": "", "cpf": "", "rg": "", "nacionalidade": "", "dataNascimento": "", "estadoCivil": "", "profissao": ""}`;
      } else if (section === 'procurador_conta') {
        prompt = `Analise este comprovante de residência (Conta de Água/Luz) do procurador e extraia o endereço completo em JSON. Procure por: logradouro, número, complemento, bairro, município, estado, CEP. Formato: {"endereco": "", "complemento": "", "bairro": "", "municipio": "", "estado": "", "cep": ""}`;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: file.type, data: base64 } }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            fillFieldsFromAI(data, section);
          }
        }
      } else {
        const errorText = await response.text().catch(() => 'Erro desconhecido');
        console.error(`Erro na requisição para IA: ${response.status} - ${errorText}`);
        alert(`Erro ao processar imagem: ${response.status} - Verifique o console para detalhes.`);
      }
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      alert('Ocorreu um erro inesperado ao processar a imagem.');
    } finally {
      setProcessingImage(false);
    }
  };

  // Função para extrair CEP de um endereço string
  const extractCEPFromAddress = (address: string): string | null => {
    if (!address) return null;
    const cepMatch = address.match(/(\d{5})-?(\d{3})/);
    return cepMatch ? cepMatch[0].replace('-', '') : null;
  };

  // Função para preencher campos (melhorada)
  const fillFieldsFromAI = (data: any, section: string) => {
    console.log(`Dados extraídos da seção ${section}:`, data);

    setNewItem(prev => {
      const updated = { ...prev };

      if (section === 'empresa_juridico') {
        // Preencher dados da empresa
        if (data.cnpj) updated.cnpjEmpresaJuridico = data.cnpj.replace(/\D/g, '');
        if (data.razaoSocial) updated.nomeEmpresaJuridico = data.razaoSocial.toUpperCase();
        if (data.nomeFantasia && !updated.nomeEmpresaJuridico) {
          updated.nomeEmpresaJuridico = data.nomeFantasia.toUpperCase();
        }

        // Extrair CEP e usar ViaCEP
        if (data.endereco || data.cep) {
          const cep = data.cep ? data.cep.replace(/\D/g, '') : extractCEPFromAddress(data.endereco);
          if (cep && cep.length === 8) {
            updated.cepEmpresaJuridico = cep;
            setTimeout(() => fetchAddressFromCEPEmpresaJuridico(cep), 500);
          }
        }

        // Usar dados individuais se fornecidos diretamente
        if (data.bairro) updated.bairroEmpresaJuridico = data.bairro.toUpperCase();
        if (data.municipio) updated.municipioEmpresaJuridico = data.municipio.toUpperCase();
        if (data.estado) updated.estadoEmpresaJuridico = data.estado.toUpperCase();
      } else if (section === 'socio_administrador') {
        // Preencher dados do sócio administrador
        if (data.nome) updated.nomeSocioAdministrador = data.nome.toUpperCase();
        if (data.cpf) updated.cpfSocioAdministrador = data.cpf.replace(/\D/g, '');
        if (data.rg) updated.rgSocioAdministrador = data.rg;
        if (data.nacionalidade) updated.nacionalidadeSocioAdministrador = data.nacionalidade;
        if (data.estadoCivil) updated.estadoCivilSocioAdministrador = data.estadoCivil;
        if (data.profissao) updated.profissaoSocioAdministrador = data.profissao;

        // Extrair CEP e usar ViaCEP
        if (data.endereco || data.cep) {
          const cep = data.cep ? data.cep.replace(/\D/g, '') : extractCEPFromAddress(data.endereco);
          if (cep && cep.length === 8) {
            updated.cepSocioAdministrador = cep;
            setTimeout(() => fetchAddressFromCEPSocioAdmin(cep), 500);
          }
        }
      } else if (section === 'veiculo') {
        if (data.placa) {
          const placaLimpa = data.placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
          updated.id = placaLimpa;
          updated.placa = placaLimpa;
        }
        if (data.renavam) updated.renavam = data.renavam.toString().replace(/\D/g, '');
        if (data.crv) updated.crv = data.crv.toString().replace(/\D/g, '');
        if (data.chassi) updated.chassi = data.chassi.toUpperCase();
        if (data.modelo) updated.modelo = data.modelo.toUpperCase();

        // Mapear "ano" para anoFabricacao e anoModelo se não vier separado
        if (data.anoFabricacao) {
          updated.anoFabricacao = data.anoFabricacao.toString();
        } else if (data.ano) {
          updated.anoFabricacao = data.ano.toString();
        }

        if (data.anoModelo) {
          updated.anoModelo = data.anoModelo.toString();
        } else if (data.ano) {
          updated.anoModelo = data.ano.toString();
        }

        if (data.cor) updated.cor = data.cor.toUpperCase();
        if (data.combustivel) updated.combustivel = data.combustivel.toUpperCase();
      } else if (section === 'proprietario_doc') {
        if (data.nome) updated.nomeProprietario = data.nome.toUpperCase();
        if (data.cpf) updated.cpfProprietario = data.cpf.replace(/\D/g, '');
        if (data.rg) updated.rgProprietario = data.rg.toString();
        if (data.dataNascimento) updated.dataNascimentoProprietario = data.dataNascimento;
        if (data.nomePai) updated.nomePaiProprietario = data.nomePai.toUpperCase();
        if (data.nomeMae) updated.nomeMaeProprietario = data.nomeMae.toUpperCase();
      } else if (section === 'proprietario_conta') {
        if (data.endereco) updated.enderecoProprietario = data.endereco.toUpperCase();
        if (data.bairro) updated.complementoProprietario = data.bairro.toUpperCase();
        if (data.municipio) updated.municipioProprietario = data.municipio.toUpperCase();
        if (data.cep) updated.cepProprietario = data.cep.replace(/\D/g, '');
        if (data.estado) updated.estadoProprietario = data.estado.toUpperCase();
      } else if (section === 'procurador_doc') {
        if (data.nome) updated.nomeProcurador = data.nome.toUpperCase();
        if (data.cpf) updated.cpfProcurador = data.cpf.replace(/\D/g, '');
        if (data.rg) updated.rgProcurador = data.rg.toString();
         if (data.nregistro) updated.nregistroProcurador = data.rg.toString();
        if (data.estadoCivil) updated.estadoCivilProcurador = data.estadoCivil.toUpperCase();
        if (data.profissao) updated.profissaoProcurador = data.profissao.toUpperCase();
      } else if (section === 'procurador_conta') {
        if (data.endereco) updated.enderecoProcurador = data.endereco.toUpperCase();
        if (data.bairro) updated.complementoProcurador = data.bairro.toUpperCase();
        if (data.municipio) updated.municipioProcurador = data.municipio.toUpperCase();
        if (data.cep) updated.cepProcurador = data.cep.replace(/\D/g, '');
        if (data.estado) updated.estadoProcuradorEnd = data.estado.toUpperCase();
      }
      return updated;
    });
  };

  // Handlers para uploads
  const handleVeiculoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setVeiculoFiles(prev => [...prev, ...selectedFiles]);
    if (selectedFiles.length > 0) {
      processImageWithAI(selectedFiles[0], 'veiculo');
    }
  };

  const handleProprietarioDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setProprietarioDocFiles(prev => [...prev, ...selectedFiles]);
    if (selectedFiles.length > 0) {
      processProprietarioWithAI(selectedFiles[0]);
    }
  };

  const handleProprietarioContaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setProprietarioContaFiles(prev => [...prev, ...selectedFiles]);
    if (selectedFiles.length > 0) {
      processProprietarioWithAI(selectedFiles[0]);
    }
  };

  const handleProcuradorDocFileChange = (e: React.ChangeEvent<HTMLInputElement>, procuradorNumber: number = 1) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setProcuradorDocFiles(prev => [...prev, ...selectedFiles]);
    if (selectedFiles.length > 0) {
      processProcuradorWithAI(selectedFiles[0], procuradorNumber);
    }
  };

  const handleProcuradorContaFileChange = (e: React.ChangeEvent<HTMLInputElement>, procuradorNumber: number = 1) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setProcuradorContaFiles(prev => [...prev, ...selectedFiles]);
    if (selectedFiles.length > 0) {
      processProcuradorWithAI(selectedFiles[0], procuradorNumber);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => uniqueFiles([...prev, ...selectedFiles]));
  };

  // Função para alterar dados do contato
  const handleContactChange = (field: string, value: string) => {
    setContactData(prev => ({ ...prev, [field]: value }));

    // Busca automática por CEP para contatos
    if (field === 'cep' && value.replace(/\D/g, '').length === 8) {
      fetchAddressFromCEPContact(value.replace(/\D/g, ''));
    }
  };

  // Função para buscar endereço por CEP (para contatos)
  const fetchAddressFromCEPContact = async (cep: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setContactData(prev => ({
          ...prev,
          endereco: data.logradouro || '',
          complemento: data.bairro || '',
          municipio: data.localidade || '',
          estado: data.uf || ''
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Item
  ) => {
    let { value } = e.target;
    setNewItem(prev => {
      const updated = { ...prev };
      if (field === 'placa') {
        updated.id = value.toUpperCase();
        updated[field] = value.toUpperCase();
        return updated;
      }

      // Busca automática por CEP
      const camposCep: (keyof Item)[] = [
        'cepProprietario',
        'cepProcurador',
        'cepProcurador2',
        'cepProcurador3',
        'cepProcurador4',
        'cepProcurador5',
        'cepEmpresaJuridico', // Adicionado para empresa jurídica
        'cepSocioAdministrador' // Adicionado para sócio administrador
      ];
      if (camposCep.includes(field)) {
        const cepLimpo = value.replace(/\D/g, '');
        if (cepLimpo.length === 8) {
          // Mapear field para a função de busca correta
          if (field === 'cepEmpresaJuridico') {
            setTimeout(() => fetchAddressFromCEPEmpresaJuridico(cepLimpo), 500);
          } else if (field === 'cepSocioAdministrador') {
            setTimeout(() => fetchAddressFromCEPSocioAdmin(cepLimpo), 500);
          } else {
            setTimeout(() => fetchAddressFromCEP(cepLimpo, field as string), 500);
          }
        }
      }

      const camposCpfCnpj: (keyof Item)[] = [
        'cpfProprietario',
        'cpfProcurador',
        'cpfProcurador2',
        'cpfProcurador3',
        'cpfProcurador4',
        'cpfProcurador5',
        'cpfSocioAdministrador' // Adicionado para sócio administrador
      ];
      if (camposCpfCnpj.includes(field)) {
        const raw = value.replace(/\D/g, '');
        const formatado = formatCpfCnpj(raw);
        // Salvar apenas números no estado
        (updated as Record<keyof Item, any>)[field] = raw;

        setTimeout(() => {
          const input = document.querySelector(`input[name="${field}"]`) as HTMLInputElement;
          if (input) input.value = formatado;
        }, 0);

        if (isValidCpfCnpj(raw)) {
          const target =
            field === 'cpfProprietario' ? 'nomeProprietario' :
            field === 'cpfProcurador' ? 'nomeProcurador' :
            field === 'cpfProcurador2' ? 'nomeProcurador2' :
            field === 'cpfProcurador3' ? 'nomeProcurador3' :
            field === 'cpfProcurador4' ? 'nomeProcurador4' :
            field === 'cpfProcurador5' ? 'nomeProcurador5' :
            field === 'cpfSocioAdministrador' ? 'nomeSocioAdministrador' :
            'nomeProcurador'; // Fallback

          // Busca automática aprimorada que preenche todos os campos disponíveis
          const searchWithAllFields = async (doc: string, targetField: string) => {
            try {
              const cleaned = doc.replace(/\D/g, '');
              if (cleaned.length !== 11 && cleaned.length !== 14) return;

              const tipo = cleaned.length === 14 ? 'cnpj' : 'cpf';
              const response = await fetch(`/api/${tipo}?${tipo}=${cleaned}`);

              if (response.ok) {
                const data = await response.json();

                setNewItem(prev => {
                  const updated = { ...prev };

                  // Preencher nome
                  if (data.nome) {
                    (updated as any)[targetField] = data.nome.toUpperCase();
                  }

                  // Para CNPJ, preencher endereço se disponível
                  if (tipo === 'cnpj' && data.endereco) {
                    const suffix = field.replace('cpf', '').replace('Proprietario', '').replace('Procurador', '').replace('SocioAdministrador', '');
                    const enderecoField = `endereco${field.includes('Proprietario') ? 'Proprietario' : field.includes('SocioAdministrador') ? 'SocioAdministrador' : 'Procurador'}${suffix}`;
                    const bairroField = `bairro${field.includes('Proprietario') ? 'Proprietario' : field.includes('SocioAdministrador') ? 'SocioAdministrador' : 'Procurador'}${suffix}`;
                    const municipioField = `municipio${field.includes('Proprietario') ? 'Proprietario' : field.includes('SocioAdministrador') ? 'SocioAdministrador' : 'Procurador'}${suffix}`;
                    const estadoField = field.includes('Proprietario') ? `estadoProprietario` : field.includes('SocioAdministrador') ? `estadoSocioAdministrador` : `estadoProcuradorEnd${suffix}`;
                    const cepField = `cep${field.includes('Proprietario') ? 'Proprietario' : field.includes('SocioAdministrador') ? 'SocioAdministrador' : 'Procurador'}${suffix}`;

                    if (data.endereco.logradouro) (updated as any)[enderecoField] = data.endereco.logradouro.toUpperCase();
                    if (data.endereco.bairro) (updated as any)[bairroField] = data.endereco.bairro.toUpperCase();
                    if (data.endereco.municipio) (updated as any)[municipioField] = data.endereco.municipio.toUpperCase();
                    if (data.endereco.uf) (updated as any)[estadoField] = data.endereco.uf.toUpperCase();
                    if (data.endereco.cep) (updated as any)[cepField] = data.endereco.cep.replace(/\D/g, '');
                  }

                  return updated;
                });
              }
            } catch (error) {
              console.error('Erro na busca automática:', error);
              // Fallback para busca simples apenas do nome
              debouncedSearch(doc, targetField, setNewItem);
            }
          };

          searchWithAllFields(raw, target);
        }
      }
      (updated as Record<keyof Item, any>)[field] = value;
      return updated;
    });
  };

  // Camera handling
  useEffect(() => {
    if (cameraOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [cameraOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      alert("Não foi possível acessar a câmera. Por favor, verifique as permissões.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (!context) return;

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          // Determinar qual estado de arquivo atualizar com base na seção ativa (se possível)
          // Por enquanto, adiciona ao arquivo geral
          setFiles(prev => [...prev, file]);
          setCameraOpen(false);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const openCropDialog = (index: number, fileType: 'geral' | 'veiculo' | 'proprietario_doc' | 'proprietario_conta' | 'procurador_doc' | 'procurador_conta' | 'empresa_juridico' | 'socio_administrador') => {
    let fileToCrop: File | undefined;
    switch (fileType) {
      case 'geral': fileToCrop = files[index]; break;
      case 'veiculo': fileToCrop = veiculoFiles[index]; break;
      case 'proprietario_doc': fileToCrop = proprietarioDocFiles[index]; break;
      case 'proprietario_conta': fileToCrop = proprietarioContaFiles[index]; break;
      case 'procurador_doc': fileToCrop = procuradorDocFiles[index]; break;
      case 'procurador_conta': fileToCrop = procuradorContaFiles[index]; break;
      case 'empresa_juridico': fileToCrop = empresaFiles[index]; break;
      case 'socio_administrador': fileToCrop = socioAdministradorFiles[index]; break;
      default: break;
    }

    if (!fileToCrop) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setCurrentImageIndex(index);
      setCropOpen(true);
    };
    reader.readAsDataURL(fileToCrop);
  };

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const cropImage = async () => {
    try {
      if (!imageToCrop || currentImageIndex === null || !croppedAreaPixels) return;

      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const blob = await fetch(croppedImage).then(r => r.blob());
      const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });

      // Atualizar o estado de arquivos correto
      // Esta parte precisa ser adaptada para saber qual estado de arquivo atualizar
      // Por ora, assumimos que é o arquivo geral
      setFiles(prev => prev.map((f, i) => i === currentImageIndex ? file : f));

      setCropOpen(false);
    } catch (e) {
      console.error('Erro ao cortar imagem:', e);
      alert('Ocorreu um erro ao processar a imagem. Por favor, tente novamente.');
    }
  };

  const uploadFiles = async (): Promise<string[]> => {
    const allFiles = [...files, ...veiculoFiles, ...proprietarioDocFiles, ...proprietarioContaFiles, ...procuradorDocFiles, ...procuradorContaFiles, ...empresaFiles, ...socioAdministradorFiles];
    const toUpload = uniqueFiles(allFiles);
    if (toUpload.length === 0) return [];

    setIsLoading(true);
    try {
      const uploadPromises = toUpload.map(async (file) => {
        const k = fileSig(file);
        const cached = uploadCacheRef.current.get(k);
        if (cached) return cached;

        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
        const fileName = `${timestamp}-${sanitizedName}`;
        const storageRef = ref(storage, `uploads/procuracao/${fileName}`);

        const metadata = {
          contentType: file.type,
          customMetadata: {
            'originalName': file.name,
            'uploadedAt': new Date().toISOString(),
            'placa': newItem.id || 'sem-placa',
            'fileSignature': k
          }
        };

        const snap = await uploadBytes(storageRef, file, metadata);
        const url = await getDownloadURL(snap.ref);
        uploadCacheRef.current.set(k, url);
        return url;
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = async (): Promise<string | null> => {
    const input = document.getElementById('pdf-content');
    if (!input) return null;

    try {
      const canvas = await html2canvas(input, { scale: 2, useCORS: true, logging: false });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);

      const blob = pdf.output('blob');
      const fileName = `Procuracao_${newItem.id}_${Date.now()}.pdf`;
      const pdfRef = ref(storage, `pdfs/procuracao/${fileName}`);

      await uploadBytes(pdfRef, blob);
      const pdfURL = await getDownloadURL(pdfRef);
      return pdfURL;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return null;
    }
  };

  const formatDate = (date: string | Timestamp | undefined | null) => {
    if (!date) return 'Data inválida';
    let localDate;
    if (date instanceof Timestamp) {
      localDate = date.toDate();
    } else {
      localDate = new Date(date);
    }
    if (isNaN(localDate.getTime())) return 'Data inválida';
    const offsetMs = localDate.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(localDate.getTime() - offsetMs - 3 * 3600000);
    return format(adjustedDate, 'dd/MM/yyyy');
  };

  const handleAddItem = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setIsSubmitting(true);

    try {
      if (!newItem.id) {
        alert('ID do item (placa) não foi gerado corretamente. Por favor, recarregue a página.');
        return;
      }

      setIsLoading(true);
      const uploadedUrls = await uploadFiles();

      const itemParaSalvar = {
        ...newItem,
        imagemUrls: uploadedUrls,
        dataCriacao: Timestamp.fromDate(new Date()),
      };

      const docUuid = uuidv4();

      await setDoc(
        doc(db, 'Betodespachanteprocuracaoeletronica', docUuid),
        { ...itemParaSalvar, docUuid },
        { merge: true }
      );

      setItems(prev => [...prev, { ...itemParaSalvar, id: newItem.id, docUuid }]);

      const pdfURL = await generatePDF();
      const numeroWhatsApp = '5548988449379'; // Substitua pelo número desejado
      const mensagemInicial = `Olá! Tudo certo, a procuração eletrônica foi preenchida!\n\n📌 *Placa:* ${newItem.id}\n📄 *Documento:* ${pdfURL}`;

      window.location.href = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(mensagemInicial)}`;

      resetForm();

      setTimeout(() => {
        alert('Procuração eletrônica criada com sucesso! Os dados foram salvos.');
        if (onItemEnviado) onItemEnviado();
      }, 5000);
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      alert('Ocorreu um erro ao salvar a procuração. Tente novamente.');
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
      savingRef.current = false;
    }
  };

  // Função para renderizar texto dos procuradores no preview
  const gerarTextoProcuradores = () => {
    const procuradores = [];
    if (newItem.nomeProcurador) procuradores.push({ nome: newItem.nomeProcurador, cpf: newItem.cpfProcurador, rg: newItem.rgProcurador,nregistro: newItem.nregistroProcurador, nacionalidade: newItem.nacionalidadeProcurador, estadoCivil: newItem.estadoCivilProcurador, profissao: newItem.profissaoProcurador, endereco: newItem.enderecoProcurador, municipio: newItem.municipioProcurador, estado: newItem.estadoProcuradorEnd, cep: newItem.cepProcurador });
    if (newItem.nomeProcurador1) procuradores.push({ nome: newItem.nomeProcurador1, cpf: newItem.cpfProcurador1, rg: newItem.rgProcurador1,nregistro: newItem.nregistroProcurador1, nacionalidade: newItem.nacionalidadeProcurador1, estadoCivil: newItem.estadoCivilProcurador1, profissao: newItem.profissaoProcurador1, endereco: newItem.enderecoProcurador1, municipio: newItem.municipioProcurador1, estado: newItem.estadoProcuradorEnd1, cep: newItem.cepProcurador1 });
    if (newItem.nomeProcurador2) procuradores.push({ nome: newItem.nomeProcurador2, cpf: newItem.cpfProcurador2, rg: newItem.rgProcurador2,nregistro: newItem.nregistroProcurador2, nacionalidade: newItem.nacionalidadeProcurador2, estadoCivil: newItem.estadoCivilProcurador2, profissao: newItem.profissaoProcurador2, endereco: newItem.enderecoProcurador2, municipio: newItem.municipioProcurador2, estado: newItem.estadoProcuradorEnd2, cep: newItem.cepProcurador2 });
    if (newItem.nomeProcurador3) procuradores.push({ nome: newItem.nomeProcurador3, cpf: newItem.cpfProcurador3, rg: newItem.rgProcurador3,nregistro: newItem.nregistroProcurador3, nacionalidade: newItem.nacionalidadeProcurador3, estadoCivil: newItem.estadoCivilProcurador3, profissao: newItem.profissaoProcurador3, endereco: newItem.enderecoProcurador3, municipio: newItem.municipioProcurador3, estado: newItem.estadoProcuradorEnd3, cep: newItem.cepProcurador3 });
    if (newItem.nomeProcurador4) procuradores.push({ nome: newItem.nomeProcurador4, cpf: newItem.cpfProcurador4, rg: newItem.rgProcurador4,nregistro: newItem.nregistroProcurador4, nacionalidade: newItem.nacionalidadeProcurador4, estadoCivil: newItem.estadoCivilProcurador4, profissao: newItem.profissaoProcurador4, endereco: newItem.enderecoProcurador4, municipio: newItem.municipioProcurador4, estado: newItem.estadoProcuradorEnd4, cep: newItem.cepProcurador4 });
    if (newItem.nomeProcurador5) procuradores.push({ nome: newItem.nomeProcurador5, cpf: newItem.cpfProcurador5, rg: newItem.rgProcurador5,nregistro: newItem.nregistroProcurador5, nacionalidade: newItem.nacionalidadeProcurador5, estadoCivil: newItem.estadoCivilProcurador5, profissao: newItem.profissaoProcurador5, endereco: newItem.enderecoProcurador5, municipio: newItem.municipioProcurador5, estado: newItem.estadoProcuradorEnd5, cep: newItem.cepProcurador5 });

    if (procuradores.length === 0) {
      return '<strong style="color: #999">[NOME DO PROCURADOR]</strong>';
    }

    return procuradores.map((p, index) => {
      // Construir partes do texto apenas se os dados existirem
      let texto = '';

      // Separador com "e/ou" entre procuradores
      if (index > 0) {
        texto += ' <strong>e/ou</strong> ';
      }

      // Nome (obrigatório)
      texto += `<strong>${p.nome}</strong>`;

      // RG (opcional)
      if (p.rg) {
        texto += `, RG Nº <strong>${p.rg}</strong>`;
      }

      // CPF (opcional) - com formatação
      if (p.cpf) {
        texto += `, CPF Nº <strong>${formatCpfCnpj(p.cpf)}</strong>`;
      }

      // Número de Registro (opcional)
      if (p.nregistro) {
        texto += `, Nº de Registro <strong>${p.nregistro}</strong>`;
      }

      // Nacionalidade (com padrão)
      texto += `, nacionalidade <strong>${p.nacionalidade || 'brasileiro'}</strong>`;

      // Estado civil (opcional)
      if (p.estadoCivil) {
        texto += `, estado civil <strong>${p.estadoCivil}</strong>`;
      }

      // Profissão (opcional)
      if (p.profissao) {
        texto += `, profissão <strong>${p.profissao}</strong>`;
      }

      // Endereço completo (só se tiver ao menos município e estado)
      if (p.municipio && p.estado) {
        texto += ', residente ';
        if (p.endereco) {
          texto += `na <strong>${p.endereco}, ${p.municipio}/${p.estado}</strong>`;
        } else {
          texto += `em <strong>${p.municipio}/${p.estado}</strong>`;
        }
      }

      return texto;
    }).join('');
  };

  // Função para renderizar campos de procurador dinâmicos
  const renderProcurador = (numero: number) => {
    const suffix = numero === 1 ? '' : numero.toString();
    const cpfField = `cpfProcurador${suffix}` as keyof Item;
    const nomeField = `nomeProcurador${suffix}` as keyof Item;
    const rgField = `rgProcurador${suffix}` as keyof Item;
    const nregistroField = `nregistroProcurador${suffix}` as keyof Item;
    const nacionalidadeField = `nacionalidadeProcurador${suffix}` as keyof Item;
    const estadoCivilField = `estadoCivilProcurador${suffix}` as keyof Item;
    const profissaoField = `profissaoProcurador${suffix}` as keyof Item;
    const enderecoField = `enderecoProcurador${suffix}` as keyof Item;
    const complementoField = `complementoProcurador${suffix}` as keyof Item;
    const municipioField = `municipioProcurador${suffix}` as keyof Item;
    const estadoField = `estadoProcuradorEnd${suffix}` as keyof Item;
    const cepField = `cepProcurador${suffix}` as keyof Item;

    return (
      <Grid item xs={12} md={6} key={numero}>
        <div className={classes.compactSection}>
          <Typography className={classes.sectionTitle}>
            Identificação do Procurador {numero}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Tooltip title="Tirar Foto">
                <IconButton
                  size="small"
                  onClick={() => setCameraOpen(true)}
                  disabled={processingImage}
                  style={{
                    backgroundColor: 'rgba(45, 90, 61, 0.1)',
                    color: '#2d5a3d',
                    width: '32px',
                    height: '32px'
                  }}
                >
                  <PhotoCamera fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Preencher Manual">
                <IconButton
                  size="small"
                  onClick={() => setProcuradorExpanded(!procuradorExpanded)}
                  style={{
                    backgroundColor: 'rgba(45, 90, 61, 0.1)',
                    color: '#2d5a3d',
                    width: '32px',
                    height: '32px'
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
          </Typography>

          {processingImage && (
            <div className={classes.processingIndicator}>
              <CircularProgress size={16} />
              <Typography variant="caption">Analisando documento...</Typography>
            </div>
          )}

          {/* Upload de Documentos do Procurador */}
          <Grid container spacing={2} style={{ marginBottom: 16 }}>
            <Grid item xs={12} sm={6}>
              <input
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                id={`procurador${numero}-doc-upload`}
                type="file"
                onChange={(e) => handleProcuradorDocFileChange(e, numero)}
                multiple
              />
              <label htmlFor={`procurador${numero}-doc-upload`}>
                <Button
                  variant="contained"
                  component="span"
                  className={classes.uploadButton}
                  fullWidth
                  startIcon={<CloudUpload />}
                  disabled={processingImage}
                >
                  {isMobile ? 'RG/CNH' : 'RG/CNH/CPF'}
                </Button>
              </label>
            </Grid>

            <Grid item xs={12} sm={6}>
              <input
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                id={`procurador${numero}-conta-upload`}
                type="file"
                onChange={(e) => handleProcuradorContaFileChange(e, numero)}
                multiple
              />
              <label htmlFor={`procurador${numero}-conta-upload`}>
                <Button
                  variant="contained"
                  component="span"
                  className={classes.uploadButton}
                  fullWidth
                  startIcon={<CloudUpload />}
                  disabled={processingImage}
                >
                  {isMobile ? 'Conta' : 'Conta Água/Luz'}
                </Button>
              </label>
            </Grid>
          </Grid>

          <Collapse in={procuradorExpanded}>
            <div className={classes.expandableContent}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label={`Código de Busca (5 dígitos) - Procurador ${numero}`}
                    placeholder="Ex: 12345"
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                      e.target.value = value;
                      if (value.length === 5) {
                        searchContactByCode(value, numero);
                      }
                    }}
                    fullWidth
                    variant="outlined"
                    className={classes.textField}
                    size="small"
                    helperText="Digite 5 dígitos para buscar contato salvo"
                    InputProps={{
                      endAdornment: isLoadingContact ? (
                        <CircularProgress size={24} />
                      ) : null,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name={cpfField}
                    label="CPF"
                    value={formatCpfCnpj(newItem[cpfField] as string || '')}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, '');
                      handleInputChange({
                        ...e,
                        target: {
                          ...e.target,
                          name: cpfField,
                          value: rawValue
                        }
                      } as any, cpfField);
                    }}
                    fullWidth
                    variant="outlined"
                    className={classes.textField}
                    size="small"
                    error={!!(newItem[cpfField] as string) && !isValidCpfCnpj(newItem[cpfField] as string)}
                    helperText={!!(newItem[cpfField] as string) && !isValidCpfCnpj(newItem[cpfField] as string)
                      ? 'CPF inválido'
                      : ''}
                    InputProps={{
                      endAdornment: isLoadingSearch && (newItem[cpfField] as string)?.length === 11 ? (
                        <CircularProgress size={24} />
                      ) : null,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nome Completo"
                    value={newItem[nomeField] as string || ''}
                    onChange={(e) => handleInputChange(e, nomeField)}
                    fullWidth
                    variant="outlined"
                    className={classes.textField}
                    size="small"
                    helperText="Preencha manualmente se a consulta automática falhar"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name={rgField}
                    label="RG"
                    value={newItem[rgField as keyof Item] || ''}
                    onChange={(e) => handleInputChange(e, rgField as keyof Item)}
                    fullWidth
                    variant="outlined"
                    className={classes.textField}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name={nregistroField}
                    label="N de Registro"
                    value={newItem[nregistroField as keyof Item] || ''}
                    onChange={(e) => handleInputChange(e, nregistroField as keyof Item)}
                    fullWidth
                    variant="outlined"
                    className={classes.textField}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name={nacionalidadeField}
                    label="Nacionalidade"
                    value={newItem[nacionalidadeField as keyof Item] || ''}
                    onChange={(e) => handleInputChange(e, nacionalidadeField as keyof Item)}
                    fullWidth
                    variant="outlined"
                    className={classes.textField}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name={estadoCivilField}
                    label="Estado Civil"
                    value={newItem[estadoCivilField as keyof Item] || ''}
                    onChange={(e) => handleInputChange(e, estadoCivilField as keyof Item)}
                    fullWidth
                    variant="outlined"
                    className={classes.textField}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name={profissaoField}
                    label="Profissão"
                    value={newItem[profissaoField as keyof Item] || ''}
                    onChange={(e) => handleInputChange(e, profissaoField as keyof Item)}
                    fullWidth
                    variant="outlined"
                    className={classes.textField}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name={cepField}
                    label="CEP"
                    value={(newItem[cepField as keyof Item] as string)?.replace(/(\d{5})(\d{3})/, '$1-$2') || ''}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, '');
                      handleInputChange({
                        ...e,
                        target: {
                          ...e.target,
                          value: rawValue
                        }
                      } as any, cepField as keyof Item);
                    }}
                    fullWidth
                    variant="outlined"
                    className={classes.textField}
                    size="small"
                    placeholder="Digite o CEP para buscar automaticamente"
                    helperText="Endereço será preenchido automaticamente"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name={enderecoField}
                    label="Endereço"
                    value={newItem[enderecoField as keyof Item] || ''}
                    onChange={(e) => handleInputChange(e, enderecoField as keyof Item)}
                    fullWidth
                    variant="outlined"
                    className={classes.textField}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name={complementoField}
                    label="Complemento/Bairro"
                    value={newItem[complementoField as keyof Item] || ''}
                    onChange={(e) => handleInputChange(e, complementoField as keyof Item)}
                    fullWidth
                    variant="outlined"
                    className={classes.textField}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name={municipioField}
                    label="Município"
                    value={newItem[municipioField as keyof Item] || ''}
                    onChange={(e) => handleInputChange(e, municipioField as keyof Item)}
                    fullWidth
                    variant="outlined"
                    className={classes.textField}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name={estadoField}
                    label="Estado"
                    value={newItem[estadoField as keyof Item] || ''}
                    onChange={(e) => handleInputChange(e, estadoField as keyof Item)}
                    fullWidth
                    variant="outlined"
                    className={classes.textField}
                    size="small"
                  />
                </Grid>
              </Grid>
            </div>
          </Collapse>
        </div>
      </Grid>
    );
  };

  const resetForm = () => {
    setNewItem({
      id: '',
      cliente: '',
      status: 'Pendente',
      quantidade: 0,
      imagemUrls: [],
      concluido: false,
      placa: '',
      renavam: '',
      crv: '',
      nregistroProcurador1: '',
        nregistroProcurador2: '',
        nregistroProcurador3: '',
         nregistroProcurador4: '',
        nregistroProcurador5: '',
        nregistroProcurador: '',

      // Campos obrigatórios para compatibilidade
      valordevenda: '',
      nomevendedor: '',
      cpfvendedor: '',
      enderecovendedor: '',
      complementovendedor: '',
      municipiovendedor: '',
      emailvendedor: '',
      bairrocomprador: '',
      nomecomprador: '',
      cpfcomprador: '',
      enderecocomprador: '',
      complementocomprador: '',
      municipiocomprador: '',
      emailcomprador: '',
      celtelcomprador: '',
      cepvendedor: '',
      cepcomprador: '',
      tipo: '',
      cnpjempresa: '',
      nomeempresa: '',
      celtelvendedor: '',
      // Campos específicos da procuração
      chassi: '',
      modelo: '',
      anoFabricacao: '',
      anoModelo: '',
      cor: '',

      combustivel: '',
      nomeProprietario: '',
      cpfProprietario: '',
      rgProprietario: '',
      nacionalidadeProprietario: 'brasileiro(a)',
      dataNascimentoProprietario: '',
      nomePaiProprietario: '',
      nomeMaeProprietario: '',
      enderecoProprietario: '',
      complementoProprietario: '',
      municipioProprietario: '',
      estadoProprietario: '',
      cepProprietario: '',
      nomeProcurador: '',
      cpfProcurador: '',
      rgProcurador: '',
      nacionalidadeProcurador: 'brasileiro',
      estadoCivilProcurador: '',
      profissaoProcurador: '',
      enderecoProcurador: '',
      complementoProcurador: '',
      municipioProcurador: '',
      estadoProcuradorEnd: '',
      cepProcurador: '',
      // Campos para múltiplos procuradores
      nomeProcurador2: '',
      cpfProcurador2: '',
      rgProcurador2: '',
      nacionalidadeProcurador2: 'brasileiro',
      estadoCivilProcurador2: '',
      profissaoProcurador2: '',
      enderecoProcurador2: '',
      complementoProcurador2: '',
      municipioProcurador2: '',
      estadoProcuradorEnd2: '',

      cepProcurador2: '',
      nregistro: '',
      nomeProcurador3: '',
      cpfProcurador3: '',
      rgProcurador3: '',
      nacionalidadeProcurador3: 'brasileiro',
      estadoCivilProcurador3: '',
      profissaoProcurador3: '',
      enderecoProcurador3: '',
      complementoProcurador3: '',
      municipioProcurador3: '',
      estadoProcuradorEnd3: '',
      cepProcurador3: '',
      nomeProcurador4: '',
      cpfProcurador4: '',
      rgProcurador4: '',
      nacionalidadeProcurador4: 'brasileiro',
      estadoCivilProcurador4: '',
      profissaoProcurador4: '',
      enderecoProcurador4: '',
      complementoProcurador4: '',
      municipioProcurador4: '',
      estadoProcuradorEnd4: '',
      cepProcurador4: '',
      nomeProcurador5: '',
      cpfProcurador5: '',
      rgProcurador5: '',
      nacionalidadeProcurador5: 'brasileiro',
      estadoCivilProcurador5: '',
      profissaoProcurador5: '',
      enderecoProcurador5: '',
      complementoProcurador5: '',
      municipioProcurador5: '',
      estadoProcuradorEnd5: '',
      cepProcurador5: '',
      dataCriacao: Timestamp.fromDate(new Date()),
      signature: '',
    });
    setFiles([]);
    setVeiculoFiles([]);
    setProprietarioDocFiles([]);
    setProprietarioContaFiles([]);
    setProcuradorDocFiles([]);
    setProcuradorContaFiles([]);
    setVeiculoExpanded(false);
    setProprietarioExpanded(false);
    setProcuradorExpanded(false);
    setAssinaturaExpanded(false);
    setDocumentosExpanded(false);
    // Resetar novos estados
    setEmpresaExpanded(false);
    setSocioAdministradorExpanded(false);
    setEmpresaFiles([]);
    setSocioAdministradorFiles([]);

    setQuantidadeProcuradores(1);
  };

  // Paginacao de empresas
  const totalEmpresasPaginas = Math.ceil(empresas.length / empresasPorPagina);
  const empresasPaginadas = empresas.slice(
    (empresasPagina - 1) * empresasPorPagina,
    empresasPagina * empresasPorPagina
  );

  // Handlers para upload de Empresa e Sócio Administrador
  const handleEmpresaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setEmpresaFiles(prev => [...prev, ...selectedFiles]);
    if (selectedFiles.length > 0) {
      processImageWithAI(selectedFiles[0], 'empresa_juridico');
    }
  };

  const handleSocioAdministradorFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setSocioAdministradorFiles(prev => [...prev, ...selectedFiles]);
    if (selectedFiles.length > 0) {
      processImageWithAI(selectedFiles[0], 'socio_administrador');
    }
  };

  // Função para buscar endereço da Empresa Jurídica por CEP
  const fetchAddressFromCEPEmpresaJuridico = async (cep: string) => {
    try {
      const cepLimpo = cep.replace(/\D/g, '');
      if (cepLimpo.length !== 8) return;

      console.log(`Buscando endereço da empresa para CEP: ${cepLimpo}`);

      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        console.log('Dados do ViaCEP para empresa:', data);
        setNewItem(prev => ({
          ...prev,
          enderecoEmpresaJuridico: data.logradouro || prev.enderecoEmpresaJuridico,
          bairroEmpresaJuridico: data.bairro || prev.bairroEmpresaJuridico,
          municipioEmpresaJuridico: data.localidade || prev.municipioEmpresaJuridico,
          estadoEmpresaJuridico: data.uf || prev.estadoEmpresaJuridico,
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP da empresa:', error);
    }
  };

  // Função para buscar endereço do Sócio Administrador por CEP
  const fetchAddressFromCEPSocioAdmin = async (cep: string) => {
    try {
      const cepLimpo = cep.replace(/\D/g, '');
      if (cepLimpo.length !== 8) return;

      console.log(`Buscando endereço do sócio admin para CEP: ${cepLimpo}`);

      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        console.log('Dados do ViaCEP para sócio admin:', data);
        setNewItem(prev => ({
          ...prev,
          enderecoSocioAdministrador: data.logradouro || prev.enderecoSocioAdministrador,
          complementoSocioAdministrador: data.bairro || prev.complementoSocioAdministrador,
          municipioSocioAdministrador: data.localidade || prev.municipioSocioAdministrador,
          estadoSocioAdministrador: data.uf || prev.estadoSocioAdministrador,
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP do sócio admin:', error);
    }
  };

  return (
    <div className={classes.noPrint} style={{ width: '100%', padding: 16 }}>
      {/* Barra horizontal de empresas - Compacta */}
      <Paper style={{
        padding: '6px 8px',
        marginBottom: 12,
        background: '#fff',
        borderRadius: 6,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Typography variant="caption" style={{ color: '#2d5a3d', fontWeight: 600, fontSize: '0.75rem' }}>
            Empresas ({empresas.length})
          </Typography>
          <div style={{ display: 'flex', gap: 4 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setModoVisualizacao(modoVisualizacao === 'lista' ? 'cards' : 'lista')}
              style={{
                minWidth: 'auto',
                padding: '2px 8px',
                fontSize: '0.7rem',
                border: '1px solid #2d5a3d',
                color: '#2d5a3d',
                height: '24px'
              }}
            >
              {modoVisualizacao === 'lista' ? '⊞' : '☰'}
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => setEmpresaDialogOpen(true)}
              style={{
                background: '#2d5a3d',
                color: 'white',
                padding: '2px 8px',
                fontSize: '0.7rem',
                height: '24px'
              }}
            >
              +
            </Button>
          </div>
        </div>

        {empresas.length === 0 ? (
          <Typography variant="caption" style={{ color: '#999', padding: '8px 0', textAlign: 'center', display: 'block', fontSize: '0.7rem' }}>
            Nenhuma empresa
          </Typography>
        ) : modoVisualizacao === 'lista' ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {empresasPaginadas.map((empresa) => (
                <div
                  key={empresa.id}
                  onClick={() => selecionarEmpresa(empresa)}
                  style={{
                    padding: '4px 8px',
                    cursor: 'pointer',
                    background: empresaSelecionada?.id === empresa.id ? '#e8f5e9' : '#f9f9f9',
                    border: empresaSelecionada?.id === empresa.id ? '1px solid #2d5a3d' : '1px solid #e0e0e0',
                    borderRadius: 3,
                    transition: 'all 0.2s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Typography variant="caption" style={{ fontWeight: 600, color: '#2d5a3d', fontSize: '0.72rem', display: 'block' }}>
                      {empresa.nomeEmpresa}
                    </Typography>
                    <Typography variant="caption" style={{ color: '#666', fontSize: '0.65rem' }}>
                      {empresa.id} • {empresa.quantidadeProcuradores} Proc.
                    </Typography>
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <IconButton
                      size="small"
                      onClick={(e) => abrirDialogEdicao(empresa, e)}
                      style={{
                        padding: 2,
                        backgroundColor: '#2d5a3d',
                        color: '#fff',
                        width: 20,
                        height: 20
                      }}
                    >
                      <Edit style={{ fontSize: 12 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => abrirDialogExclusao(empresa, e)}
                      style={{
                        padding: 2,
                        backgroundColor: '#d32f2f',
                        color: '#fff',
                        width: 20,
                        height: 20
                      }}
                    >
                      <Delete style={{ fontSize: 12 }} />
                    </IconButton>
                    {empresaSelecionada?.id === empresa.id && (
                      <div style={{ fontSize: '0.9rem', color: '#2d5a3d', marginLeft: 4 }}>✓</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação compacta */}
            {totalEmpresasPaginas > 1 && (
              <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 6, alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setEmpresasPagina(Math.max(1, empresasPagina - 1))}
                  disabled={empresasPagina === 1}
                  style={{
                    minWidth: '20px',
                    padding: '2px 4px',
                    fontSize: '0.65rem',
                    height: '20px'
                  }}
                >
                  ‹
                </Button>
                <Typography variant="caption" style={{ fontSize: '0.65rem', color: '#666' }}>
                  {empresasPagina}/{totalEmpresasPaginas}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setEmpresasPagina(Math.min(totalEmpresasPaginas, empresasPagina + 1))}
                  disabled={empresasPagina === totalEmpresasPaginas}
                  style={{
                    minWidth: '20px',
                    padding: '2px 4px',
                    fontSize: '0.65rem',
                    height: '20px'
                  }}
                >
                  ›
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <div
              ref={empresasContainerRef}
              style={{
                display: 'flex',
                gap: 6,
                overflowX: 'hidden',
                paddingBottom: 4,
                flexWrap: 'nowrap'
              }}
            >
              {empresasPaginadas.map((empresa) => (
              <div
                key={empresa.id}
                onClick={() => selecionarEmpresa(empresa)}
                style={{
                  minWidth: 120,
                  padding: 6,
                  cursor: 'pointer',
                  background: empresaSelecionada?.id === empresa.id ? '#e8f5e9' : 'white',
                  border: empresaSelecionada?.id === empresa.id ? '1px solid #2d5a3d' : '1px solid #e0e0e0',
                  borderRadius: 4,
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                <div style={{ position: 'absolute', top: 2, right: 2, display: 'flex', gap: 2 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => abrirDialogEdicao(empresa, e)}
                    style={{
                      padding: 2,
                      backgroundColor: '#2d5a3d',
                      color: '#fff',
                      width: 16,
                      height: 16
                    }}
                  >
                    <Edit style={{ fontSize: 10 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => abrirDialogExclusao(empresa, e)}
                    style={{
                      padding: 2,
                      backgroundColor: '#d32f2f',
                      color: '#fff',
                      width: 16,
                      height: 16
                    }}
                  >
                    <Delete style={{ fontSize: 10 }} />
                  </IconButton>
                </div>
                <Typography variant="caption" style={{ fontWeight: 600, color: '#2d5a3d', fontSize: '0.72rem', display: 'block', marginBottom: 2, paddingRight: 36 }}>
                  {empresa.nomeEmpresa}
                </Typography>
                <Typography variant="caption" style={{ color: '#666', fontSize: '0.65rem', display: 'block' }}>
                  {empresa.id}
                </Typography>
                <Typography variant="caption" style={{ color: '#4a7c59', fontSize: '0.65rem' }}>
                  {empresa.quantidadeProcuradores} Proc.
                </Typography>
              </div>
              ))}
            </div>

            {/* Paginação para modo cards */}
            {totalEmpresasPaginas > 1 && (
              <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 6, alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setEmpresasPagina(Math.max(1, empresasPagina - 1))}
                  disabled={empresasPagina === 1}
                  style={{
                    minWidth: '20px',
                    padding: '2px 4px',
                    fontSize: '0.65rem',
                    height: '20px'
                  }}
                >
                  ‹
                </Button>
                <Typography variant="caption" style={{ fontSize: '0.65rem', color: '#666' }}>
                  {empresasPagina}/{totalEmpresasPaginas}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setEmpresasPagina(Math.min(totalEmpresasPaginas, empresasPagina + 1))}
                  disabled={empresasPagina === totalEmpresasPaginas}
                  style={{
                    minWidth: '20px',
                    padding: '2px 4px',
                    fontSize: '0.65rem',
                    height: '20px'
                  }}
                >
                  ›
                </Button>
              </div>
            )}
          </>
        )}
      </Paper>

      {/* PDF Content (hidden for PDF generation) */}
      <div id="pdf-content" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <Paper className={classes.paper}>
          <Typography className={classes.documentTitle}>
            PROCURAÇÃO ELETRÔNICA
          </Typography>

          <Typography className={classes.documentText}>
            Eu, <strong>{newItem.nomeProprietario || '[NOME DO PROPRIETÁRIO]'}</strong>, nacionalidade: {newItem.nacionalidadeProprietario}, nascido(a) em {newItem.dataNascimentoProprietario || '[DATA DE NASCIMENTO]'}, filho(a) de <strong>{newItem.nomePaiProprietario || '[NOME DO PAI]'}</strong> e <strong>{newItem.nomeMaeProprietario || '[NOME DA MÃE]'}</strong>, residente e domiciliado(a) em <strong>, {newItem.municipioProprietario || '[MUNICÍPIO]'}/{newItem.estadoProprietario || '[ESTADO]'}</strong>. Cédula de identidade n° <strong>{newItem.rgProprietario || '[RG]'}</strong>, inscrito(a) no CPF sob o nº <strong>{newItem.cpfProprietario || '[CPF]'}</strong>; por este instrumento nomeia(m) e constitui(em) seu(s) (sua(s)) bastante procurador(a)(es)(as), podendo agir em CONJUNTO ou ISOLADAMENTE, {gerarTextoProcuradores()}, com poderes para o fim especial de vender, transferir à quem lhe convier pelo preço e condições que ajustar o veículo de propriedade da Outorgante, com as seguintes características: marca/modelo: <strong>{newItem.modelo || '[MARCA/MODELO]'}</strong>, placa: <strong>{newItem.id || '[PLACA]'}</strong>, código RENAVAM: <strong>{newItem.renavam || '[RENAVAM]'}</strong>, chassi: <strong>{newItem.chassi || '[CHASSI]'}</strong>, combustível: <strong>{newItem.combustivel || '[COMBUSTÍVEL]'}</strong>, ano fab.: <strong>{newItem.anoFabricacao || '[ANO FAB.]'}</strong> ano mod.: <strong>{newItem.anoModelo || '[ANO MOD.]'}</strong>, cor predominante: <strong>{newItem.cor || '[COR]'}</strong>; podendo para isso ditos Procurador(es), receber o preço da venda, dar recibos e quitações, assinar requerimentos, termos de transferências e ou de repasse de bem, solicitar e retirar 2ª via de documentos - CRV e CRLV, emitir CRLV digital, endosso de documentação, efetuar vistorias, receber créditos de consórcios, solicitar colocação de placas e lacre, retirar documentos postados nos Correios, alterar endereço de postagem, solicitar remarcação de chassi e motor ou troca de motor, solicitar troca categoria ou combustível, requerer alteração de características e dados, solicitar intenção de venda (ATPV), realizar o cancelamento de intenção de venda (ATPV), solicitar etiquetas de identificação, solicitar baixa definitiva do veículo, comunicar venda junto aos órgãos competentes, cancelar comunicação de venda, cancelamento de processo de transferência, manter reserva de domínio, retirar reserva de domínio, usar o veículo em apreço, manejando o mesmo em qualquer parte do território nacional ou estrangeiro, ficando civil e criminalmente responsável por qualquer acidente, multas ou ocorrências que venha a ocorrer com o veículo, que na presente data passa a ser de total responsabilidade dos Outorgados, usar e gozar do veículo como coisa sua e sem interferência ou autorização de outros, requerer, perante qualquer autoridade alfandegária ou aduaneira de país estrangeiro, licença ou permissão e turismo, pelo tempo e prazo que julgar conveniente, podendo representar a Outorgante, junto as repartições públicas federais, estaduais, municipais, inclusive junto ao DETRAN e onde com esta apresentar-se, pagar taxas, multas e impostos, efetuar licenciamento, assinar termos de entrega e ou qualquer outro documento que for necessário em caso de apreensão do veículo, inclusive retirar/liberar o referido veículo, bem como representar perante qualquer instituição financeira, banco comercial, companhia de arrendamento mercantil ou administradora de consorcio para efetivar a quitação de financiamentos, leasings ou consórcios e a baixa/levantamento de qualquer gravame ou restrição, tais como alienação fiduciária em garantia ou reserva de domínio, assim como para efetuar a retirada do instrumento de liberação ou ainda assinar opção de compra, carta resposta, termo de rescisão contratual, termo de liquidação contratual de arrendamento mercantil ou documento equivalente, conforme o caso e se necessário for, representando e assinando o que preciso for para o referido fim, <strong>VEDADO SUBSTABELECER</strong>.
          </Typography>

          <Typography className={classes.documentText}>
            A procuração é outorgada em caráter irrevogável e irretratável.
          </Typography>

          <Typography className={classes.documentText}>
            Tubarão, {formatDate(newItem.dataCriacao)}.
          </Typography>

          {newItem.signature && (
            <div className={classes.signatureSection}>
              <img src={newItem.signature} alt="Assinatura do Proprietário" style={{ maxWidth: '400px' }} />
            </div>
          )}

          <div className={classes.signatureSection}>
            <div className={classes.signatureBlock}>
              ASSINATURA
            </div>
          </div>

          <Typography className={classes.footer}>
            PROCURAÇÃO VÁLIDA CONFORME PORTARIA Nº 0656/DETRAN/PROJUR/2022 de 15/12/2022 Art. 2º e LEI Nº 14.063, DE 23 DE SETEMBRO DE 2020
          </Typography>
        </Paper>
      </div>

      {/* Layout principal com duas colunas */}
      <Grid container spacing={2}>
        {/* Coluna esquerda - Formulário */}
        <Grid item xs={12} lg={6}>
          <Paper className={classes.formContainer}>
            {/* Botão para alternar modo Jurídico */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <Button
                variant={modoJuridico ? 'contained' : 'outlined'}
                onClick={() => setModoJuridico(!modoJuridico)}
                style={{
                  background: modoJuridico ? 'linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%)' : 'transparent',
                  color: modoJuridico ? 'white' : '#2d5a3d',
                  border: '2px solid #2d5a3d',
                  fontWeight: 600,
                  padding: '8px 24px',
                  borderRadius: '8px'
                }}
              >
                {modoJuridico ? '✓ Modo Jurídico (Empresa)' : 'Modo Jurídico (Empresa)'}
              </Button>
            </div>

            {/* Header */}
            <div className={classes.header}>
              <img src="/betologo.jpg" alt="Logo" className={classes.logo} />
              <Typography variant="h4" className={classes.title}>
                Procuração Eletrônica {modoJuridico ? '- Empresa' : ''}
              </Typography>
            </div>

            {/* Primeira linha: Veículo e Proprietário/Empresa */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <CompactSection
                  title="Identificação do Veículo"
                  files={veiculoFiles}
                  setFiles={setVeiculoFiles}
                  onFileChange={handleVeiculoFileChange}
                  onManualEdit={() => setVeiculoExpanded(!veiculoExpanded)}
                  processingImage={processingImage}
                  classes={classes}
                  manualExpanded={veiculoExpanded}
                  uploadLabel={isMobile ? 'CRV/CRLV' : 'Enviar CRV/CRLV'}
                  setCameraOpen={setCameraOpen}
                >
                  <Grid container spacing={2}>
                    {[
                      { label: 'Placa', value: 'placa' },
                      { label: 'Renavam', value: 'renavam' },
                      { label: 'CRV', value: 'crv' },
                      { label: 'Chassi', value: 'chassi' },
                      { label: 'Marca/Modelo', value: 'modelo' },
                      { label: 'Ano Fabricação', value: 'anoFabricacao' },
                      { label: 'Ano Modelo', value: 'anoModelo' },
                      { label: 'Cor', value: 'cor' },
                      { label: 'Combustível', value: 'combustivel' },
                    ].map((field) => (
                      <Grid item xs={12} sm={6} key={field.value}>
                        <TextField
                          name={field.value}
                          label={field.label}
                          value={newItem[field.value as keyof Item] || ''}
                          onChange={(e) => handleInputChange(e, field.value as keyof Item)}
                          fullWidth
                          variant="outlined"
                          className={classes.textField}
                          size="small"
                        />
                      </Grid>
                    ))}
                  </Grid>
                </CompactSection>
              </Grid>

              {/* Seção condicional: Empresa (modo jurídico) ou Proprietário (modo padrão) */}
              {modoJuridico ? (
                <Grid item xs={12} md={6}>
                  <CompactSection
                    title="Identificação da Empresa"
                    files={empresaFiles}
                    setFiles={setEmpresaFiles}
                    onFileChange={handleEmpresaFileChange}
                    onManualEdit={() => setEmpresaExpanded(!empresaExpanded)}
                    processingImage={processingImage}
                    classes={classes}
                    manualExpanded={empresaExpanded}
                    uploadLabel={isMobile ? 'CNPJ/Contrato' : 'Enviar CNPJ/Contrato Social'}
                    setCameraOpen={setCameraOpen}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="CNPJ"
                          value={formatCpfCnpj(newItem.cnpjEmpresaJuridico || '')}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, '');
                            handleInputChange({
                              ...e,
                              target: { ...e.target, name: 'cnpjEmpresaJuridico', value: rawValue }
                            } as any, 'cnpjEmpresaJuridico');
                            if (rawValue.length === 14) {
                              fetchEmpresaDataByCNPJ(rawValue);
                            }
                          }}
                          fullWidth
                          variant="outlined"
                          className={classes.textField}
                          size="small"
                          helperText="Nome e endereço serão preenchidos automaticamente"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Razão Social"
                          value={newItem.nomeEmpresaJuridico || ''}
                          onChange={(e) => handleInputChange(e, 'nomeEmpresaJuridico')}
                          fullWidth
                          variant="outlined"
                          className={classes.textField}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="CEP"
                          value={newItem.cepEmpresaJuridico?.replace(/(\d{5})(\d{3})/, '$1-$2') || ''}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, '');
                            handleInputChange({
                              ...e,
                              target: { ...e.target, name: 'cepEmpresaJuridico', value: rawValue }
                            } as any, 'cepEmpresaJuridico');
                            if (rawValue.length === 8) {
                              fetchAddressFromCEPEmpresaJuridico(rawValue);
                            }
                          }}
                          fullWidth
                          variant="outlined"
                          className={classes.textField}
                          size="small"
                          helperText="Endereço será preenchido automaticamente"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Endereço"
                          value={newItem.enderecoEmpresaJuridico || ''}
                          onChange={(e) => handleInputChange(e, 'enderecoEmpresaJuridico')}
                          fullWidth
                          variant="outlined"
                          className={classes.textField}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Bairro"
                          value={newItem.bairroEmpresaJuridico || ''}
                          onChange={(e) => handleInputChange(e, 'bairroEmpresaJuridico')}
                          fullWidth
                          variant="outlined"
                          className={classes.textField}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Município"
                          value={newItem.municipioEmpresaJuridico || ''}
                          onChange={(e) => handleInputChange(e, 'municipioEmpresaJuridico')}
                          fullWidth
                          variant="outlined"
                          className={classes.textField}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Estado"
                          value={newItem.estadoEmpresaJuridico || ''}
                          onChange={(e) => handleInputChange(e, 'estadoEmpresaJuridico')}
                          fullWidth
                          variant="outlined"
                          className={classes.textField}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </CompactSection>
                </Grid>
              ) : (
                <Grid item xs={12} md={6}>
                  <CompactSection
                    title="Identificação do Proprietário"
                    files={proprietarioDocFiles}
                    setFiles={setProprietarioDocFiles}
                    onFileChange={handleProprietarioDocFileChange}
                    onManualEdit={() => setProprietarioExpanded(!proprietarioExpanded)}
                    processingImage={processingImage}
                    classes={classes}
                    manualExpanded={proprietarioExpanded}
                    uploadLabel={isMobile ? 'RG/CNH' : 'Enviar RG/CNH/CPF'}
                    setCameraOpen={setCameraOpen}
                  >
                    <Grid container spacing={2} style={{ marginBottom: 16 }}>
                      <Grid item xs={12} sm={6}>
                        <input
                          accept="image/*,application/pdf"
                          style={{ display: 'none' }}
                          id="proprietario-doc-upload"
                          type="file"
                          onChange={handleProprietarioDocFileChange}
                          multiple
                        />
                        <label htmlFor="proprietario-doc-upload">
                          <Button
                            variant="contained"
                            component="span"
                            className={classes.uploadButton}
                            fullWidth
                            startIcon={<CloudUpload />}
                            disabled={processingImage}
                          >
                            {isMobile ? 'RG/CNH' : 'RG/CNH/CPF'}
                          </Button>
                        </label>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <input
                          accept="image/*,application/pdf"
                          style={{ display: 'none' }}
                          id="proprietario-conta-upload"
                          type="file"
                          onChange={handleProprietarioContaFileChange}
                          multiple
                        />
                        <label htmlFor="proprietario-conta-upload">
                          <Button
                            variant="contained"
                            component="span"
                            className={classes.uploadButton}
                            fullWidth
                            startIcon={<CloudUpload />}
                            disabled={processingImage}
                          >
                            {isMobile ? 'Conta' : 'Conta Água/Luz'}
                          </Button>
                        </label>
                      </Grid>
                    </Grid>

                    {(proprietarioDocFiles.length > 0 || proprietarioContaFiles.length > 0) && (
                      <div className={classes.thumbnailContainer}>
                        {proprietarioDocFiles.map((file, index) => (
                          <div key={`prop-doc-${index}`} className={file.type === 'application/pdf' ? classes.pdfThumbnail : classes.thumbnail}>
                            {file.type === 'application/pdf' ? (
                              <PictureAsPdf style={{ color: '#d32f2f', fontSize: 30 }} />
                            ) : (
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Proprietário Doc ${index}`}
                                onError={(e) => {
                                  console.error('Erro ao carregar imagem:', e);
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <IconButton
                              className={classes.deleteButton}
                              size="small"
                              onClick={() => setProprietarioDocFiles(prev => prev.filter((_, i) => i !== index))}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </div>
                        ))}
                        {proprietarioContaFiles.map((file, index) => (
                          <div key={`prop-conta-${index}`} className={file.type === 'application/pdf' ? classes.pdfThumbnail : classes.thumbnail}>
                            {file.type === 'application/pdf' ? (
                              <PictureAsPdf style={{ color: '#d32f2f', fontSize: 30 }} />
                            ) : (
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Proprietário Conta ${index}`}
                                onError={(e) => {
                                  console.error('Erro ao carregar imagem:', e);
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <IconButton
                              className={classes.deleteButton}
                              size="small"
                              onClick={() => setProprietarioContaFiles(prev => prev.filter((_, i) => i !== index))}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </div>
                        ))}
                      </div>
                    )}

                    <Collapse in={proprietarioExpanded}>
                      <div className={classes.expandableContent}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              name="cpfProprietario"
                              label="CPF"
                              value={formatCpfCnpj(newItem.cpfProprietario || '')}
                              onChange={(e) => {
                                const rawValue = e.target.value.replace(/\D/g, '');
                                handleInputChange({
                                  ...e,
                                  target: {
                                    ...e.target,
                                    name: 'cpfProprietario',
                                    value: rawValue
                                  }
                                } as any, 'cpfProprietario');
                              }}
                              fullWidth
                              variant="outlined"
                              className={classes.textField}
                              size="small"
                              error={!!newItem.cpfProprietario && !isValidCpfCnpj(newItem.cpfProprietario)}
                              helperText={!!newItem.cpfProprietario && !isValidCpfCnpj(newItem.cpfProprietario)
                                ? 'CPF inválido'
                                : ''}
                              InputProps={{
                                endAdornment: isLoadingSearch && newItem.cpfProprietario?.length === 11 ? (
                                  <CircularProgress size={24} />
                                ) : null,
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Nome Completo"
                              value={newItem.nomeProprietario || ''}
                              onChange={(e) => handleInputChange(e, 'nomeProprietario')}
                              fullWidth
                              variant="outlined"
                              className={classes.textField}
                              size="small"
                              helperText="Preencha manualmente se a consulta automática falhar"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="RG do Proprietário"
                              name="rgProprietario"
                              value={newItem.rgProprietario || ''}
                              onChange={(e) => handleInputChange(e, 'rgProprietario')}
                              onBlur={(e) => {
                                const value = e.target.value.trim().toUpperCase();
                                if (!value) return;

                                // Se não tiver "/", adicionar formato padrão
                                if (!value.includes('/')) {
                                  const numeroRg = value.replace(/\D/g, '');
                                  if (numeroRg) {
                                    handleInputChange({
                                      target: {
                                        name: 'rgProprietario',
                                        value: `${numeroRg} /SSP SC`
                                      }
                                    } as any, 'rgProprietario');
                                  }
                                }
                                // Se tiver "/", normalizar o formato
                                else {
                                  const partes = value.split('/');
                                  if (partes.length === 2) {
                                    const numero = partes[0].trim();
                                    const orgaoUF = partes[1].trim();

                                    // Validar se tem espaço entre órgão e UF
                                    const partesOrgaoUF = orgaoUF.split(/\s+/);
                                    if (partesOrgaoUF.length >= 2) {
                                      const orgao = partesOrgaoUF[0];
                                      const uf = partesOrgaoUF[partesOrgaoUF.length - 1];
                                      handleInputChange({
                                        target: {
                                          name: 'rgProprietario',
                                          value: `${numero} /${orgao} ${uf}`
                                        }
                                      } as any, 'rgProprietario');
                                    } else {
                                      // Se só tem órgão, adicionar SC como padrão
                                      handleInputChange({
                                        target: {
                                          name: 'rgProprietario',
                                          value: `${numero} /${orgaoUF} SC`
                                        }
                                      } as any, 'rgProprietario');
                                    }
                                  }
                                }
                              }}
                              fullWidth
                              margin="dense"
                              size="small"
                              variant="outlined"
                              className={classes.textField}
                              helperText="Formato: 1234567 /SSP SC (ou /SSP SP, /PC GO, etc.)"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              name="nacionalidadeProprietario"
                              label="Nacionalidade"
                              value={newItem.nacionalidadeProprietario || ''}
                              onChange={(e) => handleInputChange(e, 'nacionalidadeProprietario')}
                              fullWidth
                              variant="outlined"
                              className={classes.textField}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Data de Nascimento"
                              type="text"
                              fullWidth
                              margin="normal"
                              placeholder="dd/mm/aaaa"
                              value={newItem.dataNascimentoProprietario || ''}
                              onChange={(e) => {
                                let valor = e.target.value.replace(/\D/g, '');
                                if (valor.length >= 2) {
                                  valor = valor.substring(0, 2) + '/' + valor.substring(2);
                                }
                                if (valor.length >= 5) {
                                  valor = valor.substring(0, 5) + '/' + valor.substring(5, 9);
                                }
                                setNewItem({ ...newItem, dataNascimentoProprietario: valor });
                              }}
                              inputProps={{ maxLength: 10 }}
                              className={classes.textField}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              name="nomePaiProprietario"
                              label="Nome do Pai"
                              value={newItem.nomePaiProprietario || ''}
                              onChange={(e) => handleInputChange(e, 'nomePaiProprietario')}
                              fullWidth
                              variant="outlined"
                              className={classes.textField}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              name="nomeMaeProprietario"
                              label="Nome da Mãe"
                              value={newItem.nomeMaeProprietario || ''}
                              onChange={(e) => handleInputChange(e, 'nomeMaeProprietario')}
                              fullWidth
                              variant="outlined"
                              className={classes.textField}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              name="cepProprietario"
                              label="CEP"
                              value={newItem.cepProprietario?.replace(/(\d{5})(\d{3})/, '$1-$2') || ''}
                              onChange={(e) => {
                                const rawValue = e.target.value.replace(/\D/g, '');
                                handleInputChange({
                                  ...e,
                                  target: {
                                    ...e.target,
                                    value: rawValue
                                  }
                                } as any, 'cepProprietario');
                              }}
                              fullWidth
                              variant="outlined"
                              className={classes.textField}
                              size="small"
                              placeholder="Digite o CEP para buscar automaticamente"
                              helperText="Endereço será preenchido automaticamente"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              name="enderecoProprietario"
                              label="Endereço"
                              value={newItem.enderecoProprietario || ''}
                              onChange={(e) => handleInputChange(e, 'enderecoProprietario')}
                              fullWidth
                              variant="outlined"
                              className={classes.textField}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              name="complementoProprietario"
                              label="Complemento/Bairro"
                              value={newItem.complementoProprietario || ''}
                              onChange={(e) => handleInputChange(e, 'complementoProprietario')}
                              fullWidth
                              variant="outlined"
                              className={classes.textField}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              name="municipioProprietario"
                              label="Município"
                              value={newItem.municipioProprietario || ''}
                              onChange={(e) => handleInputChange(e, 'municipioProprietario')}
                              fullWidth
                              variant="outlined"
                              className={classes.textField}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              name="estadoProprietario"
                              label="Estado"
                              value={newItem.estadoProprietario || ''}
                              onChange={(e) => handleInputChange(e, 'estadoProprietario')}
                              fullWidth
                              variant="outlined"
                              className={classes.textField}
                              size="small"
                            />
                          </Grid>
                        </Grid>
                      </div>
                    </Collapse>
                  </CompactSection>
                </Grid>
              )}
            </Grid>

            {/* Seção Sócio Administrador (Modo Jurídico) */}
            {modoJuridico && (
              <Grid item xs={12} md={6}>
                <CompactSection
                  title="Sócio Administrador"
                  files={socioAdministradorFiles}
                  setFiles={setSocioAdministradorFiles}
                  onFileChange={handleSocioAdministradorFileChange}
                  onManualEdit={() => setSocioAdministradorExpanded(!socioAdministradorExpanded)}
                  processingImage={processingImage}
                  classes={classes}
                  manualExpanded={socioAdministradorExpanded}
                  uploadLabel={isMobile ? 'RG/CPF/CNH' : 'Enviar RG/CPF/CNH'}
                  setCameraOpen={setCameraOpen}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Nome Completo"
                        value={newItem.nomeSocioAdministrador || ''}
                        onChange={(e) => handleInputChange(e, 'nomeSocioAdministrador')}
                        fullWidth
                        variant="outlined"
                        className={classes.textField}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="CPF"
                        value={formatCpfCnpj(newItem.cpfSocioAdministrador || '')}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, '');
                          handleInputChange({
                            ...e,
                            target: { ...e.target, name: 'cpfSocioAdministrador', value: rawValue }
                          } as any, 'cpfSocioAdministrador');
                        }}
                        fullWidth
                        variant="outlined"
                        className={classes.textField}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="RG"
                        value={newItem.rgSocioAdministrador || ''}
                        onChange={(e) => handleInputChange(e, 'rgSocioAdministrador')}
                        fullWidth
                        variant="outlined"
                        className={classes.textField}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Data de Nascimento"
                        value={newItem.dataNascimentoSocioAdministrador || ''}
                        onChange={(e) => handleInputChange(e, 'dataNascimentoSocioAdministrador')}
                        fullWidth
                        variant="outlined"
                        className={classes.textField}
                        size="small"
                        placeholder="DD/MM/AAAA"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Nacionalidade"
                        value={newItem.nacionalidadeSocioAdministrador || 'brasileiro(a)'}
                        onChange={(e) => handleInputChange(e, 'nacionalidadeSocioAdministrador')}
                        fullWidth
                        variant="outlined"
                        className={classes.textField}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Profissão"
                        value={newItem.profissaoSocioAdministrador || ''}
                        onChange={(e) => handleInputChange(e, 'profissaoSocioAdministrador')}
                        fullWidth
                        variant="outlined"
                        className={classes.textField}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="CEP"
                        value={newItem.cepSocioAdministrador?.replace(/(\d{5})(\d{3})/, '$1-$2') || ''}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, '');
                          handleInputChange({
                            ...e,
                            target: { ...e.target, name: 'cepSocioAdministrador', value: rawValue }
                          } as any, 'cepSocioAdministrador');
                          if (rawValue.length === 8) {
                            fetchAddressFromCEPSocioAdmin(rawValue);
                          }
                        }}
                        fullWidth
                        variant="outlined"
                        className={classes.textField}
                        size="small"
                        helperText="Endereço será preenchido automaticamente"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Endereço"
                        value={newItem.enderecoSocioAdministrador || ''}
                        onChange={(e) => handleInputChange(e, 'enderecoSocioAdministrador')}
                        fullWidth
                        variant="outlined"
                        className={classes.textField}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Complemento/Bairro"
                        value={newItem.complementoSocioAdministrador || ''}
                        onChange={(e) => handleInputChange(e, 'complementoSocioAdministrador')}
                        fullWidth
                        variant="outlined"
                        className={classes.textField}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Município"
                        value={newItem.municipioSocioAdministrador || ''}
                        onChange={(e) => handleInputChange(e, 'municipioSocioAdministrador')}
                        fullWidth
                        variant="outlined"
                        className={classes.textField}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Estado"
                        value={newItem.estadoSocioAdministrador || ''}
                        onChange={(e) => handleInputChange(e, 'estadoSocioAdministrador')}
                        fullWidth
                        variant="outlined"
                        className={classes.textField}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </CompactSection>
              </Grid>
            )}
            {/* Fim da Seção Sócio Administrador */}

            {/* Seção Quantidade de Procuradores */}
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <div className={classes.compactSection}>
                  <Typography className={classes.sectionTitle}>
                    Quantidade de Procuradores
                  </Typography>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                    {[1, 2, 3, 4, 5].map((numero) => (
                      <Button
                        key={numero}
                        variant={quantidadeProcuradores === numero ? 'contained' : 'outlined'}
                        color="primary"
                        onClick={() => setQuantidadeProcuradores(numero)}
                        className={classes.uploadButton}
                        style={{
                          minWidth: '60px',
                          background: quantidadeProcuradores === numero
                            ? 'linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%)'
                            : 'transparent'
                        }}
                      >
                        {numero}
                      </Button>
                    ))}
                  </div>
                </div>
              </Grid>
            </Grid>

            {/* Campos Dinâmicos de Procuradores */}
            <Grid container spacing={2}>
              {Array.from({ length: quantidadeProcuradores }, (_, index) =>
                renderProcurador(index + 1)
              )}
            </Grid>

            {/* Thumbnails dos arquivos de procuradores */}
            {(procuradorDocFiles.length > 0 || procuradorContaFiles.length > 0) && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <div className={classes.compactSection}>
                    <Typography className={classes.sectionTitle}>
                      Documentos dos Procuradores
                    </Typography>
                    <div className={classes.thumbnailContainer}>
                      {procuradorDocFiles.map((file, index) => (
                        <div key={`proc-doc-${index}`} className={file.type === 'application/pdf' ? classes.pdfThumbnail : classes.thumbnail}>
                          {file.type === 'application/pdf' ? (
                            <PictureAsPdf style={{ color: '#d32f2f', fontSize: 30 }} />
                          ) : (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Procurador Doc ${index}`}
                              onError={(e) => {
                                console.error('Erro ao carregar imagem:', e);
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <IconButton
                            className={classes.deleteButton}
                            size="small"
                            onClick={() => setProcuradorDocFiles(prev => prev.filter((_, i) => i !== index))}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </div>
                      ))}
                      {procuradorContaFiles.map((file, index) => (
                        <div key={`proc-conta-${index}`} className={file.type === 'application/pdf' ? classes.pdfThumbnail : classes.thumbnail}>
                          {file.type === 'application/pdf' ? (
                            <PictureAsPdf style={{ color: '#d32f2f', fontSize: 30 }} />
                          ) : (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Procurador Conta ${index}`}
                              onError={(e) => {
                                console.error('Erro ao carregar imagem:', e);
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <IconButton
                            className={classes.deleteButton}
                            size="small"
                            onClick={() => setProcuradorContaFiles(prev => prev.filter((_, i) => i !== index))}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </div>
                      ))}
                    </div>
                  </div>
                </Grid>
              </Grid>
            )}

            {/* Seção Assinatura */}
            <div className={classes.compactSection}>
              <Typography className={classes.sectionTitle}>
                Assinatura do Proprietário
                <Button
                  size="small"
                  onClick={() => setAssinaturaExpanded(!assinaturaExpanded)}
                  className={classes.manualButton}
                  startIcon={assinaturaExpanded ? <ExpandLess /> : <ExpandMore />}
                >
                  {assinaturaExpanded ? 'Esconder' : 'Mostrar'}
                </Button>
              </Typography>

              <Collapse in={assinaturaExpanded}>
                <div className={classes.expandableContent}>
                  <div className={classes.signatureContainer}>
                    <SignaturePad onSave={(signature) => setNewItem(prev => ({ ...prev, signature }))} />
                  </div>
                </div>
              </Collapse>
            </div>

            {/* Seção Documentos Adicionais */}
            <div className={classes.compactSection}>
              <Typography className={classes.sectionTitle}>
                Documentos Adicionais (Opcional)
                <Button
                  size="small"
                  onClick={() => setDocumentosExpanded(!documentosExpanded)}
                  className={classes.manualButton}
                  startIcon={documentosExpanded ? <ExpandLess /> : <ExpandMore />}
                >
                  {documentosExpanded ? 'Esconder' : 'Mostrar'}
                </Button>
              </Typography>

              <Collapse in={documentosExpanded}>
                <div className={classes.expandableContent}>
                  <Typography variant="body2" style={{ marginBottom: 16, color: '#666' }}>
                    Ex: Outros documentos complementares...
                  </Typography>

                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <input
                        accept="image/*,application/pdf"
                        style={{ display: 'none' }}
                        id="additional-files"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                      />
                      <label htmlFor="additional-files">
                        <Button
                          variant="contained"
                          component="span"
                          className={classes.uploadButton}
                          fullWidth
                          startIcon={<CloudUpload />}
                        >
                          {isMobile ? 'Anexar' : 'Anexar Documentos'}
                        </Button>
                      </label>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Button
                        variant="outlined"
                        className={classes.manualButton}
                        fullWidth
                        startIcon={<PhotoCamera />}
                        onClick={() => setCameraOpen(true)}
                        disabled={processingImage}
                      >
                        {isMobile ? 'Foto' : 'Tirar Foto'}
                      </Button>
                    </Grid>

                    {files.length > 0 && (
                      <Grid item xs={12} sm={6}>
                        <div className={classes.thumbnailContainer}>
                          {files.map((file, index) => (
                            <div key={index} className={file.type === 'application/pdf' ? classes.pdfThumbnail : classes.thumbnail}>
                              {file.type === 'application/pdf' ? (
                                <PictureAsPdf style={{ color: '#d32f2f', fontSize: 30 }} />
                              ) : (
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Documento ${index}`}
                                  onError={(e) => {
                                    console.error('Erro ao carregar imagem:', e);
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              )}
                              <IconButton
                                className={classes.deleteButton}
                                size="small"
                                onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </div>
                          ))}
                        </div>
                      </Grid>
                    )}
                  </Grid>
                </div>
              </Collapse>
            </div>

            {/* Botão de Envio */}
            <Button
              onClick={handleAddItem}
              variant="contained"
              className={classes.submitButton}
              fullWidth
              startIcon={<Send />}
              disabled={isLoading || isSubmitting || processingImage}
            >
              {isLoading || isSubmitting || processingImage ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Gerar Procuração Eletrônica'
              )}
            </Button>
          </Paper>
        </Grid>

        {/* Coluna direita - Preview */}
        <Grid item xs={12} lg={6}>
          <Paper
            style={{
              padding: 16,
              backgroundColor: '#f8f9fa',
              border: '1px solid #e0e0e0',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              marginBottom: 16
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Typography
                variant="h6"
                style={{
                  color: '#2d5a3d',
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 600
                }}
              >
                📄 Pré-visualização do Documento
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  const printWindow = window.open('', '_blank', 'width=800,height=600');
                  if (!printWindow) return;

                  // Gerar texto com formatação HTML mantendo negrito nos dados
                  const gerarTextoProcuradoresLimpo = () => {
                    const procuradores = [];
                    if (newItem.nomeProcurador) procuradores.push({ nome: newItem.nomeProcurador, cpf: newItem.cpfProcurador, rg: newItem.rgProcurador, nregistro: newItem.nregistroProcurador, nacionalidade: newItem.nacionalidadeProcurador, estadoCivil: newItem.estadoCivilProcurador, profissao: newItem.profissaoProcurador, endereco: newItem.enderecoProcurador, municipio: newItem.municipioProcurador, estado: newItem.estadoProcuradorEnd, cep: newItem.cepProcurador });
                    if (newItem.nomeProcurador1) procuradores.push({ nome: newItem.nomeProcurador1, cpf: newItem.cpfProcurador1, rg: newItem.rgProcurador1,nregistro: newItem.nregistroProcurador1, nacionalidade: newItem.nacionalidadeProcurador1, estadoCivil: newItem.estadoCivilProcurador1, profissao: newItem.profissaoProcurador1, endereco: newItem.enderecoProcurador1, municipio: newItem.municipioProcurador1, estado: newItem.estadoProcuradorEnd1, cep: newItem.cepProcurador1 });
                    if (newItem.nomeProcurador2) procuradores.push({ nome: newItem.nomeProcurador2, cpf: newItem.cpfProcurador2, rg: newItem.rgProcurador2,nregistro: newItem.nregistroProcurador2, nacionalidade: newItem.nacionalidadeProcurador2, estadoCivil: newItem.estadoCivilProcurador2, profissao: newItem.profissaoProcurador2, endereco: newItem.enderecoProcurador2, municipio: newItem.municipioProcurador2, estado: newItem.estadoProcuradorEnd2, cep: newItem.cepProcurador2 });
                    if (newItem.nomeProcurador3) procuradores.push({ nome: newItem.nomeProcurador3, cpf: newItem.cpfProcurador3, rg: newItem.rgProcurador3,nregistro: newItem.nregistroProcurador3, nacionalidade: newItem.nacionalidadeProcurador3, estadoCivil: newItem.estadoCivilProcurador3, profissao: newItem.profissaoProcurador3, endereco: newItem.enderecoProcurador3, municipio: newItem.municipioProcurador3, estado: newItem.estadoProcuradorEnd3, cep: newItem.cepProcurador3 });
                    if (newItem.nomeProcurador4) procuradores.push({ nome: newItem.nomeProcurador4, cpf: newItem.cpfProcurador4, rg: newItem.rgProcurador4,nregistro: newItem.nregistroProcurador4, nacionalidade: newItem.nacionalidadeProcurador4, estadoCivil: newItem.estadoCivilProcurador4, profissao: newItem.profissaoProcurador4, endereco: newItem.enderecoProcurador4, municipio: newItem.municipioProcurador4, estado: newItem.estadoProcuradorEnd4, cep: newItem.cepProcurador4 });
                    if (newItem.nomeProcurador5) procuradores.push({ nome: newItem.nomeProcurador5, cpf: newItem.cpfProcurador5, rg: newItem.rgProcurador5,nregistro: newItem.nregistroProcurador5, nacionalidade: newItem.nacionalidadeProcurador5, estadoCivil: newItem.estadoCivilProcurador5, profissao: newItem.profissaoProcurador5, endereco: newItem.enderecoProcurador5, municipio: newItem.municipioProcurador5, estado: newItem.estadoProcuradorEnd5, cep: newItem.cepProcurador5 });

                    if (procuradores.length === 0) return '';

                    return procuradores.map((p, index) => {
                      let texto = '';
                      // Separador com "e/ou" entre procuradores
                      if (index > 0) texto += ' e/ou ';

                      texto += `<strong>${p.nome}</strong>`;
                      if (p.rg) texto += `, RG Nº <strong>${p.rg}</strong>`;
                       if (p.nregistro) texto += `, Nº Registro <strong>${p.nregistro}</strong>`;
                      if (p.cpf) texto += `, CPF Nº <strong>${formatCpfCnpj(p.cpf)}</strong>`;
                      texto += `, nacionalidade <strong>${p.nacionalidade || 'brasileiro'}</strong>`;
                      if (p.estadoCivil) texto += `, estado civil <strong>${p.estadoCivil}</strong>`;
                      if (p.profissao) texto += `, profissão <strong>${p.profissao}</strong>`;
                      if (p.municipio && p.estado) {
                        texto += ', residente ';
                        if (p.endereco) texto += `na <strong>${p.endereco}, ${p.municipio}/${p.estado}</strong>`;
                        else texto += `em <strong>${p.municipio}/${p.estado}</strong>`;
                      }

                      return texto;
                    }).join('');
                  };

                  const textoProcuradores = gerarTextoProcuradoresLimpo();

                  // Determinar qual texto usar baseado no modo
                  let textoOutorgante = '';

                  if (modoJuridico) {
                    // Texto para modo jurídico (empresa)
                    textoOutorgante = `A empresa <strong>${newItem.nomeEmpresaJuridico || '[NOME DA EMPRESA]'}</strong>, inscrita no CNPJ sob o nº <strong>${formatCpfCnpj(newItem.cnpjEmpresaJuridico || '')}</strong>, com sede na cidade de <strong>${newItem.municipioEmpresaJuridico || '[MUNICÍPIO]'}/${newItem.estadoEmpresaJuridico || '[ESTADO]'}</strong>, representada neste ato pelo sócio administrador <strong>${newItem.nomeSocioAdministrador || '[NOME DO SÓCIO ADMINISTRADOR]'}</strong>, nacionalidade ${newItem.nacionalidadeSocioAdministrador || 'brasileiro(a)'}${newItem.dataNascimentoSocioAdministrador ? `, nascido(a) em <strong>${newItem.dataNascimentoSocioAdministrador}</strong>` : ''}, residente na cidade de <strong>${newItem.municipioEmpresaJuridico || '[MUNICÍPIO]'}/${newItem.estadoEmpresaJuridico || '[ESTADO]'}</strong>${newItem.rgSocioAdministrador ? `, cédula de identidade n° <strong>${newItem.rgSocioAdministrador}</strong>` : ''}${newItem.cpfSocioAdministrador ? `, inscrito(a) no CPF sob o nº <strong>${formatCpfCnpj(newItem.cpfSocioAdministrador)}</strong>` : ''}`;
                  } else {
                    // Texto para modo principal (pessoa física)
                    textoOutorgante = `Eu, <strong>${newItem.nomeProprietario || '[NOME DO PROPRIETÁRIO]'}</strong>, nacionalidade: <strong>${newItem.nacionalidadeProprietario || 'brasileiro(a)'}</strong>${newItem.dataNascimentoProprietario ? `, nascido(a) em <strong>${newItem.dataNascimentoProprietario}</strong>` : ''}${(newItem.nomePaiProprietario || newItem.nomeMaeProprietario) ? `, filho(a) de ${newItem.nomePaiProprietario ? `<strong>${newItem.nomePaiProprietario}</strong>` : ''}${newItem.nomePaiProprietario && newItem.nomeMaeProprietario ? ' e ' : ''}${newItem.nomeMaeProprietario ? `<strong>${newItem.nomeMaeProprietario}</strong>` : ''}` : ''}${(newItem.municipioProprietario && newItem.estadoProprietario) ? `, residente e domiciliado(a) ${newItem.enderecoProprietario ? `na <strong>${newItem.enderecoProprietario}, ${newItem.municipioProprietario}/${newItem.estadoProprietario}</strong>` : `em <strong>${newItem.municipioProprietario}/${newItem.estadoProprietario}</strong>`}` : ''}${newItem.rgProprietario ? `. Cédula de identidade n° <strong>${newItem.rgProprietario}</strong>` : ''}${newItem.cpfProprietario ? `, inscrito(a) no CPF sob o nº <strong>${formatCpfCnpj(newItem.cpfProprietario)}</strong>` : ''}`;
                  }

                  // Gerar descrição do veículo
                  let textoVeiculo = 'o veículo de propriedade da Outorgante, com as seguintes características: ';
                  const caracteristicas = [];
                  if (newItem.modelo) caracteristicas.push(`marca/modelo: <strong>${newItem.modelo}</strong>`);
                  if (newItem.id) caracteristicas.push(`placa: <strong>${newItem.id}</strong>`);
                  if (newItem.renavam) caracteristicas.push(`código RENAVAM: <strong>${newItem.renavam}</strong>`);
                  if (newItem.chassi) caracteristicas.push(`chassi: <strong>${newItem.chassi}</strong>`);
                  if (newItem.combustivel) caracteristicas.push(`combustível: <strong>${newItem.combustivel}</strong>`);
                  if (newItem.anoFabricacao) caracteristicas.push(`ano fab.: <strong>${newItem.anoFabricacao}</strong>`);
                  if (newItem.anoModelo) caracteristicas.push(`ano mod.: <strong>${newItem.anoModelo}</strong>`);
                  if (newItem.cor) caracteristicas.push(`cor predominante: <strong>${newItem.cor}</strong>`);
                  textoVeiculo += caracteristicas.join(', ');

            const printHTML = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="UTF-8">
                      <title>Procuração Eletrônica</title>
                      <style>
                        @page {
                          size: A4;
                          margin: 15mm 20mm;
                        }
                        * {
                          -webkit-print-color-adjust: exact !important;
                          print-color-adjust: exact !important;
                          color: #000 !important;
                        }
                        body {
                          font-family: 'Calibri', Arial, sans-serif;
                          font-size: 12pt;
                          line-height: 1.8; /* Aumentado para espaçamento maior entre linhas */
                          color: #000;
                          background: white;
                          padding: 20px; /* Removido padding aqui para @page controlar margens */
                          font-weight: normal !important;

                          word-spacing: 0.15em; /* Espaçamento maior entre palavras */
                        }
                        strong, b {
                          font-weight: 700 !important;
                          color: #000 !important;
                        }
                        h1 {
                          font-size: 18pt;
                          font-weight: 700 !important;
                          text-align: center;
                          margin-bottom: 24px;
                          text-transform: uppercase;
                          color: #000 !important;
                          font-family: 'Calibri', Arial, sans-serif;
                          word-spacing: 0.15em;
                        }
                        p {
                          margin-bottom: 16px; /* Espaçamento entre parágrafos */
                          text-align: justify;
                          font-weight: normal !important;
                          color: #000 !important;
                          font-family: 'Calibri', Arial, sans-serif;
                          word-spacing: 0.15em;
                        }
                        p strong, p b {
                          font-weight: 700 !important;
                          color: #000 !important;
                        }
                        .signature-section {
                          margin-top: 80px;
                          text-align: center;
                          font-weight: normal !important;
                        }
                        .signature-block {
                          border-top: 2px solid #000;
                          width: 300px;
                          margin: 0 auto;
                          padding-top: 8px;
                          font-size: 12pt; /* Tamanho da fonte para "ASSINATURA" */
                          font-weight: normal !important;
                          color: #000 !important;
                          font-family: 'Calibri', Arial, sans-serif;
                          word-spacing: 0.15em;
                        }
                        .footer {
                          font-size: 10pt;
                          text-align: center;
                          margin-top: 32px;
                          font-style: italic;
                          font-weight: normal !important;
                          color: #000 !important;
                          font-family: 'Calibri', Arial, sans-serif;
                          word-spacing: 0.15em;
                        }
                        img {
                          max-width: 300px;
                          max-height: 100px;
                          margin: 20px auto;
                          display: block;
                        }
                        @media print {
                          * {
                            color: #000 !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                          }
                          body {
                            font-weight: normal !important;
                          }
                          body, p, div, span, h1, h2, h3, li {
                            font-weight: normal !important;
                            color: #000 !important;
                          }
                          strong, b {
                            font-weight: 700 !important;
                            color: #000 !important;
                          }
                          p strong, p b {
                            font-weight: 700 !important;
                            color: #000 !important;
                          }
                          h1 {
                            font-weight: 700 !important;
                            color: #000 !important;
                          }
                        }
                        @media screen {
                          strong, b {
                            font-weight: 700 !important;
                            color: #000 !important;
                          }
                          p strong, p b {
                            font-weight: 700 !important;
                            color: #000 !important;
                          }
                        }
                      </style>
                    </head>
                    <body>
                      <h1>PROCURAÇÃO ELETRÔNICA</h1>

                      <p>${textoOutorgante}; por este instrumento nomeia(m) e constitui(em) seu(s) (sua(s)) bastante procurador(a)(es)(as), podendo agir em CONJUNTO ou ISOLADAMENTE, ${textoProcuradores}, com poderes para o fim especial de vender, transferir à quem lhe convier pelo preço e condições que ajustar ${textoVeiculo}; podendo para isso ditos Procurador(es), receber o preço da venda, dar recibos e quitações, assinar requerimentos, termos de transferências e ou de repasse de bem, solicitar e retirar 2ª via de documentos - CRV e CRLV, emitir CRLV digital, endosso de documentação, efetuar vistorias, receber créditos de consórcios, solicitar colocação de placas e lacre, retirar documentos postados nos Correios, alterar endereço de postagem, solicitar remarcação de chassi e motor ou troca de motor, solicitar troca categoria ou combustível, requerer alteração de características e dados, solicitar intenção de venda (ATPV), realizar o cancelamento de intenção de venda (ATPV), solicitar etiquetas de identificação, solicitar baixa definitiva do veículo, comunicar venda junto aos órgãos competentes, cancelar comunicação de venda, cancelamento de processo de transferência, manter reserva de domínio, retirar reserva de domínio, usar o veículo em apreço, manejando o mesmo em qualquer parte do território nacional ou estrangeiro, ficando civil e criminalmente responsável por qualquer acidente, multas ou ocorrências que venha a ocorrer com o veículo, que na presente data passa a ser de total responsabilidade dos Outorgados, usar e gozar do veículo como coisa sua e sem interferência ou autorização de outros, requerer, perante qualquer autoridade alfandegária ou aduaneira de país estrangeiro, licença ou permissão e turismo, podendo representar a Outorgante, junto as repartições públicas federais, estaduais, municipais, inclusive junto ao DETRAN e onde com esta apresentar-se, pagar taxas, multas e impostos, efetuar licenciamento, assinar termos de entrega e ou qualquer outro documento que for necessário em caso de apreensão do veículo, inclusive retirar/liberar o referido veículo, bem como representar perante qualquer instituição financeira, banco comercial, companhia de arrendamento mercantil ou administradora de consorcio para efetivar a quitação de financiamentos, leasings ou consórcios e a baixa/levantamento de qualquer gravame ou restrição, tais como alienação fiduciária em garantia ou reserva de domínio, assim como para efetuar a retirada do instrumento de liberação ou ainda assinar opção de compra, carta resposta, termo de rescisão contratual, termo de liquidação contratual de arrendamento mercantil ou documento equivalente, conforme o caso e se necessário for, representando e assinando o que preciso for para o referido fim, <strong>VEDADO SUBSTABELECER</strong>.</p>

                      <p>A procuração é outorgada em caráter irrevogável e irretratável.</p>

                      <p>Tubarão, ${formatDate(newItem.dataCriacao)}.</p>

                      ${newItem.signature ? `
                      <div class="signature-section">
                        <img src="${newItem.signature}" alt="Assinatura do Proprietário" />
                      </div>
                      ` : ''}

                      <div class="signature-section">
                        <div class="signature-block">
                          ASSINATURA
                        </div>
                      </div>

                      <p class="footer">
                        PROCURAÇÃO VÁLIDA CONFORME PORTARIA Nº 0656/DETRAN/PROJUR/2022 de 15/12/2022 Art. 2º e LEI Nº 14.063, DE 23 DE SETEMBRO DE 2020
                      </p>

                      <script>
                        window.onload = function() {
                          // Configurar CSS para remover cabeçalhos e rodapés
                          const style = document.createElement('style');
                          style.textContent = \`
                            @page { 
                              margin: 15mm 20mm;
                              /* Remove cabeçalho e rodapé em alguns navegadores */
                              @top-left { content: ""; }
                              @top-center { content: ""; }
                              @top-right { content: ""; }
                              @bottom-left { content: ""; }
                              @bottom-center { content: ""; }
                              @bottom-right { content: ""; }
                            }
                          \`;
                          document.head.appendChild(style);

                          // Limpar título para evitar aparecer no cabeçalho
                          document.title = '';

                          setTimeout(function() {
                            // Abrir diálogo de impressão
                            window.print();
                          }, 500);
                        };

                        // Configurar antes da impressão
                        window.addEventListener('beforeprint', function() {
                          document.title = '';
                          // Tentar usar API do Chrome/Edge para configurar impressão
                          if (window.chrome && window.chrome.webview) {
                            // Configurações para navegadores baseados em Chromium
                            const printSettings = {
                              headerFooterEnabled: false,
                              shouldPrintHeaderFooter: false,
                              displayHeaderFooter: false,
                              marginType: 1, // Custom margins
                              marginTop: 15,
                              marginBottom: 15,
                              marginLeft: 20,
                              marginRight: 20
                            };
                          }
                        });

                        // Restaurar após impressão
                        window.addEventListener('afterprint', function() {
                          window.close();
                        });
                      </script>
                    </body>
                    </html>
                  `;

                  printWindow.document.write(printHTML);
                  printWindow.document.close();
                }}
                style={{
                  background: 'linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%)',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  padding: '6px 16px'
                }}
                className={classes.noPrint}
              >
                🖨️ Imprimir Preview
              </Button>
            </div>

            <div
              id="preview-content"
              style={{
                backgroundColor: 'white',
                padding: 24,
                borderRadius: 8,
                minHeight: '80vh',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                fontFamily: 'Calibri, Arial, sans-serif',
                fontSize: '11pt',
                lineHeight: 1.6,
                transition: 'all 0.3s ease-in-out',
                wordSpacing: '0.15em'
              }}
            >
              {/* Preview do documento */}
              <Typography
                style={{
                  fontSize: '16pt',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: 24,
                  textTransform: 'uppercase',
                  fontFamily: 'Calibri, Arial, sans-serif',
                  wordSpacing: '0.15em'
                }}
              >
                PROCURAÇÃO ELETRÔNICA
              </Typography>

              {modoJuridico ? (
                <div
                  style={{ fontSize: '11pt', lineHeight: 1.8, textAlign: 'justify', marginBottom: 16, fontFamily: 'Calibri, Arial, sans-serif', wordSpacing: '0.15em' }}
                  dangerouslySetInnerHTML={{
                    __html: `A empresa <strong>${newItem.nomeEmpresaJuridico || '[NOME DA EMPRESA]'}</strong>, inscrita no CNPJ sob o nº <strong>${formatCpfCnpj(newItem.cnpjEmpresaJuridico || '')}</strong>, com sede na cidade de <strong>${newItem.municipioEmpresaJuridico || '[MUNICÍPIO]'}/${newItem.estadoEmpresaJuridico || '[ESTADO]'}</strong>, representada neste ato pelo sócio administrador <strong>${newItem.nomeSocioAdministrador || '[NOME DO SÓCIO ADMINISTRADOR]'}</strong>, nacionalidade ${newItem.nacionalidadeSocioAdministrador || 'brasileiro(a)'}${newItem.dataNascimentoSocioAdministrador ? `, nascido(a) em <strong>${newItem.dataNascimentoSocioAdministrador}</strong>` : ''}, residente na cidade de <strong>${newItem.municipioSocioAdministrador || '[MUNICÍPIO]'}/${newItem.estadoSocioAdministrador || '[ESTADO]'}</strong>${newItem.rgSocioAdministrador ? `, cédula de identidade n° <strong>${newItem.rgSocioAdministrador}</strong>` : ''}${newItem.cpfSocioAdministrador ? `, inscrito(a) no CPF sob o nº <strong>${formatCpfCnpj(newItem.cpfSocioAdministrador)}</strong>` : ''}; por este instrumento nomeia(m) e constitui(em) seu(s) (sua(s)) bastante procurador(a)(es)(as), podendo agir em CONJUNTO ou ISOLADAMENTE, ${gerarTextoProcuradores()}, com poderes para o fim especial de vender, transferir à quem lhe convier pelo preço e condições que ajustar o veículo de propriedade da Outorgante, com as seguintes características: ${newItem.modelo ? `marca/modelo: <strong>${newItem.modelo}</strong>, ` : ''}${newItem.id ? `placa: <strong>${newItem.id}</strong>, ` : ''}${newItem.renavam ? `código RENAVAM: <strong>${newItem.renavam}</strong>, ` : ''}${newItem.chassi ? `chassi: <strong>${newItem.chassi}</strong>, ` : ''}${newItem.combustivel ? `combustível: <strong>${newItem.combustivel}</strong>, ` : ''}${newItem.anoFabricacao ? `ano fab.: <strong>${newItem.anoFabricacao}</strong> ` : ''}${newItem.anoModelo ? `ano mod.: <strong>${newItem.anoModelo}</strong>, ` : ''}${newItem.cor ? `cor predominante: <strong>${newItem.cor}</strong>` : ''}; podendo para isso ditos Procurador(es), receber o preço da venda, dar recibos e quitações, assinar requerimentos, termos de transferências e ou de repasse de bem, solicitar e retirar 2ª via de documentos - CRV e CRLV, emitir CRLV digital, endosso de documentação, efetuar vistorias, receber créditos de consórcios, solicitar colocação de placas e lacre, retirar documentos postados nos Correios, alterar endereço de postagem, solicitar remarcação de chassi e motor ou troca de motor, solicitar troca categoria ou combustível, requerer alteração de características e dados, solicitar intenção de venda (ATPV), realizar o cancelamento de intenção de venda (ATPV), solicitar etiquetas de identificação, solicitar baixa definitiva do veículo, comunicar venda junto aos órgãos competentes, cancelar comunicação de venda, cancelamento de processo de transferência, manter reserva de domínio, retirar reserva de domínio, usar o veículo em apreço, manejando o mesmo em qualquer parte do território nacional ou estrangeiro, ficando civil e criminalmente responsável por qualquer acidente, multas ou ocorrências que venha a ocorrer com o veículo, que na presente data passa a ser de total responsabilidade dos Outorgados, usar e gozar do veículo como coisa sua e sem interferência ou autorização de outros, requerer, perante qualquer autoridade alfandegária ou aduaneira de país estrangeiro, licença ou permissão e turismo, podendo representar a Outorgante, junto as repartições públicas federais, estaduais, municipais, inclusive junto ao DETRAN e onde com esta apresentar-se, pagar taxas, multas e impostos, efetuar licenciamento, assinar termos de entrega e ou qualquer outro documento que for necessário em caso de apreensão do veículo, inclusive retirar/liberar o referido veículo, bem como representar perante qualquer instituição financeira, banco comercial, companhia de arrendamento mercantil ou administradora de consorcio para efetivar a quitação de financiamentos, leasings ou consórcios e a baixa/levantamento de qualquer gravame ou restrição, tais como alienação fiduciáriaem garantia ou reserva de domínio, assim como para efetuar a retirada do instrumento de liberação ou ainda assinar opção de compra, carta resposta, termo de rescisão contratual, termo de liquidação contratual de arrendamento mercantil ou documento equivalente, conforme o caso e se necessário for, representando e assinando o que preciso for para o referido fim, <strong>VEDADO SUBSTABELECER</strong>.`
                  }}
                />
              ) : (
                <div
                  style={{ fontSize: '11pt', lineHeight: 1.8, textAlign: 'justify', marginBottom: 16, fontFamily: 'Calibri, Arial, sans-serif', wordSpacing: '0.15em' }}
                  dangerouslySetInnerHTML={{
                    __html: `Eu, <strong>${newItem.nomeProprietario || '[NOME DO PROPRIETÁRIO]'}</strong>, nacionalidade: <strong>${newItem.nacionalidadeProprietario || 'brasileiro(a)'}</strong>${newItem.dataNascimentoProprietario ? `, nascido(a) em <strong>${newItem.dataNascimentoProprietario}</strong>` : ''}${(newItem.nomePaiProprietario || newItem.nomeMaeProprietario) ? `, filho(a) de ${newItem.nomePaiProprietario ? `<strong>${newItem.nomePaiProprietario}</strong>` : ''}${newItem.nomePaiProprietario && newItem.nomeMaeProprietario ? ' e ' : ''}${newItem.nomeMaeProprietario ? `<strong>${newItem.nomeMaeProprietario}</strong>` : ''}` : ''}${(newItem.municipioProprietario && newItem.estadoProprietario) ? `, residente e domiciliado(a) ${newItem.enderecoProprietario ? `na <strong>${newItem.enderecoProprietario}, ${newItem.municipioProprietario}/${newItem.estadoProprietario}</strong>` : `em <strong>${newItem.municipioProprietario}/${newItem.estadoProprietario}</strong>`}` : ''}${newItem.rgProprietario ? `. Cédula de identidade n° <strong>${newItem.rgProprietario}</strong>` : ''}${newItem.cpfProprietario ? `, inscrito(a) no CPF sob o nº <strong>${formatCpfCnpj(newItem.cpfProprietario)}</strong>` : ''}; por este instrumento nomeia(m) e constitui(em) seu(s) (sua(s)) bastante procurador(a)(es)(as), podendo agir em CONJUNTO ou ISOLADAMENTE, ${gerarTextoProcuradores()}, com poderes para o fim especial de vender, transferir à quem lhe convier pelo preço e condições que ajustar o veículo de propriedade da Outorgante, com as seguintes características: ${newItem.modelo ? `marca/modelo: <strong>${newItem.modelo}</strong>, ` : ''}${newItem.id ? `placa: <strong>${newItem.id}</strong>, ` : ''}${newItem.renavam ? `código RENAVAM: <strong>${newItem.renavam}</strong>, ` : ''}${newItem.chassi ? `chassi: <strong>${newItem.chassi}</strong>, ` : ''}${newItem.combustivel ? `combustível: <strong>${newItem.combustivel}</strong>, ` : ''}${newItem.anoFabricacao ? `ano fab.: <strong>${newItem.anoFabricacao}</strong> ` : ''}${newItem.anoModelo ? `ano mod.: <strong>${newItem.anoModelo}</strong>, ` : ''}${newItem.cor ? `cor predominante: <strong>${newItem.cor}</strong>` : ''}; podendo para isso ditos Procurador(es), receber o preço da venda, dar recibos e quitações, assinar requerimentos, termos de transferências e ou de repasse de bem, solicitar e<bos> retirar 2ª via de documentos - CRV e CRLV, emitir CRLV digital, endosso de documentação, efetuar vistorias, receber créditos de consórcios, solicitar colocação de placas e lacre, retirar documentos postados nos Correios, alterar endereço de postagem, solicitar remarcação de chassi e motor ou troca de motor, solicitar troca categoria ou combustível, requerer alteração de características e dados, solicitar intenção de venda (ATPV), realizar o cancelamento de intenção de venda (ATPV), solicitar etiquetas de identificação, solicitar baixa definitiva do veículo, comunicar venda junto aos órgãos competentes, cancelar comunicação de venda, cancelamento de processo de transferência, manter reserva de domínio, retirar reserva de domínio, usar o veículo em apreço, manejando o mesmo em qualquer parte do território nacional ou estrangeiro, ficando civil e criminalmente responsável por qualquer acidente, multas ou ocorrências que venha a ocorrer com o veículo, que na presente data passa a ser de total responsabilidade dos Outorgados, usar e gozar do veículo como coisa sua e sem interferência ou autorização de outros, requerer, perante qualquer autoridade alfandegária ou aduaneira de país estrangeiro, licença ou permissão e turismo, podendo representar a Outorgante, junto as repartições públicas federais, estaduais, municipais, inclusive junto ao DETRAN e onde com esta apresentar-se, pagar taxas, multas e impostos, efetuar licenciamento, assinar termos de entrega e ou qualquer outro documento que for necessário em caso de apreensão do veículo, inclusive retirar/liberar o referido veículo, bem como representar perante qualquer instituição financeira, banco comercial, companhia de arrendamento mercantil ou administradora de consorcio para efetivar a quitação de financiamentos, leasings ou consórcios e a baixa/levantamento de qualquer gravame ou restrição, tais como alienação fiduciária em garantia ou reserva de domínio, assim como para efetuar a retirada do instrumento de liberação ou ainda assinar opção de compra, carta resposta, termo de rescisão contratual, termo de liquidação contratual de arrendamento mercantil ou documento equivalente, conforme o caso e se necessário for, representando e assinando o que preciso for para o referido fim, <strong>VEDADO SUBSTABELECER</strong>.`
                  }}
                />
              )}

              <Typography style={{ fontSize: '11pt', lineHeight: 1.8, textAlign: 'justify', marginBottom: 16, fontFamily: 'Calibri, Arial, sans-serif', wordSpacing: '0.15em' }}>
                A procuração é outorgada em caráter irrevogável e irretratável.
              </Typography>

              <Typography style={{ fontSize: '11pt', lineHeight: 1.8, textAlign: 'justify', marginBottom: 32, fontFamily: 'Calibri, Arial, sans-serif', wordSpacing: '0.15em' }}>
                Tubarão, {formatDate(newItem.dataCriacao)}.
              </Typography>

              {newItem.signature && (
                <div style={{ textAlign: 'center', marginTop: 48, marginBottom: 24 }}>
                  <img
                    src={newItem.signature}
                    alt="Assinatura do Proprietário"
                    style={{
                      maxWidth: '300px',
                      maxHeight: '100px',
                      border: '1px solid #ddd',
                      borderRadius: 4
                    }}
                  />
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: 48 }}>
                <div style={{
                  borderTop: '2px solid #000',
                  width: '300px',
                  margin: '0 auto',
                  paddingTop: 8,
                  fontSize: '11pt',
                  fontFamily: 'Calibri, Arial, sans-serif',
                  wordSpacing: '0.15em'
                }}>
                  ASSINATURA
                </div>
              </div>

              <Typography style={{
                fontSize: '9pt',
                textAlign: 'center',
                marginTop: 32,
                fontStyle: 'italic',
                fontFamily: 'Calibri, Arial, sans-serif',
                wordSpacing: '0.15em'
              }}>
                PROCURAÇÃO VÁLIDA CONFORME PORTARIA Nº 0656/DETRAN/PROJUR/2022 de 15/12/2022 Art. 2º e LEI Nº 14.063, DE 23 DE SETEMBRO DE 2020
              </Typography>
            </div>
          </Paper>
        </Grid>
      </Grid>

      {/* Modal Câmera */}
      <Dialog open={cameraOpen} onClose={() => setCameraOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Tirar Foto</Typography>
            <IconButton onClick={() => setCameraOpen(false)}>
              <Close />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: isMobile ? '50vh' : '60vh',
              borderRadius: '8px',
              backgroundColor: '#000'
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={takePhoto}
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            startIcon={<PhotoCamera />}
          >
            Capturar Foto
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Recorte */}
      <Dialog open={cropOpen} onClose={() => setCropOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Recortar Imagem</Typography>
            <IconButton onClick={() => setCropOpen(false)}>
              <Close />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Cropper
            image={imageToCrop || ''}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={    setZoom}
            style={{
              containerStyle: {
                width: '100%',
                height: '100%',
                position: 'relative',
                backgroundColor: '#f5f5f5'
              }
            }}
          />
          <div className={classes.cropControls}>
            <Button
              onClick={() => setCropOpen(false)}
              variant="outlined"
              color="secondary"
              style={{ marginRight: '16px' }}
            >
              Cancelar
            </Button>
            <Button
              onClick={cropImage}
              variant="contained"
              color="primary"
            >
              Aplicar Recorte
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Botão Flutuante para Adicionar Contatos */}
      <Fab
        className={classes.fabButton}
        onClick={() => setContactDialogOpen(true)}
        aria-label="Adicionar Contato"
      >
        <Add />
      </Fab>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog
        open={empresaDeleteDialogOpen}
        onClose={() => setEmpresaDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d32f2f' }}>
            <Delete />
            Confirmar Exclusão
          </div>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" style={{ marginBottom: 16 }}>
            Tem certeza que deseja excluir a empresa <strong>{empresaParaExcluir?.nomeEmpresa}</strong>?
          </Typography>
          <Typography variant="body2" style={{ color: '#666' }}>
            Esta ação não poderá ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEmpresaDeleteDialogOpen(false)}
            color="default"
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmarExclusaoEmpresa}
            variant="contained"
            style={{ backgroundColor: '#d32f2f', color: '#fff' }}
            disabled={isLoadingContact}
            startIcon={isLoadingContact ? <CircularProgress size={20} /> : <Delete />}
          >
            {isLoadingContact ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para Editar Empresa */}
      <Dialog
        open={empresaEditDialogOpen}
        onClose={() => {
          setEmpresaEditDialogOpen(false);
          setEmpresaParaEditar(null);
          resetEmpresaForm();
        }}
        maxWidth="md"
        fullWidth
        className={classes.contactDialog}
      >
        <DialogTitle>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Edit />
              Editar Empresa
            </Typography>
            <IconButton onClick={() => {
              setEmpresaEditDialogOpen(false);
              setEmpresaParaEditar(null);
              resetEmpresaForm();
            }}>
              <Close />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          <div className={classes.contactForm}>
            <TextField
              label="ID da Empresa (5 dígitos)"
              value={novaEmpresa.id}
              disabled
              fullWidth
              variant="outlined"
              size="small"
              helperText="ID não pode ser alterado"
            />

            <TextField
              label="Nome da Empresa"
              value={novaEmpresa.nomeEmpresa}
              onChange={(e) => setNovaEmpresa(prev => ({ ...prev, nomeEmpresa: e.target.value }))}
              fullWidth
              variant="outlined"
              size="small"
              required
            />

            <div>
              <Typography variant="body2" style={{ marginBottom: 12, color: '#666' }}>
                Quantidade de Procuradores
              </Typography>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <Button
                    key={num}
                    variant={novaEmpresa.quantidadeProcuradores === num ? 'contained' : 'outlined'}
                    onClick={() => setNovaEmpresa(prev => ({ ...prev, quantidadeProcuradores: num }))}
                    className={classes.uploadButton}
                    style={{
                      minWidth: '50px',
                      background: novaEmpresa.quantidadeProcuradores === num
                        ? 'linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%)'
                        : 'transparent'
                    }}
                    size="small"
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Campos dos Procuradores */}
            {Array.from({ length: novaEmpresa.quantidadeProcuradores }, (_, index) => (
              <Card key={index} style={{ padding: 16, marginBottom: 16, backgroundColor: '#f8f9fa' }}>
                <Typography variant="subtitle2" style={{ marginBottom: 12, color: '#2d5a3d', fontWeight: 600 }}>
                  Procurador {index + 1}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="CPF/CNPJ"
                      value={formatCpfCnpj(novaEmpresa.procuradores[index]?.cpfCnpj || '')}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        atualizarProcuradorEmpresa(index, 'cpfCnpj', rawValue);
                      }}
                      fullWidth
                      variant="outlined"
                      size="small"
                      required
                      error={!!(novaEmpresa.procuradores[index]?.cpfCnpj) && !isValidCpfCnpj(novaEmpresa.procuradores[index]?.cpfCnpj)}
                      helperText={!!(novaEmpresa.procuradores[index]?.cpfCnpj) && !isValidCpfCnpj(novaEmpresa.procuradores[index]?.cpfCnpj)
                        ? 'CPF/CNPJ inválido'
                        : 'Nome será preenchido automaticamente'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Nome Completo"
                      value={novaEmpresa.procuradores[index]?.nome || ''}
                      onChange={(e) => atualizarProcuradorEmpresa(index, 'nome', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="RG"
                      value={novaEmpresa.procuradores[index]?.rg || ''}
                      onChange={(e) => atualizarProcuradorEmpresa(index, 'rg', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="N de Registro"
                      value={novaEmpresa.procuradores[index]?.nregistro || ''}
                      onChange={(e) => atualizarProcuradorEmpresa(index, 'nregistro', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Nacionalidade"
                      value={novaEmpresa.procuradores[index]?.nacionalidade || 'brasileiro'}
                      onChange={(e) => atualizarProcuradorEmpresa(index, 'nacionalidade', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Estado Civil"
                      value={novaEmpresa.procuradores[index]?.estadoCivil || ''}
                      onChange={(e) => atualizarProcuradorEmpresa(index, 'estadoCivil', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Profissão"
                      value={novaEmpresa.procuradores[index]?.profissao || ''}
                      onChange={(e) => atualizarProcuradorEmpresa(index, 'profissao', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="CEP"
                      value={(novaEmpresa.procuradores[index]?.cep || '').replace(/(\d{5})(\d{3})/, '$1-$2')}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        atualizarProcuradorEmpresa(index, 'cep', rawValue);
                        if (rawValue.length === 8) {
                          fetchAddressFromCEPEmpresa(rawValue, index);
                        }
                      }}
                      fullWidth
                      variant="outlined"
                      size="small"
                      helperText="Endereço será preenchido automaticamente"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Endereço"
                      value={novaEmpresa.procuradores[index]?.endereco || ''}
                      onChange={(e) => atualizarProcuradorEmpresa(index, 'endereco', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Complemento/Bairro"
                      value={novaEmpresa.procuradores[index]?.complemento || ''}
                      onChange={(e) => atualizarProcuradorEmpresa(index, 'complemento', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Município"
                      value={novaEmpresa.procuradores[index]?.municipio || ''}
                      onChange={(e) => atualizarProcuradorEmpresa(index, 'municipio', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Estado"
                      value={novaEmpresa.procuradores[index]?.estado || ''}
                      onChange={(e) => atualizarProcuradorEmpresa(index, 'estado', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Card>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEmpresaEditDialogOpen(false);
              setEmpresaParaEditar(null);
              resetEmpresaForm();
            }}
            color="secondary"
          >
            Cancelar
          </Button>
          <Button
            onClick={salvarEdicaoEmpresa}
            variant="contained"
            className={classes.uploadButton}
            startIcon={<Save />}
            disabled={isLoadingContact || !novaEmpresa.id || !novaEmpresa.nomeEmpresa}
          >
            {isLoadingContact ? <CircularProgress size={24} /> : 'Salvar Alterações'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para Cadastrar Nova Empresa */}
      <Dialog
        open={empresaDialogOpen}
        onClose={() => setEmpresaDialogOpen(false)}
        maxWidth="md"
        fullWidth
        className={classes.contactDialog}
      >
        <DialogTitle>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Add />
              Cadastrar Nova Empresa
            </Typography>
            <IconButton onClick={() => setEmpresaDialogOpen(false)}>
              <Close />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          <div className={classes.contactForm}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <TextField
                label="ID da Empresa (8 dígitos)"
                value={novaEmpresa.id}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                  setNovaEmpresa(prev => ({ ...prev, id: value }));
                }}
                fullWidth
                variant="outlined"
                size="small"
                helperText="Código único de 8 dígitos (será gerado automaticamente se vazio)"
              />
              <Button
                variant="outlined"
                onClick={() => {
                  const novoId = gerarIdEmpresa();
                  setNovaEmpresa(prev => ({ ...prev, id: novoId }));
                }}
                style={{
                  minWidth: '120px',
                  height: '40px',
                  marginTop: '0px',
                  border: '1px solid #2d5a3d',
                  color: '#2d5a3d'
                }}
              >
                Gerar ID
              </Button>
            </div>

            <TextField
              label="Nome da Empresa"
              value={novaEmpresa.nomeEmpresa}
              onChange={(e) => setNovaEmpresa(prev => ({ ...prev, nomeEmpresa: e.target.value }))}
              fullWidth
              variant="outlined"
              size="small"
              required
            />

            <div>
              <Typography variant="body2" style={{ marginBottom: 12, color: '#666' }}>
                Quantidade de Procuradores
              </Typography>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <Button
                    key={num}
                    variant={novaEmpresa.quantidadeProcuradores === num ? 'contained' : 'outlined'}
                    onClick={() => setNovaEmpresa(prev => ({ ...prev, quantidadeProcuradores: num }))}
                    className={classes.uploadButton}
                    style={{
                      minWidth: '50px',
                      background: novaEmpresa.quantidadeProcuradores === num
                        ? 'linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%)'
                        : 'transparent'
                    }}
                    size="small"
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Campos dos Procuradores */}
            {Array.from({ length: novaEmpresa.quantidadeProcuradores }, (_, index) => (
              <Card key={index} style={{ padding: 16, marginBottom: 16, backgroundColor: '#f8f9fa' }}>
                <Typography variant="subtitle2" style={{ marginBottom: 12, color: '#2d5a3d', fontWeight: 600 }}>
                  Procurador {index + 1}
                </Typography>

                {/* Upload de Documentos */}
                <div style={{
                  border: '2px dashed #ccc',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px',
                  backgroundColor: '#fff'
                }}>
                  <Typography variant="body2" style={{ marginBottom: 12, color: '#666', textAlign: 'center' }}>
                    📄 Upload de Documentos (RG, CPF, CNH, Comprovante de Endereço)
                  </Typography>

                  {processingImage && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                      <CircularProgress size={16} />
                      <Typography variant="caption">Analisando documento...</Typography>
                    </div>
                  )}

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <input
                        accept="image/*,application/pdf"
                        style={{ display: 'none' }}
                        id={`empresa-procurador-${index}-upload`}
                        type="file"
                        multiple
                        onChange={(e) => handleEmpresaProcuradorFileChange(e, index)}
                      />
                      <label htmlFor={`empresa-procurador-${index}-upload`}>
                        <Button
                          variant="contained"
                          component="span"
                          className={classes.uploadButton}
                          fullWidth
                          startIcon={<CloudUpload />}
                          disabled={processingImage}
                          size="small"
                        >
                          Enviar Arquivos
                        </Button>
                      </label>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        variant="outlined"
                        className={classes.manualButton}
                        fullWidth
                        startIcon={<PhotoCamera />}
                        onClick={() => {
                          setProcuradorEditIndex(index);
                          setCameraOpen(true);
                        }}
                        disabled={processingImage}
                        size="small"
                      >
                        Tirar Foto
                      </Button>
                    </Grid>
                  </Grid>

                  {/* Thumbnails dos arquivos carregados */}
                  {empresaProcuradorFiles[index] && empresaProcuradorFiles[index].length > 0 && (
                    <div className={classes.thumbnailContainer} style={{ marginTop: 12 }}>
                      {empresaProcuradorFiles[index].map((file, fileIndex) => (
                        <div key={fileIndex} className={file.type === 'application/pdf' ? classes.pdfThumbnail : classes.thumbnail}>
                          {file.type === 'application/pdf' ? (
                            <PictureAsPdf style={{ color: '#d32f2f', fontSize: 30 }} />
                          ) : (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Procurador ${index + 1} Doc ${fileIndex}`}
                              onError={(e) => {
                                console.error('Erro ao carregar imagem:', e);
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <IconButton
                            className={classes.deleteButton}
                            size="small"
                            onClick={() => {
                              setEmpresaProcuradorFiles(prev => {
                                const newFiles = { ...prev };
                                newFiles[index] = newFiles[index].filter((_, i) => i !== fileIndex);
                                return newFiles;
                              });
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="CPF/CNPJ"
                      value={formatCpfCnpj(novaEmpresa.procuradores[index]?.cpfCnpj || '')}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        atualizarProcuradorEmpresa(index, 'cpfCnpj', rawValue);
                      }}
                      fullWidth
                      variant="outlined"
                      size="small"
                      required
                      error={!!(novaEmpresa.procuradores[index]?.cpfCnpj) && !isValidCpfCnpj(novaEmpresa.procuradores[index]?.cpfCnpj)}
                      helperText={!!(novaEmpresa.procuradores[index]?.cpfCnpj) && !isValidCpfCnpj(novaEmpresa.procuradores[index]?.cpfCnpj)
                        ? 'CPF/CNPJ inválido'
                        : 'Nome será preenchido automaticamente'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Nome Completo"
                      value={novaEmpresa.procuradores[index]?.nome || ''}
                      onChange={(e) => atualizarProcuradorEmpresa(index, 'nome', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="RG"
                      value={novaEmpresa.procuradores[index]?.rg || ''}
                      onChange={(e) => atualizarProcuradorEmpresa(index, 'rg', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="N de Registro"
                      value={novaEmpresa.procuradores[index]?.nregistro || ''}
                      onChange={(e) => atualizarProcuradorEmpresa(index, 'nregistro', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Nacionalidade"
                      value={novaEmpresa.procuradores[index]?.nacionalidade || 'brasileiro'}
                      onChange={(e) => atualizarProcuradorEmpresa(index, 'nacionalidade', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Estado Civil"
                      value={novaEmpresa.procuradores[index]?.estadoCivil || ''}
                      onChange={(e) => atualizarProcuradorEmpresa(index, 'estadoCivil', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Profissão"
                      value={novaEmpresa.procuradores[index]?.profissao || ''}
                      onChange={(e) => atualizarProcuradorEmpresa(index, 'profissao', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="CEP"
                      value={(novaEmpresa.procuradores[index]?.cep || '').replace(/(\d{5})(\d{3})/, '$1-$2')}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        atualizarProcuradorEmpresa(index, 'cep', rawValue);
                        if (rawValue.length === 8) {
                          fetchAddressFromCEPEmpresa(rawValue, index);
                        }
                      }}
                      fullWidth
                      variant="outlined"
                      size="small"
                      helperText="Endereço será preenchido automaticamente"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Endereço"
                      value={novaEmpresa.procuradores[index]?.endereco || ''}
                      onChange={(e) => atualizarProcuradorEmpresa(index, 'endereco', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Complemento/Bairro"
                      value={novaEmpresa.procuradores[index]?.complemento || ''}
                      onChange={(e) => atualizarProcuradorEmpresa(index, 'complemento', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Município"
                      value={novaEmpresa.procuradores[index]?.municipio || ''}
                      onChange={(e) => atualizarProcuradorEmpresa(index, 'municipio', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Estado"
                      value={novaEmpresa.procuradores[index]?.estado || ''}
                      onChange={(e) => atualizarProcuradorEmpresa(index, 'estado', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Card>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEmpresaDialogOpen(false)}
            color="secondary"
          >
            Cancelar
          </Button>
          <Button
            onClick={salvarEmpresa}
            variant="contained"
            className={classes.uploadButton}
            startIcon={<Save />}
            disabled={isLoadingContact || !novaEmpresa.nomeEmpresa}
          >
            {isLoadingContact ? <CircularProgress size={24} /> : 'Salvar Empresa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para Cadastrar Contatos */}
      <Dialog
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        className={classes.contactDialog}
      >
        <DialogTitle>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PersonAdd />
              Cadastrar Novo Contato
            </Typography>
            <IconButton onClick={() => setContactDialogOpen(false)}>
              <Close />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          <div className={classes.contactForm}>
            <TextField
              label="Código de Identificação (5 dígitos)"
              value={contactData.id}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                handleContactChange('id', value);
              }}
              fullWidth
              variant="outlined"
              size="small"
              required
              helperText="Código único de 5 dígitos para busca rápida"
            />

            {/* Seção de Upload de Documentos */}
            <div style={{
              border: '2px dashed #ccc',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              backgroundColor: '#f9f9f9'
            }}>
              <Typography variant="body2" style={{ marginBottom: 12, color: '#666' }}>
                📄 Upload de Documentos (RG, CPF, CNH, Comprovante de Endereço)
              </Typography>

              {processingImage && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption">Analisando documento...</Typography>
                </div>
              )}

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <input
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    id="contact-files-upload"
                    type="file"
                    multiple
                    onChange={handleContactFileChange}
                  />
                  <label htmlFor="contact-files-upload">
                    <Button
                      variant="contained"
                      component="span"
                      className={classes.uploadButton}
                      fullWidth
                      startIcon={<CloudUpload />}
                      disabled={processingImage}
                      size="small"
                    >
                      Enviar Arquivos
                    </Button>
                  </label>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    className={classes.manualButton}
                    fullWidth
                    startIcon={<PhotoCamera />}
                    onClick={() => setCameraOpen(true)}
                    disabled={processingImage}
                    size="small"
                  >
                    Tirar Foto
                  </Button>
                </Grid>
              </Grid>

              {/* Thumbnails dos arquivos */}
              {contactFiles.length > 0 && (
                <div className={classes.thumbnailContainer} style={{ marginTop: 12 }}>
                  {contactFiles.map((file, index) => (
                    <div key={index} className={file.type === 'application/pdf' ? classes.pdfThumbnail : classes.thumbnail}>
                      {file.type === 'application/pdf' ? (
                        <PictureAsPdf style={{ color: '#d32f2f', fontSize: 30 }} />
                      ) : (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Contato Doc ${index}`}
                          onError={(e) => {
                            console.error('Erro ao carregar imagem:', e);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <IconButton
                        className={classes.deleteButton}
                        size="small"
                        onClick={() => setContactFiles(prev => prev.filter((_, i) => i !== index))}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </div>
                  ))}
                </div>
              )}
            </div>



            <TextField
              label="CPF/CNPJ"
              value={formatCpfCnpj(contactData.cpfCnpj || '')}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, '');
                handleContactChange('cpfCnpj', rawValue);

                // Busca automática de nome quando CPF/CNPJ válido
                if (isValidCpfCnpj(rawValue)) {
                  const target = 'nome';
                  debouncedSearchContact(rawValue, target);
                }
              }}
              fullWidth
              variant="outlined"
              size="small"
              required
              error={!!contactData.cpfCnpj && !isValidCpfCnpj(contactData.cpfCnpj)}
              helperText={!!contactData.cpfCnpj && !isValidCpfCnpj(contactData.cpfCnpj)
                ? 'CPF/CNPJ inválido'
                : 'Nome será preenchido automaticamente'}
              InputProps={{
                endAdornment: isLoadingSearch && (contactData.cpfCnpj?.length === 11 || contactData.cpfCnpj?.length === 14) ? (
                  <CircularProgress size={24} />
                ) : null,
              }}
            />
            <TextField
              label="Nome Completo"
              value={contactData.nome}
              onChange={(e) => handleContactChange('nome', e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              required
            />

            <TextField
              label="RG"
              value={contactData.rg}
              onChange={(e) => handleContactChange('rg', e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Nacionalidade"
                  value={contactData.nacionalidade}
                  onChange={(e) => handleContactChange('nacionalidade', e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Estado Civil"
                  value={contactData.estadoCivil}
                  onChange={(e) => handleContactChange('estadoCivil', e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>

            <TextField
              label="Profissão"
              value={contactData.profissao}
              onChange={(e) => handleContactChange('profissao', e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
            />

            <TextField
              label="CEP"
              value={(contactData.cep || '').replace(/(\d{5})(\d{3})/, '$1-$2')}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, '');
                handleContactChange('cep', rawValue);
              }}
              fullWidth
              variant="outlined"
              size="small"
              helperText="Endereço será preenchido automaticamente"
            />

            <TextField
              label="Endereço"
              value={contactData.endereco}
              onChange={(e) => handleContactChange('endereco', e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Complemento/Bairro"
                  value={contactData.complemento}
                  onChange={(e) => handleContactChange('complemento', e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Município"
                  value={contactData.municipio}
                  onChange={(e) => handleContactChange('municipio', e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>

            <TextField
              label="Estado"
              value={contactData.estado}
              onChange={(e) => handleContactChange('estado', e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setContactDialogOpen(false)}
            color="secondary"
          >
            Cancelar
          </Button>
          <Button
            onClick={saveContact}
            variant="contained"
            className={classes.uploadButton}
            startIcon={<Save />}
            disabled={isLoadingContact || !contactData.id || !contactData.nome || !contactData.cpfCnpj}
          >
            {isLoadingContact ? <CircularProgress size={24} /> : 'Salvar Contato'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ListPost;