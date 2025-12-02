import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Button, Grid, Paper, Typography, IconButton,
  Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery,
  CircularProgress, Divider, Fab, Tooltip, Collapse, Card, CardContent
} from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { motion } from 'framer-motion';
import { PhotoCamera, Delete, Close, Crop, CloudUpload, Send, HelpOutline, ExpandMore, ExpandLess, Edit, PictureAsPdf, Add, Save, PersonAdd } from '@material-ui/icons';
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

// Interface para o contato do banco de dados
interface Contact {
  id: string;
  nome: string;
  cpfCnpj: string;
  rg: string;
  nacionalidade: string;
  estadoCivil: string;
  profissao: string;
  endereco: string;
  complemento: string;
  municipio: string;
  estado: string;
  cep: string;
}

// Interface para Socio da Empresa
interface SocioEmpresa {
  id: string;
  cpfCnpj: string;
  nome: string;
  rg: string;
  nacionalidade: string;
  estadoCivil: string;
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
  quantidadeSocioes: number;
  procuradores: SocioEmpresa[];
}

const useStyles = makeStyles((theme) => ({
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
    display: 'flex',
    flexDirection: 'column',
    background: 'white',
    alignItems: 'center',
    color: 'Black',
    padding: theme.spacing(1),
    borderRadius: '16px',
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(0.5),
    },
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
}));

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

const ListPost: React.FC<{
  setItems: React.Dispatch<React.SetStateAction<Item[]>>,
  onItemEnviado?: () => void,
  modeloRecurso?: 1 | 2
}> = ({ setItems, onItemEnviado, modeloRecurso = 1 }) => {
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

  // Estados das seções expandidas
  const [veiculoExpanded, setVeiculoExpanded] = useState(false);
  const [proprietarioExpanded, setEmpresaExpanded] = useState(false);
  const [procuradorExpanded, setSocioExpanded] = useState(false);
  const [assinaturaExpanded, setAssinaturaExpanded] = useState(false);
  const [documentosExpanded, setDocumentosExpanded] = useState(false);

  // Estados para os arquivos de cada seção
  const [veiculoFiles, setVeiculoFiles] = useState<File[]>([]);
  const [proprietarioDocFiles, setEmpresaDocFiles] = useState<File[]>([]);
  const [proprietarioContaFiles, setEmpresaContaFiles] = useState<File[]>([]);
  const [procuradorDocFiles, setSocioDocFiles] = useState<File[]>([]);
  const [procuradorContaFiles, setSocioContaFiles] = useState<File[]>([]);

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
    complemento: '',
    municipio: '',
    estado: '',
    cep: ''
  });

  // Estados para gerenciamento de empresas
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null);
  const [empresaDialogOpen, setEmpresaDialogOpen] = useState(false);
  const [novaEmpresa, setNovaEmpresa] = useState<Empresa>({
    id: '',
    nomeEmpresa: '',
    quantidadeSocioes: 1,
    procuradores: []
  });
  const [procuradorEditIndex, setSocioEditIndex] = useState<number>(0);
  const [empresaSocioFiles, setEmpresaSocioFiles] = useState<{ [key: number]: File[] }>({});
  const [modoVisualizacao, setModoVisualizacao] = useState<'cards' | 'lista'>('cards');
  const [empresasPagina, setEmpresasPagina] = useState<number>(1);
  const empresasPorPagina = 5;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

        console.log(`Resposta da consulta de ${tipo.toUpperCase()}:`, data);

        if (data.nome) {
          setNewItem(prev => ({ ...prev, [target]: data.nome }));
        } else {
          console.warn(`Nenhum nome encontrado para ${tipo.toUpperCase()} ${cleaned}`);
        }
      } catch (error) {
        console.error(`Erro na consulta de ${tipo || 'documento'}:`, {
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
      console.error(`Erro na consulta de contato:`, {
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
  const [quantidadeSocioes, setQuantidadeSocioes] = useState<number>(1);

  const [newItem, setNewItem] = useState<Item>({
    id: '',
    cliente: '',
    status: 'Pendente',
    quantidade: 0,
    imagemUrls: [],
    concluido: false,
    placa: '',
    renavam: '',
    descricao: '',
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
    nomeEmpresa: '',
    cpfEmpresa: '',
    rgEmpresa: '',
    nacionalidadeEmpresa: 'brasileiro(a)',
    dataNascimentoEmpresa: '',
    nomePaiEmpresa: '',
    nomeMaeEmpresa: '',
    enderecoEmpresa: '',
    complementoEmpresa: '',
    municipioEmpresa: '',
    estadoEmpresa: '',
    cepEmpresa: '',
    nomeSocio: '',
    cpfSocio: '',
    rgSocio: '',
    nacionalidadeSocio: 'brasileiro',
    estadoCivilSocio: '',
    profissaoSocio: '',
    enderecoSocio: '',
    complementoSocio: '',
    municipioSocio: '',
    estadoSocioEnd: '',
    cepSocio: '',
    // Campos para múltiplos procuradores
    nomeSocio2: '',
    cpfSocio2: '',
    rgSocio2: '',
    nacionalidadeSocio2: 'brasileiro',
    estadoCivilSocio2: '',
    profissaoSocio2: '',
    enderecoSocio2: '',
    complementoSocio2: '',
    municipioSocio2: '',
    estadoSocioEnd2: '',
    cepSocio2: '',
    nomeSocio3: '',
    cpfSocio3: '',
    rgSocio3: '',
    nacionalidadeSocio3: 'brasileiro',
    estadoCivilSocio3: '',
    profissaoSocio3: '',
    enderecoSocio3: '',
    complementoSocio3: '',
    municipioSocio3: '',
    estadoSocioEnd3: '',
    cepSocio3: '',
    nomeSocio4: '',
    cpfSocio4: '',
    rgSocio4: '',
    nacionalidadeSocio4: 'brasileiro',
    estadoCivilSocio4: '',
    profissaoSocio4: '',
    enderecoSocio4: '',
    complementoSocio4: '',
    municipioSocio4: '',
    estadoSocioEnd4: '',
    cepSocio4: '',
    nomeSocio5: '',
    cpfSocio5: '',
    rgSocio5: '',
    nacionalidadeSocio5: 'brasileiro',
    estadoCivilSocio5: '',
    profissaoSocio5: '',
    enderecoSocio5: '',
    complementoSocio5: '',
    municipioSocio5: '',
    estadoSocioEnd5: '',
    cepSocio5: '',
    dataCriacao: Timestamp.fromDate(new Date()),
    signature: '',
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
          [`nomeSocio${suffix}`]: (contact as any).nome || '',
          [`cpfSocio${suffix}`]: (contact as any).cpfCnpj?.replace(/\D/g, '') || '',
          [`rgSocio${suffix}`]: (contact as any).rg || '',
          [`nacionalidadeSocio${suffix}`]: (contact as any).nacionalidade || 'brasileiro',
          [`estadoCivilSocio${suffix}`]: (contact as any).estadoCivil || '',
          [`profissaoSocio${suffix}`]: (contact as any).profissao || '',
          [`enderecoSocio${suffix}`]: (contact as any).endereco || '',
          [`complementoSocio${suffix}`]: (contact as any).complemento || '',
          [`municipioSocio${suffix}`]: (contact as any).municipio || '',
          [`estadoSocioEnd${suffix}`]: (contact as any).estado || '',
          [`cepSocio${suffix}`]: (contact as any).cep || ''
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

  // Função para processar dados da empresa usando IA
  const processEmpresaWithAI = async (file: File) => {
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

      const prompt = `Extraia dados da empresa em JSON: {"nome": "", "razaoSocial": "", "nomeFantasia": "", "cnpj": "", "endereco": "", "cep": "", "bairro": "", "municipio": "", "estado": ""}`;

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
            console.log('Dados extraídos da empresa:', data);

            setNewItem(prev => {
              const updated = { ...prev };
              
              // Nome da empresa
              if (data.razaoSocial) updated.nomeEmpresa = data.razaoSocial.toUpperCase();
              else if (data.nomeFantasia) updated.nomeEmpresa = data.nomeFantasia.toUpperCase();
              else if (data.nome) updated.nomeEmpresa = data.nome.toUpperCase();
              
              // CNPJ
              if (data.cnpj) {
                const cnpjLimpo = data.cnpj.replace(/\D/g, '');
                updated.cpfEmpresa = cnpjLimpo;
                
                // Se CNPJ válido, buscar dados completos via API
                if (cnpjLimpo.length === 14) {
                  setTimeout(async () => {
                    try {
                      const response = await fetch(`/api/cnpj?cnpj=${cnpjLimpo}`);
                      if (response.ok) {
                        const apiData = await response.json();
                        console.log('Dados do CNPJ via API:', apiData);
                        
                        setNewItem(prevItem => ({
                          ...prevItem,
                          nomeEmpresa: apiData.nome?.toUpperCase() || prevItem.nomeEmpresa,
                          enderecoEmpresa: apiData.endereco?.logradouro ? `${apiData.endereco.logradouro}${apiData.endereco.number ? `, ${apiData.endereco.number}` : ''}`.toUpperCase() : prevItem.enderecoEmpresa,
                          complementoEmpresa: apiData.endereco?.district?.toUpperCase() || prevItem.complementoEmpresa,
                          municipioEmpresa: apiData.endereco?.city?.toUpperCase() || prevItem.municipioEmpresa,
                          estadoEmpresa: apiData.endereco?.state?.toUpperCase() || prevItem.estadoEmpresa,
                          cepEmpresa: apiData.endereco?.zip?.replace(/\D/g, '') || prevItem.cepEmpresa
                        }));
                      }
                    } catch (error) {
                      console.error('Erro ao buscar CNPJ via API:', error);
                    }
                  }, 300);
                }
              }
              
              // Dados extraídos da IA (fallback)
              if (data.endereco && !updated.enderecoEmpresa) updated.enderecoEmpresa = data.endereco.toUpperCase();
              if (data.bairro && !updated.complementoEmpresa) updated.complementoEmpresa = data.bairro.toUpperCase();
              if (data.municipio && !updated.municipioEmpresa) updated.municipioEmpresa = data.municipio.toUpperCase();
              if (data.estado && !updated.estadoEmpresa) updated.estadoEmpresa = data.estado.toUpperCase();
              
              // CEP
              if (data.cep) {
                const cepLimpo = data.cep.replace(/\D/g, '');
                if (!updated.cepEmpresa) updated.cepEmpresa = cepLimpo;
                
                // Buscar endereço completo pelo CEP se não foi preenchido
                if (cepLimpo.length === 8 && !data.endereco && !updated.enderecoEmpresa) {
                  setTimeout(() => fetchAddressFromCEP(cepLimpo, 'cepEmpresa'), 500);
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
      console.error('Erro ao processar imagem da empresa:', error);
    } finally {
      setProcessingImage(false);
    }
  };

  // Função para processar dados de procurador usando IA
  const processSocioWithAI = async (file: File, procuradorNumber: number = 1) => {
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

      const prompt = `Extraia dados do procurador em JSON: {"nome": "", "cpf": "", "rg": "", "estadoCivil": "", "profissao": "", "endereco": "", "cep": "", "bairro": "", "municipio": "", "estado": ""}`;

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
              if (data.nome) (updated as any)[`nomeSocio${suffix}`] = data.nome.toUpperCase();
              if (data.cpf) (updated as any)[`cpfSocio${suffix}`] = data.cpf.replace(/\D/g, '');
              if (data.rg) (updated as any)[`rgSocio${suffix}`] = data.rg.toString();
              if (data.estadoCivil) (updated as any)[`estadoCivilSocio${suffix}`] = data.estadoCivil.toUpperCase();
              if (data.profissao) (updated as any)[`profissaoSocio${suffix}`] = data.profissao.toUpperCase();
              if (data.endereco) (updated as any)[`enderecoSocio${suffix}`] = data.endereco.toUpperCase();
              if (data.bairro) (updated as any)[`complementoSocio${suffix}`] = data.bairro.toUpperCase();
              if (data.municipio) (updated as any)[`municipioSocio${suffix}`] = data.municipio.toUpperCase();
              if (data.cep) {
                const cepLimpo = data.cep.replace(/\D/g, '');
                (updated as any)[`cepSocio${suffix}`] = cepLimpo;
                // Buscar endereço completo pelo CEP se não foi preenchido
                if (cepLimpo.length === 8 && !data.endereco) {
                  setTimeout(() => fetchAddressFromCEP(cepLimpo, `cepSocio${suffix}`), 500);
                }
              }

              if (data.estado) (updated as any)[`estadoSocioEnd${suffix}`] = data.estado.toUpperCase();
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

      const prompt = `Extraia dados pessoais em JSON: {"nome": "", "cpf": "", "cnpj": "", "rg": "", "nacionalidade": "", "estadoCivil": "", "profissao": "", "endereco": "", "complemento": "", "bairro": "", "municipio": "", "estado": "", "cep": ""}`;

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
          quantidadeSocioes: empresa.quantidadeSocioes,
          procuradores: empresa.procuradores || []
        } as Empresa));
        setEmpresas(empresasCarregadas);
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
      }
    };
    carregarEmpresas();
  }, []);

  // Função para salvar empresa
  const salvarEmpresa = async () => {
    if (!novaEmpresa.id || !novaEmpresa.nomeEmpresa) {
      alert('Por favor, preencha o ID e o nome da empresa');
      return;
    }

    if (novaEmpresa.procuradores.length !== novaEmpresa.quantidadeSocioes) {
      alert('Por favor, preencha todos os dados dos procuradores');
      return;
    }

    try {
      setIsLoadingContact(true);
      const colecao = new Colecao();
      const empresaParaSalvar = {
        ...novaEmpresa,
        dataCriacao: Timestamp.fromDate(new Date())
      };

      await colecao.salvar('empresasProcuracao', empresaParaSalvar, novaEmpresa.id);

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
      quantidadeSocioes: 1,
      procuradores: []
    });
    setSocioEditIndex(0);
    setEmpresaSocioFiles({});
  };

  // Função para processar arquivos de procurador da empresa com IA
  const processEmpresaSocioWithAI = async (file: File, procuradorIndex: number) => {
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

      const prompt = `Extraia dados pessoais em JSON: {"nome": "", "cpf": "", "cnpj": "", "rg": "", "nacionalidade": "", "estadoCivil": "", "profissao": "", "endereco": "", "complemento": "", "bairro": "", "municipio": "", "estado": "", "cep": ""}`;

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
  const handleEmpresaSocioFileChange = (e: React.ChangeEvent<HTMLInputElement>, procuradorIndex: number) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);

    setEmpresaSocioFiles(prev => ({
      ...prev,
      [procuradorIndex]: [...(prev[procuradorIndex] || []), ...selectedFiles]
    }));

    if (selectedFiles.length > 0) {
      processEmpresaSocioWithAI(selectedFiles[0], procuradorIndex);
    }
  };

  // Função para buscar endereço por CEP (para procuradores da empresa)
  const fetchAddressFromCEPEmpresa = async (cep: string, procuradorIndex: number) => {
    try {
      const cepLimpo = cep.replace(/\D/g, '');
      if (cepLimpo.length !== 8) return;

      console.log(`Buscando endereço para CEP: ${cepLimpo} - Socio ${procuradorIndex + 1} da empresa`);

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
    setQuantidadeSocioes(empresa.quantidadeSocioes);

    // Preencher dados dos procuradores no formulário principal
    empresa.procuradores.forEach((proc, index) => {
      const suffix = index === 0 ? '' : (index + 1).toString();
      setNewItem(prev => ({
        ...prev,
        [`nomeSocio${suffix}`]: proc.nome,
        [`cpfSocio${suffix}`]: proc.cpfCnpj.replace(/\D/g, ''),
        [`rgSocio${suffix}`]: proc.rg,
        [`nacionalidadeSocio${suffix}`]: proc.nacionalidade,
        [`estadoCivilSocio${suffix}`]: proc.estadoCivil,
        [`profissaoSocio${suffix}`]: proc.profissao,
        [`enderecoSocio${suffix}`]: proc.endereco,
        [`complementoSocio${suffix}`]: proc.complemento,
        [`municipioSocio${suffix}`]: proc.municipio,
        [`estadoSocioEnd${suffix}`]: proc.estado,
        [`cepSocio${suffix}`]: proc.cep
      }));
    });
  };

  // Função para adicionar procurador à nova empresa
  const adicionarSocioEmpresa = (procurador: SocioEmpresa) => {
    setNovaEmpresa(prev => ({
      ...prev,
      procuradores: [...prev.procuradores, procurador]
    }));
  };

  // Função para atualizar procurador da nova empresa
  const atualizarSocioEmpresa = (index: number, campo: keyof SocioEmpresa, valor: string) => {
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

          if (fieldType === 'cepEmpresa') {
            updated.enderecoEmpresa = data.logradouro || '';
            updated.complementoEmpresa = data.bairro || '';
            updated.municipioEmpresa = data.localidade || '';
            updated.estadoEmpresa = data.uf || '';
          } else if (fieldType === 'cepSocio') {
            updated.enderecoSocio = data.logradouro || '';
            updated.complementoSocio = data.bairro || '';
            updated.municipioSocio = data.localidade || '';
            updated.estadoSocioEnd = data.uf || '';
          } else if (fieldType === 'cepSocio2') {
            updated.enderecoSocio2 = data.logradouro || '';
            updated.complementoSocio2 = data.bairro || '';
            updated.municipioSocio2 = data.localidade || '';
            updated.estadoSocioEnd2 = data.uf || '';
          } else if (fieldType === 'cepSocio3') {
            updated.enderecoSocio3 = data.logradouro || '';
            updated.complementoSocio3 = data.bairro || '';
            updated.municipioSocio3 = data.localidade || '';
            updated.estadoSocioEnd3 = data.uf || '';
          } else if (fieldType === 'cepSocio4') {
            updated.enderecoSocio4 = data.logradouro || '';
            updated.complementoSocio4 = data.bairro || '';
            updated.municipioSocio4 = data.localidade || '';
            updated.estadoSocioEnd4 = data.uf || '';
          } else if (fieldType === 'cepSocio5') {
            updated.enderecoSocio5 = data.logradouro || '';
            updated.complementoSocio5 = data.bairro || '';
            updated.municipioSocio5 = data.localidade || '';
            updated.estadoSocioEnd5 = data.uf || '';
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
        prompt = `Extraia dados do veículo em JSON: {"placa": "", "renavam": "", "descricao": "", "chassi": "", "modelo": "", "anoFabricacao": "", "anoModelo": "", "cor": "", "combustivel": ""}`;
      } else if (section === 'proprietario_doc') {
        prompt = `Extraia dados pessoais em JSON: {"nome": "", "cpf": "", "rg": "", "dataNascimento": "", "nomePai": "", "nomeMae": ""}`;
      } else if (section === 'proprietario_conta') {
        prompt = `Extraia endereço em JSON: {"endereco": "", "bairro": "", "municipio": "", "cep": "", "estado": ""}`;
      } else if (section === 'procurador_doc') {
        prompt = `Extraia dados pessoais do procurador em JSON: {"nome": "", "cpf": "", "rg": "", "estadoCivil": "", "profissao": ""}`;
      } else if (section === 'procurador_conta') {
        prompt = `Extraia endereço do procurador em JSON: {"endereco": "", "bairro": "", "municipio": "", "cep": "", "estado": ""}`;
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

  // Função para preencher campos
  const fillFieldsFromAI = (data: any, section: string) => {
    setNewItem(prev => {
      const updated = { ...prev };
      if (section === 'veiculo') {
        if (data.placa) {
          const placaLimpa = data.placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
          updated.id = placaLimpa;
          updated.placa = placaLimpa;
        }
        if (data.renavam) updated.renavam = data.renavam.toString().replace(/\D/g, '');
        if (data.descricao) updated.descricao = data.descricao.toString().replace(/\D/g, '');
        if (data.chassi) updated.chassi = data.chassi.toUpperCase();
        if (data.modelo) updated.modelo = data.modelo.toUpperCase();
        if (data.anoFabricacao) updated.anoFabricacao = data.anoFabricacao.toString();
        if (data.anoModelo) updated.anoModelo = data.anoModelo.toString();
        if (data.cor) updated.cor = data.cor.toUpperCase();
        if (data.combustivel) updated.combustivel = data.combustivel.toUpperCase();
      } else if (section === 'proprietario_doc') {
        if (data.nome) updated.nomeEmpresa = data.nome.toUpperCase();
        if (data.cpf) updated.cpfEmpresa = data.cpf.replace(/\D/g, '');
        if (data.rg) updated.rgEmpresa = data.rg.toString();
        if (data.dataNascimento) updated.dataNascimentoEmpresa = data.dataNascimento;
        if (data.nomePai) updated.nomePaiEmpresa = data.nomePai.toUpperCase();
        if (data.nomeMae) updated.nomeMaeEmpresa = data.nomeMae.toUpperCase();
      } else if (section === 'proprietario_conta') {
        if (data.endereco) updated.enderecoEmpresa = data.endereco.toUpperCase();
        if (data.bairro) updated.complementoEmpresa = data.bairro.toUpperCase();
        if (data.municipio) updated.municipioEmpresa = data.municipio.toUpperCase();
        if (data.cep) updated.cepEmpresa = data.cep.replace(/\D/g, '');
        if (data.estado) updated.estadoEmpresa = data.estado.toUpperCase();
      } else if (section === 'procurador_doc') {
        if (data.nome) updated.nomeSocio = data.nome.toUpperCase();
        if (data.cpf) updated.cpfSocio = data.cpf.replace(/\D/g, '');
        if (data.rg) updated.rgSocio = data.rg.toString();
        if (data.estadoCivil) updated.estadoCivilSocio = data.estadoCivil.toUpperCase();
        if (data.profissao) updated.profissaoSocio = data.profissao.toUpperCase();
      } else if (section === 'procurador_conta') {
        if (data.endereco) updated.enderecoSocio = data.endereco.toUpperCase();
        if (data.bairro) updated.complementoSocio = data.bairro.toUpperCase();
        if (data.municipio) updated.municipioSocio = data.municipio.toUpperCase();
        if (data.cep) updated.cepSocio = data.cep.replace(/\D/g, '');
        if (data.estado) updated.estadoSocioEnd = data.estado.toUpperCase();
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

  const handleEmpresaDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setEmpresaDocFiles(prev => [...prev, ...selectedFiles]);
    if (selectedFiles.length > 0) {
      processEmpresaWithAI(selectedFiles[0]);
    }
  };

  const handleEmpresaContaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setEmpresaContaFiles(prev => [...prev, ...selectedFiles]);
    if (selectedFiles.length > 0) {
      processEmpresaWithAI(selectedFiles[0]);
    }
  };

  const handleSocioDocFileChange = (e: React.ChangeEvent<HTMLInputElement>, procuradorNumber: number = 1) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setSocioDocFiles(prev => [...prev, ...selectedFiles]);
    if (selectedFiles.length > 0) {
      processSocioWithAI(selectedFiles[0], procuradorNumber);
    }
  };

  const handleSocioContaFileChange = (e: React.ChangeEvent<HTMLInputElement>, procuradorNumber: number = 1) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setSocioContaFiles(prev => [...prev, ...selectedFiles]);
    if (selectedFiles.length > 0) {
      processSocioWithAI(selectedFiles[0], procuradorNumber);
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
        'cepEmpresa',
        'cepSocio',
        'cepSocio2',
        'cepSocio3',
        'cepSocio4',
        'cepSocio5'
      ];
      if (camposCep.includes(field)) {
        const cepLimpo = value.replace(/\D/g, '');
        if (cepLimpo.length === 8) {
          setTimeout(() => fetchAddressFromCEP(cepLimpo, field as string), 500);
        }
      }

      const camposCpfCnpj: (keyof Item)[] = [
        'cpfEmpresa',
        'cpfSocio',
        'cpfSocio2',
        'cpfSocio3',
        'cpfSocio4',
        'cpfSocio5'
      ];
      if (camposCpfCnpj.includes(field)) {
        const raw = value.replace(/\D/g, '');
        const formatado = formatCpfCnpj(raw);
        (updated as Record<keyof Item, any>)[field] = value;

        setTimeout(() => {
          const input = document.querySelector(`input[name="${field}"]`) as HTMLInputElement;
          if (input) input.value = formatado;
        }, 0);

        if (isValidCpfCnpj(raw)) {
          const target =
            field === 'cpfEmpresa' ? 'nomeEmpresa' :
            field === 'cpfSocio' ? 'nomeSocio' :
            field === 'cpfSocio2' ? 'nomeSocio2' :
            field === 'cpfSocio3' ? 'nomeSocio3' :
            field === 'cpfSocio4' ? 'nomeSocio4' :
            field === 'cpfSocio5' ? 'nomeSocio5' :
            'nomeSocio';

          // Busca automática aprimorada que preenche todos os campos disponíveis
          const searchWithAllFields = async (doc: string, targetField: string) => {
            try {
              const cleaned = doc.replace(/\D/g, '');
              if (cleaned.length !== 11 && cleaned.length !== 14) return;

              const tipo = cleaned.length === 14 ? 'cnpj' : 'cpf';
              const response = await fetch(`/api/${tipo}?${tipo}=${cleaned}`);

              if (response.ok) {
                const data = await response.json();
                console.log('Dados completos da API:', data);

                setNewItem(prev => {
                  const updated = { ...prev };

                  // Preencher nome
                  if (data.nome) {
                    (updated as any)[targetField] = data.nome.toUpperCase();
                  }

                  // Para CNPJ, preencher endereço completo se disponível
                  if (tipo === 'cnpj' && data.endereco) {
                    const suffix = field.replace('cpf', '').replace('Empresa', '').replace('Socio', '');
                    const enderecoField = `endereco${field.includes('Empresa') ? 'Empresa' : 'Socio'}${suffix}`;
                    const complementoField = `complemento${field.includes('Empresa') ? 'Empresa' : 'Socio'}${suffix}`;
                    const municipioField = `municipio${field.includes('Empresa') ? 'Empresa' : 'Socio'}${suffix}`;
                    const estadoField = field.includes('Empresa') ? `estadoEmpresa` : `estadoSocioEnd${suffix}`;
                    const cepField = `cep${field.includes('Empresa') ? 'Empresa' : 'Socio'}${suffix}`;

                    // Preencher endereço
                    if (data.endereco.logradouro) {
                      const enderecoCompleto = `${data.endereco.logradouro}${data.endereco.number ? `, ${data.endereco.number}` : ''}`;
                      (updated as any)[enderecoField] = enderecoCompleto.toUpperCase();
                    }
                    
                    // Preencher complemento/bairro
                    if (data.endereco.district) {
                      (updated as any)[complementoField] = data.endereco.district.toUpperCase();
                    }
                    
                    // Preencher município
                    if (data.endereco.city) {
                      (updated as any)[municipioField] = data.endereco.city.toUpperCase();
                    }
                    
                    // Preencher estado
                    if (data.endereco.state) {
                      (updated as any)[estadoField] = data.endereco.state.toUpperCase();
                    }
                    
                    // Preencher CEP
                    if (data.endereco.zip) {
                      const cepLimpo = data.endereco.zip.replace(/\D/g, '');
                      (updated as any)[cepField] = cepLimpo;
                      console.log(`CEP preenchido: ${cepLimpo} para campo ${cepField}`);
                    }
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
          setFiles(prev => [...prev, file]);
          setCameraOpen(false);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const openCropDialog = (index: number) => {
    const file = files[index];
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setCurrentImageIndex(index);
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
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

      setFiles(prev => prev.map((f, i) => i === currentImageIndex ? file : f));
      setCropOpen(false);
    } catch (e) {
      console.error('Erro ao cortar imagem:', e);
      alert('Ocorreu um erro ao processar a imagem. Por favor, tente novamente.');
    }
  };

  const uploadFiles = async (): Promise<string[]> => {
    const allFiles = [...files, ...veiculoFiles, ...proprietarioDocFiles, ...proprietarioContaFiles, ...procuradorDocFiles, ...procuradorContaFiles];
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
        doc(db, 'BetoDespachanteRecursoAdministrativo', docUuid),
        { ...itemParaSalvar, docUuid, modeloRecurso },
        { merge: true }
      );

      setItems(prev => [...prev, { ...itemParaSalvar, id: newItem.id, docUuid }]);

      const pdfURL = await generatePDF();
      const numeroWhatsApp = '5548988449379';
      const tipoDocumento = modeloRecurso === 1 ? 'Recurso de Multa' : `Recurso Administrativo - Modelo ${modeloRecurso}`;
      const mensagemInicial = `Olá! Tudo certo, o ${tipoDocumento} foi gerado!\n\n📌 *Placa:* ${newItem.id}\n📄 *Documento:* ${pdfURL}`;

      window.location.href = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(mensagemInicial)}`;

      resetForm();

      setTimeout(() => {
        alert(`${tipoDocumento} criado com sucesso! Os dados foram salvos.`);
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
  const gerarTextoSocioes = () => {
    const procuradores = [];
    if (newItem.nomeSocio) procuradores.push({ nome: newItem.nomeSocio, cpf: newItem.cpfSocio, rg: newItem.rgSocio, nacionalidade: newItem.nacionalidadeSocio, estadoCivil: newItem.estadoCivilSocio, profissao: newItem.profissaoSocio, endereco: newItem.enderecoSocio, municipio: newItem.municipioSocio, estado: newItem.estadoSocioEnd, cep: newItem.cepSocio });
    if (newItem.nomeSocio1) procuradores.push({ nome: newItem.nomeSocio1, cpf: newItem.cpfSocio1, rg: newItem.rgSocio1, nacionalidade: newItem.nacionalidadeSocio1, estadoCivil: newItem.estadoCivilSocio1, profissao: newItem.profissaoSocio1, endereco: newItem.enderecoSocio1, municipio: newItem.municipioSocio1, estado: newItem.estadoSocioEnd1, cep: newItem.cepSocio1 });
    if (newItem.nomeSocio2) procuradores.push({ nome: newItem.nomeSocio2, cpf: newItem.cpfSocio2, rg: newItem.rgSocio2, nacionalidade: newItem.nacionalidadeSocio2, estadoCivil: newItem.estadoCivilSocio2, profissao: newItem.profissaoSocio2, endereco: newItem.enderecoSocio2, municipio: newItem.municipioSocio2, estado: newItem.estadoSocioEnd2, cep: newItem.cepSocio2 });
    if (newItem.nomeSocio3) procuradores.push({ nome: newItem.nomeSocio3, cpf: newItem.cpfSocio3, rg: newItem.rgSocio3, nacionalidade: newItem.nacionalidadeSocio3, estadoCivil: newItem.estadoCivilSocio3, profissao: newItem.profissaoSocio3, endereco: newItem.enderecoSocio3, municipio: newItem.municipioSocio3, estado: newItem.estadoSocioEnd3, cep: newItem.cepSocio3 });
    if (newItem.nomeSocio4) procuradores.push({ nome: newItem.nomeSocio4, cpf: newItem.cpfSocio4, rg: newItem.rgSocio4, nacionalidade: newItem.nacionalidadeSocio4, estadoCivil: newItem.estadoCivilSocio4, profissao: newItem.profissaoSocio4, endereco: newItem.enderecoSocio4, municipio: newItem.municipioSocio4, estado: newItem.estadoSocioEnd4, cep: newItem.cepSocio4 });
    if (newItem.nomeSocio5) procuradores.push({ nome: newItem.nomeSocio5, cpf: newItem.cpfSocio5, rg: newItem.rgSocio5, nacionalidade: newItem.nacionalidadeSocio5, estadoCivil: newItem.estadoCivilSocio5, profissao: newItem.profissaoSocio5, endereco: newItem.enderecoSocio5, municipio: newItem.municipioSocio5, estado: newItem.estadoSocioEnd5, cep: newItem.cepSocio5 });

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

      // CPF (opcional)
      if (p.cpf) {
        texto += `, CPF Nº <strong>${p.cpf}</strong>`;
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
  const renderSocio = (numero: number) => {
    const suffix = numero === 1 ? '' : numero.toString();
    const cpfField = `cpfSocio${suffix}` as keyof Item;
    const nomeField = `nomeSocio${suffix}` as keyof Item;
    const rgField = `rgSocio${suffix}` as keyof Item;
    const nacionalidadeField = `nacionalidadeSocio${suffix}` as keyof Item;
    const estadoCivilField = `estadoCivilSocio${suffix}` as keyof Item;
    const profissaoField = `profissaoSocio${suffix}` as keyof Item;
    const enderecoField = `enderecoSocio${suffix}` as keyof Item;
    const complementoField = `complementoSocio${suffix}` as keyof Item;
    const municipioField = `municipioSocio${suffix}` as keyof Item;
    const estadoField = `estadoSocioEnd${suffix}` as keyof Item;
    const cepField = `cepSocio${suffix}` as keyof Item;

    return (
      <Grid item xs={12} md={6} key={numero}>
        <div className={classes.compactSection}>
          <Typography className={classes.sectionTitle}>
            Identificação do Socio {numero}
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
                  onClick={() => setSocioExpanded(!procuradorExpanded)}
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

          {/* Upload de Documentos do Socio */}
          <Grid container spacing={2} style={{ marginBottom: 16 }}>
            <Grid item xs={12} sm={6}>
              <input
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                id={`procurador${numero}-doc-upload`}
                type="file"
                onChange={(e) => handleSocioDocFileChange(e, numero)}
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
                onChange={(e) => handleSocioContaFileChange(e, numero)}
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
                    label={`Código de Busca (5 dígitos) - Socio ${numero}`}
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
      descricao: '',
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
      nomeEmpresa: '',
      cpfEmpresa: '',
      rgEmpresa: '',
      nacionalidadeEmpresa: 'brasileiro(a)',
      dataNascimentoEmpresa: '',
      nomePaiEmpresa: '',
      nomeMaeEmpresa: '',
      enderecoEmpresa: '',
      complementoEmpresa: '',
      municipioEmpresa: '',
      estadoEmpresa: '',
      cepEmpresa: '',
      nomeSocio: '',
      cpfSocio: '',
      rgSocio: '',
      nacionalidadeSocio: 'brasileiro',
      estadoCivilSocio: '',
      profissaoSocio: '',
      enderecoSocio: '',
      complementoSocio: '',
      municipioSocio: '',
      estadoSocioEnd: '',
      cepSocio: '',
      // Campos para múltiplos procuradores
      nomeSocio2: '',
      cpfSocio2: '',
      rgSocio2: '',
      nacionalidadeSocio2: 'brasileiro',
      estadoCivilSocio2: '',
      profissaoSocio2: '',
      enderecoSocio2: '',
      complementoSocio2: '',
      municipioSocio2: '',
      estadoSocioEnd2: '',
      cepSocio2: '',
      nomeSocio3: '',
      cpfSocio3: '',
      rgSocio3: '',
      nacionalidadeSocio3: 'brasileiro',
      estadoCivilSocio3: '',
      profissaoSocio3: '',
      enderecoSocio3: '',
      complementoSocio3: '',
      municipioSocio3: '',
      estadoSocioEnd3: '',
      cepSocio3: '',
      nomeSocio4: '',
      cpfSocio4: '',
      rgSocio4: '',
      nacionalidadeSocio4: 'brasileiro',
      estadoCivilSocio4: '',
      profissaoSocio4: '',
      enderecoSocio4: '',
      complementoSocio4: '',
      municipioSocio4: '',
      estadoSocioEnd4: '',
      cepSocio4: '',
      nomeSocio5: '',
      cpfSocio5: '',
      rgSocio5: '',
      nacionalidadeSocio5: 'brasileiro',
      estadoCivilSocio5: '',
      profissaoSocio5: '',
      enderecoSocio5: '',
      complementoSocio5: '',
      municipioSocio5: '',
      estadoSocioEnd5: '',
      cepSocio5: '',
      dataCriacao: Timestamp.fromDate(new Date()),
      signature: '',
    });
    setFiles([]);
    setVeiculoFiles([]);
    setEmpresaDocFiles([]);
    setEmpresaContaFiles([]);
    setSocioDocFiles([]);
    setSocioContaFiles([]);
    setVeiculoExpanded(false);
    setEmpresaExpanded(false);
    setSocioExpanded(false);
    setAssinaturaExpanded(false);
    setDocumentosExpanded(false);
    setQuantidadeSocioes(1);
  };

  // Paginacao de empresas
  const totalEmpresasPaginas = Math.ceil(empresas.length / empresasPorPagina);
  const empresasPaginadas = empresas.slice(
    (empresasPagina - 1) * empresasPorPagina,
    empresasPagina * empresasPorPagina
  );

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
                  <div>
                    <Typography variant="caption" style={{ fontWeight: 600, color: '#2d5a3d', fontSize: '0.72rem', display: 'block' }}>
                      {empresa.nomeEmpresa}
                    </Typography>
                    <Typography variant="caption" style={{ color: '#666', fontSize: '0.65rem' }}>
                      {empresa.id} • {empresa.quantidadeSocioes} Proc.
                    </Typography>
                  </div>
                  {empresaSelecionada?.id === empresa.id && (
                    <div style={{ fontSize: '0.9rem', color: '#2d5a3d' }}>✓</div>
                  )}
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
          <div style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            paddingBottom: 4
          }}>
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
                  transition: 'all 0.2s'
                }}
              >
                <Typography variant="caption" style={{ fontWeight: 600, color: '#2d5a3d', fontSize: '0.72rem', display: 'block', marginBottom: 2 }}>
                  {empresa.nomeEmpresa}
                </Typography>
                <Typography variant="caption" style={{ color: '#666', fontSize: '0.65rem', display: 'block' }}>
                  {empresa.id}
                </Typography>
                <Typography variant="caption" style={{ color: '#4a7c59', fontSize: '0.65rem' }}>
                  {empresa.quantidadeSocioes} Proc.
                </Typography>
              </div>
            ))}
          </div>
        )}
      </Paper>

      {/* PDF Content (hidden for PDF generation) */}
      <div id="pdf-content" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <Paper className={classes.paper}>
          {modeloRecurso === 1 ? (
            <>
              <Typography className={classes.documentTitle}>
                DEFESA PRÉVIA
              </Typography>

              <Typography className={classes.documentText}>
                <strong>EXCELENTÍSSIMO(A) SENHOR(A) DELEGADO(A) REGIONAL DA {newItem.municipioEmpresa ? `CIRETRAN DE ${newItem.municipioEmpresa.toUpperCase()}/${newItem.estadoEmpresa || 'SC'}` : '[CIRETRAN]'}</strong>
              </Typography>

              <Typography className={classes.documentText}>
                <strong>AUTO DE INFRAÇÃO nº [NUMERO_AUTO]</strong>
              </Typography>

              <Typography className={classes.documentText}>
                <strong>{newItem.nomeEmpresa || '[NOME_COMPLETO]'}</strong>{newItem.estadoCivilSocio ? `, ${newItem.estadoCivilSocio}` : ''} da empresa <strong>{empresaSelecionada?.nomeEmpresa || '[NOME_EMPRESA]'}</strong>, inscrita no CNPJ nº <strong>{newItem.cpfEmpresa || '[CNPJ]'}</strong>, com endereço comercial na {newItem.enderecoEmpresa ? `${newItem.enderecoEmpresa}${newItem.complementoEmpresa ? `, ${newItem.complementoEmpresa}` : ''}, ${newItem.municipioEmpresa || '[MUNICIPIO]'}/${newItem.estadoEmpresa || '[UF]'}` : '[ENDERECO_COMPLETO]'}, CEP: {newItem.cepEmpresa ? newItem.cepEmpresa.replace(/(\d{5})(\d{3})/, '$1-$2') : '[CEP]'}, vem respeitosamente à presença de V. Sª, com base nos incisos II, XXXIV e LV do artigo 5º da CONSTITUIÇÃO FEDERAL, apresentar DEFESA PRÉVIA em desfavor do auto de infração nº [NUMERO_AUTO] pelos motivos de fato e de direito a seguir aduzidos.
              </Typography>

              <Typography className={classes.documentText} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                DOS FATOS E FUNDAMENTOS
              </Typography>

              <Typography className={classes.documentText}>
                O auto de infração deve ser anulado, pois a descrição constante na notificação é genérica e não apresenta os elementos mínimos necessários para a configuração da infração prevista no art. 191 do Código de Trânsito Brasileiro. Consta apenas que o condutor '<strong>{newItem.descricao ||'[DESCRICAO_RESUMIDA_DA_OCORRENCIA]' }</strong>, sem qualquer detalhamento sobre o local, o tipo de via, as condições de tráfego, a sinalização existente ou a forma como o agente constatou a suposta conduta.
              </Typography>

              <Typography className={classes.documentText}>
                A ausência dessas informações essenciais inviabiliza o exercício do direito à ampla defesa e ao contraditório, garantidos pelo art. 5º, inciso LV, da Constituição Federal, e configura irregularidade nos termos do art. 280 do CTB, que exige a descrição clara e objetiva do fato e suas circunstâncias.
              </Typography>

              <Typography className={classes.documentText}>
                Ademais, a infração do art. 191 pressupõe que o condutor efetivamente tenha forçado ultrapassagem entre veículos em sentidos opostos, colocando outro veículo em risco iminente de colisão, o que não está devidamente comprovado nos autos. Não há registro de imagens, croqui ou qualquer outro meio de prova que comprove a manobra descrita, o que compromete a credibilidade da autuação.
              </Typography>

              <Typography className={classes.documentText}>
                Dessa forma, diante da falta de elementos objetivos e da insuficiência de fundamentação, requer-se o cancelamento do auto de infração, nos termos do art. 281, inciso I, do CTB, por irregularidade na lavratura e ausência de provas que sustentem a penalidade aplicada.
              </Typography>

              <Typography className={classes.documentText} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                DOS PEDIDOS
              </Typography>

              <Typography className={classes.documentText}>
                Que a presente defesa seja recebida em seus efeitos legais e julgada procedente, declarando a nulidade do Auto de Infração.
              </Typography>

              <Typography className={classes.documentText}>
                Que a decisão seja encaminhada por escrito para o endereço: {newItem.enderecoEmpresa ? `${newItem.enderecoEmpresa}${newItem.complementoEmpresa ? `, ${newItem.complementoEmpresa}` : ''}, ${newItem.municipioEmpresa || '[MUNICIPIO]'}/${newItem.estadoEmpresa || '[UF]'}` : '[ENDERECO_COMPLETO]'}, CEP: {newItem.cepEmpresa ? newItem.cepEmpresa.replace(/(\d{5})(\d{3})/, '$1-$2') : '[CEP]'}.
              </Typography>

              <Typography className={classes.documentText}>
                {newItem.municipioEmpresa || '[CIDADE]'}/{newItem.estadoEmpresa || 'SC'}, {formatDate(newItem.dataCriacao)}.
              </Typography>

              {newItem.signature && (
                <div className={classes.signatureSection}>
                  <img src={newItem.signature} alt="Assinatura" style={{ maxWidth: '400px' }} />
                </div>
              )}
            </>
          ) : (
            <>
              {/* Modelo 2 permanece como estava */}
              <Typography className={classes.documentTitle}>
                RECURSO ADMINISTRATIVO - MODELO 2
              </Typography>
              {/* ... resto do conteúdo do Modelo 2 ... */}
            </>
          )}
        </Paper>
      </div>

      {/* Layout principal com duas colunas */}
      <Grid container spacing={2}>
        {/* Coluna esquerda - Formulário */}
        <Grid item xs={12} lg={6}>
          <Paper className={classes.formContainer}>
            {/* Header */}
            <div className={classes.header}>
              <img src="/betologo.jpg" alt="Logo" className={classes.logo} />
              <Typography variant="h4" className={classes.title}>
                Recurso Administrativo - Modelo {modeloRecurso}
              </Typography>
            </div>

            {/* Primeira linha: Veículo e Proprietário */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <div className={classes.compactSection}>
                  <Typography className={classes.sectionTitle}>
                    Auto De Infração
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        name="placa"
                        label="Nº Auto De Infração"
                        value={newItem.placa || ''}
                        onChange={(e) => handleInputChange(e, 'placa')}
                        fullWidth
                        variant="outlined"
                        className={classes.textField}
                        size="small"
                        placeholder="Digite o número do auto de infração"
                      />
                    </Grid>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          name="descricao"
                          label="Descrição da infração"
                          value={newItem.descricao || ''}
                          onChange={(e) => handleInputChange(e, 'descricao')}
                          fullWidth
                          variant="outlined"
                          className={classes.textField}
                          size="small"
                          placeholder="Digite Descrição da infração"
                        />
                      </Grid>
                  </Grid>
                    </Grid>
                </div>
              </Grid>

              <Grid item xs={12} md={6}>
                <div className={classes.compactSection}>
                  <Typography className={classes.sectionTitle}>
                    Dados da Empresa
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
                          onClick={() => setEmpresaExpanded(!proprietarioExpanded)}
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

                  {/* Upload de Documentos da Empresa */}
                  <Grid container spacing={2} style={{ marginBottom: 16 }}>
                    <Grid item xs={12} sm={6}>
                      <input
                        accept="image/*,application/pdf"
                        style={{ display: 'none' }}
                        id="proprietario-doc-upload"
                        type="file"
                        onChange={handleEmpresaDocFileChange}
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
                          {isMobile ? 'Contrato Social' : 'Contrato Social'}
                        </Button>
                      </label>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <input
                        accept="image/*,application/pdf"
                        style={{ display: 'none' }}
                        id="proprietario-conta-upload"
                        type="file"
                        onChange={handleEmpresaContaFileChange}
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
                          {isMobile ? 'Cartão CNPJ' : 'Cartão CNPJ'}
                        </Button>
                      </label>
                    </Grid>
                  </Grid>

                  {/* Thumbnails dos arquivos de proprietário */}
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
                            onClick={() => setEmpresaDocFiles(prev => prev.filter((_, i) => i !== index))}
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
                            onClick={() => setEmpresaContaFiles(prev => prev.filter((_, i) => i !== index))}
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
                            name="cpfEmpresa"
                            label="CNPJ da Empresa"
                            value={formatCpfCnpj(newItem.cpfEmpresa || '')}
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(/\D/g, '');
                              handleInputChange({
                                ...e,
                                target: {
                                  ...e.target,
                                  name: 'cpfEmpresa',
                                  value: rawValue
                                }
                              } as any, 'cpfEmpresa');
                            }}
                            fullWidth
                            variant="outlined"
                            className={classes.textField}
                            size="small"
                            error={!!newItem.cpfEmpresa && newItem.cpfEmpresa.length > 0 && newItem.cpfEmpresa.length !== 14}
                            helperText={!!newItem.cpfEmpresa && newItem.cpfEmpresa.length > 0 && newItem.cpfEmpresa.length !== 14
                              ? 'CNPJ inválido - deve ter 14 dígitos'
                              : 'Nome e endereço serão preenchidos automaticamente'}
                            InputProps={{
                              endAdornment: isLoadingSearch && newItem.cpfEmpresa?.length === 14 ? (
                                <CircularProgress size={24} />
                              ) : null,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Razão Social / Nome Fantasia"
                            value={newItem.nomeEmpresa || ''}
                            onChange={(e) => handleInputChange(e, 'nomeEmpresa')}
                            fullWidth
                            variant="outlined"
                            className={classes.textField}
                            size="small"
                            helperText="Preencha manualmente se a consulta automática falhar"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            name="cepEmpresa"
                            label="CEP"
                            value={newItem.cepEmpresa?.replace(/(\d{5})(\d{3})/, '$1-$2') || ''}
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(/\D/g, '');
                              handleInputChange({
                                ...e,
                                target: {
                                  ...e.target,
                                  value: rawValue
                                }
                              } as any, 'cepEmpresa');
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
                            name="enderecoEmpresa"
                            label="Endereço"
                            value={newItem.enderecoEmpresa || ''}
                            onChange={(e) => handleInputChange(e, 'enderecoEmpresa')}
                            fullWidth
                            variant="outlined"
                            className={classes.textField}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            name="complementoEmpresa"
                            label="Complemento/Bairro"
                            value={newItem.complementoEmpresa || ''}
                            onChange={(e) => handleInputChange(e, 'complementoEmpresa')}
                            fullWidth
                            variant="outlined"
                            className={classes.textField}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            name="municipioEmpresa"
                            label="Município"
                            value={newItem.municipioEmpresa || ''}
                            onChange={(e) => handleInputChange(e, 'municipioEmpresa')}
                            fullWidth
                            variant="outlined"
                            className={classes.textField}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            name="estadoEmpresa"
                            label="Estado"
                            value={newItem.estadoEmpresa || ''}
                            onChange={(e) => handleInputChange(e, 'estadoEmpresa')}
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
            </Grid>

            {/* Seletor de Quantidade de Socioes */}
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <div className={classes.compactSection}>
                  <Typography className={classes.sectionTitle}>
                    Quantidade de Socioes
                  </Typography>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                    {[1, 2, 3, 4, 5].map((numero) => (
                      <Button
                        key={numero}
                        variant={quantidadeSocioes === numero ? 'contained' : 'outlined'}
                        color="primary"
                        onClick={() => setQuantidadeSocioes(numero)}
                        className={classes.uploadButton}
                        style={{
                          minWidth: '60px',
                          background: quantidadeSocioes === numero
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

            {/* Campos Dinâmicos de Socioes */}
            <Grid container spacing={2}>
              {Array.from({ length: quantidadeSocioes }, (_, index) =>
                renderSocio(index + 1)
              )}
            </Grid>

            {/* Thumbnails dos arquivos de procuradores */}
            {(procuradorDocFiles.length > 0 || procuradorContaFiles.length > 0) && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <div className={classes.compactSection}>
                    <Typography className={classes.sectionTitle}>
                      Documentos dos Socioes
                    </Typography>
                    <div className={classes.thumbnailContainer}>
                      {procuradorDocFiles.map((file, index) => (
                        <div key={`proc-doc-${index}`} className={file.type === 'application/pdf' ? classes.pdfThumbnail : classes.thumbnail}>
                          {file.type === 'application/pdf' ? (
                            <PictureAsPdf style={{ color: '#d32f2f', fontSize: 30 }} />
                          ) : (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Socio Doc ${index}`}
                              onError={(e) => {
                                console.error('Erro ao carregar imagem:', e);
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <IconButton
                            className={classes.deleteButton}
                            size="small"
                            onClick={() => setSocioDocFiles(prev => prev.filter((_, i) => i !== index))}
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
                              alt={`Socio Conta ${index}`}
                              onError={(e) => {
                                console.error('Erro ao carregar imagem:', e);
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <IconButton
                            className={classes.deleteButton}
                            size="small"
                            onClick={() => setSocioContaFiles(prev => prev.filter((_, i) => i !== index))}
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
                modeloRecurso === 1 ? 'Gerar Recurso de Multa' : `Gerar Recurso Administrativo - Modelo ${modeloRecurso}`
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
                📄 Pré-visualização - {modeloRecurso === 1 ? 'Recurso de Multa' : 'Recurso Administrativo - Modelo 2'}
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  const printWindow = window.open('', '_blank', 'width=800,height=600');
                  if (!printWindow) return;

                  const previewContent = document.getElementById('preview-content');
                  if (!previewContent) return;

                  const printHTML = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="UTF-8">
                      <title>${modeloRecurso === 1 ? 'Defesa Prévia' : 'Recurso Administrativo'}</title>
                      <style>
                        @page {
                          size: A4;
                          margin: 20mm;
                        }
                        * {
                          box-sizing: border-box;
                        }
                        body {
                          font-family: Arial, sans-serif;
                          line-height: 1.8;
                          margin: 0;
                          padding: 24px;
                          background: white;
                          color: #000;
                        }
                        #preview-content {
                          background-color: white;
                          padding: 24px;
                          border-radius: 8px;
                          min-height: 80vh;
                          font-family: Arial, sans-serif;
                          font-size: 11pt;
                          line-height: 1.6;
                        }
                        p {
                          font-size: 11pt;
                          line-height: 1.8;
                          text-align: justify;
                          margin-bottom: 16px;
                        }
                        strong {
                          font-weight: bold;
                        }
                        img {
                          max-width: 300px;
                          max-height: 100px;
                          margin: 20px auto;
                          display: block;
                          border: 1px solid #ddd;
                          border-radius: 4px;
                        }
                        .signature-section {
                          text-align: center;
                          margin-top: 48px;
                          margin-bottom: 24px;
                        }
                        .signature-block {
                          border-top: 2px solid #000;
                          width: 300px;
                          margin: 0 auto;
                          padding-top: 8px;
                          font-size: 11pt;
                        }
                        h1, h2, h3, h4, h5, h6 {
                          font-weight: bold;
                          margin-bottom: 16px;
                        }
                        .text-center {
                          text-align: center;
                        }
                      </style>
                    </head>
                    <body>
                      <div id="preview-content">
                        ${previewContent.innerHTML}
                      </div>

                      <script>
                        window.onload = function() {
                          setTimeout(function() {
                            window.print();
                          }, 500);
                        };
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
                fontFamily: 'Arial, sans-serif',
                fontSize: '11pt',
                lineHeight: 1.6,
                transition: 'all 0.3s ease-in-out'
              }}
            >
              {/* Preview do documento */}
              <Typography
                style={{
                  fontSize: '16pt',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: 24,
                  textTransform: 'uppercase'
                }}
              >
                {modeloRecurso === 1 ? 'RECURSO DE MULTA' : 'RECURSO ADMINISTRATIVO - MODELO 2'}
              </Typography>

              {modeloRecurso === 1 ? (
                <>
                  <Typography className={classes.documentTitle}>
                    DEFESA PRÉVIA
                  </Typography>

                  <Typography className={classes.documentText}>
                    <strong>EXCELENTÍSSIMO(A) SENHOR(A) DELEGADO(A) REGIONAL DA {newItem.municipioEmpresa ? `CIRETRAN DE ${newItem.municipioEmpresa.toUpperCase()}/${newItem.estadoEmpresa || 'SC'}` : '[CIRETRAN]'}</strong>
                  </Typography>

                  <Typography className={classes.documentText}>
                    <strong>AUTO DE INFRAÇÃO nº {newItem.placa || '[NUMERO_AUTO]'}</strong>
                  </Typography>

                  <Typography className={classes.documentText}>
                    <strong>{newItem.nomeSocio || '[NOME_COMPLETO]'}</strong>{newItem.estadoCivilSocio ? `, ${newItem.estadoCivilSocio}` : ''} da empresa <strong>{newItem.nomeEmpresa || '[NOME_EMPRESA]'}</strong>, inscrita no CNPJ nº <strong>{newItem.cpfEmpresa || '[CNPJ]'}</strong>, com endereço comercial na {newItem.enderecoEmpresa ? `${newItem.enderecoEmpresa}${newItem.complementoEmpresa ? `, ${newItem.complementoEmpresa}` : ''}, ${newItem.municipioEmpresa || '[MUNICIPIO]'}/${newItem.estadoEmpresa || '[UF]'}` : '[ENDERECO_COMPLETO]'}, CEP: {newItem.cepEmpresa ? newItem.cepEmpresa.replace(/(\d{5})(\d{3})/, '$1-$2') : '[CEP]'}, vem respeitosamente à presença de V. Sª, com base nos incisos II, XXXIV e LV do artigo 5º da CONSTITUIÇÃO FEDERAL, apresentar DEFESA PRÉVIA em desfavor do auto de infração nº {newItem.placa || '[NUMERO_AUTO]'} pelos motivos de fato e de direito a seguir aduzidos.
                  </Typography>

                  <Typography className={classes.documentText} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    DOS FATOS E FUNDAMENTOS
                  </Typography>

                  <Typography className={classes.documentText}>
                    O auto de infração deve ser anulado, pois a descrição constante na notificação é genérica e não apresenta os elementos mínimos necessários para a configuração da infração prevista no art. 191 do Código de Trânsito Brasileiro. Consta apenas que o condutor"<strong>{newItem.descricao ||'[DESCRICAO_RESUMIDA_DA_OCORRENCIA]' }</strong>", sem qualquer detalhamento sobre o local, o tipo de via, as condições de tráfego, a sinalização existente ou a forma como o agente constatou a suposta conduta.
                  </Typography>

                  <Typography className={classes.documentText}>
                    A ausência dessas informações essenciais inviabiliza o exercício do direito à ampla defesa e ao contraditório, garantidos pelo art. 5º, inciso LV, da Constituição Federal, e configura irregularidade nos termos do art. 280 do CTB, que exige a descrição clara e objetiva do fato e suas circunstâncias.
                  </Typography>

                  <Typography className={classes.documentText}>
                    Ademais, a infração do art. 191 pressupõe que o condutor efetivamente tenha forçado ultrapassagem entre veículos em sentidos opostos, colocando outro veículo em risco iminente de colisão, o que não está devidamente comprovado nos autos. Não há registro de imagens, croqui ou qualquer outro meio de prova que comprove a manobra descrita, o que compromete a credibilidade da autuação.
                  </Typography>

                  <Typography className={classes.documentText}>
                    Dessa forma, diante da falta de elementos objetivos e da insuficiência de fundamentação, requer-se o cancelamento do auto de infração, nos termos do art. 281, inciso I, do CTB, por irregularidade na lavratura e ausência de provas que sustentem a penalidade aplicada.
                  </Typography>

                  <Typography className={classes.documentText} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    DOS PEDIDOS
                  </Typography>

                  <Typography className={classes.documentText}>
                    Que a presente defesa seja recebida em seus efeitos legais e julgada procedente, declarando a nulidade do Auto de Infração.
                  </Typography>

                  <Typography className={classes.documentText}>
                    Que a decisão seja encaminhada por escrito para o endereço: {newItem.enderecoEmpresa ? `${newItem.enderecoEmpresa}${newItem.complementoEmpresa ? `, ${newItem.complementoEmpresa}` : ''}, ${newItem.municipioEmpresa || '[MUNICIPIO]'}/${newItem.estadoEmpresa || '[UF]'}` : '[ENDERECO_COMPLETO]'}, CEP: {newItem.cepEmpresa ? newItem.cepEmpresa.replace(/(\d{5})(\d{3})/, '$1-$2') : '[CEP]'}.
                  </Typography>

                  <Typography className={classes.documentText}>
                    {newItem.municipioEmpresa || '[CIDADE]'}/{newItem.estadoEmpresa || 'SC'}, {formatDate(newItem.dataCriacao)}.
                  </Typography>

                  {newItem.signature && (
                    <div className={classes.signatureSection}>
                      <img src={newItem.signature} alt="Assinatura" style={{ maxWidth: '400px' }} />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Typography style={{ fontSize: '11pt', lineHeight: 1.8, textAlign: 'justify', marginBottom: 16 }}>
                    <strong>EXCELENTÍSSIMO SENHOR DIRETOR DO DEPARTAMENTO ESTADUAL DE TRÂNSITO - DETRAN/SC</strong>
                  </Typography>

                  <div
                    style={{ fontSize: '11pt', lineHeight: 1.8, textAlign: 'justify', marginBottom: 16 }}
                    dangerouslySetInnerHTML={{
                      __html: `<strong>${newItem.nomeEmpresa || '[NOME DO PROPRIETÁRIO]'}</strong>, ${newItem.nacionalidadeEmpresa || 'brasileiro(a)'}, ${newItem.estadoCivilSocio ? `estado civil <strong>${newItem.estadoCivilSocio}</strong>` : ''}, ${newItem.profissaoSocio ? `profissão <strong>${newItem.profissaoSocio}</strong>` : ''}, portador(a) da Cédula de Identidade RG nº <strong>${newItem.rgEmpresa || '[RG]'}</strong>, inscrito(a) no CPF sob o nº <strong>${newItem.cpfEmpresa || '[CPF]'}</strong>, residente e domiciliado(a) ${newItem.enderecoEmpresa ? `na <strong>${newItem.enderecoEmpresa}, ${newItem.complementoEmpresa || ''}, ${newItem.municipioEmpresa || '[MUNICÍPIO]'}/${newItem.estadoEmpresa || '[UF]'}</strong>` : 'em <strong>[ENDEREÇO COMPLETO]</strong>'}, CEP <strong>${newItem.cepEmpresa || '[CEP]'}</strong>, proprietário(a) do veículo marca/modelo <strong>${newItem.modelo || '[MARCA/MODELO]'}</strong>, placa <strong>${newItem.id || '[PLACA]'}</strong>, ${newItem.chassi ? `chassi <strong>${newItem.chassi}</strong>,` : ''} RENAVAM <strong>${newItem.renavam || '[RENAVAM]'}</strong>, ${newItem.cor ? `cor <strong>${newItem.cor}</strong>,` : ''} ${newItem.anoFabricacao ? `ano de fabricação <strong>${newItem.anoFabricacao}</strong>,` : ''} ${newItem.anoModelo ? `ano/modelo <strong>${newItem.anoModelo}</strong>,` : ''}, vem, mui respeitosamente, à presença de Vossa Senhoria, por meio de seu procurador infra-assinado, apresentar <strong>RECURSO ADMINISTRATIVO DE MULTA DE TRÂNSITO</strong>, nos termos dos artigos 280 a 290 do Código de Trânsito Brasileiro (Lei nº 9.503/97), pelas razões de fato e de direito a seguir aduzidas.`
                    }}
                  />

                  <Typography style={{ fontSize: '11pt', lineHeight: 1.8, textAlign: 'center', marginBottom: 16, fontWeight: 'bold' }}>
                    I - SÍNTESE DOS FATOS
                  </Typography>

                  <Typography style={{ fontSize: '11pt', lineHeight: 1.8, textAlign: 'justify', marginBottom: 16 }}>
                    O recorrente foi surpreendido com a notificação de autuação por infração de trânsito, aplicada de forma indevida, apresentando vícios formais e materiais que serão demonstrados ao longo desta peça recursal.
                  </Typography>

                  <Typography style={{ fontSize: '11pt', lineHeight: 1.8, textAlign: 'center', marginBottom: 16, fontWeight: 'bold' }}>
                    II - DO CABIMENTO DO RECURSO
                  </Typography>

                  <Typography style={{ fontSize: '11pt', lineHeight: 1.8, textAlign: 'justify', marginBottom: 16 }}>
                    O presente recurso é tempestivo e encontra fundamento nos artigos 280 e seguintes do Código de Trânsito Brasileiro, que asseguram ao autuado o direito ao contraditório e à ampla defesa em procedimento administrativo.
                  </Typography>

                  <Typography style={{ fontSize: '11pt', lineHeight: 1.8, textAlign: 'center', marginBottom: 16, fontWeight: 'bold' }}>
                    III - DO MÉRITO
                  </Typography>

                  <Typography style={{ fontSize: '11pt', lineHeight: 1.8, textAlign: 'justify', marginBottom: 16 }}>
                    A autuação ora impugnada apresenta irregularidades que comprometem sua validade, devendo ser anulada pelos motivos técnicos e jurídicos que serão demonstrados mediante a análise dos documentos anexos.
                  </Typography>

                  <Typography style={{ fontSize: '11pt', lineHeight: 1.8, textAlign: 'center', marginBottom: 16, fontWeight: 'bold' }}>
                    IV - DOS PEDIDOS
                  </Typography>

                  <Typography style={{ fontSize: '11pt', lineHeight: 1.8, textAlign: 'justify', marginBottom: 16 }}>
                    Diante de todo o exposto, o recorrente requer:
                  </Typography>

                  <Typography style={{ fontSize: '11pt', lineHeight: 1.8, textAlign: 'justify', marginBottom: 8, paddingLeft: '30px' }}>
                    a) Seja conhecido e provido o presente recurso administrativo;
                  </Typography>

                  <Typography style={{ fontSize: '11pt', lineHeight: 1.8, textAlign: 'justify', marginBottom: 8, paddingLeft: '30px' }}>
                    b) Seja declarada a nulidade do auto de infração;
                  </Typography>

                  <Typography style={{ fontSize: '11pt', lineHeight: 1.8, textAlign: 'justify', marginBottom: 8, paddingLeft: '30px' }}>
                    c) Seja determinado o cancelamento da multa e respectiva pontuação na CNH do recorrente;
                  </Typography>

                  <Typography style={{ fontSize: '11pt', lineHeight: 1.8, textAlign: 'justify', marginBottom: 16, paddingLeft: '30px' }}>
                    d) Sejam produzidas todas as provas em direito admitidas, especialmente a juntada de documentos complementares se necessário.
                  </Typography>
                </>
              )}

              <Typography style={{ fontSize: '11pt', lineHeight: 1.8, textAlign: 'justify', marginBottom: 32 }}>
                Tubarão, {formatDate(newItem.dataCriacao)}.
              </Typography>

              {/* Área de assinatura no preview */}
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
                  fontSize: '11pt'
                }}>
                  <strong>{newItem.nomeSocio || '[NOME_COMPLETO]'}</strong>
                </div>
              </div>

            

          

              <Typography style={{
                fontSize: '9pt',
                textAlign: 'center',
                marginTop: 48,
                fontStyle: 'italic',
                color: '#666'
              }}>
                Recurso Administrativo conforme Código de Trânsito Brasileiro - Lei nº 9.503/97, Arts. 280 a 290
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
            onZoomChange={setZoom}
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
            <TextField
              label="ID da Empresa (5 dígitos)"
              value={novaEmpresa.id}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                setNovaEmpresa(prev => ({ ...prev, id: value }));
              }}
              fullWidth
              variant="outlined"
              size="small"
              required
              helperText="Código único de 5 dígitos para identificação"
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
                Quantidade de Socioes
              </Typography>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <Button
                    key={num}
                    variant={novaEmpresa.quantidadeSocioes === num ? 'contained' : 'outlined'}
                    onClick={() => setNovaEmpresa(prev => ({ ...prev, quantidadeSocioes: num }))}
                    className={classes.uploadButton}
                    style={{
                      minWidth: '50px',
                      background: novaEmpresa.quantidadeSocioes === num
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

            {/* Campos dos Socioes */}
            {Array.from({ length: novaEmpresa.quantidadeSocioes }, (_, index) => (
              <Card key={index} style={{ padding: 16, marginBottom: 16, backgroundColor: '#f8f9fa' }}>
                <Typography variant="subtitle2" style={{ marginBottom: 12, color: '#2d5a3d', fontWeight: 600 }}>
                  Socio {index + 1}
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
                        onChange={(e) => handleEmpresaSocioFileChange(e, index)}
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
                          setSocioEditIndex(index);
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
                  {empresaSocioFiles[index] && empresaSocioFiles[index].length > 0 && (
                    <div className={classes.thumbnailContainer} style={{ marginTop: 12 }}>
                      {empresaSocioFiles[index].map((file, fileIndex) => (
                        <div key={fileIndex} className={file.type === 'application/pdf' ? classes.pdfThumbnail : classes.thumbnail}>
                          {file.type === 'application/pdf' ? (
                            <PictureAsPdf style={{ color: '#d32f2f', fontSize: 30 }} />
                          ) : (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Socio ${index + 1} Doc ${fileIndex}`}
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
                              setEmpresaSocioFiles(prev => {
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
                        atualizarSocioEmpresa(index, 'cpfCnpj', rawValue);
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
                      onChange={(e) => atualizarSocioEmpresa(index, 'nome', e.target.value)}
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
                      onChange={(e) => atualizarSocioEmpresa(index, 'rg', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Nacionalidade"
                      value={novaEmpresa.procuradores[index]?.nacionalidade || 'brasileiro'}
                      onChange={(e) => atualizarSocioEmpresa(index, 'nacionalidade', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Estado Civil"
                      value={novaEmpresa.procuradores[index]?.estadoCivil || ''}
                      onChange={(e) => atualizarSocioEmpresa(index, 'estadoCivil', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Profissão"
                      value={novaEmpresa.procuradores[index]?.profissao || ''}
                      onChange={(e) => atualizarSocioEmpresa(index, 'profissao', e.target.value)}
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
                        atualizarSocioEmpresa(index, 'cep', rawValue);
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
                      onChange={(e) => atualizarSocioEmpresa(index, 'endereco', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Complemento/Bairro"
                      value={novaEmpresa.procuradores[index]?.complemento || ''}
                      onChange={(e) => atualizarSocioEmpresa(index, 'complemento', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Município"
                      value={novaEmpresa.procuradores[index]?.municipio || ''}
                      onChange={(e) => atualizarSocioEmpresa(index, 'municipio', e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Estado"
                      value={novaEmpresa.procuradores[index]?.estado || ''}
                      onChange={(e) => atualizarSocioEmpresa(index, 'estado', e.target.value)}
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
            disabled={isLoadingContact || !novaEmpresa.id || !novaEmpresa.nomeEmpresa}
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